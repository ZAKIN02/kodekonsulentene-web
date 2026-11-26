/**
 * Rullefilm: bildekilden bak hvert klipp i ScrollWorld. Hentes av scroll-world.ts først når et klipp
 * skal lastes (etter første interaksjon), så den veier ingenting ved første visning.
 * Spolelogikken er rene funksjoner i spole.ts. Rapport: docs/design/rapporter/wow-r7-flyt.md.
 *
 * To kilder med samme kontrakt (`Kilde`), og SAMME fil (`<navn>.mp4`, laget av scripts/kod-rullefilm.sh):
 *
 *  1. WebCodecs (`VideoDecoder`) til et lerret, der nettleseren har det. Tabellen over ramer leses
 *     fra MP4-en, fila hentes i deler med Range (nærmest rulleposisjonen først), og hele GOP-er
 *     dekodes FØR de trengs, i et vindu rundt posisjonen. Hvert bilde på skjermen tegnes fra vinduet,
 *     i samme bilde som teksten. Ingen søking, så baklengs koster det samme som forlengs. Vinduet er
 *     en ring med fast minnebudsjett, uansett hvor langt klippet er. Leverer ikke dekoderen, prøves
 *     programvaredekoding, og så reserven.
 *  2. Reserve: `<video>` og `currentTime`, én søking om gangen (som før runde 7). Brukes når
 *     VideoDecoder mangler, ikke støtter fila, eller feiler underveis.
 *
 * Elementet får klassen `sw__video` og `data-kilde`. For testene og målingene står tilstanden på
 * elementet: `swAndel` (andelen av klippet som vises nå, 0–1), `swRamer` (antall ramer, 0 i reserven)
 * og `swMotor` ("webcodecs" | "video").
 */
import { lesHode, lagGoper, lagDeler, nesteDel, vinduStr, onskeliste, velgGoper, skalKastes, naermeste, stegFor, vinduFor, klem, type Tabell, type Gop, type Del } from "./spole";

export interface Kilde {
  readonly el: HTMLElement;
  /**
   * Ønsket andel av klippet (0–1), kalt hvert bilde mens laget er aktivt eller nabo til det aktive.
   * `aktiv`: laget vises nå. Naboene varmer bare opp bildene ved inngangen.
   * Svarer true når bildet som vises er det ønskede (da kan takten stoppe).
   */
  sett(andel: number, aktiv: boolean): boolean;
  /** Frigjør dekoder og dekodede ramer. Det som er hentet, beholdes. */
  hvil(): void;
  /** iOS: et dempet klipp må ha spilt én gang etter en berøring (bare reserven). */
  prim(): void;
  slipp(): void;
}

export interface KildeValg {
  mobil: boolean;
  /** Første bilde er tegnet: posteren kan skjules. */
  forsteBilde(): void;
  /** Kilden kan ikke levere (bare WebCodecs): bytt til reserven. */
  feil(grunn: unknown): void;
}

type MedTilstand = HTMLElement & { swAndel?: number; swRamer?: number; swMotor?: string };

/** Først hentes så mye: tabellen (moov) og de første GOP-ene. */
const HODE = 256 * 1024;
/** Samtidige delhentinger per klipp. */
const HENT_SAMTIDIG = 2;
/** Så mye komprimert data holdes per klipp før delene lengst unna slippes. */
const MAKS_HENTET = 32 * 1024 * 1024;
/** Minnebudsjett for dekodede ramer i det aktive klippet (naboene får NABO ramer hver). */
const BUDSJETT = { desktop: 96 * 1024 * 1024, mobil: 40 * 1024 * 1024 };
const NABO = 4;
/** En bunke som ikke er ferdig etter så lang tid, regnes som at dekoderen har stoppet. */
const STOPPET_MS = 2500;

