import { chromium } from "playwright";
const b=await chromium.launch();
for(const [w,h] of [[390,844],[412,915],[1440,900]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<500,isMobile:w<500,deviceScaleFactor:2});
  const p=await ctx.newPage();
  await p.goto("https://kodekonsulentene.no/",{waitUntil:"networkidle"}); await p.waitForTimeout(1500);
  const d=await p.evaluate(()=>{
    const kand=[...document.querySelectorAll("header,nav,[class*=topp],[class*=header]")]
      .map(e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();
        return {t:e.tagName.toLowerCase()+"."+(e.className||"").toString().split(" ")[0],pos:c.position,h:Math.round(r.height),w:Math.round(r.width),y:Math.round(r.top)};})
      .filter(x=>x.h>20);
    return {kand:kand.slice(0,5), vindu:innerHeight, hoyde:document.documentElement.scrollHeight,
      // hvor mye av foerste skjerm er header
      };
  });
  // etter scroll
  await p.evaluate(()=>scrollTo({top:900,behavior:"instant"})); await p.waitForTimeout(900);
  const e=await p.evaluate(()=>{
    const h=[...document.querySelectorAll("header,nav")].map(x=>{const c=getComputedStyle(x),r=x.getBoundingClientRect();
      return c.position==="fixed"||c.position==="sticky"?`${x.tagName.toLowerCase()} ${c.position} ${Math.round(r.height)}px @y${Math.round(r.top)}`:null}).filter(Boolean);
    return h;
  });
  console.log(`${w}x${h}`, JSON.stringify(d), "ETTER SCROLL:", JSON.stringify(e));
  await ctx.close();
}
await b.close();
