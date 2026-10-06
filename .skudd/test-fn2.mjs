import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const kilde = readFileSync(".skudd/syn3.mjs", "utf8");
const fnTekst = kilde.slice(kilde.indexOf("function tommeRaderFraPiksel"), kilde.indexOf("async function tomrom"));
const fn = new Function("PNG", fnTekst + "; return tommeRaderFraPiksel;")(PNG);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 900 }, colorScheme: "dark" });
const url = process.argv[2];
for (const forsok of [1, 2]) {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
  console.log(`  forsøk ${forsok}:`, JSON.stringify(fn(await p.screenshot())));
}
await b.close();
