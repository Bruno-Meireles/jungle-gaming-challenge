import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import process from 'node:process';
import { after, before, test } from 'node:test';
import { setTimeout } from 'node:timers';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const { fetch } = globalThis;
const serverScript = fileURLToPath(new URL('./serve-static.mjs', import.meta.url));
const jsBody = 'export const lighthouseFixture = "compression check";\n'.repeat(200);
let fixtureRoot;
let baseUrl;
let child;
let childOutput = '';

async function reservePort() {
  const socket = createServer();
  await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', resolve);
  });
  const address = socket.address();
  assert.ok(address && typeof address === 'object');
  await new Promise((resolve, reject) => socket.close((error) => (error ? reject(error) : resolve())));
  return address.port;
}

before(async () => {
  fixtureRoot = await mkdtemp(path.join(tmpdir(), 'jg-static-server-'));
  await mkdir(path.join(fixtureRoot, 'assets'));
  await mkdir(path.join(fixtureRoot, 'nfts'));
  await writeFile(path.join(fixtureRoot, 'index.html'), '<main>SPA fixture</main>');
  await writeFile(path.join(fixtureRoot, 'assets', 'app.js'), jsBody);
  await writeFile(path.join(fixtureRoot, 'nfts', 'fixture.webp'), Buffer.from('image'));
  await writeFile(path.join(fixtureRoot, 'nfts', 'metadata.json'), '{"name":"fixture"}');
  await writeFile(path.join(fixtureRoot, 'mockServiceWorker.js'), '/* worker */');

  const port = await reservePort();
  baseUrl = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, [serverScript, fixtureRoot, String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.setEncoding('utf8').on('data', (chunk) => (childOutput += chunk));
  child.stderr.setEncoding('utf8').on('data', (chunk) => (childOutput += chunk));

  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Static server exited early:\n${childOutput}`);
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(`Static server did not become ready:\n${childOutput}`);
});

after(async () => {
  child?.kill();
  if (child) await new Promise((resolve) => child.once('exit', resolve));
  if (fixtureRoot) await rm(fixtureRoot, { recursive: true, force: true });
});

test('serves SPA routes from index.html without caching the document', async () => {
  const response = await fetch(`${baseUrl}/nfts/emerald-ape-042`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.match(response.headers.get('cache-control') ?? '', /no-cache/);
  assert.equal(await response.text(), '<main>SPA fixture</main>');

  const head = await fetch(`${baseUrl}/nfts/emerald-ape-042`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal((await head.arrayBuffer()).byteLength, 0);
});

test('serves immutable assets with Brotli and the matching Vercel cache header', async () => {
  const response = await fetch(`${baseUrl}/assets/app.js`, {
    headers: { 'accept-encoding': 'gzip, br' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/javascript; charset=utf-8');
  assert.equal(response.headers.get('content-encoding'), 'br');
  assert.match(response.headers.get('cache-control') ?? '', /max-age=31536000, immutable/);
  assert.match(response.headers.get('vary') ?? '', /Accept-Encoding/i);
  assert.equal(await response.text(), jsBody);
});

test('respects encoding quality and serves images with their Vercel cache policy', async () => {
  const script = await fetch(`${baseUrl}/assets/app.js`, {
    headers: { 'accept-encoding': 'br;q=0, gzip;q=1' },
  });
  assert.equal(script.headers.get('content-encoding'), 'gzip');
  assert.equal(await script.text(), jsBody);

  const image = await fetch(`${baseUrl}/nfts/fixture.webp`, {
    headers: { 'accept-encoding': 'gzip, br' },
  });
  assert.equal(image.headers.get('content-type'), 'image/webp');
  assert.equal(image.headers.get('content-encoding'), null);
  assert.match(image.headers.get('cache-control') ?? '', /max-age=604800/);
  assert.equal((await image.arrayBuffer()).byteLength, 5);

  const metadata = await fetch(`${baseUrl}/nfts/metadata.json`);
  assert.match(metadata.headers.get('cache-control') ?? '', /no-cache/);
});

test('does not cache the MSW worker and does not rewrite missing assets to the SPA', async () => {
  const worker = await fetch(`${baseUrl}/mockServiceWorker.js`);
  assert.match(worker.headers.get('cache-control') ?? '', /no-cache/);

  const missing = await fetch(`${baseUrl}/assets/missing.js`);
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), 'Not found');
});
