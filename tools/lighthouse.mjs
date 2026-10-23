import { spawn } from 'node:child_process';
import process from 'node:process';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, URLSearchParams } from 'node:url';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';

import { launch } from 'chrome-launcher';
import lighthouse, { generateReport } from 'lighthouse';

const { console, fetch } = globalThis;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_ROOT = path.join(ROOT, 'apps', 'web');
const OUTPUT_DIR = path.join(ROOT, 'docs', 'lighthouse');
const PORT = 4173;
const LOCAL_URL = `http://127.0.0.1:${PORT}`;
const PUBLISHED_URL = (
  process.env.LIGHTHOUSE_BASE_URL ??
  process.argv.find((arg) => arg.startsWith('--base-url='))?.slice('--base-url='.length) ??
  ''
).replace(/\/+$/, '');
const IS_PUBLISHED = PUBLISHED_URL !== '';
const BASE_URL = IS_PUBLISHED ? PUBLISHED_URL : LOCAL_URL;
const REPORT_TAG = IS_PUBLISHED ? 'deploy' : 'vercel-static';
const SUMMARY_FILE = IS_PUBLISHED ? 'summary-deploy.json' : 'summary.json';
const RUNS = 3;
const STATIC_SERVER = path.join(ROOT, 'tools', 'serve-static.mjs');
const TARGETS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 95,
  seo: 90,
};
const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'nft-detail', path: '/nfts/emerald-ape-042' },
];
const PROFILES = [
  {
    id: 'mobile',
    formFactor: 'mobile',
    screenEmulation: { width: 390, height: 844, deviceScaleFactor: 1, mobile: true },
  },
  {
    id: 'desktop',
    formFactor: 'desktop',
    screenEmulation: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  },
];
const CATEGORIES = Object.keys(TARGETS);
const requireFromApp = createRequire(path.join(APP_ROOT, 'package.json'));
const chromium = requireFromApp('playwright').chromium;
const REPORTED_BASELINE = [
  { route: 'home', profile: 'mobile', performance: 34 },
  { route: 'home', profile: 'desktop', performance: 28 },
  { route: 'nft-detail', profile: 'mobile', performance: 55 },
  { route: 'nft-detail', profile: 'desktop', performance: 32 },
];

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function metricValue(lhr, auditId) {
  const value = lhr.audits[auditId]?.numericValue;
  return Number.isFinite(value) ? value : null;
}

function categoryScore(lhr, categoryId) {
  const value = lhr.categories[categoryId]?.score;
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

function failingAudits(lhr, categoryId) {
  const category = lhr.categories[categoryId];
  if (!category) return [];
  return category.auditRefs
    .map(({ id, weight }) => ({ audit: lhr.audits[id], weight }))
    .filter(
      ({ audit, weight }) =>
        audit && typeof audit.score === 'number' && audit.score < 1 && weight > 0,
    )
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 5)
    .map(({ audit, weight }) => ({
      id: audit.id,
      title: audit.title,
      score: audit.score,
      displayValue: audit.displayValue ?? null,
      weight,
    }));
}

function buildCombinations(results) {
  return ROUTES.flatMap((route) =>
    PROFILES.map((profile) => {
      const runs = results.filter(
        (result) => result.route === route.id && result.profile === profile.id,
      );
      const successfulRuns = runs.filter((run) => run.categories);
      const failures = runs
        .filter((run) => run.failure)
        .map(({ run, failure }) => ({ run, failure }));
      const medians = Object.fromEntries(
        CATEGORIES.map((category) => [
          category,
          median(successfulRuns.map((run) => run.categories[category])),
        ]),
      );
      const metrics = {
        lcpMs: median(successfulRuns.map((run) => run.metrics.lcpMs)),
        cls: median(successfulRuns.map((run) => run.metrics.cls)),
        tbtMs: median(successfulRuns.map((run) => run.metrics.tbtMs)),
      };
      const belowTargets = CATEGORIES.filter(
        (category) => medians[category] !== null && medians[category] < TARGETS[category],
      );
      const causes = Object.fromEntries(
        belowTargets.map((category) => [
          category,
          successfulRuns.flatMap((run) => run.diagnostics[category] ?? []).slice(0, 10),
        ]),
      );
      return {
        route: route.id,
        path: route.path,
        profile: profile.id,
        sampleCount: successfulRuns.length,
        failures,
        medians,
        vitals: metrics,
        targets: TARGETS,
        belowTargets,
        likelyCauses: causes,
        passed:
          successfulRuns.length === RUNS && failures.length === 0 && belowTargets.length === 0,
      };
    }),
  );
}

