import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const feil = [];
p.on("console", (m) => m.type() === "error" && feil.push(m.text()));
p.on("pageerror", (e) => feil.push("PAGEERROR: " + e.message));
p.on("requestfailed", (r) => feil.push("FAILED: " + r.url() + " " + (r.failure()?.errorText ?? "")));
await p.goto("https://kodekonsulentene.no/historie", { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(2500);
const d = await p.evaluate(() => {
  const rot = document.querySelector("[data-story]");
  const v = rot?.querySelector("video");
  const s = v?.querySelector("source");
  const media = rot?.querySelector(".hist__media");
  return {
    finnesRot: !!rot,
    aktiv: rot ? rot.hasAttribute("data-aktiv") : null,
    klar: rot?.dataset.klar ?? null,
    srcSatt: s?.getAttribute("src") ?? "(ikke satt)",
    dataDesktop: s?.dataset.desktop ?? "(mangler)",
    readyState: v?.readyState,
    duration: v?.duration,
    videoRect: v ? JSON.stringify(v.getBoundingClientRect()) : null,
    mediaPosition: media ? getComputedStyle(media).position : null,
    mediaHeight: media ? getComputedStyle(media).height : null,
    rotHeight: rot ? rot.offsetHeight : null,
    vindu: window.innerHeight,
  };
});
console.log(JSON.stringify(d, null, 2));
console.log("FEIL:", feil.length ? feil : "ingen");
await b.close();
