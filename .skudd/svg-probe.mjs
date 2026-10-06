import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4455/lab/svg", { waitUntil: "networkidle" });
await p.waitForTimeout(600);

console.log("støtter view():", await p.evaluate(() => CSS.supports("animation-timeline: view()")));
const info = await p.evaluate(() => {
  const el = document.querySelector(".flyt");
  const r = el.getBoundingClientRect();
  return { topp: Math.round(r.top + window.scrollY), hoyde: Math.round(r.height), sideH: document.body.scrollHeight };
});
console.log("flyt:", JSON.stringify(info));

const les = () => p.evaluate(() => {
  const s = [...document.querySelectorAll(".flyt__strek")];
  const r = [...document.querySelectorAll(".flyt__ring")];
  const g = (e) => { const c = getComputedStyle(e); return c.strokeDashoffset + "|" + c.strokeDasharray + "|" + c.animationName; };
  return { y: Math.round(window.scrollY), strek: s.map(g), ring: r.map(g) };
});

// Scroll fra «rett før flyten kommer inn» til «rett etter den er ute».
const start = info.topp - 800;
const slutt = info.topp + info.hoyde;
for (let i = 0; i <= 8; i++) {
  const y = Math.round(start + (slutt - start) * i / 8);
  await p.evaluate((v) => window.scrollTo(0, v), y);
  await p.waitForTimeout(220);
  const d = await les();
  console.log(`  y=${String(d.y).padStart(5)}  strek=[${d.strek.join(" ")}]  ring=[${d.ring.join(" ")}]`);
}
await b.close();
