import { chromium } from "playwright";
const b = await chromium.launch();
for (const [navn, opt] of [["normalt",{}],["redusert",{reducedMotion:"reduce"}],["uten JS",{javaScriptEnabled:false}]]) {
  const c = await b.newContext({ viewport: { width: 1512, height: 850 }, ...opt });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4723/", { waitUntil: "load" });
  await p.waitForTimeout(900);
  const li = await p.$(".kk-steps li");
  await li.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const li = document.querySelector(".kk-steps li"); const cs = getComputedStyle(li);
    return { kant: cs.borderTopColor, bred: cs.borderTopWidth, bgst: cs.backgroundSize.split(" ")[0],
             synligLinje: cs.borderTopColor !== "rgba(0, 0, 0, 0)" || !cs.backgroundSize.startsWith("0") };
  });
  console.log(`  ${navn.padEnd(9)} kant ${r.kant} ${r.bred}, bg ${r.bgst}  ->  ${r.synligLinje ? "LINJE SYNLIG" : "INGEN LINJE"}`);
  await c.close();
}
await b.close();
