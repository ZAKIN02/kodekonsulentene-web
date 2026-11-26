// Spolelogikken til rullefilmen (src/scripts/wow/spole.ts): rene funksjoner, ingen nettleser.
// Kjør uten server:
//   BASE_URL=http://127.0.0.1:1 npx playwright test tests/wow/spole.spec.ts --project=desktop
import { test, expect } from "@playwright/test";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  glatt,
  rammeFor,
  lesHode,
  lagGoper,
  lagDeler,
  nesteDel,
  vinduStr,
  onskeliste,
  velgGoper,
  skalKastes,
  naermeste,
  stegFor,
  vinduFor,
  BAK_VEKT,
  type Gop,
} from "../../src/scripts/wow/spole";

const MAPPE = join(process.cwd(), "public/media/wow/scroll-world");
const lesFil = (navn: string) => {
  const b = readFileSync(join(MAPPE, navn));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
};
const klipp = existsSync(MAPPE) ? readdirSync(MAPPE).filter((f) => f.endsWith(".mp4")) : [];

/** En syntetisk tabell: n ramer, nøkkelrame hver g-te, alle på `str` byte fra byte 1000. */
function syntetisk(n: number, g: number, str = 1000) {
  const off = new Float64Array(n);
  const s = new Uint32Array(n).fill(str);
  const nokkel = new Uint8Array(n);
  const vis = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    off[i] = 1000 + i * str;
    nokkel[i] = i % g === 0 ? 1 : 0;
    vis[i] = i;
  }
  return { n, off, str: s, nokkel, vis };
}

test.describe("spole: klokka", () => {
  test("glatt: følger målet uten å skyte over, og lander nøyaktig", () => {
    let tS = 0;
    const sett: number[] = [];
    for (let i = 0; i < 200; i++) {
      tS = glatt(tS, 1, 1, 0.22);
      sett.push(tS);
    }
    expect(sett.every((x, i) => x <= 1 && (i === 0 || x >= sett[i - 1]))).toBe(true);
    expect(tS).toBe(1);
    // Halvveis på tre bilder ved 60 bilder/s (1 − 0,78³ ≈ 0,53).
    expect(sett[2]).toBeGreaterThan(0.5);
  });

  test("glatt: samme vei på 120 Hz og 30 Hz som på 60 Hz", () => {
    const etter = (hz: number) => {
      let tS = 0;
      for (let i = 0; i < hz / 10; i++) tS = glatt(tS, 1, 60 / hz, 0.22); // 100 ms
      return tS;
    };
    expect(etter(120)).toBeCloseTo(etter(60), 6);
    expect(etter(30)).toBeCloseTo(etter(60), 6);
  });

  test("rammeFor: endene er første og siste rame, uansett antall", () => {
    for (const n of [1, 2, 105, 121, 240, 720]) {
      expect(rammeFor(0, n)).toBe(0);
      expect(rammeFor(1, n)).toBe(Math.max(0, n - 1));
      expect(rammeFor(-3, n)).toBe(0);
      expect(rammeFor(7, n)).toBe(Math.max(0, n - 1));
    }
    expect(rammeFor(0.5, 121)).toBe(60);
    expect(rammeFor(0.5, 721)).toBe(360);
  });
});

