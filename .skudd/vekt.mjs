import { chromium } from "playwright";
const b=await chromium.launch();
const sider=["/","/apper-og-ai/","/systemer/","/nettsider/","/sikkerhet/","/priser/","/historie/","/om/","/caser/","/sjekk/","/status/","/kontakt/","/verktoy/","/verktoy/dmarc/","/verktoy/uu-sjekk/","/verktoy/cookie-sjekk/","/verktoy/priskalkulator/","/bransjer/klinikker/","/bransjer/handverkere/","/handbok/","/terminal/"];
for(const s of sider){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  let tot=0,vid=0;
  p.on("response",r=>{const l=+(r.headers()["content-length"]||0); tot+=l; if(/\.(mp4|webm|mov)/.test(r.url())) vid+=l;});
  await p.goto("https://kodekonsulentene.no"+s,{waitUntil:"networkidle",timeout:60000});
  await p.waitForTimeout(1500);
  const h=await p.evaluate(()=>document.documentElement.scrollHeight);
  console.log(`${s.padEnd(28)} totalt ${String(Math.round(tot/1024)).padStart(5)} kB   video ${String(Math.round(vid/1024)).padStart(5)} kB  (${Math.round(vid/Math.max(1,tot)*100)}%)  hoyde ${h}`);
  await p.close();
}
await b.close();
