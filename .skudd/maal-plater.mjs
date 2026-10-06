import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 950 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:4399/lab/interaksjon", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
const maal = async (a) => {
  await p.evaluate((a) => document.querySelector("[data-stabel]").style.setProperty("--a", String(a)), a);
  await p.waitForTimeout(400);
  return p.evaluate(() => {
  const rot = document.querySelector("[data-stabel]");
  const plater = [...rot.querySelectorAll(".stabel__plate")].map((e) => {
    const r = e.getBoundingClientRect();
    return Math.round(r.top + r.height / 2);
  });
  const merker = [...rot.querySelectorAll(".stabel__merke")].map((e) => {
    const r = e.getBoundingClientRect();
    return Math.round(r.top + r.height / 2);
  });
  return { plater, merker };
  });
};
const a0 = await maal(0);
const a1 = await maal(1);
console.log("a=0  plater:", a0.plater, " merker:", a0.merker);
console.log("a=1  plater:", a1.plater, " merker:", a1.merker);
const stegPlate = (a1.plater[0] - a1.plater[3]) / 3;
const stegMerke = (a1.merker[0] - a1.merker[3]) / 3;
console.log("steg per lag ved a=1 — plate:", stegPlate.toFixed(1), " merke:", stegMerke.toFixed(1));
await b.close();
