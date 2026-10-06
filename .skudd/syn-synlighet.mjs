/** Hvor mye ser man faktisk av en video som ligger paa lav opasitet bak tekst?
 *  Maaler spennet i lyshet innenfor videoflaten med og uten videoen. */
import { chromium } from "playwright"; import sharp from "sharp";
const [url] = process.argv.slice(2);
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(url,{waitUntil:"networkidle",timeout:60000}); await p.waitForTimeout(1500);
const n = await p.evaluate(()=>document.querySelectorAll("video").length);
for(let i=0;i<n;i++){
  await p.evaluate(k=>document.querySelectorAll("video")[k].scrollIntoView({block:"center",behavior:"instant"}),i);
  await p.waitForTimeout(1600);
  const r = await p.evaluate(k=>{const v=document.querySelectorAll("video")[k];const q=v.getBoundingClientRect();
    let o=1;for(let x=v;x;x=x.parentElement)o*=+getComputedStyle(x).opacity;
    return {x:Math.max(0,Math.round(q.left)),y:Math.max(0,Math.round(q.top)),w:Math.min(1440,Math.round(q.width)),h:Math.min(900-Math.max(0,Math.round(q.top)),Math.round(q.height)),o:+o.toFixed(2),fil:(v.currentSrc||"").split("/").pop()};},i);
  if(r.w<10||r.h<10) continue;
  const med = await p.screenshot({clip:{x:r.x,y:r.y,width:r.w,height:r.h}});
  await p.evaluate(k=>{document.querySelectorAll("video")[k].style.visibility="hidden";},i);
  await p.waitForTimeout(400);
  const uten = await p.screenshot({clip:{x:r.x,y:r.y,width:r.w,height:r.h}});
  await p.evaluate(k=>{document.querySelectorAll("video")[k].style.visibility="";},i);
  const [A,B]=await Promise.all([sharp(med).raw().toBuffer(),sharp(uten).raw().toBuffer()]);
  let sum=0,maks=0,over3=0;
  const N=Math.min(A.length,B.length);
  for(let j=0;j<N;j++){const d=Math.abs(A[j]-B[j]); sum+=d; if(d>maks)maks=d; if(d>3)over3++;}
  console.log(`  ${r.fil.padEnd(24)} ${r.w}x${r.h} op=${r.o}  snitt-forskjell ${(sum/N).toFixed(2)}/255  maks ${maks}  piksler som endrer seg merkbart: ${(over3/N*100).toFixed(1)}%`);
}
await b.close();
