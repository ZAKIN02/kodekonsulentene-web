import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const s of ["/", "/historie", "/sikkerhet", "/priser"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: "dark" });
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 70)));
  await p.goto("http://127.0.0.1:4777" + s, { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(1200);
  const d = await p.evaluate(() => {
    const m = document.querySelector(".hist__media, .scenefilm, .herofilm");
    window.scrollTo(0, 1200);
    return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      hoyde: document.body.scrollHeight, h1: document.querySelectorAll("h1").length,
      stickyPos: m ? getComputedStyle(m).position : "n/a" };
  });
  console.log(s.padEnd(12), `bredde ${d.sw}/${d.cw}`, `h1=${d.h1}`, `høyde=${d.hoyde}`, `sticky=${d.stickyPos}`, feil.length ? `FEIL ${feil.length}` : "");
  await p.close();
}
await b.close();
