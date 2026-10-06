import { chromium, firefox } from "@playwright/test";
const BASE = "http://127.0.0.1:4425";

async function faq(motor, navn, redusert = false) {
  const b = await motor.launch();
  const s = await b.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: redusert ? "reduce" : "no-preference",
  });
  await s.goto(BASE + "/", { waitUntil: "networkidle" });
  const d = s.locator(".faq details").first();
  await d.scrollIntoViewIfNeeded();
  const h = [];
  await d.locator("summary").click();
  for (let i = 0; i < 9; i++) {
    h.push(Math.round(await d.evaluate((e) => e.getBoundingClientRect().height)));
    await s.waitForTimeout(35);
  }
  const apen = await d.evaluate((e) => e.open);
  const synlig = await d.locator("div").first().evaluate((e) => e.getBoundingClientRect().height > 10);
  console.log(`FAQ ${navn}${redusert ? " (redusert bevegelse)" : ""}: ${h.join(" → ")}  | open=${apen} innhold synlig=${synlig}`);
  await b.close();
}

async function kvittering(motor, navn) {
  const b = await motor.launch();
  const s = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await s.addInitScript(() => {
    window.__spor = [];
    const tikk = () => {
      const k = document.querySelector(".kvittering");
      if (k) window.__spor.push(+getComputedStyle(k).opacity);
      if (window.__spor.length < 30) requestAnimationFrame(tikk);
    };
    requestAnimationFrame(tikk);
  });
  await s.goto(`${BASE}/kontakt?sendt=1`, { waitUntil: "networkidle" });
  await s.waitForTimeout(500);
  const spor = await s.evaluate(() => window.__spor);
  const sluttOpasitet = await s.evaluate(() => getComputedStyle(document.querySelector(".kvittering")).opacity);
  console.log(`Kvittering ${navn}: første ${spor.slice(0, 6).join(", ")} … slutt ${sluttOpasitet}`);
  await b.close();
}

for (const [n, m] of [["Chromium", chromium], ["Firefox", firefox]]) {
  await faq(m, n);
  await faq(m, n, true);
  await kvittering(m, n);
}
