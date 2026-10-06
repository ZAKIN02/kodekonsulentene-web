import { chromium } from "playwright";
const b = await chromium.launch();
const sjekk = async (navn, opt, forberedelse) => {
  const c = await b.newContext({ viewport: { width: 1280, height: 800 }, ...opt });
  const p = await c.newPage();
  if (forberedelse) await p.addInitScript(forberedelse);
  await p.goto("http://127.0.0.1:4861/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const e = document.querySelector("[data-apning-flate]");
    const h1 = document.querySelector("h1");
    const cs = e ? getComputedStyle(e) : null;
    return {
      vist: cs ? cs.display !== "none" : false,
      innhold: h1 ? (h1.textContent || "").trim().slice(0, 28) : "INGEN H1",
      // naar overlegget er borte, skal ingenting ligge over innholdet
      treff: (document.elementFromPoint(640, 400) || {}).className || "",
    };
  });
  console.log(`  ${navn.padEnd(26)} vist:${String(r.vist).padEnd(5)} h1:"${r.innhold}"`);
  await c.close();
};
await sjekk("normalt (foerste besoek)", {});
await sjekk("redusert bevegelse", { reducedMotion: "reduce" });
await sjekk("uten JavaScript", { javaScriptEnabled: false });
await sjekk("andre besoek i oekten", {}, () => { try { sessionStorage.setItem("kk-apning", "1"); } catch (e) {} });
await b.close();
