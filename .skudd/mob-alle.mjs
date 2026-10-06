import { chromium } from "@playwright/test";
const SIDER = ["/", "/historie", "/nettsider", "/systemer", "/apper-og-ai", "/sikkerhet",
  "/priser", "/caser", "/om", "/verktoy", "/verktoy/priskalkulator", "/verktoy/dmarc",
  "/verktoy/cookie-sjekk", "/verktoy/uu-sjekk", "/kontakt", "/handbok", "/status",
  "/terminal", "/personvern", "/vilkar", "/finnes-ikke",
  "/bransjer/handverkere", "/bransjer/klinikker"];
// Helsesjekk først. Andre prosesser i prosjektet rydder med
// `pkill -f "server.mjs"` og dreper testserveren midt i kjøringen. Uten denne
// sjekken ser en drept server ut som 23 ødelagte sider.
const svar = await fetch("http://127.0.0.1:4777/").catch(() => null);
if (!svar || !svar.ok) { console.error("Serveren svarer ikke på 8080. Start den og prøv igjen."); process.exit(1); }

const b = await chromium.launch();
for (const sti of SIDER) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
    colorScheme: "dark", isMobile: true, hasTouch: true });
  const feil = [];
  p.on("console", (m) => m.type() === "error" && feil.push(m.text().slice(0, 80)));
  await p.goto("http://127.0.0.1:4777" + sti, { waitUntil: "networkidle", timeout: 40000 }).catch(()=>{});
  await p.waitForTimeout(900);
  const d = await p.evaluate(() => {
    const doc = document.documentElement, vw = doc.clientWidth;
    const over = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (getComputedStyle(el).position === "fixed") continue;
      if (r.right > vw + 1 || r.left < -1)
        over.push(el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0] + " [" + Math.round(r.left) + "→" + Math.round(r.right) + "]");
    }
    const smaa = [];
    for (const el of document.querySelectorAll('a,button,input,select,textarea,summary,[role="button"]')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.width < 24 || r.height < 24)
        smaa.push(el.tagName.toLowerCase() + ":" + (el.textContent||"").trim().slice(0,18) + " " + Math.round(r.width) + "x" + Math.round(r.height));
    }
    return { sw: doc.scrollWidth, cw: vw, over: [...new Set(over)].slice(0,6), smaa: [...new Set(smaa)].slice(0,6),
      h1: document.querySelectorAll("h1").length, hoyde: document.body.scrollHeight };
  });
  await p.close();
  const sidelengs = d.sw > d.cw + 1;
  const flagg = [sidelengs ? `SIDELENGS ${d.sw}px` : null, d.h1 !== 1 ? `h1=${d.h1}` : null,
    d.over.length ? `overflyt:${d.over.length}` : null, d.smaa.length ? `små:${d.smaa.length}` : null,
    feil.length ? `feil:${feil.length}` : null].filter(Boolean);
  console.log(`${sti.padEnd(28)} ${String(d.hoyde).padStart(6)}px  ${flagg.length ? flagg.join(" · ") : "ok"}`);
  if (d.over.length) console.log("      over:", d.over.join(" | "));
  if (d.smaa.length) console.log("      små :", d.smaa.join(" | "));
  if (feil.length) console.log("      feil:", feil.join(" | "));
}
await b.close();
