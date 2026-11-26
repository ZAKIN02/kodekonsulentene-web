/**
 * Spolelogikken til rullefilmen (ScrollWorld), som rene funksjoner uten DOM og uten nettverk, så de
 * kan testes i Node (tests/wow/spole.spec.ts). Brukes av rullefilm.ts.
 *
 * Tankegangen (rapport: docs/design/rapporter/wow-r7-flyt.md):
 *  - Klippet er en vanlig MP4 (H.264). Vi leser tabellen over ramer selv (`lesHode`), så vi vet
 *    hvor hver ramme ligger i fila, hvilke som er nøkkelramer, og hvor mange det er. Ingenting
 *    antar 121 ramer eller 24 bilder i sekundet.
 *  - Ramene dekodes i hele GOP-er (fra en nøkkelrame til neste) FØR de trengs, i et vindu rundt
 *    rulleposisjonen, og tegnes på et lerret i samme bilde som teksten. Vinduet er en ring: det
 *    som ligger lengst unna, kastes først (`skalKastes`), og størrelsen følger et minnebudsjett
 *    (`vinduStr`), ikke klippets lengde. Et klipp på 30 s bruker like mye minne som ett på 5 s.
 *  - Fila hentes i deler med Range, nærmest rulleposisjonen først (`lagDeler`, `nesteDel`).
 */

export interface Tabell {
  /** Antall ramer. */
  n: number;
  /** Bilder per sekund (tidsskala / varighet per rame). */
  fps: number;
  bredde: number;
  hoyde: number;
  /** Kodekstreng for VideoDecoder, f.eks. avc1.640028. */
  codec: string;
  /** avcC-boksen (VideoDecoderConfig.description). */
  beskrivelse: Uint8Array;
  /** Per rame i DEKODErekkefølge: byteposisjon, størrelse, nøkkelrame, og plass i visningsrekkefølgen. */
  off: Float64Array;
  str: Uint32Array;
  nokkel: Uint8Array;
  vis: Uint32Array;
}

export type Hode =
  | { tabell: Tabell; trenger?: undefined }
  /** Tabellen er ikke komplett i bufferen: hent minst så mange byte fra starten (-1 = hele fila). */
  | { tabell?: undefined; trenger: number };

export interface Gop {
  /** Ramer i dekoderekkefølge [a, b). */
  a: number;
  b: number;
  /** Laveste og høyeste rame i visningsrekkefølge. */
  lo: number;
  hi: number;
  /** Byteområdet [fra, til). */
  fra: number;
  til: number;
}

export interface Del {
  /** Byteområdet [fra, til) i fila. */
  fra: number;
  til: number;
  /** GOP-ene [g0, g1) som ligger helt inne i delen. */
  g0: number;
  g1: number;
}

export const klem = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** tS følger t mykt: andelen `folg` av avstanden per bilde ved 60 bilder/s, uavhengig av skjermens takt. */
export function glatt(tS: number, t: number, deltaRatio: number, folg: number, terskel = 0.0008): number {
  const d = t - tS;
  if (Math.abs(d) < terskel) return t;
  return tS + d * (1 - Math.pow(1 - folg, deltaRatio));
}

/** Ramen som står for andelen (0–1) av et klipp med n ramer. */
export function rammeFor(andel: number, n: number): number {
  if (n <= 1) return 0;
  return Math.round(klem(andel) * (n - 1));
}

// ── MP4 ─────────────────────────────────────────────────────────────────────

interface Boks {
  type: string;
  a: number;
  b: number;
}

function* bokser(dv: DataView, a: number, b: number): Generator<Boks> {
  let p = a;
  while (p + 8 <= b) {
    let sz = dv.getUint32(p);
    let h = 8;
    if (sz === 1) {
      if (p + 16 > b) return;
      sz = Number(dv.getBigUint64(p + 8));
      h = 16;
    } else if (sz === 0) sz = b - p;
    if (sz < h) return;
    const type = String.fromCharCode(dv.getUint8(p + 4), dv.getUint8(p + 5), dv.getUint8(p + 6), dv.getUint8(p + 7));
    yield { type, a: p + h, b: p + sz };
    p += sz;
  }
}

