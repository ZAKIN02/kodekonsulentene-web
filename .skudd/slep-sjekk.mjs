import { chromium, devices } from "playwright";
const [bredde="390",hoyde="844"]=process.argv.slice(2);
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:+bredde,height:+hoyde},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();
const feil=[]; p.on("pageerror",e=>feil.push(String(e).slice(0,160)));
p.on("console",m=>{if(m.type()==="error")feil.push("[konsoll] "+m.text().slice(0,160));});
await p.goto("https://kodekonsulentene.no/",{waitUntil:"networkidle"});
await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{
  const el=document.querySelector("[data-slep]");
  if(!el) return {finnes:false};
  el.scrollIntoView({block:"center",behavior:"instant"});
  return null;
});
await p.waitForTimeout(5000);
const d=await p.evaluate(()=>{
  const el=document.querySelector("[data-slep]");
  const fl=el.querySelector("[data-slep-flate]"); const fb=fl.getBoundingClientRect();
  const k=el.querySelector(".slep__kontroll"); const sp=el.querySelector(".slep__spak,[data-slep-spak],input.spak");
  const li=el.querySelector(".slep__linje");
  const pan=[...el.querySelectorAll(".slep__panel")].map(x=>{const q=x.getBoundingClientRect();return `${x.className.split(" ")[1]}:${Math.round(q.width)}x${Math.round(q.height)}@y${Math.round(q.top)}`});
  return {
    klar: el.dataset.klar ?? null,
    p: el.style.getPropertyValue("--p") || "(ikke satt)",
    harKnott: !!el.querySelector(".slep__knott"),
    harForteller: !!el.querySelector("[data-slep-forteller]"),
    harPanelAttr: el.querySelectorAll("[data-slep-panel]").length,
    kontrollDisplay: k?getComputedStyle(k).display:"MANGLER",
    spakSynlig: sp?getComputedStyle(sp).display:"MANGLER",
    spakH: sp?Math.round(sp.getBoundingClientRect().height):0,
    linjeDisplay: li?getComputedStyle(li).display:"MANGLER",
    linjeRect: li?[...["width","height"]].map(k=>Math.round(li.getBoundingClientRect()[k])).join("x"):"-",
    flate: `${Math.round(fb.width)}x${Math.round(fb.height)} @y${Math.round(fb.top)}`,
    vindu: innerHeight, paneler: pan,
    hint: [...el.querySelectorAll(".interaksjon-hint,.slep__hint")].map(h=>`${getComputedStyle(h).display}:${h.textContent.trim().slice(0,46)}`),
    gridKol: getComputedStyle(fl).gridTemplateColumns, gridRad: getComputedStyle(fl).gridTemplateRows,
  };
});
console.log(JSON.stringify(d,null,1)); console.log("FEIL:",feil);
await p.screenshot({path:`.skudd/syn/slep-${bredde}.png`});
await b.close();
