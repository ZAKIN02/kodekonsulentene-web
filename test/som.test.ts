/**
 * Sømmer og hold i rullefilmen (src/scripts/wow/som.ts): rene funksjoner.
 *
 * Det som kan gå galt her er ikke regnestykket, men at bildet hopper: en toning som ikke starter
 * på 0 eller ikke ender på 1, et hold som gjør at klippet går baklengs eller ikke når slutten,
 * eller to sømmer som er åpne samtidig. Testene verner de egenskapene.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { SOM_TONING, SOM_MAKS, HOLD_MAKS, somBredde, toning, somVed, erKutt, holdAndel, holdKart } from "../src/scripts/wow/som.ts";
import { film } from "../src/data/historie.ts";

const naer = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

describe("somBredde", () => {
  test("kutt er standard og har ingen bredde", () => {
    assert.equal(somBredde(undefined), 0);
    assert.equal(somBredde("kutt"), 0);
    assert.equal(somBredde(0), 0);
    assert.equal(somBredde(-1), 0);
    assert.equal(somBredde(Number.NaN), 0);
  });
  test("toning er 0,05 skjermhøyder (manus v6 del 2)", () => {
    assert.equal(SOM_TONING, 0.05);
    assert.equal(somBredde("toning"), 0.05);
    assert.equal(somBredde(0.08), 0.08);
  });
  test("holdes under taket og under 40 % av det korteste nabosegmentet", () => {
    assert.equal(somBredde(2), SOM_MAKS);
    naer(somBredde("toning", 0.1, 1), 0.04);
    naer(somBredde(0.2, 1, 0.25), 0.1);
  });
});

describe("toning", () => {
  test("går fra 0 til 1 over bredden, midt over sømmen", () => {
    assert.equal(toning(0.9, 1, 0.05), 0);
    assert.equal(toning(0.97, 1, 0.05), 0);
    naer(toning(0.975, 1, 0.05), 0);
    naer(toning(1, 1, 0.05), 0.5);
    naer(toning(1.025, 1, 0.05), 1);
    assert.equal(toning(1.03, 1, 0.05), 1);
    assert.equal(toning(1.5, 1, 0.05), 1);
  });
  test("er monoton, så bildet aldri toner tilbake mens du ruller én vei", () => {
    let forrige = -1;
    for (let t = 0.9; t <= 1.1; t += 0.001) {
      const p = toning(t, 1, 0.05);
      assert.ok(p >= forrige);
      forrige = p;
    }
  });
  test("bredde 0 er et kutt", () => {
    assert.equal(toning(0.999, 1, 0), 0);
    assert.equal(toning(1, 1, 0), 1);
  });
});

describe("somVed", () => {
  const slutt = [1, 2, 3, 4];
  const bredde = [0.05, 0, 0.1, 0.05];
  test("gir sømmen og opasiteten til det nye laget", () => {
    const s = somVed(1.0, slutt, bredde);
    assert.equal(s?.i, 0);
    naer(s!.p, 0.5);
    const s2 = somVed(3.04, slutt, bredde);
    assert.equal(s2?.i, 2);
    naer(s2!.p, 0.9);
  });
  test("null utenfor sømmene, i et kutt og etter siste segment", () => {
    assert.equal(somVed(0.5, slutt, bredde), null);
    assert.equal(somVed(2.0, slutt, bredde), null);
    assert.equal(somVed(4.0, slutt, bredde), null);
    assert.equal(somVed(0.97, slutt, bredde), null);
    assert.equal(somVed(1.03, slutt, bredde), null);
  });
});

describe("erKutt", () => {
  const bredde = [0.05, 0, 0.05];
  test("nabosegmenter med toning er ikke et kutt, begge veier", () => {
    assert.equal(erKutt(1, 0, bredde), false);
    assert.equal(erKutt(0, 1, bredde), false);
  });
  test("sømmer uten bredde og hopp over flere segmenter er kutt", () => {
    assert.equal(erKutt(2, 1, bredde), true);
    assert.equal(erKutt(1, 2, bredde), true);
    assert.equal(erKutt(0, 2, bredde), true);
    assert.equal(erKutt(1, 1, bredde), false);
  });
});

describe("holdKart", () => {
  test("uten hold er kartet uendret", () => {
    for (const u of [0, 0.3, 1]) assert.equal(holdKart(u, 0.2, 0), u);
  });
  test("starter på 0, ender på 1 og står på rammen i mellom", () => {
    const ved = 0.2;
    const andel = 0.25;
    assert.equal(holdKart(0, ved, andel), 0);
    naer(holdKart(1, ved, andel), 1);
    const a = ved * (1 - andel);
    naer(holdKart(a, ved, andel), ved);
    naer(holdKart(a + andel / 2, ved, andel), ved);
    naer(holdKart(a + andel, ved, andel), ved);
  });
  test("er monoton og kontinuerlig: klippet går aldri baklengs og hopper aldri", () => {
    for (const [ved, andel] of [[0.2, 0.25], [0, 0.3], [1, 0.3], [0.5, 0.9], [0.13, 0.05]]) {
      let forrige = holdKart(0, ved, andel);
      for (let i = 1; i <= 2000; i++) {
        const v = holdKart(i / 2000, ved, andel);
        assert.ok(v >= forrige - 1e-12, `baklengs ved ${i / 2000}`);
        assert.ok(v - forrige < 0.01, `hopp ved ${i / 2000}`);
        forrige = v;
      }
      naer(forrige, 1);
    }
  });
  test("samme fart før og etter holdet", () => {
    const fart = (u: number) => (holdKart(u + 0.001, 0.2, 0.25) - holdKart(u, 0.2, 0.25)) / 0.001;
    naer(fart(0.05), fart(0.8), 1e-6);
    naer(fart(0.05), 1 / 0.75, 1e-6);
  });
  test("holdAndel: skjermhøyder om til andel av segmentet, med tak", () => {
    naer(holdAndel(0.3, 1.2), 0.25);
    assert.equal(holdAndel(undefined, 1), 0);
    assert.equal(holdAndel(0, 1), 0);
    assert.equal(holdAndel(5, 1), HOLD_MAKS);
  });
});

describe("filmen i historie.ts", () => {
  const segmenter = film.flatMap((k) => k.segmenter);
  test("hver søm er kutt, toning eller en bredde som ikke kuttes av taket", () => {
    segmenter.forEach((s, i) => {
      if (s.som === undefined || s.som === "kutt" || s.som === "toning") return;
      assert.equal(typeof s.som, "number", `segment ${i} (${s.kilde})`);
      assert.ok(s.som >= 0 && s.som <= SOM_MAKS, `segment ${i} (${s.kilde}): som ${s.som}`);
    });
  });
  test("hold står bare på klipp, innenfor klippet, og lar minst 10 % av rullingen være til bevegelsen", () => {
    segmenter.forEach((s, i) => {
      if (!s.hold) return;
      assert.notEqual(s.type, "still", `segment ${i} (${s.kilde}): hold på et stillbilde`);
      assert.ok(s.hold.ved >= 0 && s.hold.ved <= 1, `segment ${i}: ved`);
      assert.ok(s.hold.lengde > 0 && s.hold.lengde <= s.lengde * HOLD_MAKS, `segment ${i}: lengde`);
      assert.equal(s.gronnVed, undefined, `segment ${i}: hold og gronnVed kan ikke kombineres`);
    });
  });
});
