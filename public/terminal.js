/**
 * Terminalmodus – KodeKonsulentenes signaturdetalj.
 *
 * Progressiv forbedring: alt den gjør finnes også som vanlige lenker, og siden
 * fungerer uten denne filen. Den lastes `defer` og rører ingenting før en tast trykkes.
 * Reglene fra brandboken: markøren får blinke her, fordi terminalen *er* innholdet.
 */
(() => {
  "use strict";
  if (matchMedia("(pointer: coarse)").matches) return; // ikke på touch – tastatur er premisset

  const SIDER = {
    hjem: "/", nettsider: "/nettsider", systemer: "/systemer", apper: "/apper-og-ai",
    sikkerhet: "/sikkerhet", priser: "/priser", caser: "/caser", om: "/om",
    kontakt: "/kontakt", sjekk: "/sjekk", handbok: "/handbok", status: "/status",
    personvern: "/personvern", vilkar: "/vilkar",
  };

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  let el = null;
  let sisteFokus = null;
  const historikk = [];
  let hi = -1;

  function bygg() {
    const d = document.createElement("div");
    d.className = "kkterm-backdrop";
    d.innerHTML =
      '<div class="kkterm" role="dialog" aria-modal="true" aria-label="Terminalmodus">' +
      '<div class="kkterm__bar"><span>~/kodekonsulentene</span><span>Esc lukker</span></div>' +
      '<div class="kkterm__out" id="kkterm-out" role="log" aria-live="polite"></div>' +
      '<div class="kkterm__line"><span class="kkterm__ps" aria-hidden="true">$</span>' +
      '<label class="visually-hidden" for="kkterm-in">Kommando</label>' +
      '<input class="kkterm__in" id="kkterm-in" autocomplete="off" spellcheck="false" /></div>' +
      "</div>";
    document.body.appendChild(d);
    const out = d.querySelector("#kkterm-out");
    const inn = d.querySelector("#kkterm-in");

    d.addEventListener("mousedown", (e) => { if (e.target === d) lukk(); });
    inn.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { kjor(inn.value); inn.value = ""; }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (hi < historikk.length - 1) inn.value = historikk[++hi]; }
      else if (e.key === "ArrowDown") { e.preventDefault(); inn.value = hi > 0 ? historikk[--hi] : ((hi = -1), ""); }
    });
    return { d, out, inn };
  }

  function skriv(html) {
    el.out.insertAdjacentHTML("beforeend", html + "\n");
    el.out.scrollTop = el.out.scrollHeight;
  }

  const HJELP = [
    "<i>Kommandoer</i>",
    "  <u>ls</u>                 list sidene",
    "  <u>cat</u> &lt;side&gt;        les en side her",
    "  <u>open</u> &lt;side&gt;       gå til siden",
    "  <u>sjekk</u> &lt;url&gt;       kjør nettsidesjekken",
    "  <u>book</u>               book 20 minutter",
    "  <u>tema</u>               bytt mørkt/lyst",
    "  <u>clear</u>              tøm skjermen",
    "  <u>exit</u>               lukk (Esc)",
  ].join("\n");

  async function kjor(raa) {
    const linje = raa.trim();
    skriv('<b><span style="color:var(--accent)">$</span> ' + esc(linje) + "</b>");
    if (!linje) return;
    historikk.unshift(linje); hi = -1;

    const [cmd, ...rest] = linje.split(/\s+/);
    const arg = rest.join(" ");

    switch (cmd.toLowerCase()) {
      case "help": case "hjelp": case "?":
        skriv(HJELP); break;

      case "ls": case "dir":
        skriv(Object.keys(SIDER).map((k) => "  <u>" + k + "</u>").join("\n")); break;

      case "cat": {
        const href = SIDER[arg.toLowerCase()];
        if (!href) { skriv("<i>cat: fant ikke «" + esc(arg) + "». Prøv <u>ls</u>.</i>"); break; }
        skriv("<i>leser " + esc(href) + " …</i>");
        try {
          const r = await fetch(href, { headers: { Accept: "text/html" } });
          const doc = new DOMParser().parseFromString(await r.text(), "text/html");
          const h1 = doc.querySelector("h1")?.textContent?.trim() ?? "";
          const avsnitt = [...doc.querySelectorAll("main p")]
            .map((p) => p.textContent.trim()).filter((t) => t.length > 60).slice(0, 4);
          skriv("<b>" + esc(h1) + "</b>\n" + avsnitt.map((t) => "<i>" + esc(t) + "</i>").join("\n\n"));
          skriv("\n<i>hele siden: <u>open " + esc(arg) + "</u></i>");
        } catch { skriv("<i>cat: klarte ikke å lese siden.</i>"); }
        break;
      }

      case "open": case "cd": {
        const href = SIDER[arg.toLowerCase()];
        if (!href) { skriv("<i>open: fant ikke «" + esc(arg) + "». Prøv <u>ls</u>.</i>"); break; }
        skriv("<i>åpner " + esc(href) + " …</i>");
        location.href = href; break;
      }

      case "sjekk": {
        if (!arg) { skriv("<i>bruk: sjekk dinbedrift.no</i>"); break; }
        skriv("<i>åpner sjekken for " + esc(arg) + " …</i>");
        location.href = "/sjekk?url=" + encodeURIComponent(arg); break;
      }

      case "book":
        skriv("<i>åpner kalenderen …</i>");
        location.href = "/kontakt"; break;

      case "tema": {
        const lys = document.documentElement.dataset.theme === "light";
        document.documentElement.dataset.theme = lys ? "dark" : "light";
        try { localStorage.setItem("kk-tema", lys ? "dark" : "light"); } catch {}
        skriv("<i>tema: " + (lys ? "mørkt" : "lyst") + "</i>"); break;
      }

      case "clear": el.out.innerHTML = ""; break;
      case "exit": case "q": lukk(); break;

      case "whoami":
        skriv("<i>Du er en besøkende. Jeg er én utvikler i Oslo. Vi kan snakke: <u>book</u></i>"); break;

      default:
        skriv("<i>" + esc(cmd) + ": ukjent kommando. <u>help</u> viser alle.</i>");
    }
  }

  function apne(forhandsutfylt) {
    if (el) return;
    sisteFokus = document.activeElement;
    el = bygg();
    skriv("<i>KodeKonsulentene – terminalmodus. <u>help</u> for kommandoer, Esc for å lukke.</i>");
    if (forhandsutfylt) el.inn.value = forhandsutfylt;
    el.inn.focus();
    document.documentElement.style.overflow = "hidden";
  }

  function lukk() {
    if (!el) return;
    el.d.remove(); el = null;
    document.documentElement.style.overflow = "";
    if (sisteFokus instanceof HTMLElement) sisteFokus.focus();
  }

  addEventListener("keydown", (e) => {
    if (el && e.key === "Escape") { e.preventDefault(); lukk(); return; }
    if (el) return;
    const t = e.target;
    const skriver = t instanceof HTMLElement &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (skriver) return;
    if (e.key === "~" || e.key === "¨") { e.preventDefault(); apne(); }
    else if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); apne(); }
  });

  // Hintet dukker opp én gang per besøk, nede til høyre, bare på pekerenheter med tastatur.
  addEventListener("DOMContentLoaded", () => {
    const hint = document.createElement("p");
    hint.className = "kkterm__hint";
    hint.textContent = "Trykk ~ for terminal";
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 9000);
  });
})();