async function writeSummary(results, environment, comparison) {
  const summary = {
    auditVersion: 1,
    generatedAt: new Date().toISOString(),
    status:
      results.length === ROUTES.length * PROFILES.length * RUNS &&
      results.every((result) => !result.failure)
        ? 'complete'
        : 'incomplete',
    configuration: {
      target: IS_PUBLISHED ? 'published deployment' : 'local production build',
      buildCommand: IS_PUBLISHED ? null : 'pnpm build',
      mockScenario: 'default (reset before each run)',
      runsPerCombination: RUNS,
      categories: TARGETS,
      profiles: PROFILES.map(({ id, formFactor, screenEmulation }) => ({
        id,
        formFactor,
        screenEmulation,
      })),
      routes: ROUTES,
      throttlingMethod: 'simulate',
      serverCommand: IS_PUBLISHED ? null : `node tools/serve-static.mjs apps/web/dist ${PORT}`,
      serverUrl: BASE_URL,
      compression: 'Brotli or gzip for compressible MIME types when accepted by the client',
      cacheHeaders:
        'immutable /assets files, one-week /nfts image files, no-cache SPA documents and MSW worker',
      knownVercelDifference:
        'vercel.json currently applies the /nfts cache rule to extensionless SPA routes as well',
    },
    environment,
    comparison,
    auditCount: results.length,
    combinations: buildCombinations(results),
    results,
  };
  await writeFile(path.join(OUTPUT_DIR, SUMMARY_FILE), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

async function waitForServer(server, getServerError) {
  const deadline = Date.now() + 60_000;
  let lastError;
  while (Date.now() < deadline) {
    if (getServerError()) throw getServerError();
    if (server.exitCode !== null) {
      throw new Error(`static server exited before readiness (code ${server.exitCode})`);
    }
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
      lastError = new Error(`static server returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(300);
  }
  throw new Error(`Timed out waiting for static server: ${lastError?.message ?? 'unknown error'}`);
}

function auditUrl(route) {
  const query = new URLSearchParams({ mockReset: '1', mockScenario: 'default' });
  return `${BASE_URL}${route.path}?${query.toString()}`;
}

function reportBaseName(route, profile, run) {
  return `${route.id}-${profile.id}-${REPORT_TAG}-${run}`;
}

async function runAudit(route, profile, run) {
  const browser = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox'],
    logLevel: 'error',
  });
  let result;
  try {
    result = await lighthouse(auditUrl(route), {
      port: browser.port,
      output: ['html', 'json'],
      logLevel: 'error',
      onlyCategories: CATEGORIES,
      formFactor: profile.formFactor,
      screenEmulation: { ...profile.screenEmulation, disabled: false },
      throttlingMethod: 'simulate',
      disableStorageReset: false,
    });
  } finally {
    browser.kill();
  }
  if (!result)
    throw new Error(`Lighthouse returned no result for ${route.id}/${profile.id}/${run}`);

  const html = generateReport(result.lhr, 'html').replace(/^[ \t]+$/gm, '');
  const json = generateReport(result.lhr, 'json');
  const basename = reportBaseName(route, profile, run);
  await Promise.all([
    writeFile(path.join(OUTPUT_DIR, `${basename}.html`), html),
    writeFile(path.join(OUTPUT_DIR, `${basename}.json`), json),
  ]);

  const userAgent = result.lhr.userAgent;
  const chromeVersion = /Chrome\/([\d.]+)/.exec(userAgent)?.[1] ?? null;
  return {
    route: route.id,
    path: route.path,
    profile: profile.id,
    run,
    url: auditUrl(route),
    chromeVersion,
    categories: Object.fromEntries(
      CATEGORIES.map((category) => [category, categoryScore(result.lhr, category)]),
    ),
    metrics: {
      lcpMs: metricValue(result.lhr, 'largest-contentful-paint'),
      cls: metricValue(result.lhr, 'cumulative-layout-shift'),
      tbtMs: metricValue(result.lhr, 'total-blocking-time'),
    },
    diagnostics: Object.fromEntries(
      CATEGORIES.map((category) => [category, failingAudits(result.lhr, category)]),
    ),
    reports: { html: `${basename}.html`, json: `${basename}.json` },
  };
}

async function main() {
  const rootPackage = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const browserPath = chromium.executablePath();
  process.env.CHROME_PATH = browserPath;
  if (!IS_PUBLISHED) {
    await access(path.join(APP_ROOT, 'dist', 'index.html')).catch(() => {
      throw new Error('Production build missing. Run `pnpm build` before `pnpm lighthouse`.');
    });
  }
  await mkdir(OUTPUT_DIR, { recursive: true });
  const previousSummary = await readFile(path.join(OUTPUT_DIR, SUMMARY_FILE), 'utf8')
    .then((value) => JSON.parse(value))
    .catch((error) => {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return null;
      }
      throw error;
    });
  const comparison = {
    claudeReportedPreImageOptimization: {
      source: 'docs/agent-communication.md, 2026-10-23 08:40',
      server: 'vite preview',
      performanceMedians: REPORTED_BASELINE,
    },
    immediatelyPreviousRun: previousSummary
      ? {
          generatedAt: previousSummary.generatedAt,
          serverCommand: previousSummary.configuration?.previewCommand ?? null,
          performanceMedians: previousSummary.combinations.map(({ route, profile, medians }) => ({
            route,
            profile,
            performance: medians.performance,
          })),
          vitals: previousSummary.combinations.map(({ route, profile, vitals }) => ({
            route,
            profile,
            ...vitals,
          })),
        }
      : null,
  };

  const results = [];
  const environment = {
    node: process.version,
    packageManager: rootPackage.packageManager,
    lighthouse: rootPackage.devDependencies.lighthouse,
    platform: `${os.type()} ${os.release()}`,
    architecture: os.arch(),
    cpu: os.cpus()[0]?.model ?? 'unknown',
    cpuCount: os.cpus().length,
    totalMemoryBytes: os.totalmem(),
    chromeExecutable: browserPath,
  };
  await writeSummary(results, environment, comparison);

  const server = IS_PUBLISHED
    ? null
    : spawn(process.execPath, [STATIC_SERVER, path.join(APP_ROOT, 'dist'), String(PORT)], {
        cwd: ROOT,
        stdio: 'inherit',
      });
  let serverError = null;
  server?.on('error', (error) => {
    serverError = error;
    console.error(`Failed to start static server: ${error.message}`);
  });

  try {
    if (server) await waitForServer(server, () => serverError);
    else {
      const response = await fetch(BASE_URL);
      if (!response.ok) throw new Error(`${BASE_URL} returned HTTP ${response.status}`);
    }
    for (const route of ROUTES) {
      for (const profile of PROFILES) {
        for (let run = 1; run <= RUNS; run += 1) {
          const label = `${route.id}/${profile.id} run ${run}/${RUNS}`;
          console.log(`Lighthouse: ${label}`);
          try {
            const result = await runAudit(route, profile, run);
            results.push(result);
            await writeSummary(results, environment, comparison);
            console.log(
              `  Performance ${result.categories.performance}, Accessibility ${result.categories.accessibility}, ` +
                `Best Practices ${result.categories['best-practices']}, SEO ${result.categories.seo}`,
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`  ${label} failed: ${message}`);
            results.push({
              route: route.id,
              path: route.path,
              profile: profile.id,
              run,
              failure: message,
            });
            await writeSummary(results, environment, comparison);
          }
        }
      }
    }
  } finally {
    server?.kill();
  }

  const summary = await writeSummary(results, environment, comparison);
  for (const combination of summary.combinations) {
    console.log(
      `${combination.route}/${combination.profile}: median ` +
        `${JSON.stringify(combination.medians)}, LCP ${combination.vitals.lcpMs}ms, ` +
        `CLS ${combination.vitals.cls}, TBT ${combination.vitals.tbtMs}ms`,
    );
  }
  const failed = summary.combinations.filter((combination) => !combination.passed);
  console.log(`Reports and summary: ${OUTPUT_DIR}`);
  if (failed.length > 0) {
    console.error(`${failed.length} audit combination(s) failed or missed their median targets.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
