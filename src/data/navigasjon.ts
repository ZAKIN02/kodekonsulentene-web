export interface NavLenke { label: string; href: string }

export const hovedmeny: NavLenke[] = [
  { label: "Nettsider", href: "/nettsider" },
  { label: "Systemer", href: "/systemer" },
  { label: "Apper og AI", href: "/apper-og-ai" },
  { label: "Sikkerhet", href: "/sikkerhet" },
  { label: "Verktøy", href: "/verktoy" },
  { label: "Priser", href: "/priser" },
  { label: "Om", href: "/om" },
];

/**
 * Footeren står på hver side, så en lenke herfra er den eneste måten en side kan
 * bli nådd fra hele nettstedet uten å ligge i hovedmenyen.
 *
 * HVORFOR BRANSJESIDENE OG ARTIKLENE KOM INN HER. Målt over bygget HTML hadde
 * `/bransjer/handverkere` NULL innlenker fra en indekserbar side – den eneste
 * lenken dit kom fra `/lab/svg`, som er noindex og stengt i robots.txt. Siden
 * fantes altså i sitemap og ingen andre steder. De tre artiklene hadde én
 * innlenke hver, fra hverandre.
 *
 * Google finner sider ved å følge lenker. En side som bare står i sitemap, ber om
 * å bli indeksert uten å vise at den hører til noe.
 */
export const footerLenker: NavLenke[] = [
  { label: "Priser", href: "/priser" },
  { label: "Caser", href: "/caser" },
  { label: "Artikler", href: "/artikler" },
  { label: "Historie", href: "/historie" },
  { label: "Sjekk nettsiden din", href: "/sjekk" },
  { label: "Gratisverktøy", href: "/verktoy" },
  // De to verktøyene som ikke lenkes fra noen tjenesteside, bare fra /verktoy.
  // Begge svarer på en helt egen søkeintensjon – «hva koster en nettside» og
  // «kan noen sende e-post i mitt navn» – og de lå med én innlenke hver.
  { label: "Priskalkulator", href: "/verktoy/priskalkulator" },
  { label: "E-postsjekk (SPF, DMARC)", href: "/verktoy/dmarc" },
  { label: "For håndverkere", href: "/bransjer/handverkere" },
  { label: "For klinikker", href: "/bransjer/klinikker" },
  { label: "Håndbok", href: "/handbok" },
  { label: "Driftsstatus", href: "/status" },
  // Synlige, litt rare innganger. Epic.net har «Puzzle», «Rabbit» og «Castle»
  // stående i footeren – det er hele hemmeligheten bak følelsen av dybde. En
  // skjult funksjon ingen vet om, finnes ikke.
  { label: "Terminal (~)", href: "/terminal" },
  { label: "Personvern", href: "/personvern" },
  { label: "Salgsvilkår", href: "/vilkar" },
];
