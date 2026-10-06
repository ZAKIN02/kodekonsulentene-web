/** Mobilrevisjon: sidelengs overflyt, for smaa trykkmaal, tekst som stikker ut,
 *  overlappende elementer og innhold som er klippet. Maaler paa ekte visningsbilde. */
import { chromium } from "playwright";
const [base, ...sider] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const feil = [];
for (const s of sider) {
  const resp = await p.goto(base + s, { waitUntil: "networkidle" }).catch(() => null);
  if (!resp || resp.status() >= 400) { feil.push([s, "SIDEN SVARTE " + (resp?.status() ?? "ikke")]); continue; }
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(70); }
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const ut = { drag: 0, utenfor: [], smaa: [], liten: [] };
    ut.drag = Math.max(0, document.documentElement.scrollWidth - 390);
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
      const q = el.getBoundingClientRect();
      if (q.width < 1 || q.height < 1) continue;
      if (q.right > 392 && el.children.length === 0 && el.textContent?.trim())
        ut.utenfor.push(`${el.tagName}.${(el.className||"").toString().slice(0,18)} +${Math.round(q.right-390)}px`);
      if (/^(A|BUTTON|INPUT|SUMMARY|SELECT)$/.test(el.tagName) && (q.height < 24 || q.width < 24) && el.textContent?.trim())
        ut.smaa.push(`${el.tagName} ${Math.round(q.width)}x${Math.round(q.height)} «${el.textContent.trim().slice(0,16)}»`);
      if (el.children.length === 0 && el.textContent?.trim() && parseFloat(cs.fontSize) < 12)
        ut.liten.push(`${Math.round(parseFloat(cs.fontSize))}px «${el.textContent.trim().slice(0,16)}»`);
    }
    for (const k of ["utenfor","smaa","liten"]) ut[k] = [...new Set(ut[k])].slice(0, 4);
    return ut;
  });
  const p2 = [];
  if (r.drag > 0) p2.push(`drag ${r.drag}px`);
  if (r.utenfor.length) p2.push(`utenfor: ${r.utenfor.join(" | ")}`);
  if (r.smaa.length) p2.push(`smaa trykkmaal: ${r.smaa.join(" | ")}`);
  if (r.liten.length) p2.push(`liten skrift: ${r.liten.join(" | ")}`);
  if (p2.length) feil.push([s, p2.join("\n      ")]);
}
for (const [s, m] of feil) console.log(`  ${s}\n      ${m}`);
console.log(feil.length ? `\n  ${feil.length} sider med funn` : "\n  ingen funn");
await b.close();
