import satori from "satori";
import { readFileSync } from "node:fs";
const fonts = [
  { name: "Schibsted Grotesk", data: readFileSync("assets/fonts-og/schibsted-grotesk-800.ttf"), weight: 800, style: "normal" },
  { name: "JetBrains Mono", data: readFileSync("assets/fonts-og/jetbrains-mono-400.ttf"), weight: 400, style: "normal" },
];
const svg = await satori(
  { type: "div", props: { style: { display: "flex", width: "400px", height: "200px", backgroundColor: "#0b0d10", color: "#c8f24a", fontFamily: "Schibsted Grotesk", fontSize: "48px" }, children: "Test æøå" } },
  { width: 400, height: 200, fonts },
);
console.log("satori ok –", svg.length, "tegn SVG");
