import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage();
const f = [];
p.on("console", (m) => m.type() === "error" && m.text().includes("Content Security Policy") && f.push(1));
await p.goto(process.argv[2], { waitUntil: "networkidle" });
await p.waitForTimeout(600);
console.log("CSP-brudd:", f.length);
await b.close();
