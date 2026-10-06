/**
 * IndexNow: ber Bing, DuckDuckGo og Yandex hente sitemap-URLene med en gang.
 *
 * Google stoetter IKKE IndexNow og deprekerte sitemap-ping i 2023 – der finnes
 * ingen programmatisk vei inn, bare Search Console. Men Bing og DuckDuckGo er
 * ekte trafikk, og dette koster ingenting.
 *
 * Noekkelen ligger i public/15145d4f5f57e4c8a5b03fde6bc0e55d.txt og maa svare 200 foer innsending,
 * ellers avviser tjenesten hele settet.
 *
 *   node .skudd/seo-indexnow.mjs
 */
const NOKKEL = "15145d4f5f57e4c8a5b03fde6bc0e55d";
const VERT = "kodekonsulentene.no";

const xml = await (await fetch(`https://${VERT}/sitemap-0.xml`)).text();
const urler = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const sjekk = await fetch(`https://${VERT}/${NOKKEL}.txt`);
if (!sjekk.ok) {
  console.error(`  noekkelfila svarer ${sjekk.status} – deploy foerst, ellers avvises innsendingen`);
  process.exit(1);
}

const svar = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: VERT, key: NOKKEL, keyLocation: `https://${VERT}/${NOKKEL}.txt`, urlList: urler }),
});
console.log(`  sendte ${urler.length} URL-er – HTTP ${svar.status} ${svar.status === 200 ? "(mottatt)" : await svar.text()}`);
