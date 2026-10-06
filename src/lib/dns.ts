/**
 * E-postsikkerhet: SPF, DKIM og DMARC.
 *
 * Parserne er rene funksjoner uten nettverk, slik at de kan testes. Oppslaget
 * mot DNS ligger nederst og feiler stille.
 *
 * Æresregelen fra src/lib/sjekk.ts gjelder her også: det vi ikke har slått opp,
 * får status «neutral» og en setning om hvorfor. Og funnene forklares for en
 * bedriftseier, ikke for en driftsingeniør – «noen kan sende e-post som ser ut
 * til å komme fra dere» slår «DMARC p=none».
 */

import type { Status, Rad } from "./sjekk.ts";

/* --------------------------------------------------------------- SPF ---- */

/** Mekanismer og modifikatorer som koster et DNS-oppslag (RFC 7208 § 4.6.4). */
const SPF_OPPSLAG = ["include", "a", "mx", "ptr", "exists", "redirect"] as const;

export interface SpfFunn {
  finnes: boolean;
  /** Rå TXT-posten, slik den står i DNS. */
  post: string | null;
  /** «~all», «-all», «?all», «+all» – eller null hvis posten mangler all-mekanismen. */
  all: string | null;
  /** Antall mekanismer som krever DNS-oppslag. Grensen er 10. */
  oppslag: number;
  /** Mer enn én SPF-post på domenet er i seg selv en feil (RFC 7208 § 3.2). */
  flerePoster: boolean;
  feil: string[];
}

/**
 * Plukker SPF-posten ut av alle TXT-postene på domenet og vurderer den.
 * Tar imot listen av TXT-poster, ikke domenet – derfor er den testbar.
 */
export function parseSpf(txtPoster: string[]): SpfFunn {
  const spf = txtPoster.filter((t) => /^v=spf1\b/i.test(t.trim()));
  const feil: string[] = [];

  if (spf.length === 0) {
    return { finnes: false, post: null, all: null, oppslag: 0, flerePoster: false, feil };
  }
  if (spf.length > 1) {
    feil.push("Domenet har flere SPF-poster. Da ignorerer mottakerne alle sammen.");
  }

  const post = spf[0]!.trim();
  const deler = post.split(/\s+/).slice(1);

  let oppslag = 0;
  let all: string | null = null;

  for (const d of deler) {
    const alt = /^([+\-~?]?)all$/i.exec(d);
    if (alt) {
      all = `${alt[1] || "+"}all`;
      continue;
    }
    // «include:…», «a», «a:domene», «mx», «redirect=…»
    const navn = d.replace(/^[+\-~?]/, "").split(/[:=]/)[0]!.toLowerCase();
    if ((SPF_OPPSLAG as readonly string[]).includes(navn)) oppslag++;
  }

  if (oppslag > 10) {
    feil.push(
      `SPF-posten krever ${oppslag} DNS-oppslag. Grensen er 10, og over den slutter kontrollen å virke.`,
    );
  }
  if (all === "+all") {
    feil.push("SPF-posten slutter med «+all», som tillater hvem som helst å sende på deres vegne.");
  }
  if (all === null) {
    feil.push("SPF-posten mangler en all-mekanisme, så den sier ikke hva som skal skje med resten.");
  }

  return { finnes: true, post, all, oppslag, flerePoster: spf.length > 1, feil };
}

/** Oversetter SPF-funnet til en rad i rapporten. */
export function vurderSpf(f: SpfFunn): Rad {
  if (!f.finnes) {
    return {
      name: "SPF",
      status: "fail",
      value: "Mangler",
      note: "Ingen SPF-post. Hvem som helst kan sende e-post som ser ut til å komme fra dere, og deres egen e-post havner oftere i søppelposten.",
    };
  }
  if (f.feil.length > 0) {
    return {
      name: "SPF",
      status: f.all === "+all" || f.flerePoster ? "fail" : "warn",
      value: f.all ?? "uten all",
      note: f.feil[0]!,
    };
  }
  const streng = f.all === "-all";
  return {
    name: "SPF",
    status: "ok",
    value: `${f.all} · ${f.oppslag}/10 oppslag`,
    note: streng
      ? "SPF er satt opp strengt. Andre kan ikke sende e-post i deres navn."
      : "SPF er på plass. «~all» ber mottakeren merke falsk e-post i stedet for å avvise den – «-all» er strengere.",
  };
}