function finn(dv: DataView, x: { a: number; b: number }, type: string): Boks | null {
  for (const y of bokser(dv, x.a, x.b)) if (y.type === type) return y;
  return null;
}

/**
 * Leser tabellen over ramer fra starten av en MP4. `buf` er de første bytene i fila, `filStr` hele
 * filas størrelse. Krever at moov ligger først (`-movflags +faststart`); ellers bes det om hele fila.
 * Kaster hvis fila ikke er H.264 i MP4 slik kodeskriptet lager den.
 */
export function lesHode(buf: ArrayBuffer, filStr = buf.byteLength): Hode {
  const dv = new DataView(buf);
  const har = buf.byteLength;
  let moov: Boks | null = null;
  let p = 0;
  while (p + 8 <= har) {
    let sz = dv.getUint32(p);
    let h = 8;
    if (sz === 1) {
      if (p + 16 > har) break;
      sz = Number(dv.getBigUint64(p + 8));
      h = 16;
    } else if (sz === 0) sz = filStr - p;
    const type = String.fromCharCode(dv.getUint8(p + 4), dv.getUint8(p + 5), dv.getUint8(p + 6), dv.getUint8(p + 7));
    if (type === "moov") {
      if (p + sz > har) return { trenger: p + sz };
      moov = { type, a: p + h, b: p + sz };
      break;
    }
    // mdat før moov: tabellen ligger sist i fila.
    if (type === "mdat") return { trenger: har >= filStr ? fail("moov mangler") : -1 };
    if (sz < h) fail("ugyldig boks");
    p += sz;
  }
  if (!moov) return { trenger: har >= filStr ? fail("moov mangler") : Math.min(filStr, Math.max(har * 2, p + 16)) };

  let stbl: Boks | null = null;
  let tidsskala = 0;
  for (const trak of bokser(dv, moov.a, moov.b)) {
    if (trak.type !== "trak") continue;
    const mdia = finn(dv, trak, "mdia");
    const hdlr = mdia && finn(dv, mdia, "hdlr");
    if (!mdia || !hdlr) continue;
    const slag = String.fromCharCode(dv.getUint8(hdlr.a + 8), dv.getUint8(hdlr.a + 9), dv.getUint8(hdlr.a + 10), dv.getUint8(hdlr.a + 11));
    if (slag !== "vide") continue;
    const mdhd = finn(dv, mdia, "mdhd");
    if (mdhd) tidsskala = dv.getUint8(mdhd.a) === 1 ? dv.getUint32(mdhd.a + 20) : dv.getUint32(mdhd.a + 12);
    const minf = finn(dv, mdia, "minf");
    stbl = minf && finn(dv, minf, "stbl");
    break;
  }
  if (!stbl) return fail("fant ikke videosporet");

  const stsd = finn(dv, stbl, "stsd");
  if (!stsd) return fail("stsd mangler");
  const e = stsd.a + 8 + 8; // første oppføring, etter boksens eget hode
  const format = String.fromCharCode(dv.getUint8(e - 4), dv.getUint8(e - 3), dv.getUint8(e - 2), dv.getUint8(e - 1));
  if (format !== "avc1" && format !== "avc3") fail(`ikke H.264 (${format})`);
  const bredde = dv.getUint16(e + 24);
  const hoyde = dv.getUint16(e + 26);
  const avcC = finn(dv, { a: e + 78, b: stsd.b }, "avcC");
  if (!avcC) return fail("avcC mangler");
  const beskrivelse = new Uint8Array(buf.slice(avcC.a, avcC.b));
  const codec = "avc1." + [1, 2, 3].map((i) => beskrivelse[i].toString(16).padStart(2, "0")).join("");

  const stsz = finn(dv, stbl, "stsz");
  if (!stsz) return fail("stsz mangler");
  const fast = dv.getUint32(stsz.a + 4);
  const n = dv.getUint32(stsz.a + 8);
  const str = new Uint32Array(n);
  for (let i = 0; i < n; i++) str[i] = fast || dv.getUint32(stsz.a + 12 + i * 4);

  const stco = finn(dv, stbl, "stco");
  const co64 = finn(dv, stbl, "co64");
  const co = stco ?? co64;
  if (!co) return fail("stco mangler");
  const nc = dv.getUint32(co.a + 4);
  const chunk = (i: number) => (stco ? dv.getUint32(co.a + 8 + i * 4) : Number(dv.getBigUint64(co.a + 8 + i * 8)));
  const stsc = finn(dv, stbl, "stsc");
  if (!stsc) return fail("stsc mangler");
  const ns = dv.getUint32(stsc.a + 4);
  const off = new Float64Array(n);
  let s = 0;
  for (let c = 0, r = 0; c < nc && s < n; c++) {
    while (r + 1 < ns && dv.getUint32(stsc.a + 8 + (r + 1) * 12) <= c + 1) r++;
    const per = dv.getUint32(stsc.a + 12 + r * 12);
    let pos = chunk(c);
    for (let j = 0; j < per && s < n; j++, s++) {
      off[s] = pos;
      pos += str[s];
    }
  }
  if (s !== n) fail("ufullstendig tabell");

  const nokkel = new Uint8Array(n);
  const stss = finn(dv, stbl, "stss");
  if (stss) {
    for (let i = 0, k = dv.getUint32(stss.a + 4); i < k; i++) {
      const nr = dv.getUint32(stss.a + 8 + i * 4) - 1;
      if (nr < n) nokkel[nr] = 1;
    }
  } else nokkel.fill(1);
  if (n) nokkel[0] = 1;

  // Tid: stts gir varigheten per rame (fast bildefrekvens antas for fps, ikke for rekkefølgen).
  const stts = finn(dv, stbl, "stts");
  const dts = new Float64Array(n);
  let delta = 1;
  if (stts) {
    let i = 0;
    let tid = 0;
    for (let j = 0, k = dv.getUint32(stts.a + 4); j < k && i < n; j++) {
      const ant = dv.getUint32(stts.a + 8 + j * 8);
      const d = dv.getUint32(stts.a + 12 + j * 8);
      if (j === 0) delta = d || 1;
      for (let q = 0; q < ant && i < n; q++, i++) {
        dts[i] = tid;
        tid += d;
      }
    }
  } else for (let i = 0; i < n; i++) dts[i] = i;
  // Visningsrekkefølgen: B-ramer vises i en annen rekkefølge enn de dekodes (ctts).
  const ctts = finn(dv, stbl, "ctts");
  const vis = new Uint32Array(n);
  if (ctts) {
    const v1 = dv.getUint8(ctts.a) === 1;
    const cts = Array.from(dts);
    let i = 0;
    for (let j = 0, k = dv.getUint32(ctts.a + 4); j < k && i < n; j++) {
      const ant = dv.getUint32(ctts.a + 8 + j * 8);
      const o = v1 ? dv.getInt32(ctts.a + 12 + j * 8) : dv.getUint32(ctts.a + 12 + j * 8);
      for (let q = 0; q < ant && i < n; q++, i++) cts[i] += o;
    }
    const rang = cts.map((c, idx) => [c, idx] as const).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    rang.forEach(([, idx], r) => (vis[idx] = r));
  } else for (let i = 0; i < n; i++) vis[i] = i;

  const fps = tidsskala && delta ? tidsskala / delta : 24;
  return { tabell: { n, fps, bredde, hoyde, codec, beskrivelse, off, str, nokkel, vis } };
}

