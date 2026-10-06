/**
 * Byte ved foerstelast kontra etter scroll. SceneFilm og Demo skal laste film
 * foerst ved 60 % av skjermhoeyden – uten det dro /nettsider ned 5685 kB foer
 * brukeren hadde scrollet i det hele tatt.
 *
 * content-length summeres SYNKRONT per svar. response.body() er asynkron, og en
 * side som lukkes foer alle lofter er innfridd gir umulige tall – «18 kB» paa en
 * side med 65 kB HTML.
 */
import { chromium } from "playwright";
const [base, profil, ...sider] = process.argv.slice(2);
const mob = profil === "mobile";
const b = await chromium.launch();
for (const s of sider) {
  const ctx = await b.newContext({
    viewport: mob ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mob ? 2.625 : 1, isMobile: mob,
  });
  const p = await ctx.newPage();
  let foer = 0, etter = 0, film = 0, scrollet = false;
  p.on("response", (r) => {
    const n = Number(r.headers()["content-length"] || 0);
    if (!n) return;
    if (scrollet) etter += n; else foer += n;
    if (/\.(mp4|webm)(\?|$)/.test(r.url())) film += n;
  });
  await p.goto(base + s, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  const filmFoer = film;
  scrollet = true;
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(110); }
  await p.waitForTimeout(1600);
  const kb = (n) => Math.round(n / 1024);
  console.log(
    `  ${s.padEnd(30)} foer ${String(kb(foer)).padStart(5)}kB  (film ${String(kb(filmFoer)).padStart(5)}kB)` +
    `   etter scroll +${String(kb(etter)).padStart(5)}kB  = ${String(kb(foer + etter)).padStart(5)}kB` +
    (filmFoer > 300 * 1024 ? "   <-- FILM FOER SCROLL" : ""));
  await ctx.close();
}
await b.close();
