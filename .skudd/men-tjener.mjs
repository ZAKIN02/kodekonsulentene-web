/** Liten statisk tjener over et isolert bygg. Finnes fordi den delte dev-
 *  serveren startes og stoppes av andre agenter midt i en måling, og fordi
 *  bygget er det eneste stedet den minifiserte CSS-en faktisk kan måles. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
const ROT = join(process.cwd(), ".skudd/dist-men/client");
const T = { ".html":"text/html;charset=utf-8", ".js":"text/javascript", ".css":"text/css", ".png":"image/png",
  ".jpg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".json":"application/json",
  ".mp4":"video/mp4", ".txt":"text/plain", ".xml":"application/xml", ".avif":"image/avif", ".ico":"image/x-icon" };
createServer(async (q, s) => {
  let sti = decodeURIComponent(new URL(q.url, "http://x").pathname);
  let f = join(ROT, sti);
  try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); }
  catch { f = join(ROT, sti.replace(/\/$/, "") + "/index.html"); }
  try {
    const d = await readFile(f);
    s.writeHead(200, { "content-type": T[extname(f)] || "application/octet-stream" });
    s.end(d);
  } catch { s.writeHead(404, { "content-type": "text/plain" }); s.end("404"); }
}).listen(4877, () => console.log("tjener: http://localhost:4877"));
