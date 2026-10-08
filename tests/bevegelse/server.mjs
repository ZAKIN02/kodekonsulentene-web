#!/usr/bin/env node
// Liten statisk server for testene av Scene.astro. Port 4330.
// - Serverer testsiden fra .design/arbeid/bevegelse/side/ på /
// - Serverer public/ (testvideoene ligger i /scener/test/)
// - Svarer 206 Partial Content på Range-forespørsler, slik nettleseren
//   trenger for å spole i video. Produksjonsserveren (server.mjs i rota)
//   må kontrolleres separat.
import http from 'node:http';
import { stat, readFile, open } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sideMappe = path.join(rot, '.design', 'arbeid', 'bevegelse', 'side');
const publicMappe = path.join(rot, 'public');
const port = Number(process.env.PORT ?? 4330);

// Generer testsidene før serveren svarer.
await import('./lag-testside.mjs');
await import('./lag-testside-oyeblikk.mjs');
await import('./lag-testside-prisvelger.mjs');

const typer = {
  '.html': 'text/html; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.avif': 'image/avif',
  '.js': 'text/javascript',
  '.css': 'text/css',
};

const finnFil = (url) => {
  const ren = decodeURIComponent(new URL(url, 'http://x').pathname);
  if (ren.includes('..')) return null;
  if (ren === '/' || ren === '/index.html') return path.join(sideMappe, 'index.html');
  if (ren.endsWith('.html')) return path.join(sideMappe, ren);
  return path.join(publicMappe, ren);
};

const server = http.createServer(async (req, res) => {
  const fil = finnFil(req.url ?? '/');
  if (!fil) {
    res.writeHead(400).end();
    return;
  }
  let info;
  try {
    info = await stat(fil);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Finnes ikke');
    return;
  }
  const type = typer[path.extname(fil)] ?? 'application/octet-stream';
  const range = req.headers.range;

  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!m || (m[1] === '' && m[2] === '')) {
      res.writeHead(416, { 'content-range': `bytes */${info.size}` }).end();
      return;
    }
    const start = m[1] === '' ? Math.max(0, info.size - Number(m[2])) : Number(m[1]);
    const slutt = m[1] !== '' && m[2] !== '' ? Math.min(Number(m[2]), info.size - 1) : info.size - 1;
    if (start > slutt || start >= info.size) {
      res.writeHead(416, { 'content-range': `bytes */${info.size}` }).end();
      return;
    }
    const fd = await open(fil, 'r');
    const buf = Buffer.alloc(slutt - start + 1);
    await fd.read(buf, 0, buf.length, start);
    await fd.close();
    res.writeHead(206, {
      'content-type': type,
      'accept-ranges': 'bytes',
      'content-range': `bytes ${start}-${slutt}/${info.size}`,
      'content-length': buf.length,
    });
    res.end(buf);
    return;
  }

  const data = await readFile(fil);
  res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': data.length });
  res.end(data);
});

server.listen(port, () => console.log(`Testserver på http://localhost:${port}/`));
