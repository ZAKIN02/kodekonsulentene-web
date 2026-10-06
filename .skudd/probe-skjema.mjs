import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, colorScheme: "dark", reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4710/kontakt", { waitUntil: "networkidle" });
await p.locator("form .field").first().scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
const g = await p.evaluate(() => {
  const f = [...document.querySelectorAll("form .field")];
  const u = f.reduce((a, e) => { const r = e.getBoundingClientRect();
    return { x: Math.min(a.x, r.left), y: Math.min(a.y, r.top), r: Math.max(a.r, r.right), b: Math.max(a.b, r.bottom) };
  }, { x: 1e9, y: 1e9, r: -1e9, b: -1e9 });
  return { x: Math.round(u.x), y: Math.round(u.y), bredde: Math.round(u.r - u.x), hoyde: Math.round(u.b - u.y),
           felt: f.map((e) => e.querySelector(".control")?.name), paakrevd: f.map((e) => e.querySelector(".control")?.required) };
});
console.log(JSON.stringify(g, null, 1));
// Sjekk at :user-invalid faktisk slaar inn
const ep = p.locator('input[name="epost"]');
await ep.click(); await ep.fill("hei@"); await p.locator('input[name="navn"]').click();
await p.waitForTimeout(300);
console.log("etter ugyldig e-post:", await p.evaluate(() => {
  const c = document.querySelector('input[name="epost"]');
  return { kant: getComputedStyle(c).borderColor, merke: getComputedStyle(c.closest(".field").querySelector("label"), "::after").content };
}));
await ep.fill("hei@kodekonsulentene.no"); await p.locator('input[name="navn"]').click();
await p.waitForTimeout(300);
console.log("etter gyldig e-post: ", await p.evaluate(() => {
  const c = document.querySelector('input[name="epost"]');
  return { kant: getComputedStyle(c).borderColor, merke: getComputedStyle(c.closest(".field").querySelector("label"), "::after").content };
}));
await b.close();