function fail(hva: string): never {
  throw new Error(`rullefilm: ${hva}`);
}

/**
 * GOP-ene: fra hver nøkkelrame til neste. `gopAv[rame]` er GOP-en en rame (i visningsrekkefølge)
 * ligger i, `dekAv[rame]` plassen dens i dekoderekkefølgen.
 */
export function lagGoper(t: Pick<Tabell, "n" | "off" | "str" | "nokkel" | "vis">): { gop: Gop[]; gopAv: Uint32Array; dekAv: Uint32Array } {
  const gop: Gop[] = [];
  for (let i = 0; i < t.n; i++) {
    const slutt = t.off[i] + t.str[i];
    if (t.nokkel[i] || !gop.length) gop.push({ a: i, b: i + 1, lo: t.vis[i], hi: t.vis[i], fra: t.off[i], til: slutt });
    else {
      const g = gop[gop.length - 1];
      g.b = i + 1;
      g.lo = Math.min(g.lo, t.vis[i]);
      g.hi = Math.max(g.hi, t.vis[i]);
      g.fra = Math.min(g.fra, t.off[i]);
      g.til = Math.max(g.til, slutt);
    }
  }
  const gopAv = new Uint32Array(t.n);
  const dekAv = new Uint32Array(t.n);
  gop.forEach((g, gi) => {
    for (let i = g.a; i < g.b; i++) {
      gopAv[t.vis[i]] = gi;
      dekAv[t.vis[i]] = i;
    }
  });
  return { gop, gopAv, dekAv };
}

