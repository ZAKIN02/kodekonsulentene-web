/**
 * Levende hero-terminal.
 *
 * Skriver du inn en adresse i hero-feltet, kjører sjekken her og nå i stedet for
 * å sende deg videre. Det er hele poenget med siden: den gjør det den selger,
 * mens du ser på. Uten JavaScript går skjemaet som før til /sjekk.
 */
(() => {
  "use strict";
  const term = document.querySelector(".kk-term[data-live]");
  const pre = term?.querySelector("pre");
  const skjema = document.querySelector("#url")?.closest("form");
  const felt = document.querySelector("#url");
  if (!term || !pre || !skjema || !felt) return;

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const KLASSE = { ok: "kk-ok", warn: "kk-warn", fail: "kk-fail", neutral: "kk-out" };
  const sov = (ms) => new Promise((r) => setTimeout(r, ms));
  const redusert = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let original = null;

  function nullstill() {
    if (original === null) original = pre.innerHTML;
    pre.innerHTML = "";
    term.dataset.gaar = "";
  }

  function linje(html, klasse) {
    const el = document.createElement("span");
    el.className = "kk-term-linje";
    el.dataset.synlig = "";
    el.innerHTML = `<span class="${klasse ?? "kk-out"}">${html}</span>\n`;
    pre.appendChild(el);
    pre.scrollTop = pre.scrollHeight;
    return el;
  }

  async function skrivKommando(tekst) {
    const el = document.createElement("span");
    el.className = "kk-term-linje";
    el.dataset.synlig = "";
    el.innerHTML = '<span class="kk-ps">$ </span><span class="kk-cmd"></span>';
    pre.appendChild(el);
    const mål = el.querySelector(".kk-cmd");
    if (redusert) { mål.textContent = tekst; return; }
    for (const tegn of tekst) { mål.textContent += tegn; await sov(22); }
  }

  async function kjor(url) {
    nullstill();
    await skrivKommando(`sjekk ${url}`);
    await sov(redusert ? 0 : 220);
    const venter = linje("skanner …", "kk-out");

    let data;
    try {
      const svar = await fetch("/api/sjekk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      data = await svar.json();
    } catch {
      venter.remove();
      linje("fikk ikke svar fra serveren. Prøv igjen.", "kk-fail");
      return;
    }
    venter.remove();

    if (data.feil) {
      linje(esc(data.feil), "kk-fail");
      return;
    }

    const bredde = Math.max(...data.rader.map((r) => r.name.length));
    for (const r of data.rader) {
      const prikker = ".".repeat(Math.max(2, bredde + 3 - r.name.length));
      linje(`${esc(r.name.toLowerCase())} ${prikker} ${esc(r.value)}`, KLASSE[r.status]);
      if (!redusert) await sov(260);
    }
    await sov(redusert ? 0 : 200);
    linje("", "kk-out");
    const brudd = data.rader.filter((r) => r.status === "fail" || r.status === "warn").length;
    linje(
      brudd
        ? `${brudd} ${brudd === 1 ? "ting" : "ting"} å fikse. Samlet: ${data.totalt}/100.`
        : `Alt bestått. Samlet: ${data.totalt}/100.`,
      brudd ? "kk-warn" : "kk-ok",
    );
    const lenke = linje(
      `<a class="kk-link" href="/sjekk?url=${encodeURIComponent(url)}">hele rapporten →</a>`,
      "kk-out",
    );
    lenke.querySelector("a")?.setAttribute("style", "color: var(--accent)");
    delete term.dataset.gaar;
  }

  skjema.addEventListener("submit", (e) => {
    const url = felt.value.trim();
    if (!url) return;
    e.preventDefault();
    // Terminalen er dekorasjon for skjermlesere; resultatet skal også annonseres.
    term.setAttribute("aria-label", `Sjekker ${url}`);
    void kjor(url);
  });
})();
