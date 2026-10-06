import { firefox, chromium } from "@playwright/test";
for (const [navn, motor] of [["Firefox", firefox], ["Chromium", chromium]]) {
  const b = await motor.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => ({
    supports: CSS.supports("animation-timeline: view()"),
    antallAvslor: document.querySelectorAll("[data-avslor], .avslor").length,
  }));
  // Finn et avdekkingselement langt nede og les opasiteten før og etter scroll
  const les = () => p.evaluate(() => {
    const e = document.querySelector("[data-avslor], .avslor");
    if (!e) return null;
    const m = e.firstElementChild || e;
    return +(+getComputedStyle(m).opacity).toFixed(2);
  });
  const serie = [];
  for (const y of [0, 1200, 2000, 3000]) {
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(500);
    serie.push(await les());
  }
  await p.screenshot({ path: `.skudd/avslor-${navn.toLowerCase()}.png` });
  await b.close();
  console.log("%s: supports=%s  avslor-elementer=%s  opacity=%s",
    navn, info.supports, info.antallAvslor, serie.join(" → "));
}