/** Deler fila i byteområder på hele GOP-er, hver på høyst `maks` byte (én GOP kan være større). */
export function lagDeler(gop: Gop[], maks = 640 * 1024): Del[] {
  const deler: Del[] = [];
  for (let gi = 0; gi < gop.length; gi++) {
    const g = gop[gi];
    const d = deler[deler.length - 1];
    if (d && Math.max(d.til, g.til) - Math.min(d.fra, g.fra) <= maks) {
      d.fra = Math.min(d.fra, g.fra);
      d.til = Math.max(d.til, g.til);
      d.g1 = gi + 1;
    } else deler.push({ fra: g.fra, til: g.til, g0: gi, g1: gi + 1 });
  }
  return deler;
}

/**
 * Neste del som bør hentes: den som ligger nærmest `senterDel`, med det som ligger i fartsretningen
 * først ved lik avstand. `status[i]` er 0 når delen ikke er hentet. Høyst `rekkevidde` deler unna.
 * -1 når alt innen rekkevidde er hentet eller på vei.
 */
export function nesteDel(status: ArrayLike<number>, senterDel: number, retn: 1 | -1, rekkevidde = Infinity): number {
  const n = status.length;
  for (let d = 0; d < n && d <= rekkevidde; d++) {
    const forst = senterDel + retn * d;
    if (forst >= 0 && forst < n && !status[forst]) return forst;
    const sa = senterDel - retn * d;
    if (d && sa >= 0 && sa < n && !status[sa]) return sa;
  }
  return -1;
}

// ── Vinduet ─────────────────────────────────────────────────────────────────

/**
 * Hvor mange dekodede ramer vinduet får holde: budsjettet delt på størrelsen av én rame (RGBA når
 * ramene kopieres til ImageBitmap, ellers 4:2:0), men alltid nok til tre GOP-er og aldri over `tak`.
 */
export function vinduStr(bredde: number, hoyde: number, budsjett: number, gopMaks: number, kopi: boolean, tak = 48): number {
  const perRame = bredde * hoyde * (kopi ? 4 : 1.5);
  const etterBudsjett = Math.floor(budsjett / Math.max(1, perRame));
  return Math.max(Math.min(tak, etterBudsjett), gopMaks * 3);
}

/**
 * Ramene vi vil ha dekodet, viktigst først: den vi står på, så `fram` ramer i fartsretningen og `bak`
 * ramer den andre veien, med `steg` mellom dem (ved rask rulling hoppes det over ramer).
 */
export function onskeliste(senter: number, retn: 1 | -1, steg: number, fram: number, bak: number, n: number): number[] {
  const ut: number[] = [];
  const legg = (i: number) => {
    if (i >= 0 && i < n) ut.push(i);
  };
  legg(senter);
  // Én bak for hver tredje fram (den første straks), så en snuoperasjon alltid har noe å vise.
  let b = 0;
  for (let j = 1; j <= fram; j++) {
    legg(senter + retn * j * steg);
    if (j % 3 === 1 && b < bak) legg(senter - retn * ++b * steg);
  }
  while (b < bak) legg(senter - retn * ++b * steg);
  return ut;
}

