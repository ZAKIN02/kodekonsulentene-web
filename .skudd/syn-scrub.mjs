import { chromium } from "playwright";
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
let kb=0; p.on("response", r=>{ const l=+(r.headers()["content-length"]||0); kb+=l; });
await p.goto(url,{waitUntil:"networkidle",timeout:60000}); await p.waitForTimeout(2000);
const h = await p.evaluate(()=>document.documentElement.scrollHeight);
const rader=[];
for(let i=0;i<=20;i++){
  const y=Math.round((h-900)*i/20);
  await p.evaluate(v=>scrollTo({top:v,behavior:"instant"}),y);
  await p.waitForTimeout(260);
  const t = await p.evaluate(()=>[...document.querySelectorAll("video")].map(v=>({t:+v.currentTime.toFixed(2),p:v.paused,o:(()=>{let o=1;for(let n=v;n;n=n.parentElement)o*=+getComputedStyle(n).opacity;return +o.toFixed(2)})()})));
  rader.push({y,t});
}
console.log(url.replace("https://kodekonsulentene.no",""), "totalKB", Math.round(kb/1024));
for(const r of rader) console.log("  y="+String(r.y).padStart(5), r.t.map(x=>`${x.t}s${x.p?"[pause]":"[spill]"}op${x.o}`).join("  "));
await b.close();