test.describe("spole: MP4-tabellen", () => {
  test("hvert klipp i public/ leses: antall ramer, mål, kodek og nøkkelramer, uten antakelser om lengde", () => {
    test.skip(!klipp.length, "Ingen klipp i public/media/wow/scroll-world");
    for (const navn of klipp) {
      const buf = lesFil(navn);
      const h = lesHode(buf);
      expect(h.tabell, navn).toBeTruthy();
      const t = h.tabell!;
      expect(t.n, navn).toBeGreaterThan(1);
      expect(t.fps, navn).toBeGreaterThan(5);
      expect(t.fps, navn).toBeLessThan(121);
      expect(t.codec, navn).toMatch(/^avc1\.[0-9a-f]{6}$/);
      expect(t.beskrivelse[0], navn).toBe(1);
      expect(Math.min(t.bredde, t.hoyde), navn).toBeGreaterThanOrEqual(360);
      expect(navn.includes("-m.") ? t.hoyde > t.bredde : t.bredde > t.hoyde, `${navn} retning`).toBe(true);
      expect(t.nokkel[0], navn).toBe(1);
      // Hver rame ligger inne i fila, og visningsrekkefølgen er en permutasjon av 0..n-1.
      for (let i = 0; i < t.n; i++) expect(t.off[i] + t.str[i]).toBeLessThanOrEqual(buf.byteLength);
      expect([...t.vis].sort((a, b) => a - b).every((v, i) => v === i), navn).toBe(true);
      // GOP-ene dekker alle ramer, og hver GOP er et sammenhengende stykke av visningsrekkefølgen.
      const { gop, gopAv } = lagGoper(t);
      expect(gop.reduce((a, g) => a + g.b - g.a, 0), navn).toBe(t.n);
      for (const g of gop) expect(g.hi - g.lo + 1, navn).toBe(g.b - g.a);
      expect(gopAv.length).toBe(t.n);
    }
  });

  test("bare starten av fila holder når moov ligger først, og for lite ber om mer", () => {
    test.skip(!klipp.length, "Ingen klipp");
    const buf = lesFil(klipp[0]);
    const hel = lesHode(buf).tabell!;
    const liten = lesHode(buf.slice(0, 64), buf.byteLength);
    expect(liten.tabell).toBeUndefined();
    expect(liten.trenger).toBeGreaterThan(64);
    const start = lesHode(buf.slice(0, liten.trenger! > 0 ? Math.max(liten.trenger!, 4096) : buf.byteLength), buf.byteLength);
    const t = start.tabell ?? lesHode(buf.slice(0, start.trenger!), buf.byteLength).tabell!;
    expect(t.n).toBe(hel.n);
    expect([...t.off.slice(0, 5)]).toEqual([...hel.off.slice(0, 5)]);
  });

  test("det som ikke er en MP4 med H.264, kaster (da tar reserven over)", () => {
    expect(() => lesHode(new Uint8Array(4096).buffer)).toThrow();
    expect(() => lesHode(new TextEncoder().encode("ikke en film ".repeat(400)).buffer as ArrayBuffer)).toThrow();
  });
});

test.describe("spole: GOP-er og deler", () => {
  test("lagGoper: fra nøkkelrame til nøkkelrame, for korte og lange klipp", () => {
    for (const [n, g] of [
      [121, 8],
      [105, 8],
      [240, 12],
      [720, 8],
      [61, 1],
    ]) {
      const { gop, gopAv } = lagGoper(syntetisk(n, g));
      expect(gop.length).toBe(Math.ceil(n / g));
      expect(gop[0]).toMatchObject({ a: 0, lo: 0, fra: 1000 });
      expect(gop[gop.length - 1].b).toBe(n);
      expect(gopAv[n - 1]).toBe(gop.length - 1);
      expect(gopAv[g]).toBe(g < n ? 1 : 0);
    }
  });

  test("lagGoper med B-ramer: visningsrekkefølgen avgjør hvilke ramer en GOP dekker", () => {
    // Dekoderekkefølge I P B B | I P B B, visning 0 3 1 2 | 4 7 5 6.
    const t = syntetisk(8, 4);
    t.vis.set([0, 3, 1, 2, 4, 7, 5, 6]);
    const { gop, gopAv } = lagGoper(t);
    expect(gop.map((g) => [g.lo, g.hi])).toEqual([
      [0, 3],
      [4, 7],
    ]);
    expect([...gopAv]).toEqual([0, 0, 0, 0, 1, 1, 1, 1]);
  });

  test("lagDeler: hele GOP-er, sammenhengende, innenfor taket, og dekker hele klippet", () => {
    const { gop } = lagGoper(syntetisk(720, 8, 20_000)); // 160 kB per GOP
    const deler = lagDeler(gop, 640 * 1024);
    expect(deler[0].fra).toBe(gop[0].fra);
    expect(deler[deler.length - 1].til).toBe(gop[gop.length - 1].til);
    for (let i = 0; i < deler.length; i++) {
      expect(deler[i].til - deler[i].fra).toBeLessThanOrEqual(640 * 1024);
      if (i) {
        expect(deler[i].fra).toBe(deler[i - 1].til);
        expect(deler[i].g0).toBe(deler[i - 1].g1);
      }
    }
    expect(deler.length).toBe(Math.ceil(90 / 4));
    // En GOP som er større enn taket, får sin egen del.
    const store = lagDeler(lagGoper(syntetisk(16, 8, 200_000)).gop, 640 * 1024);
    expect(store.length).toBe(2);
  });

  test("nesteDel: nærmest først, fartsretningen først ved lik avstand, og bare innen rekkevidde", () => {
    const status = new Uint8Array(10);
    expect(nesteDel(status, 4, 1)).toBe(4);
    status[4] = 2;
    expect(nesteDel(status, 4, 1)).toBe(5);
    expect(nesteDel(status, 4, -1)).toBe(3);
    status[5] = 1;
    expect(nesteDel(status, 4, 1)).toBe(3);
    // Baklengs klipp starter på siste del.
    expect(nesteDel(new Uint8Array(10), 9, -1)).toBe(9);
    // En nabo henter bare inngangen og delen ved siden av.
    const nabo = new Uint8Array(10);
    nabo[0] = 2;
    nabo[1] = 2;
    expect(nesteDel(nabo, 0, 1, 1)).toBe(-1);
    expect(nesteDel(new Uint8Array(10).fill(2), 3, 1)).toBe(-1);
  });
});

