// Servidor estático sem dependências. Uso: node tools/serve-static.mjs <diretório> <porta>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const [dirArg, portArg] = process.argv.slice(2);
if (!dirArg || !portArg) {
  console.error('Uso: node serve-static.mjs <diretório> <porta>');
  process.exit(1);
}
const root = resolve(dirArg);
const port = Number(portArg);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type });
  res.end(body);
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    const relative = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '');
    let file = join(root, relative);
    if (file !== root && !file.startsWith(root + sep)) return send(res, 403, 'Forbidden');
    const info = await stat(file).catch(() => null);
    if (!info) return send(res, 404, 'Not found');
    if (info.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file).catch(() => null);
    if (!body) return send(res, 404, 'Not found');
    send(res, 200, body, MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
  } catch {
    send(res, 400, 'Bad request');
  }
}).listen(port, '127.0.0.1', () => console.log(`Servindo ${root} em http://127.0.0.1:${port}`));
