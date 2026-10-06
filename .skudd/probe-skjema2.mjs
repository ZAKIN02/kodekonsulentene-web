import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const [w,h] of [[1200,675],[1400,788],[1600,900]]) {
  const p = await (await b.newContext({ viewport:{width:w,height:h}, colorScheme:"dark", reducedMotion:"reduce" })).newPage();
  await p.goto("http://127.0.0.1:4710/kontakt", { waitUntil: "networkidle" });
  await p.evaluate(() => { const f=document.querySelector("form .field"); scrollTo(0, f.getBoundingClientRect().top+scrollY-150); });
  await p.waitForTimeout(500);
  const g = await p.evaluate(() => {
    const f=[...document.querySelectorAll("form .field")];
    const u=f.reduce((a,e)=>{const r=e.getBoundingClientRect();
      return {x:Math.min(a.x,r.left),y:Math.min(a.y,r.top),r:Math.max(a.r,r.right),b:Math.max(a.b,r.bottom)};},{x:1e9,y:1e9,r:-1e9,b:-1e9});
    return {x:Math.round(u.x),y:Math.round(u.y),w:Math.round(u.r-u.x),h:Math.round(u.b-u.y)};
  });
  console.log(`${w}x${h}: felt-union x=${g.x} y=${g.y} ${g.w}x${g.h}`);
  await p.close();
}
await b.close();
