/**
 * Terminalmodus – KodeKonsulentenes signaturdetalj.
 *
 * To flater, én motor:
 *   1. Modal, åpnes med «~» eller Ctrl/Cmd+K hvor som helst på siden.
 *   2. Innfelt, på /404 – der er terminalen hele poenget med siden.
 *
 * Progressiv forbedring: alt den gjør finnes også som vanlige lenker, og siden
 * fungerer uten denne filen. Ingenting kjører før brukeren utløser noe – modalen
 * bygges først ved første tastetrykk, og den innfelte først når verten finnes.
 *
 * Reglene fra brandboken: markøren får blinke her, og teknisk humor er tillatt
 * her og ingen andre steder.
 */
(() => {
  "use strict";

  const SIDER = {
    hjem: "/", nettsider: "/nettsider", systemer: "/systemer", apper: "/apper-og-ai",
    sikkerhet: "/sikkerhet", priser: "/priser", caser: "/caser", om: "/om",
    kontakt: "/kontakt", sjekk: "/sjekk", verktoy: "/verktoy", historie: "/historie",
    handbok: "/handbok", status: "/status", personvern: "/personvern", vilkar: "/vilkar",
  };

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const sov = (ms) => new Promise((r) => setTimeout(r, ms));
  const redusert = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KLASSE = { ok: "kk-ok", warn: "kk-warn", fail: "kk-fail", neutral: "" };

  /* ------------------------------------------------------------ økt ---- */

  /** En økt er én terminalflate: utdataområde, inputfelt og historikk. */
  function lagOkt(out, inn, lukkFn) {
    const okt = {
      out, inn, lukk: lukkFn,
      historikk: [], hi: -1,
      laast: false,
      skriv(html, klasse) {
        const el = document.createElement("span");
        el.innerHTML = klasse ? `<span class="${klasse}">${html}</span>` : html;
        out.appendChild(el);
        out.appendChild(document.createTextNode("\n"));
        out.scrollTop = out.scrollHeight;
        return el;
      },
    };

    inn.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (okt.laast) return;
        const v = inn.value; inn.value = "";
        void kjor(okt, v);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (okt.hi < okt.historikk.length - 1) inn.value = okt.historikk[++okt.hi];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        inn.value = okt.hi > 0 ? okt.historikk[--okt.hi] : ((okt.hi = -1), "");
      } else if (e.key === "Tab") {
        // Fullfør kommandonavn. Bare på første ord – argumentene er for frie.
        const biter = inn.value.split(/\s+/);
        if (biter.length > 1) return;
        const treff = Object.keys(KOMMANDOER).filter((k) => k.startsWith(biter[0].toLowerCase()));
        if (!treff.length) return;
        e.preventDefault();
        if (treff.length === 1) inn.value = treff[0] + " ";
        else okt.skriv(treff.map((t) => "<u>" + t + "</u>").join("  "));
      }
    });
    return okt;
  }

  /* -------------------------------------------------- felles rapport ---- */

  /**
   * /api/sjekk og /api/dmarc svarer med samme form: { rader, totalt, feil }.
   * Derfor kan én funksjon skrive begge ut.
   */
  async function skrivRapport(okt, url, kropp, tittel) {
    okt.laast = true;
    const venter = okt.skriv("<i>skanner …</i>");
    let data;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(kropp),
      });
      data = await r.json();
    } catch {
      venter.remove();
      okt.laast = false;
      return okt.skriv("fikk ikke svar fra serveren. Prøv igjen.", "kk-fail");
    }
    venter.remove();
    if (data.feil) { okt.laast = false; return okt.skriv(esc(data.feil), "kk-fail"); }

    if (tittel) okt.skriv("<b>" + esc(tittel) + "</b>");
    const bredde = Math.max(...data.rader.map((r) => r.name.length));
    for (const r of data.rader) {
      const prikker = ".".repeat(Math.max(2, bredde + 3 - r.name.length));
      okt.skriv(`${esc(r.name.toLowerCase())} ${prikker} ${esc(r.value)}`, KLASSE[r.status]);
      if (!redusert()) await sov(180);
    }
    const brudd = data.rader.filter((r) => r.status === "fail" || r.status === "warn").length;
    const usjekket = data.rader.filter((r) => r.status === "neutral").length;
    okt.skriv("");
    // «Alt bestått» er feil når noe ikke er sjekket. Verktøyet skal aldri påstå
    // mer enn det har målt – det er hele grunnen til at noen stoler på det.
    const sum = brudd
      ? `${brudd} å fikse`
      : usjekket
        ? `Ingen brudd, men ${usjekket} ikke sjekket`
        : "Alt bestått";
    okt.skriv(`${sum}. Samlet: ${data.totalt}/100.`, brudd ? "kk-warn" : usjekket ? "" : "kk-ok");
    okt.laast = false;
    return data;
  }

  /* ----------------------------------------------------- kommandoer ---- */

  const KOMMANDOER = {
    help: {
      tekst: "vis denne listen",
      async kjor(okt) {
        const bredde = Math.max(...Object.keys(KOMMANDOER).map((k) => k.length));
        okt.skriv("<i>Kommandoer. Tab fullfører, piltastene henter historikk.</i>");
        for (const [navn, k] of Object.entries(KOMMANDOER)) {
          if (k.skjult) continue;
          okt.skriv("  <u>" + navn + "</u>" + " ".repeat(bredde - navn.length + 2) + "<i>" + k.tekst + "</i>");
        }
      },
    },

    ls: {
      tekst: "list sidene",
      async kjor(okt) { okt.skriv(Object.keys(SIDER).map((k) => "  <u>" + k + "</u>").join("\n")); },
    },

    cat: {
      tekst: "les en side her",
      async kjor(okt, arg) {
        const href = SIDER[arg.toLowerCase()];
        if (!href) return okt.skriv("<i>cat: fant ikke «" + esc(arg) + "». Prøv <u>ls</u>.</i>");
        okt.skriv("<i>leser " + esc(href) + " …</i>");
        try {
          const r = await fetch(href, { headers: { Accept: "text/html" } });
          const doc = new DOMParser().parseFromString(await r.text(), "text/html");
          const h1 = doc.querySelector("h1")?.textContent?.trim() ?? "";
          const avsnitt = [...doc.querySelectorAll("main p")]
            .map((p) => p.textContent.trim()).filter((t) => t.length > 60).slice(0, 3);
          okt.skriv("<b>" + esc(h1) + "</b>");
          avsnitt.forEach((t) => okt.skriv("<i>" + esc(t) + "</i>"));
          okt.skriv("<i>hele siden: <u>open " + esc(arg) + "</u></i>");
        } catch { okt.skriv("<i>cat: klarte ikke å lese siden.</i>"); }
      },
    },

    open: {
      tekst: "gå til siden",
      async kjor(okt, arg) {
        const href = SIDER[arg.toLowerCase()];
        if (!href) return okt.skriv("<i>open: fant ikke «" + esc(arg) + "». Prøv <u>ls</u>.</i>");
        okt.skriv("<i>åpner " + esc(href) + " …</i>");
        location.href = href;
      },
    },

    sjekk: {
      tekst: "kjør nettsidesjekken her",
      async kjor(okt, arg) {
        if (!arg) return okt.skriv("<i>bruk: sjekk dinbedrift.no</i>");
        const data = await skrivRapport(okt, "/api/sjekk", { url: arg }, null);
        if (data) okt.skriv(`<i>hele rapporten: <u>/sjekk?url=${encodeURIComponent(arg)}</u></i>`);
      },
    },

    headere: {
      tekst: "bare sikkerhetsheaderne",
      async kjor(okt, arg) {
        if (!arg) return okt.skriv("<i>bruk: headere dinbedrift.no</i>");
        okt.laast = true;
        const venter = okt.skriv("<i>henter headere …</i>");
        try {
          const r = await fetch("/api/sjekk", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ url: arg }),
          });
          const data = await r.json();
          venter.remove();
          if (data.feil) return okt.skriv(esc(data.feil), "kk-fail");
          const rad = data.rader.find((x) => /sikkerhetsheadere/i.test(x.name));
          okt.skriv(esc(rad.value), KLASSE[rad.status]);
          okt.skriv("<i>" + esc(rad.note) + "</i>");
        } catch {
          venter.remove();
          okt.skriv("fikk ikke svar fra serveren.", "kk-fail");
        } finally { okt.laast = false; }
      },
    },

    dmarc: {
      tekst: "sjekk e-postoppsettet",
      async kjor(okt, arg) {
        if (!arg) return okt.skriv("<i>bruk: dmarc dinbedrift.no</i>");
        await skrivRapport(okt, "/api/dmarc", { domene: arg }, null);
      },
    },

    pris: {
      tekst: "hent prislisten",
      async kjor(okt) {
        okt.laast = true;
        const venter = okt.skriv("<i>henter prisene …</i>");
        try {
          // Prisene leses fra /priser, ikke skrevet inn her. Ett sted å endre.
          const r = await fetch("/priser", { headers: { Accept: "text/html" } });
          const doc = new DOMParser().parseFromString(await r.text(), "text/html");
          venter.remove();
          const kort = [...doc.querySelectorAll(".kk-price")];
          if (!kort.length) throw new Error("fant ingen prisekort");
          const rader = kort.map((k) => {
            const belop = k.querySelector(".kk-amount");
            // Prefikset («fra») og beløpet er egne elementer. textContent limer dem
            // sammen til «fra60 000 kr», så de hentes hver for seg.
            const prefiks = belop?.querySelector(".kk-prefix")?.textContent?.trim() ?? "";
            const tall = [...(belop?.childNodes ?? [])]
              .filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ");
            return {
              navn: k.querySelector("h3")?.textContent?.trim() ?? "",
              pris: (prefiks + " " + tall).replace(/\s+/g, " ").trim(),
            };
          });
          const bredde = Math.max(...rader.map((x) => x.navn.length));
          rader.forEach((x) =>
            okt.skriv(`${esc(x.navn)}${" ".repeat(bredde - x.navn.length + 2)}${esc(x.pris)}`));
          // Sto «alle priser eks. mva». Foretaket er ikke mva-registrert
          // (verifisert mot Enhetsregisteret, se src/data/firma.ts), og kan
          // derfor ikke fakturere mva – «eks. mva» lover et tillegg som aldri
          // kommer. Fila er statisk og kan ikke importere `mvaSetning` fra
          // src/data/priser.ts, så ordlyden speiles herfra. Endres `firma.mva`
          // til true, skal denne linjen rettes i samme omgang.
          okt.skriv("<i>prisene er endelige – foretaket er ikke mva-registrert. Hele listen: <u>open priser</u></i>");
        } catch {
          venter.remove();
          okt.skriv("<i>klarte ikke å hente prisene. <u>open priser</u></i>");
        } finally { okt.laast = false; }
      },
    },

    kontakt: {
      tekst: "book 20 minutter",
      async kjor(okt) { okt.skriv("<i>åpner kontaktsiden …</i>"); location.href = "/kontakt"; },
    },

    tema: {
      tekst: "bytt mørkt og lyst",
      async kjor(okt) {
        const lys = document.documentElement.dataset.theme === "light";
        document.documentElement.dataset.theme = lys ? "dark" : "light";
        try { localStorage.setItem("kk-tema", lys ? "dark" : "light"); } catch {}
        okt.skriv("<i>tema: " + (lys ? "mørkt" : "lyst") + "</i>");
      },
    },

    whoami: {
      tekst: "hvem du snakker med",
      async kjor(okt) {
        okt.skriv("<i>Du er en besøkende. Vi er KodeKonsulentene, Oslo.</i>");
        okt.skriv("<i>Svar innen 24 timer. <u>kontakt</u> for 20 minutter.</i>");
      },
    },

    clear: { tekst: "tøm skjermen", async kjor(okt) { okt.out.textContent = ""; } },

    exit: {
      tekst: "lukk terminalen",
      async kjor(okt) {
        if (okt.lukk) okt.lukk();
        else okt.skriv("<i>denne terminalen er siden. Prøv <u>open hjem</u>.</i>");
      },
    },

    sudo: {
      tekst: "", skjult: true,
      async kjor(okt, arg) {
        okt.skriv("<i>sudo: du har allerede alle rettigheter her. Det er din nettleser.</i>");
        if (arg) okt.skriv("<i>(og «" + esc(arg) + "» hadde uansett ikke hjulpet)</i>");
      },
    },

    rm: {
      tekst: "", skjult: true,
      async kjor(okt) {
        okt.skriv("<i>rm: nei. Du eier koden, men ikke akkurat denne kopien.</i>");
      },
    },

    nordlys: {
      tekst: "", skjult: true, laast: true,
      async kjor(okt) {
        // Eneste rene pynten på hele siden. Den ligger bak en tastesekvens,
        // så den forstyrrer ingen som ikke leter. Brandboken tillater teknisk
        // humor her og ingen andre steder.
        const b = ["▁▂▃▄▅▆▇█▇▆▅▄▃▂▁", "▁▂▃▅▇█▇▅▃▂▁▂▃▄▅", "▃▅▇█▇▆▄▃▂▁▂▄▆▇█"];
        for (const rad of b) {
          okt.skriv('<span style="color:var(--accent)">  ' + rad + "</span>");
          if (!redusert()) await sov(90);
        }
        okt.skriv("<i>Oslo, en gang i blant. Resten av året bygger vi nettsider.</i>");
      },
    },

    kk: {
      tekst: "", skjult: true,
      async kjor(okt) {
        okt.skriv("<b>KodeKonsulentene</b>");
        okt.skriv("<i>Nettsider og systemer for norske småbedrifter. Oslo.</i>");
        okt.skriv("<i>Sikkerhet, integrasjoner, apper. Fast pris.</i>");
        okt.skriv("<i>Org.nr. står i footeren, slik loven krever.</i>");
      },
    },
  };

  /* ------------------------------------------------------------ kjør ---- */

  async function kjor(okt, raa) {
    const linje = raa.trim();
    okt.skriv('<span class="kkterm__ps">$</span> <b>' + esc(linje) + "</b>");
    if (!linje) return;
    okt.historikk.unshift(linje); okt.hi = -1;

    const [cmd, ...rest] = linje.split(/\s+/);
    const arg = rest.join(" ");
    const navn = cmd.toLowerCase();

    const alias = { hjelp: "help", "?": "help", dir: "ls", cd: "open", q: "exit", book: "kontakt", priser: "pris" };
    const k = KOMMANDOER[navn] ?? KOMMANDOER[alias[navn]];
    if (!k || (k.laast && !laastOpp.has(navn))) {
      return okt.skriv("<i>" + esc(cmd) + ": ukjent kommando. <u>help</u> viser alle.</i>");
    }
    try { await k.kjor(okt, arg); }
    catch { okt.skriv("noe gikk galt. Prøv igjen.", "kk-fail"); }
  }

  /* ----------------------------------------------------- modalflate ---- */

  let modal = null;
  let sisteFokus = null;

  function apneModal() {
    if (modal) return;
    sisteFokus = document.activeElement;
    const d = document.createElement("div");
    d.className = "kkterm-backdrop";
    d.innerHTML =
      '<div class="kkterm" role="dialog" aria-modal="true" aria-label="Terminalmodus">' +
      '<div class="kkterm__bar"><span>~/kodekonsulentene</span><span>Esc lukker</span></div>' +
      '<div class="kkterm__out" role="log" aria-live="polite"></div>' +
      '<div class="kkterm__line"><span class="kkterm__ps" aria-hidden="true">$</span>' +
      '<label class="visually-hidden" for="kkterm-in">Kommando</label>' +
      '<input class="kkterm__in" id="kkterm-in" autocomplete="off" spellcheck="false" ' +
      'autocapitalize="off" autocorrect="off" /></div></div>';
    document.body.appendChild(d);

    const okt = lagOkt(d.querySelector(".kkterm__out"), d.querySelector(".kkterm__in"), lukkModal);
    modal = { d, okt };
    d.addEventListener("mousedown", (e) => { if (e.target === d) lukkModal(); });
    okt.skriv("<i>KodeKonsulentene – terminalmodus. <u>help</u> for kommandoer, Esc for å lukke.</i>");
    okt.inn.focus();
    document.documentElement.style.overflow = "hidden";
  }

  function lukkModal() {
    if (!modal) return;
    modal.d.remove(); modal = null;
    document.documentElement.style.overflow = "";
    if (sisteFokus instanceof HTMLElement) sisteFokus.focus();
  }

  /* --------------------------------------------------------- sekvens ---- */

  // En skjult tastesekvens låser opp én kommando. Den gjør ingenting med siden
  // for den som ikke leter, og den er ren tekst – ingen a11y-konsekvens.
  const laastOpp = new Set();
  const SEKVENS = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let steg = 0;

  addEventListener("keydown", (e) => {
    if (modal && e.key === "Escape") { e.preventDefault(); lukkModal(); return; }

    // Ikke tell sekvensen mens noen fyller ut et skjema – piltaster og bokstaver
    // hører hjemme i feltet, ikke i en snarvei som åpner en modal over dem.
    const iFelt = e.target instanceof HTMLElement &&
      (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable);
    const forventet = iFelt ? null : SEKVENS[steg];
    if (iFelt) steg = 0;
    if (forventet && (e.key === forventet || e.key.toLowerCase() === forventet)) {
      if (++steg === SEKVENS.length) {
        steg = 0;
        laastOpp.add("nordlys");
        apneModal();
        modal?.okt.skriv("<i>Du fant den. <u>nordlys</u> er låst opp.</i>");
      }
    } else {
      steg = e.key === SEKVENS[0] ? 1 : 0;
    }

    if (modal) return;
    const t = e.target;
    if (t instanceof HTMLElement &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.key === "~" || e.key === "¨") { e.preventDefault(); apneModal(); }
    else if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); apneModal(); }
  });

  /* ---------------------------------------------------- innfelt flate ---- */

  // På /404 ER terminalen siden. Da monteres den i dokumentet i stedet for i en
  // modal, og «exit» gir ingen mening – derfor ingen lukkefunksjon.
  const vert = document.querySelector("[data-kkterm-innfelt]");
  if (vert) {
    const out = vert.querySelector(".kkterm__out");
    const inn = vert.querySelector(".kkterm__in");
    if (out && inn) {
      const okt = lagOkt(out, inn, null);
      // Server-side står en plassholder, slik at de uten JavaScript ser en lesbar
      // feilmelding. Vi kjenner den ekte stien, så plassholderen byttes ut – ellers
      // står den samme feilen to ganger.
      out.textContent = "";
      okt.skriv('<span class="kkterm__ps">$</span> <b>cat ' + esc(location.pathname) + "</b>");
      okt.skriv("cat: " + esc(location.pathname) + ": finnes ikke", "kk-fail");
      okt.skriv("");
      okt.skriv("<i>Men terminalen virker. <u>help</u> viser hva den kan,</i>");
      okt.skriv("<i>eller <u>sjekk dinbedrift.no</u> for å prøve verktøyet.</i>");
      inn.disabled = false;
      inn.setAttribute("placeholder", "help");
    }
  }

  /* ------------------------------------------------------------ hint ---- */

  // Hintet vises én gang per besøk, bare der tastatur er sannsynlig.
  if (!matchMedia("(pointer: coarse)").matches) {
    addEventListener("DOMContentLoaded", () => {
      if (document.querySelector("[data-kkterm-innfelt]")) return; // 404 sier det selv
      const hint = document.createElement("p");
      hint.className = "kkterm__hint";
      hint.textContent = "Trykk ~ for terminal";
      document.body.appendChild(hint);
      setTimeout(() => hint.remove(), 9000);
    });
  }
})();
