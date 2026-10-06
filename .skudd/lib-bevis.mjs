import { firefox, chromium } from "@playwright/test";
for (const [navn, motor] of [["Firefox", firefox], ["Chromium", chromium]]) {
  const b = await motor.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto("http://127.0.0.1:4399/lab/bibliotek", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const st = await p.evaluate(() => CSS.supports("animation-timeline: view()"));
  const les = () => p.evaluate(() => {
    const g = (s) => { const e = document.querySelectorAll(s)[1]; return e ? getComputedStyle(e).animationName : "?"; };
    return { stenografi: g(".kort--stenografi"), langform: g(".kort--langform") };
  });
  const navnene = await les();
  await p.evaluate(() => window.scrollTo(0, 900));
  await p.waitForTimeout(700);
  await p.screenshot({ path: `.skudd/bevis-${navn.toLowerCase()}.png` });
  await b.close();
  console.log(`${navn}: supports=${st}  animationName stenografi="${navnene.stenografi}"  langform="${navnene.langform}"`);
}