/* ------------------------------------------------------------- DMARC ---- */

export interface DmarcFunn {
  finnes: boolean;
  post: string | null;
  /** «none», «quarantine» eller «reject». */
  p: string | null;
  /** Policy for underdomener, hvis satt. */
  sp: string | null;
  /** Hvor stor andel policyen gjelder for. 100 når pct ikke er satt. */
  pct: number;
  /** Adresse som mottar samlerapporter. Uten den ser dere aldri resultatet. */
  rua: string | null;
  feil: string[];
}

export function parseDmarc(txtPoster: string[]): DmarcFunn {
  const dmarc = txtPoster.find((t) => /^v=DMARC1\b/i.test(t.trim()));
  const feil: string[] = [];

  if (!dmarc) {
    return { finnes: false, post: null, p: null, sp: null, pct: 100, rua: null, feil };
  }

  const post = dmarc.trim();
  const tag = (navn: string): string | null => {
    const m = new RegExp(`(?:^|;)\\s*${navn}\\s*=\\s*([^;]+)`, "i").exec(post);
    return m ? m[1]!.trim() : null;
  };

  const p = tag("p")?.toLowerCase() ?? null;
  const sp = tag("sp")?.toLowerCase() ?? null;
  const rua = tag("rua");
  const pctRaa = tag("pct");
  const pct = pctRaa && /^\d+$/.test(pctRaa) ? Number(pctRaa) : 100;

  if (!p) feil.push("DMARC-posten mangler p-taggen, som sier hva mottakeren skal gjøre.");
  else if (!["none", "quarantine", "reject"].includes(p)) {
    feil.push(`DMARC-posten har ukjent policy «${p}».`);
  }
  if (!rua) {
    feil.push("DMARC-posten har ingen rapportadresse (rua), så dere får aldri vite om noen misbruker domenet.");
  }
  if (pct < 100) {
    feil.push(`DMARC gjelder bare ${pct} % av e-posten. Resten slipper gjennom uten kontroll.`);
  }

  return { finnes: true, post, p, sp, pct, rua, feil };
}

export function vurderDmarc(f: DmarcFunn): Rad {
  if (!f.finnes) {
    return {
      name: "DMARC",
      status: "fail",
      value: "Mangler",
      note: "Ingen DMARC-post. Uten den kan noen sende faktura i deres navn, og dere får ikke beskjed om at det skjer.",
    };
  }
  if (f.p === "none") {
    return {
      name: "DMARC",
      status: "warn",
      value: "p=none",
      note: f.rua
        ? "DMARC er satt opp, men i overvåkningsmodus. Falsk e-post i deres navn blir levert som normalt – dere får bare vite om det."
        : "DMARC står i overvåkningsmodus uten rapportadresse. Da gjør den ingenting i det hele tatt.",
    };
  }
  if (f.feil.length > 0) {
    return { name: "DMARC", status: "warn", value: `p=${f.p ?? "?"}`, note: f.feil[0]! };
  }
  return {
    name: "DMARC",
    status: "ok",
    value: `p=${f.p}`,
    note:
      f.p === "reject"
        ? "DMARC avviser falsk e-post i deres navn. Dette er det strengeste nivået."
        : "DMARC legger falsk e-post i deres navn i søppelposten hos mottakeren.",
  };
}

/* -------------------------------------------------------------- DKIM ---- */

export interface DkimFunn {
  /** null når ingen selektor ble oppgitt – da er ingenting slått opp. */
  selektor: string | null;
  finnes: boolean;
  post: string | null;
}

export function vurderDkim(f: DkimFunn): Rad {
  if (!f.selektor) {
    return {
      name: "DKIM",
      status: "neutral",
      value: "Ikke sjekket",
      note: "DKIM ligger på en selektor vi ikke kan gjette oss til. Oppgi selektoren, så sjekker vi den. Google bruker «google», Microsoft 365 bruker «selector1».",
    };
  }
  if (!f.finnes) {
    return {
      name: "DKIM",
      status: "fail",
      value: `${f.selektor}: mangler`,
      note: `Fant ingen DKIM-nøkkel på selektoren «${f.selektor}». Enten er den feil, eller så signeres ikke e-posten deres.`,
    };
  }
  return {
    name: "DKIM",
    status: "ok",
    value: `${f.selektor}: funnet`,
    note: "E-posten deres signeres, slik at mottakeren kan se at den ikke er endret underveis.",
  };
}

