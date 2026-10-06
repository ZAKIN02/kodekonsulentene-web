import { chromium, devices } from "@playwright/test";
const URL = "http://127.0.0.1:4399/lab/rontgen";
const b = await chromium.launch();
const les = (p) => p.evaluate(() => {
  const d = document.querySelector(".rontgen__design");
  const rot = document.querySelector("[data-rontgen]");
  const cs = getComputedStyle(d);
  return {
    h: cs.getPropertyValue("--h").trim(),
    x: cs.getPropertyValue("--x").trim(),
    y: cs.getPropertyValue("--y").trim(),
    klar: rot.hasAttribute("data-klar"),
    linse: rot.hasAttribute("data-linse"),
    maske: cs.maskImage !== "none",
  };
});

// 1. Tastatur
{
  const p = await b.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.focus("[data-rontgen-flate]");
  await p.keyboard.press("ArrowRight");
  await p.keyboard.press("ArrowRight");
  await p.keyboard.press("ArrowDown");
  await p.waitForTimeout(200);
  const e = await les(p);
  const st = await p.textContent("[data-rontgen-status]");
  console.log("tastatur      :", JSON.stringify(e), "| status:", JSON.stringify(st?.trim()));
  // Bryteren
  await p.click("[data-rontgen-bryter]");
  await p.waitForTimeout(250);
  const e2 = await les(p);
  console.log("bryter på     :", JSON.stringify(e2), "| tekst:", await p.textContent("[data-rontgen-bryter]"));
  await p.close();
}
// 2. Berøring
{
  const ctx = await b.newContext({ ...devices["Pixel 7"], colorScheme: "dark", hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.locator("[data-rontgen-flate]").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  const bk = await p.locator("[data-rontgen-flate]").boundingBox();
  await p.touchscreen.tap(bk.x + bk.width * 0.5, bk.y + bk.height * 0.5);
  await p.waitForTimeout(250);
  console.log("berøring tap  :", JSON.stringify(await les(p)));
  await ctx.close();
}
// 3. Uten JavaScript
{
  const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: "domcontentloaded" });
  const r = await p.evaluate(() => {
    const rot = document.querySelector("[data-rontgen]");
    const inn = document.querySelector(".rontgen__innside");
    const des = document.querySelector(".rontgen__design");
    const ir = inn.getBoundingClientRect(), dr = des.getBoundingClientRect();
    return {
      klar: rot.hasAttribute("data-klar"),
      maske: getComputedStyle(des).maskImage !== "none",
      innsideSynlig: ir.width > 0 && ir.height > 0,
      designSynlig: dr.width > 0 && dr.height > 0,
      overlapper: !(ir.bottom <= dr.top + 1 || dr.bottom <= ir.top + 1),
      rader: document.querySelectorAll(".rontgen__liste li").length,
    };
  });
  console.log("uten JS       :", JSON.stringify(r));
  await ctx.close();
}
// 4. Redusert bevegelse
{
  const ctx = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  const bk = await p.locator("[data-rontgen-flate]").boundingBox();
  await p.mouse.move(bk.x + bk.width * 0.4, bk.y + bk.height * 0.5);
  await p.waitForTimeout(250);
  console.log("redusert      :", JSON.stringify(await les(p)));
  await ctx.close();
}
await b.close();
