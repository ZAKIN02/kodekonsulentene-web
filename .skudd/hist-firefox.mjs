import { firefox, chromium } from "@playwright/test";
for (const [navn, motor] of [["Firefox", firefox], ["Chromium", chromium]]) {
  const b = await motor.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto("http://127.0.0.1:4399/historie", { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const d = await p.evaluate(() => {
    const k = document.querySelector(".hist__kort > *");
    if (!k) return { feil: "fant ikke .hist__kort > *" };
    const cs = getComputedStyle(k);
    return { animationName: cs.animationName, antall: k.getAnimations ? k.getAnimations().length : "?" };
  });
  await b.close();
  console.log("%-9s animationName=%s  animasjoner=%s", navn, d.animationName ?? d.feil, d.antall ?? "-");
}
