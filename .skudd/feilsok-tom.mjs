import { chromium } from "playwright";
import { PNG } from "pngjs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4525/om", { waitUntil: "networkidle" });
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
const buf = await p.screenshot();
const png = PNG.sync.read(buf);
const { width: W, height: H, data } = png;
const tell = new Map();
for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) {
  const i = (y * W + x) * 4;
  const k = (data[i] >> 3) * 1024 + (data[i+1] >> 3) * 32 + (data[i+2] >> 3);
  tell.set(k, (tell.get(k) || 0) + 1);
}
let topp = 0, best = -1;
for (const [k, n] of tell) if (n > best) { best = n; topp = k; }
const br = ((topp/1024)|0)<<3, bg = (((topp/32)|0)%32)<<3, bb = (topp%32)<<3;
console.log("dominant farge rgb:", br, bg, bb, " andel:", (best/((H/4)*(W/4))*100).toFixed(1)+"%");
const andelPerRad = [];
for (let y = 0; y < H; y += 50) {
  let like = 0, sum = 0;
  for (let x = 0; x < W; x += 2) {
    const i = (y*W+x)*4; sum++;
    if (Math.abs(data[i]-br)+Math.abs(data[i+1]-bg)+Math.abs(data[i+2]-bb) < 26) like++;
  }
  andelPerRad.push(`y${y}:${(like/sum*100).toFixed(1)}%`);
}
console.log(andelPerRad.join("  "));
await b.close();
