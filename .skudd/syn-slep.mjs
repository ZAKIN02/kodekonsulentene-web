/** Ser paa dra-sammenligningen slik en mobilbruker moeter den. Ekte beroering. */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
const [url, bredde="390", hoyde="844"] = process.argv.slice(2);
mkdirSync(".skudd/syn/slep",{recursive:true});
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:+bredde,height:+hoyde}, hasTouch:true, isMobile:true, deviceScaleFactor:2, userAgent: devices["Pixel 7"].userAgent });
const p = await ctx.newPage();
await p.goto(url,{waitUntil:"networkidle",timeout:60000});
await p.waitForTimeout(1500);
const f = await p.locator("[data-slep]").first();
await f.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
const info = async (merk) => p.evaluate((m)=>{
  const r=document.querySelector("[data-slep]"); const fl=r.querySelector("[data-slep-flate]");
  const rb=fl.getBoundingClientRect();
  const sp=r.querySelector("[data-slep-spak]");
  const sb=sp.getBoundingClientRect(); const ss=getComputedStyle(sp);
  const li=r.querySelector(".slep__linje"); const ls=getComputedStyle(li); const lb=li.getBoundingClientRect();
  const kn=r.querySelector(".slep__knott"); const kb=kn.getBoundingClientRect();
  const paneler=[...r.querySelectorAll("[data-slep-panel]")].map(x=>{const q=x.getBoundingClientRect();
    const inn=x.querySelector(".slep__innhold").getBoundingClientRect();
    return {navn:x.dataset.slepPanel,h:Math.round(q.height),w:Math.round(q.width),innH:Math.round(inn.height),klippet:Math.round(inn.height-q.height)};});
  return {m, p:r.style.getPropertyValue("--p"), flateTopp:Math.round(rb.top), flateH:Math.round(rb.height),
    overKant: rb.top<0 ? Math.round(-rb.top):0, underKant: rb.bottom>innerHeight?Math.round(rb.bottom-innerHeight):0,
    spakH:Math.round(sb.height), spakSynlig: ss.display!=="none"&&sb.height>0, spakIsyn: sb.top>0&&sb.bottom<innerHeight,
    linjeDisp:ls.display, linjeH:Math.round(lb.height), linjeW:Math.round(lb.width), linjeTopp:Math.round(lb.top),
    knottW:Math.round(kb.width), knottH:Math.round(kb.height), knottIsyn: kb.top>0&&kb.bottom<innerHeight,
    forteller: r.querySelector("[data-slep-forteller]").textContent.trim(),
    hint: [...r.querySelectorAll(".slep__hint")].filter(h=>getComputedStyle(h).display!=="none").map(h=>h.textContent.trim()),
    paneler, vindu: innerHeight};
},merk);
console.log(JSON.stringify(await info("ved innrulling")));
await p.waitForTimeout(4500);                       // la sveipen gaa ferdig
console.log(JSON.stringify(await info("etter sveip")));
await p.screenshot({path:`.skudd/syn/slep/slep-${bredde}-a.png`});
// Proev aa DRA paa flaten, slik en bruker ville
const fb = await f.boundingBox();
await p.touchscreen.tap(fb.x+fb.width/2, fb.y+fb.height*0.25);
await p.waitForTimeout(900);
console.log(JSON.stringify(await info("etter trykk oeverst")));
await p.screenshot({path:`.skudd/syn/slep/slep-${bredde}-b.png`});
// Dra paa selve flaten (gest)
await p.mouse.move(fb.x+fb.width/2, fb.y+fb.height*0.3);
await p.mouse.down(); await p.mouse.move(fb.x+fb.width/2, fb.y+fb.height*0.8, {steps:12}); await p.mouse.up();
await p.waitForTimeout(700);
console.log(JSON.stringify(await info("etter drag paa flaten")));
await p.screenshot({path:`.skudd/syn/slep/slep-${bredde}-c.png`});
await b.close();
