import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 160)));
await p.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector(".scenefilm-ramme").scrollIntoView({ block: "center" }));
await p.waitForTimeout(1200);
await p.screenshot({ path: ".skudd/scene-sys-stor.png" });
console.log("hvilket element målte vi:", await p.evaluate(() => {
  const t = document.querySelector(".scenefilm-ramme .section__head p, .scenefilm-ramme p");
  return t ? t.className + " | " + t.textContent.slice(0, 50) : "ingen";
}));
console.log("feil:", feil.length ? feil : "ingen");
await b.close();
