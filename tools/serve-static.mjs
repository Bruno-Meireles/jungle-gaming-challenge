// Servidor estatico sem dependencias. Uso: node tools/serve-static.mjs <diretorio> <porta>
import { createServer } from 'node:http';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { brotliCompress, gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { URL } from 'node:url';

const { console } = globalThis;
const [dirArg, portArg] = process.argv.slice(2);
if (!dirArg || !portArg) {
  console.error('Uso: node serve-static.mjs <diretório> <porta>');
  process.exit(1);
}
const root = resolve(dirArg);
const port = Number(portArg);
const compressBrotli = promisify(brotliCompress);
const compressGzip = promisify(gzip);
const compressedFiles = new Map();
const MAX_COMPRESSED_FILES = 256;
const CACHED_NFT_IMAGE_TYPES = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

const MIME = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

const COMPRESSIBLE_TYPES = new Set([
  'application/javascript',
  'application/json',
  'application/manifest+json',
  'application/wasm',
  'application/xml',
  'image/svg+xml',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function cacheControl(pathname) {
  const extension = extname(pathname).toLowerCase();
  if (pathname.startsWith('/assets/') && extension !== '') {
    return 'public, max-age=31536000, immutable';
  }
  if (pathname.startsWith('/nfts/') && CACHED_NFT_IMAGE_TYPES.has(extension)) {
    return 'public, max-age=604800';
  }
  return 'no-cache';
}

function encodingQualities(header) {
  const qualities = new Map();
  for (const entry of header.split(',')) {
    const [rawName, ...parameters] = entry.trim().split(';');
    const name = rawName.toLowerCase();
    if (!name) continue;
    const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
    const parsedQuality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;
    qualities.set(name, Number.isFinite(parsedQuality) ? Math.min(1, Math.max(0, parsedQuality)) : 0);
  }
  return qualities;
}

function preferredEncoding(header) {
  const qualities = encodingQualities(header);
  const candidates = ['br', 'gzip']
    .map((encoding, preference) => ({
      encoding,
      quality: qualities.get(encoding) ?? qualities.get('*') ?? 0,
      preference,
    }))
    .filter(({ quality }) => quality > 0)
    .sort((left, right) => right.quality - left.quality || left.preference - right.preference);
  return candidates[0]?.encoding ?? null;
}

function compressible(contentType) {
  const mime = contentType.split(';', 1)[0];
  return mime.startsWith('text/') || COMPRESSIBLE_TYPES.has(mime);
}

async function compressedBody(file, encoding, body, modifiedAt) {
  const key = `${file}:${modifiedAt}:${encoding}`;
  const cached = compressedFiles.get(key);
  if (cached) return cached;

  const compressed =
    encoding === 'br' ? await compressBrotli(body) : await compressGzip(body);
  if (compressed.byteLength >= body.byteLength) return null;
  compressedFiles.set(key, compressed);
  if (compressedFiles.size > MAX_COMPRESSED_FILES) {
    compressedFiles.delete(compressedFiles.keys().next().value);
  }
  return compressed;
}

async function fileInfo(file) {
  try {
    return await stat(file);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function resolveFile(pathname) {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '');
  let file = resolve(root, relative);
  if (file !== root && !file.startsWith(root + sep)) return { forbidden: true };

  let info = await fileInfo(file);
  if (info?.isDirectory()) {
    file = join(file, 'index.html');
    info = await fileInfo(file);
  }

  if (!info && extname(relative) === '') {
    file = join(root, 'index.html');
    info = await fileInfo(file);
  }
  return info?.isFile() ? { file, info } : null;
}

async function handleRequest(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed', { allow: 'GET, HEAD' });
  }

  let pathname;
  try {
    pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  } catch {
    return send(res, 400, 'Bad request');
  }

  const resolved = await resolveFile(pathname);
  if (resolved?.forbidden) return send(res, 403, 'Forbidden');
  if (!resolved) return send(res, 404, 'Not found');

  const { file, info } = resolved;
  const body = await readFile(file);
  const contentType = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
  const headers = {
    'cache-control': cacheControl(pathname),
    'content-length': body.byteLength,
    'content-type': contentType,
  };
  let responseBody = body;

  if (compressible(contentType)) {
    headers.vary = 'Accept-Encoding';
    const encoding = preferredEncoding(req.headers['accept-encoding'] ?? '');
    if (encoding) {
      const compressed = await compressedBody(file, encoding, body, info.mtimeMs);
      if (compressed) {
        responseBody = compressed;
        headers['content-encoding'] = encoding;
        headers['content-length'] = compressed.byteLength;
      }
    }
  }

  res.writeHead(200, headers);
  res.end(req.method === 'HEAD' ? undefined : responseBody);
}

const server = createServer((req, res) => {
  void handleRequest(req, res).catch((error) => {
    console.error(`Falha ao servir ${req.url}:`, error);
    if (!res.headersSent) send(res, 500, 'Internal server error');
    else res.destroy(error);
  });
});

server.on('error', (error) => {
  console.error(`Falha ao iniciar servidor estático: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Servindo ${root} em http://127.0.0.1:${port}`));