export interface Bunke {
  /** GOP-en. */
  g: number;
  /** Dekod fra GOP-ens nøkkelrame til (ikke med) denne plassen i dekoderekkefølgen. */
  til: number;
}

/**
 * Det som skal dekodes nå: GOP-ene til de første ramene i ønskelista som mangler og har dataene
 * hentet, til bunken er på minst `minst` ramer. Én bunke om gangen holder ventetiden kort når målet
 * flytter seg. Med `hel` (rolig rulling, steg 1) dekodes GOP-en hel: ramen etter trengs i neste
 * bilde, og en halv GOP måtte ellers tas om igjen fra nøkkelramen. Uten `hel` (rask rulling) dekodes
 * den bare til den siste ønskede ramen i den.
 */
export function velgGoper(
  liste: number[],
  har: (rame: number) => boolean,
  gopAv: ArrayLike<number>,
  gop: Gop[],
  hentet: (g: number) => boolean,
  dekAv: ArrayLike<number>,
  hel = true,
  minst = 6,
): Bunke[] {
  const valgt: Bunke[] = [];
  let ant = 0;
  for (const i of liste) {
    if (har(i)) continue;
    const g = gopAv[i];
    const til = hel ? gop[g].b : dekAv[i] + 1;
    const fra = valgt.find((v) => v.g === g);
    if (fra) {
      fra.til = Math.max(fra.til, til);
      continue;
    }
    if (ant >= minst || !hentet(g)) continue;
    valgt.push({ g, til });
    ant += til - gop[g].a;
  }
  return valgt;
}

/**
 * Ramene som må ut for at vinduet skal holde `maks`: de som ligger lengst fra `senter`, lengst først.
 * Det som ligger BAK fartsretningen teller `bakVekt` ganger så langt unna, så vinduet strekker seg
 * lenger frem enn bak (ellers ville det vi nettopp dekodet foran oss bli kastet for det vi har passert).
 */
export function skalKastes(nokler: Iterable<number>, senter: number, maks: number, retn: 1 | -1 = 1, bakVekt = BAK_VEKT): number[] {
  const alle = [...nokler];
  if (alle.length <= maks) return [];
  const avstand = (k: number) => ((k - senter) * retn >= 0 ? Math.abs(k - senter) : Math.abs(k - senter) * bakVekt);
  return alle.sort((x, y) => avstand(y) - avstand(x)).slice(0, alle.length - maks);
}

/** Det bak fartsretningen teller så mange ganger lenger unna når vinduet kastes fra. */
export const BAK_VEKT = 2.4;

/**
 * Hvor langt frem og bak ønskelista skal rekke når vinduet holder `maks` ramer. Kastingen beholder
 * maks · v/(1+v) ramer foran og maks/(1+v) bak (v = BAK_VEKT). Ønskelista må stoppe en GOP før den
 * grensen: en GOP dekodes alltid hel, og det som stikker utenfor, ville blitt kastet og dekodet på
 * nytt når vi kom dit (kverning).
 */
export function vinduFor(maks: number, gopMaks: number): { fram: number; bak: number } {
  const foran = Math.floor((maks * BAK_VEKT) / (1 + BAK_VEKT));
  const bak = Math.floor(maks / (1 + BAK_VEKT));
  return { fram: Math.max(1, foran - (gopMaks - 1)), bak: Math.max(0, bak - (gopMaks - 1)) };
}

/** Den dekodede ramen som ligger nærmest `senter` (-1 når vinduet er tomt). */
export function naermeste(nokler: Iterable<number>, senter: number): number {
  let best = -1;
  let bd = Infinity;
  for (const k of nokler) {
    const d = Math.abs(k - senter);
    if (d < bd) {
      bd = d;
      best = k;
    }
  }
  return best;
}

/** Steget mellom ramene i ønskelista ut fra farten (ramer per bilde på skjermen). */
export function stegFor(fart: number, tak = 8): number {
  return Math.round(klem(Math.abs(fart), 1, tak));
}