/**
 * Trappen ned når dekoderen ikke leverer: 0 = nettleserens valg (som regel maskinvare),
 * 1 = programvaredekoding, og etter det reserven (<video>).
 *
 * Vinduet holder på VideoFrame-ene slik dekoderen leverer dem (ingen kopi). En maskinvaredekoder med
 * få utbuffere kan stoppe når vi holder på mange; da merkes det her (bunken blir aldri ferdig), og
 * vi går ett trinn ned. Å kopiere til ImageBitmap er målt og forkastet: i WebKit feiler dekoderen
 * («Decoding task did not complete») og minnet løper løpsk.
 */
let trinn: 0 | 1 = 0;
let wcAv = false;

export function harWebCodecs(): boolean {
  return !wcAv && typeof VideoDecoder === "function" && typeof EncodedVideoChunk === "function";
}

export function lagKilde(url: string, lag: HTMLElement, valg: KildeValg): Kilde {
  return harWebCodecs() ? wcKilde(url, lag, valg) : videoKilde(url, lag, valg);
}

// ── 1. WebCodecs til lerret ─────────────────────────────────────────────────

type Bilde = VideoFrame;

function wcKilde(url: string, lag: HTMLElement, valg: KildeValg): Kilde {
  const c = document.createElement("canvas") as HTMLCanvasElement & MedTilstand;
  c.className = "sw__video";
  c.setAttribute("aria-hidden", "true");
  c.dataset.kilde = url;
  c.swMotor = "webcodecs";
  c.swRamer = 0;
  const ctx = c.getContext("2d", { alpha: false });
  lag.appendChild(c);

  const ac = new AbortController();
  let dod = false;
  let t: Tabell | null = null;
  let gop: Gop[] = [];
  let gopAv: Uint32Array = new Uint32Array(0);
  let dekAv: Uint32Array = new Uint32Array(0);
  let deler: Del[] = [];
  let delAv: Uint32Array = new Uint32Array(0); // GOP → del
  let status: Uint8Array = new Uint8Array(0); // 0 ikke hentet, 1 på vei, 2 hentet
  let data: (Uint8Array | null)[] = [];
  let hentet = 0;
  let henter = 0;
  let feilHent = 0;
  let feilDek = 0;
  let konf: VideoDecoderConfig | null = null;
  let dek: VideoDecoder | null = null;
  let opptatt = false;
  const ramer = new Map<number, Bilde>();
  let bunkeStart = 0;
  let mittTrinn: 0 | 1 = 0;
  let maksAktiv = 24;
  let gopMaks = 8;
  let senter = 0;
  let retn: 1 | -1 = 1;
  let forrigeF = -1;
  let fart = 0;
  let aktiv = false;
  let vist = -1;
  let tegnet = false;

  const gi_opp = (grunn: unknown) => {
    if (dod) return;
    wcAv = true;
    valg.feil(grunn);
  };

  async function start() {
    const r = await fetch(url, { headers: { Range: `bytes=0-${HODE - 1}` }, signal: ac.signal });
    if (!r.ok) throw new Error(String(r.status));
    let buf = await r.arrayBuffer();
    const delvis = r.status === 206;
    let total = delvis ? Number((r.headers.get("content-range") || "").split("/")[1]) || buf.byteLength : buf.byteLength;
    let hode = lesHode(buf, total);
    if (!hode.tabell) {
      // Tabellen var større enn første henting, eller ligger sist i fila: hent det som trengs.
      const hele = hode.trenger < 0 || !delvis;
      const r2 = await fetch(url, { headers: hele ? {} : { Range: `bytes=0-${hode.trenger - 1}` }, signal: ac.signal });
      if (!r2.ok) throw new Error(String(r2.status));
      buf = await r2.arrayBuffer();
      if (hele) total = buf.byteLength;
      hode = lesHode(buf, total);
      if (!hode.tabell) throw new Error("tabellen kunne ikke leses");
    }
    if (dod) return;
    t = hode.tabell;
    konf = await konfig(t);
    if (dod) return;
    ({ gop, gopAv, dekAv } = lagGoper(t));
    deler = lagDeler(gop);
    delAv = new Uint32Array(gop.length);
    deler.forEach((d, di) => {
      for (let g = d.g0; g < d.g1; g++) delAv[g] = di;
    });
    status = new Uint8Array(deler.length);
    data = deler.map(() => null);
    // Det som allerede kom med første henting.
    deler.forEach((d, di) => {
      if (d.til <= buf.byteLength) {
        data[di] = new Uint8Array(buf, d.fra, d.til - d.fra);
        status[di] = 2;
        hentet += d.til - d.fra;
      }
    });
    gopMaks = gop.reduce((m, g) => Math.max(m, g.b - g.a), 1);
    maksAktiv = vinduStr(t.bredde, t.hoyde, valg.mobil ? BUDSJETT.mobil : BUDSJETT.desktop, gopMaks, false);
    c.width = t.bredde;
    c.height = t.hoyde;
    c.swRamer = t.n;
    hent();
    pump();
  }

  // ── Henting i deler ──
  function hent() {
    if (dod || !t) return;
    while (henter < HENT_SAMTIDIG) {
      const senterDel = delAv[gopAv[senter]] ?? 0;
      // Naboene henter bare inngangen; det aktive klippet henter alt, nærmest først.
      const di = nesteDel(status, senterDel, retn, aktiv ? Infinity : 1);
      if (di < 0) return;
      const d = deler[di];
      status[di] = 1;
      henter++;
      fetch(url, { headers: { Range: `bytes=${d.fra}-${d.til - 1}` }, signal: ac.signal })
        .then((r) => (r.status === 206 ? r.arrayBuffer() : Promise.reject(new Error(`Range: ${r.status}`))))
        .then((b) => {
          if (dod) return;
          if (b.byteLength !== d.til - d.fra) throw new Error("kort svar");
          data[di] = new Uint8Array(b);
          status[di] = 2;
          hentet += b.byteLength;
          feilHent = 0;
          rydd(senterDel);
        })
        .catch((e) => {
          status[di] = 0;
          // Tre feil på rad: nettet eller tjeneren leverer ikke deler. Reserven henter hele fila.
          if (!dod && (e as Error)?.name !== "AbortError" && ++feilHent >= 3) gi_opp(e);
        })
        .finally(() => {
          henter--;
          if (dod) return;
          pump();
          if (feilHent) setTimeout(hent, 400 * feilHent);
          else hent();
        });
    }
  }

  /** Lange klipp: slipp delene lengst unna når det hentede går over taket. */
  function rydd(senterDel: number) {
    while (hentet > MAKS_HENTET) {
      let verst = -1;
      let vd = 2;
      for (let i = 0; i < deler.length; i++) {
        const dd = Math.abs(i - senterDel);
        if (status[i] === 2 && dd > vd) {
          vd = dd;
          verst = i;
        }
      }
      if (verst < 0) return;
      hentet -= deler[verst].til - deler[verst].fra;
      data[verst] = null;
      status[verst] = 0;
    }
  }

  // ── Dekoding i vinduet ──
  const maks = () => (aktiv ? maksAktiv : Math.min(NABO, maksAktiv));

  function kast() {
    for (const k of skalKastes(ramer.keys(), senter, maks(), retn)) {
      ramer.get(k)!.close();
      ramer.delete(k);
    }
  }

  function lagre(i: number, b: Bilde) {
    if (dod || !dek) {
      b.close();
      return;
    }
    feilDek = 0;
    ramer.get(i)?.close();
    ramer.set(i, b);
    kast();
  }

  /** Oppsettet for dette trinnet i trappen. Kaster når nettleseren ikke kan dekode fila slik. */
  async function konfig(tab: Tabell): Promise<VideoDecoderConfig> {
    mittTrinn = trinn;
    const k: VideoDecoderConfig = {
      codec: tab.codec,
      description: tab.beskrivelse,
      codedWidth: tab.bredde,
      codedHeight: tab.hoyde,
      optimizeForLatency: true,
      hardwareAcceleration: mittTrinn ? "prefer-software" : "no-preference",
    };
    const st = await VideoDecoder.isConfigSupported(k);
    if (!st.supported) throw new Error(`ikke støttet: ${tab.codec}`);
    return k;
  }

  /** Dekoderen leverer ikke: ett trinn ned (programvare), og deretter reserven. */
  function trappNed(grunn: unknown) {
    if (dod) return;
    lukk();
    if (mittTrinn || !t) {
      gi_opp(grunn);
      return;
    }
    trinn = 1;
    feilDek = 0;
    const tab = t;
    konf = null;
    konfig(tab).then(
      (k) => {
        konf = k;
      },
      (e) => gi_opp(e),
    );
  }

  function lukk() {
    const gammel = dek;
    dek = null;
    opptatt = false;
    try {
      gammel?.close();
    } catch {
      /* allerede lukket */
    }
    tom();
  }

  function apne() {
    if (dek || !konf || dod) return;
    const denne = new VideoDecoder({
      output(fr) {
        if (dek === denne) lagre(fr.timestamp, fr);
        else fr.close();
      },
      error(e) {
        if (dek !== denne) return;
        // Nettleseren kan ta tilbake en dekoder som har stått ubrukt (fane i bakgrunnen). Da åpnes en
        // ny ved neste bilde. Tre feil på rad uten ett eneste bilde: ett trinn ned.
        dek = null;
        opptatt = false;
        if (++feilDek >= 3) trappNed(e);
      },
    });
    denne.configure(konf);
    dek = denne;
  }

  function pump() {
    if (opptatt || dod || !t || !dek) return;
    const m = maks();
    // Ved rask rulling hoppes det over ramer (steg), men spennet i ramer er det samme, så det som
    // dekodes alltid får plass i vinduet.
    const steg = aktiv ? stegFor(fart) : 1;
    const v = vinduFor(m, gopMaks);
    const fram = aktiv ? Math.max(1, Math.floor(v.fram / steg)) : Math.max(0, m - 1);
    const bak = aktiv ? Math.floor(v.bak / steg) : 0;
    const liste = onskeliste(senter, retn, steg, fram, bak, t.n);
    // I fart er ramen vi står på, passert før den er dekodet. Da tas de foran først.
    if (steg >= 2 && liste.length > 1) liste.push(liste.shift()!);
    const valgt = velgGoper(liste, (i) => ramer.has(i), gopAv, gop, (g) => status[delAv[g]] === 2, dekAv, steg === 1);
    if (!valgt.length) return;
    opptatt = true;
    bunkeStart = performance.now();
    const denne = dek;
    try {
      for (const { g, til } of valgt) {
        const d = deler[delAv[g]];
        const bytes = data[delAv[g]]!;
        for (let i = gop[g].a; i < til; i++) {
          const fra = t.off[i] - d.fra;
          denne.decode(new EncodedVideoChunk({ type: t.nokkel[i] ? "key" : "delta", timestamp: t.vis[i], data: bytes.subarray(fra, fra + t.str[i]) }));
        }
      }
    } catch (e) {
      opptatt = false;
      trappNed(e);
      return;
    }
    denne.flush().then(
      () => {
        if (dek !== denne) return;
        opptatt = false;
        pump();
      },
      () => {
        if (dek === denne) opptatt = false;
      },
    );
  }

  function tom() {
    for (const b of ramer.values()) b.close();
    ramer.clear();
  }

  start().catch((e) => {
    if ((e as Error)?.name !== "AbortError") gi_opp(e);
  });

  return {
    el: c,
    sett(andel, aktivNa) {
      if (!t || dod) return false;
      const f = klem(andel) * (t.n - 1);
      const i = Math.round(f);
      if (forrigeF >= 0) fart = f - forrigeF;
      forrigeF = f;
      // I ro ved en ende (en nabo som venter): retningen er inn i klippet.
      if (Math.abs(fart) > 0.01) retn = fart > 0 ? 1 : -1;
      else if (i === 0) retn = 1;
      else if (i === t.n - 1) retn = -1;
      senter = i;
      // Fra aktiv til nabo: vinduet krymper straks, ikke først når neste rame kommer.
      if (aktiv && !aktivNa) {
        aktiv = false;
        kast();
      }
      aktiv = aktivNa;
      if (opptatt && performance.now() - bunkeStart > STOPPET_MS) trappNed(new Error("dekoderen stoppet"));
      if (!dek) apne();
      hent();
      pump();
      const b = naermeste(ramer.keys(), senter);
      if (b >= 0 && b !== vist && ctx) {
        ctx.drawImage(ramer.get(b)!, 0, 0, c.width, c.height);
        vist = b;
        c.swAndel = t.n > 1 ? b / (t.n - 1) : 0;
        if (!tegnet) {
          tegnet = true;
          valg.forsteBilde();
        }
      }
      return vist === senter;
    },
    hvil() {
      if (!dek) return;
      forrigeF = -1;
      fart = 0;
      lukk();
    },
    prim() {},
    slipp() {
      dod = true;
      ac.abort();
      lukk();
      data = [];
      c.remove();
    },
  };
}

