import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
const lum=(r,g,b)=>{const f=(c)=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};
const kontrast=(a,b)=>(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
const br = await chromium.launch();

// 1. Scenetekst mot faktisk malt bakgrunn
{
  const p = await br.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const mål = await p.evaluate(() => {
    const ut = [];
    for (const s of document.querySelectorAll(".scene")) {
      const t = s.querySelector(".scene__ingress") || s.querySelector(".stortekst");
      if (!t) continue;
      t.scrollIntoView({ block: "center" });
      ut.push({ id: s.id || s.querySelector(".kk-eyebrow")?.textContent?.trim() || "?",
                farge: getComputedStyle(t).color, y: Math.round(t.getBoundingClientRect().top + window.scrollY) });
    }
    return ut;
  });
  for (const m of mål) {
    await p.evaluate((y) => window.scrollTo(0, y - 300), m.y);
    await p.waitForTimeout(250);
    const png = PNG.sync.read(await p.screenshot());
    // Bakgrunnen er flat her; mål et punkt godt inne i innholdsbredden.
    const i = (png.width * 400 + 200) << 2;
    const Lb = lum(png.data[i], png.data[i+1], png.data[i+2]);
    const [r,g,b] = m.farge.match(/\d+/g).map(Number);
    const k = kontrast(lum(r,g,b), Lb);
    console.log("  %s %s:1 %s", (m.id+"").padEnd(26), k.toFixed(2), k>=4.5?"OK":"STRYKER");
  }
  await p.close();
}

// 2. Redusert bevegelse: alt skal stå ferdig
{
  const p = await br.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
  await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const skjult = await p.evaluate(() =>
    [...document.querySelectorAll(".avslor, .stortekst .ord")].filter((e) => +getComputedStyle(e).opacity < 0.99).length);
  console.log("  redusert bevegelse: %d elementer under full opasitet (skal være 0)", skjult);
  await p.close();
}

// 3. Uten JavaScript: alt innhold synlig
{
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:4399/", { waitUntil: "domcontentloaded" });
  console.log("  uten JS: %d scener, %d prisekort, %d h1",
    await p.locator(".scene").count(), await p.locator(".kk-price").count(), await p.locator("h1").count());
  await ctx.close();
}
await br.close();
