/** Tar rammer tett gjennom aapningens 1500 ms, i stedet for aa scrolle.
 *  Rydder sessionStorage foerst, ellers vises den bare én gang. */
import { chromium } from "playwright";
const [url, ut, temaRaa] = process.argv.slice(2);
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: temaRaa === "light" ? "light" : "dark" });
const p = await c.newPage();
const filer = [];
await p.goto(url, { waitUntil: "commit" });
for (let i = 0; i < 6; i++) {
  const t = [120, 350, 600, 850, 1150, 1420][i];
  await p.waitForTimeout(i === 0 ? t : t - [120, 350, 600, 850, 1150, 1420][i - 1]);
  const f = `.skudd/apn/${ut}-${i}.png`;
  await p.screenshot({ path: f });
  filer.push(f);
}
console.log("  " + filer.join(" "));
await b.close();
