/** Maaler kontrast paa FAKTISKE piksler i glyffenes kjerne, ikke paa CSS-farge.
 *  CSS-farge luger ved gjennomsiktige flater; antialiaserte kanter gir falske lave tall. */
import { chromium } from "playwright";
import { PNG } from "pngjs";
const [base] = process.argv.slice(2);
const L = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const K = (a, b2) => { const [x, y] = [L(...a), L(...b2)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const b = await chromium.launch();
for (const tema of ["dark", "light"]) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(base + "/", { waitUntil: "networkidle" });
  if (tema === "light") await p.evaluate(() => (document.documentElement.dataset.theme = "light"));
  await p.waitForTimeout(700);
  for (const [navn, velger] of [["menylenke", ".topbar nav a"], ["menyflate", ".topbar__inner"]]) {
    const el = p.locator(velger).first();
    const r = await el.boundingBox();
    const buf = await p.screenshot({ clip: r });
    const png = PNG.sync.read(buf);
    const piksler = [];
    for (let i = 0; i < png.data.length; i += 4) piksler.push([png.data[i], png.data[i+1], png.data[i+2]]);
    piksler.sort((a2, b3) => L(...a2) - L(...b3));
    const moerk = piksler[Math.floor(piksler.length * 0.05)];
    const lys = piksler[Math.floor(piksler.length * 0.95)];
    console.log(`  ${tema.padEnd(5)} ${navn.padEnd(10)} ${K(moerk, lys).toFixed(2)}:1`);
  }
  await c.close();
}
await b.close();