/* ---------------------------------------------------------- rapporten ---- */

export interface EpostRapport {
  domene: string;
  dato: string;
  rader: Rad[];
  totalt: number;
  forbehold: string[];
}

const VEKT: Record<Status, number> = { ok: 1, warn: 0.5, fail: 0, neutral: 0.5 };

export function byggEpostRapport(args: {
  domene: string;
  dato: string;
  spf: SpfFunn;
  dmarc: DmarcFunn;
  dkim: DkimFunn;
}): EpostRapport {
  const rader = [vurderSpf(args.spf), vurderDkim(args.dkim), vurderDmarc(args.dmarc)];
  const totalt = Math.round((rader.reduce((s, r) => s + VEKT[r.status], 0) / rader.length) * 100);
  return {
    domene: args.domene,
    dato: args.dato,
    rader,
    totalt,
    forbehold: [
      "Vi leser DNS-postene på domenet. Vi sender ingen e-post og logger oss ikke inn noe sted.",
      "DKIM sjekkes bare når dere oppgir selektoren. Et domene kan ha flere.",
      "Sjekken sier at postene finnes og er riktig formet, ikke at e-postoppsettet deres virker i praksis.",
      "Dette er ikke juridisk rådgivning.",
    ],
  };
}

/* ------------------------------------------------------------ oppslag ---- */

/** Domenenavn fra det brukeren skrev. Tåler URL, e-postadresse og bart domene. */
export function normaliserDomene(input: string): string {
  let s = input.trim().toLowerCase();
  if (!s) throw new Error("Skriv inn et domene.");
  if (s.includes("@")) s = s.slice(s.lastIndexOf("@") + 1);
  s = s.replace(/^[a-z]+:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "").replace(/\.$/, "");
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(s)) {
    throw new Error("Det ser ikke ut som et domene. Prøv dinbedrift.no");
  }
  return s;
}

interface DohSvar {
  Answer?: { type: number; data: string }[];
}

/**
 * Slår opp TXT-poster over DNS-over-HTTPS. Cloudflare først, Google som reserve.
 * Returnerer tom liste når ingenting finnes eller begge svarer dårlig – en sjekk
 * skal ikke stoppe fordi en resolver er nede.
 */
export async function slaaOppTxt(navn: string): Promise<string[]> {
  const resolvere = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(navn)}&type=TXT`,
    `https://dns.google/resolve?name=${encodeURIComponent(navn)}&type=TXT`,
  ];

  for (const url of resolvere) {
    try {
      const svar = await fetch(url, {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(6_000),
      });
      if (!svar.ok) continue;
      const data = (await svar.json()) as DohSvar;
      // type 16 er TXT. Resolverne returnerer verdien med anførselstegn rundt, og
      // lange poster kommer som flere strenger som skal settes sammen.
      return (data.Answer ?? [])
        .filter((a) => a.type === 16)
        .map((a) => a.data.replace(/"\s+"/g, "").replace(/^"|"$/g, ""));
    } catch {
      continue;
    }
  }
  return [];
}

/** Henter SPF, DMARC og eventuelt DKIM for et domene. */
export async function hentEpostoppsett(domene: string, dkimSelektor?: string) {
  const [txt, dmarcTxt, dkimTxt] = await Promise.all([
    slaaOppTxt(domene),
    slaaOppTxt(`_dmarc.${domene}`),
    dkimSelektor ? slaaOppTxt(`${dkimSelektor}._domainkey.${domene}`) : Promise.resolve([]),
  ]);

  const dkim: DkimFunn = {
    selektor: dkimSelektor ?? null,
    finnes: dkimTxt.some((t) => /(^|;)\s*(v=DKIM1|k=|p=)/i.test(t)),
    post: dkimTxt[0] ?? null,
  };

  return { spf: parseSpf(txt), dmarc: parseDmarc(dmarcTxt), dkim };
}