test.describe("spole: vinduet", () => {
  test("vinduStr: følger budsjettet, aldri mindre enn tre GOP-er, aldri over taket, og vokser ikke med klippets lengde", () => {
    const MB = 1024 * 1024;
    expect(vinduStr(1280, 720, 96 * MB, 8, true)).toBe(27); // 3,5 MB per rame som RGBA
    expect(vinduStr(1920, 1080, 96 * MB, 8, true)).toBe(24); // budsjettet gir 12: tre GOP-er er gulvet
    expect(vinduStr(720, 1280, 40 * MB, 8, true)).toBe(24);
    expect(vinduStr(320, 180, 96 * MB, 8, true)).toBe(48);
    expect(vinduStr(1280, 720, 96 * MB, 8, false)).toBe(48);
    expect(vinduStr(1280, 720, 96 * MB, 24, true)).toBe(72);
  });

  test("onskeliste: posisjonen først, mest foran i fartsretningen, noe bak, innenfor klippet", () => {
    const frem = onskeliste(50, 1, 1, 6, 2, 121);
    expect(frem[0]).toBe(50);
    expect(frem.slice(1, 3)).toEqual([51, 49]);
    expect(new Set(frem)).toEqual(new Set([50, 51, 52, 53, 54, 55, 56, 49, 48]));
    const bak = onskeliste(50, -1, 1, 6, 2, 121);
    expect(new Set(bak)).toEqual(new Set([50, 49, 48, 47, 46, 45, 44, 51, 52]));
    // Rask rulling: hvert tredje bilde.
    expect(onskeliste(50, 1, 3, 3, 0, 121)).toEqual([50, 53, 56, 59]);
    // Endene klippes.
    expect(onskeliste(119, 1, 1, 6, 1, 121)).toEqual([119, 120, 118]);
    expect(onskeliste(0, -1, 1, 6, 1, 121)).toEqual([0, 1]);
    for (const i of onskeliste(700, 1, 4, 12, 4, 720)) expect(i).toBeLessThan(720);
  });

  test("velgGoper: hopper over det som finnes og det som ikke er hentet, tar hele GOP-en i ro og bare det som trengs i fart", () => {
    const { gop, gopAv, dekAv } = lagGoper(syntetisk(121, 8));
    const liste = onskeliste(20, 1, 1, 20, 6, 121);
    const har = new Set<number>();
    const velg = (l: number[], hentet: (g: number) => boolean = () => true, hel = true) => velgGoper(l, (i) => har.has(i), gopAv, gop, hentet, dekAv, hel);
    // Ingenting dekodet: GOP-en posisjonen står i (2) først, hel.
    expect(velg(liste)[0]).toEqual({ g: 2, til: 24 });
    for (let i = 16; i < 24; i++) har.add(i);
    expect(velg(liste)[0]).toEqual({ g: 3, til: 32 });
    // GOP 3 er ikke hentet ennå: ta den neste som er hentet i stedet for å vente.
    expect(velg(liste, (g) => g !== 3)[0]).toEqual({ g: 4, til: 40 });
    // Rask rulling, hvert femte bilde: GOP 2 bare til rame 20, GOP 3 til rame 30 (ikke 31).
    har.clear();
    expect(velg(onskeliste(20, 1, 5, 2, 0, 121), () => true, false)).toEqual([
      { g: 2, til: 21 },
      { g: 3, til: 31 },
    ]);
    // Alt i ønskelista finnes: ingenting å gjøre.
    for (let i = 0; i < 121; i++) har.add(i);
    expect(velg(liste)).toEqual([]);
    // Bare nøkkelramer (GOP 1): flere GOP-er i samme bunke, én rame hver.
    const intra = lagGoper(syntetisk(61, 1));
    const b = velgGoper(onskeliste(10, 1, 1, 10, 2, 61), () => false, intra.gopAv, intra.gop, () => true, intra.dekAv);
    expect(b.length).toBe(6);
    expect(b.every((x) => x.til - intra.gop[x.g].a === 1)).toBe(true);
  });

  test("velgGoper med B-ramer: dekoder til og med den ønskede ramens plass i dekoderekkefølgen", () => {
    const t = syntetisk(8, 4);
    t.vis.set([0, 3, 1, 2, 4, 7, 5, 6]); // dekoderekkefølge I P B B
    const { gop, gopAv, dekAv } = lagGoper(t);
    // Rame 1 (vist) er nr. 2 i dekoderekkefølgen: I, P og den selv.
    expect(velgGoper([1], () => false, gopAv, gop, () => true, dekAv, false)).toEqual([{ g: 0, til: 3 }]);
    // Rame 3 (vist) er P-ramen: bare I og P.
    expect(velgGoper([3], () => false, gopAv, gop, () => true, dekAv, false)).toEqual([{ g: 0, til: 2 }]);
  });

  test("skalKastes: lengst unna først, og det bak fartsretningen før det foran", () => {
    expect(skalKastes([1, 2, 3], 2, 5)).toEqual([]);
    expect(skalKastes([0, 10, 20, 30, 40], 20, 3, 1, 1)).toEqual(expect.arrayContaining([0, 40]));
    // Forover: 10 bak teller som 24 unna, 14 foran som 14.
    expect(skalKastes([10, 20, 34], 20, 2, 1, BAK_VEKT)).toEqual([10]);
    expect(skalKastes([10, 20, 34], 20, 2, -1, BAK_VEKT)).toEqual([34]);
  });

  test("vinduet er en ring: en hel gjennomspoling av 720 ramer holder aldri mer enn taket, og bildet som trengs, finnes", () => {
    const n = 720;
    const { gop, gopAv, dekAv } = lagGoper(syntetisk(n, 8));
    const K = vinduStr(1280, 720, 96 * 1024 * 1024, 8, true);
    const ramer = new Set<number>();
    let dekodet = 0;
    let mangler = 0;
    let topp = 0;
    const kjor = (fra: number, til: number, fart: number) => {
      const retn = til > fra ? 1 : -1;
      for (let f = fra; retn > 0 ? f <= til : f >= til; f += retn * fart) {
        const senter = Math.round(f);
        const steg = stegFor(fart);
        // To bunker per bilde: det dekoderen rekker med god margin.
        for (let b = 0; b < 2; b++) {
          const v = vinduFor(K, 8);
          const liste = onskeliste(senter, retn, steg, Math.max(1, Math.floor(v.fram / steg)), Math.floor(v.bak / steg), n);
          for (const { g, til } of velgGoper(liste, (i) => ramer.has(i), gopAv, gop, () => true, dekAv, steg === 1)) {
            for (let i = gop[g].a; i < til; i++) {
              ramer.add(i);
              dekodet++;
            }
          }
          for (const k of skalKastes(ramer, senter, K, retn, BAK_VEKT)) ramer.delete(k);
        }
        topp = Math.max(topp, ramer.size);
        if (Math.abs(naermeste(ramer, senter) - senter) > Math.max(0, steg - 1)) mangler++;
      }
    };
    kjor(0, n - 1, 0.4); // sakte forover
    kjor(n - 1, 0, 0.4); // sakte bakover
    expect(mangler).toBe(0);
    expect(topp).toBeLessThanOrEqual(K);
    // Ingen kverning: hver rame dekodes én gang per passering (to passeringer, pluss snuoperasjonen).
    expect(dekodet).toBeLessThanOrEqual(n * 2 + 16);
    kjor(0, n - 1, 5); // raskt: fem ramer per bilde
    kjor(n - 1, 0, 5);
    expect(mangler).toBe(0);
    expect(topp).toBeLessThanOrEqual(K);
  });

  test("vinduFor: ønskelista stopper en GOP før kastegrensen, også for bare nøkkelramer og lange GOP-er", () => {
    for (const [K, g] of [[24, 8], [27, 8], [48, 8], [36, 12], [24, 1], [72, 24]]) {
      const v = vinduFor(K, g);
      const foran = Math.floor((K * BAK_VEKT) / (1 + BAK_VEKT));
      expect(v.fram).toBeGreaterThanOrEqual(1);
      expect(v.fram + g - 1).toBeLessThanOrEqual(Math.max(foran, g));
      expect(v.bak).toBeGreaterThanOrEqual(0);
    }
    expect(vinduFor(24, 8)).toEqual({ fram: 9, bak: 0 });
    expect(vinduFor(24, 1)).toEqual({ fram: 16, bak: 7 });
  });

  test("naermeste og stegFor", () => {
    expect(naermeste([], 5)).toBe(-1);
    expect(naermeste([1, 4, 9], 5)).toBe(4);
    expect(naermeste(new Set([8, 16]), 12.4)).toBe(16);
    expect(stegFor(0)).toBe(1);
    expect(stegFor(-0.4)).toBe(1);
    expect(stegFor(3.4)).toBe(3);
    expect(stegFor(-40)).toBe(8);
  });
});
