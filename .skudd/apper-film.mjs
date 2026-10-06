/**
 * Henter 4K-klippet for scenen «apper» og legger det som master.
 *
 * scripts/scene.mjs bruker klientens standard maxPollTime på 300 000 ms. Et 8 s
 * 4K-klipp fra Kling brukte lengre tid enn det, så kallet døde med TimeoutError
 * etter at jobben allerede var bestilt og betalt. Her settes vinduet til 25 min.
 * Resultatet legges i assets/mastere/, som scene.mjs leser før den bestiller nytt,
 * så `node scripts/scene.mjs apper` gjør resten uten et nytt API-kall.
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";

config({
  credentials: process.env.HF_CREDENTIALS
    ?? `${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}`,
  maxPollTime: 1_500_000,
});

const DEF = JSON.parse(readFileSync("assets/prompter/scener.json", "utf8"));
const scene = DEF.scener.find((s) => s.id === "apper");
const start = readFileSync(".skudd/scene-tmp/apper-startbilde.url", "utf8").trim();
const slutt = readFileSync(".skudd/scene-tmp/apper-sluttbilde.url", "utf8").trim();

process.stdout.write("klipp (4K) … ");
const r = await higgsfield.subscribe("kling-video/v3.0/4k/image-to-video", {
  input: {
    prompt: `${DEF._bevegelse}\n\n${scene.bevegelse}`,
    image_url: start,
    last_image_url: slutt,
    duration: 8,
    sound: "off",
    cfg_scale: 0.5,
  },
  withPolling: true,
});
if (r.status !== "completed") throw new Error(`feilet: ${r.error ?? r.status}`);
console.log("ok");
mkdirSync("assets/mastere", { recursive: true });
execFileSync("curl", ["-sS", "--max-time", "600", "-o", "assets/mastere/apper-master.mp4", r.video.url],
  { stdio: ["ignore", "pipe", "inherit"] });
console.log("master:", "assets/mastere/apper-master.mp4");