// ── 2. Reserve: <video> og currentTime ──────────────────────────────────────

function videoKilde(url: string, lag: HTMLElement, valg: KildeValg): Kilde {
  const v = document.createElement("video") as HTMLVideoElement & MedTilstand;
  v.className = "sw__video";
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.disablePictureInPicture = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  v.setAttribute("disableremoteplayback", "");
  v.setAttribute("aria-hidden", "true");
  v.tabIndex = -1;
  v.dataset.kilde = url;
  v.swMotor = "video";
  v.swRamer = 0;
  const ac = new AbortController();
  let dod = false;
  let klar = false;
  let blobUrl: string | null = null;
  let onsket = 0;
  let primet = false;
  let vilPrimes = false;
  const eps = valg.mobil ? 0.02 : 0.008;

  const prim = () => {
    vilPrimes = true;
    if (!valg.mobil || primet || v.readyState < 2) return;
    primet = true;
    const p = v.play();
    if (p) p.then(() => v.pause()).catch(() => {});
  };
  const tid = () => Math.max(0.001, klem(onsket, 0, 0.999) * (v.duration || 1));

  v.addEventListener("loadedmetadata", () => {
    klar = true;
    try {
      v.currentTime = tid();
    } catch {
      /* ingenting */
    }
  });
  v.addEventListener("seeked", () => {
    v.swAndel = v.duration ? v.currentTime / v.duration : 0;
  });
  // Posteren skjules først når klippet har tegnet et bilde (iOS blinker svart ellers).
  v.addEventListener("seeked", () => valg.forsteBilde(), { once: true });
  v.addEventListener("loadeddata", () => {
    v.pause();
    if (vilPrimes) prim();
  });

  // Hentet som Blob: alltid spolbar, også når tjeneren ikke svarer på Range.
  fetch(url, { signal: ac.signal })
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then((blob) => {
      if (dod) return;
      blobUrl = URL.createObjectURL(blob);
      v.src = blobUrl;
      lag.appendChild(v);
    })
    .catch(() => {});

  return {
    el: v,
    sett(andel) {
      onsket = andel;
      if (!klar || dod || v.seeking) return false;
      const mal = tid();
      if (Math.abs(v.currentTime - mal) <= eps) return true;
      try {
        v.currentTime = mal;
      } catch {
        /* ingenting */
      }
      return false;
    },
    hvil() {},
    prim,
    slipp() {
      dod = true;
      ac.abort();
      v.removeAttribute("src");
      v.load();
      v.remove();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    },
  };
}
