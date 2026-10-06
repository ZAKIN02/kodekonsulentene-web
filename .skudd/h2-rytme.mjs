/** Kartlegger forsidens rytme: hvor seksjonene ligger, hvor media ligger,
 *  og hvor langt man scroller uten å møte et medieelement. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 } });
for (const s of sider) {
  await p.goto(base + s, { waitUntil: "networkidle" });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(80); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const vh = innerHeight;
    const seksjoner = [...document.querySelectorAll("section, .scene")].map(e => {
      const b = e.getBoundingClientRect();
      const t = (e.querySelector("h1,h2,.mega")?.textContent || "").trim().slice(0, 34);
      return { topp: Math.round(b.top + scrollY), h: Math.round(b.height), tittel: t };
    }).filter(x => x.h > 200);
    const media = [...document.querySelectorAll("video, img:not([data-logo])")].map(e => {
      const b = e.getBoundingClientRect();
      return { topp: Math.round(b.top + scrollY), h: Math.round(b.height), tag: e.tagName };
    }).filter(x => x.h > 80);
    // Lengste strekning uten et medieelement
    const punkter = media.map(m => m.topp + m.h / 2).sort((a, z) => a - z);
    let verst = 0, forrige = 0;
    for (const q of [...punkter, document.documentElement.scrollHeight]) { verst = Math.max(verst, q - forrige); forrige = q; }
    return { hoyde: document.documentElement.scrollHeight, vh, seksjoner, media, utenMedia: Math.round(verst) };
  });
  console.log(`\n${s}  høyde ${r.hoyde}px = ${(r.hoyde / r.vh).toFixed(1)} skjermer`);
  console.log(`  medieelementer: ${r.media.length}`);
  console.log(`  lengste strekning uten media: ${r.utenMedia}px = ${(r.utenMedia / r.vh).toFixed(1)} skjermer`);
  for (const x of r.seksjoner) {
    const harMedia = r.media.some(m => m.topp >= x.topp - 50 && m.topp < x.topp + x.h);
    console.log(`   ${String(Math.round(x.topp / r.vh)).padStart(3)}sk  ${harMedia ? "FILM/BILDE" : "          "}  ${x.tittel}`);
  }
}
await b.close();
