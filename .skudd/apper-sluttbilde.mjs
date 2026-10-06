/**
 * Lager sluttbildet til scenen «apper» som en redigering AV STARTBILDET.
 *
 * scripts/scene.mjs redigerer begge rammer uavhengig ut fra basisbildet. For de
 * fleste scenene går det bra, fordi basisbildet allerede ER arrangementet og bare
 * én ting endres. Her bygges arrangementet opp fra bunnen i begge prompter, og da
 * gjetter modellen antall plater og posisjoner på nytt hver gang: første forsøk ga
 * sju plater i start og ti i slutt, og et lite objekt som vokste fra to til fire
 * plater. Mellom to slike rammer kan Kling bare morfe – nøyaktig den billige
 * AI-effekten vi prøver å unngå.
 *
 * Løsningen er å gi Qwen startbildet som kilde, slik at geometrien er låst av
 * bildet i stedet for av en prompt. Resultatet legges i mellomlageret scene.mjs
 * allerede leser fra, så `node scripts/scene.mjs apper` tar seg av resten.
 */
import { config, higgsfield } from "@higgsfield/client/v2";
import { readFileSync, writeFileSync } from "node:fs";

config({ credentials: process.env.HF_CREDENTIALS
  ?? `${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}` });

const STIL = readFileSync("assets/prompter/stilkort.txt", "utf8").trim();
const start = readFileSync(".skudd/scene-tmp/apper-startbilde.url", "utf8").trim();

const r = await higgsfield.subscribe("alibaba/qwen-image-3/edit", {
  input: {
    prompt: `${STIL}

Edit the supplied image. Keep absolutely everything identical: the exact number, size, thickness, spacing and position of every single plate in both objects, the exact position and curve of the black braided cable and both of its machined aluminium connectors, every suspension wire, the camera, the framing, the lighting and the near-black background. Do not add or remove a single plate. Do not move anything.

The ONLY change is light: a single hair-thin lime green #c8f24a line now glows softly along the full length of the black braided cable, and a single hair-thin lime green edge line is lit along the top plate of the SMALL right-hand object. Nothing else is green: the suspension wires stay bare steel, the tall left stack has no green at all, and the green covers less than three percent of the image.`,
    image_urls: [start],
    aspect_ratio: "16:9",
    resolution: "2k",
    negative_prompt: "text, letters, numbers, logos, watermark, people, hands, extra plates, missing plates, moved objects, different arrangement, green wires, purple, violet, blue tint, colour cast, neon glow, bokeh, lens flare, vignette",
  },
  withPolling: true,
});
if (r.status !== "completed") throw new Error(`feilet: ${r.error ?? r.status}`);
const url = r.images?.[0]?.url;
if (!url) throw new Error("tomt svar");
writeFileSync(".skudd/scene-tmp/apper-sluttbilde.url", url);
console.log("sluttbilde avledet fra startbildet:", url);
