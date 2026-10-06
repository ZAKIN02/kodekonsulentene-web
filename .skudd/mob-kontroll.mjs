import { chromium } from "playwright";
const b=await chromium.launch();
for(const w of [390,412]){
const ctx=await b.newContext({viewport:{width:w,height:w===390?844:915},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto("https://kodekonsulentene.no/",{waitUntil:"networkidle"}); await p.waitForTimeout(2000);
const d=await p.evaluate(()=>{
  const ut={};
  // 1. Navigasjonen i topplinja
  const nav=document.querySelector("header nav");
  if(nav){const c=getComputedStyle(nav); const r=nav.getBoundingClientRect();
    const lenker=[...nav.querySelectorAll("a")].map(a=>{const q=a.getBoundingClientRect();
      return {t:a.textContent.trim(),h:Math.round(q.right), utenfor: q.right>innerWidth};});
    ut.nav={overflowX:c.overflowX, bredde:Math.round(r.width), scrollW:nav.scrollWidth, klippet:lenker.filter(l=>l.utenfor).map(l=>l.t),
      sisteSynlige:lenker.filter(l=>!l.utenfor).map(l=>l.t).slice(-1)[0]};}
  // 2. Alle range-spaker: er de synlige og store nok (WCAG 2.5.8: 24px)
  ut.spaker=[...document.querySelectorAll('input[type=range]')].map(s=>{const c=getComputedStyle(s),r=s.getBoundingClientRect();
    return {id:s.id, display:c.display, h:Math.round(r.height), w:Math.round(r.width), isyn:r.height>0&&r.width>0};});
  // 3. "Ta siden fra hverandre"-kontrollen
  const av=document.querySelector("[data-avslor],.avslor");
  if(av){const r=av.getBoundingClientRect();
    ut.avslor={klasse:av.className.slice(0,40),h:Math.round(r.height),
      hint:[...av.querySelectorAll(".interaksjon-hint,[class*=hint]")].map(h=>`${getComputedStyle(h).display}:${h.textContent.trim().slice(0,50)}`),
      knapper:[...av.querySelectorAll("button,input")].map(x=>{const q=x.getBoundingClientRect();const c=getComputedStyle(x);
        return `${x.tagName}:${c.display}:${Math.round(q.width)}x${Math.round(q.height)}`;})};}
  ut.topplinje=(()=>{const h=document.querySelector("header.topbar");const r=h.getBoundingClientRect();
    return `${Math.round(r.height)}px = ${Math.round(r.height/innerHeight*100)}% av skjermen`;})();
  return ut;
});
console.log(w, JSON.stringify(d,null,1));
await ctx.close();}
await b.close();
