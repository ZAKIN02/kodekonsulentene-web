import { chromium } from "playwright";
const b = await chromium.launch();
for (const skjema of ["light","dark"]) {
  const c = await b.newContext({ viewport:{width:1440,height:1000}, colorScheme: skjema });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4464/verktoy/priskalkulator", { waitUntil: "networkidle" });
  await p.click('#kalk input[name="integrasjon"]');
  await p.waitForTimeout(350);                       // la overgangen fullføre
  const r = await p.evaluate(() => {
    const lab = document.querySelector('#kalk input[name="integrasjon"]').closest("label.row");
    const cs = getComputedStyle(lab);
    const L=(x)=>{const [r,g,bb]=x.match(/[\d.]+/g).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*r+0.7152*g+0.0722*bb;};
    let el=lab, bg="rgb(255,255,255)";
    while(el){const x=getComputedStyle(el).backgroundColor; if(x&&!/rgba\(0, 0, 0, 0\)|transparent/.test(x)){bg=x;break;} el=el.parentElement;}
    const a=L(cs.color), bl=L(bg);
    return { kant: cs.borderInlineStartColor, farge: cs.color, bak: bg,
             kontrast: +(((Math.max(a,bl)+0.05)/(Math.min(a,bl)+0.05)).toFixed(2)) };
  });
  console.log(skjema.padEnd(5), JSON.stringify(r));
  await c.close();
}
await b.close();
