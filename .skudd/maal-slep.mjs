import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
await p.goto("http://127.0.0.1:4581/lab/interaksjon", { waitUntil: "networkidle" });
await p.locator("[data-slep]").first().scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
let U=null;
for (const v of [8, 50, 92]) {
  await p.evaluate((val)=>{const s=document.querySelector("[data-slep-spak]");s.value=String(val);s.dispatchEvent(new Event("input",{bubbles:true}));}, v);
  await p.waitForTimeout(250);
  const bx = await p.evaluate(() => {
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    const f=document.querySelector("[data-slep-flate]");
    const b=f.getBoundingClientRect();
    x0=b.x;y0=b.y;x1=b.right;y1=b.bottom;
    return {x0,y0,x1,y1};
  });
  U = U ? {x0:Math.min(U.x0,bx.x0),y0:Math.min(U.y0,bx.y0),x1:Math.max(U.x1,bx.x1),y1:Math.max(U.y1,bx.y1)} : bx;
}
const m=24, x0=U.x0-m, y0=U.y0-m, w=(U.x1-U.x0)+2*m, h=(U.y1-U.y0)+2*m;
const cx=x0+w/2, cy=y0+h/2;
let W=Math.max(w,h*16/9), H=W*9/16;
console.log(`  flate+luft: ${Math.round(w)}x${Math.round(h)}  forhold ${(w/h).toFixed(2)}`);
console.log(`  16:9:       x=${Math.round(cx-W/2)} y=${Math.round(cy-H/2)} w=${Math.round(W/2)*2} h=${Math.round(H/2)*2}`);
await b.close();
