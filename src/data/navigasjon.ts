export interface NavLenke { label: string; href: string }

export const hovedmeny: NavLenke[] = [
  { label: "Nettsider", href: "/nettsider" },
  { label: "Systemer", href: "/systemer" },
  { label: "Apper og AI", href: "/apper-og-ai" },
  { label: "Sikkerhet", href: "/sikkerhet" },
  { label: "Priser", href: "/priser" },
  { label: "Om", href: "/om" },
];

export const footerLenker: NavLenke[] = [
  { label: "Priser", href: "/priser" },
  { label: "Caser", href: "/caser" },
  { label: "Sjekk nettsiden din", href: "/sjekk" },
  { label: "Håndbok", href: "/handbok" },
  { label: "Driftsstatus", href: "/status" },
  { label: "Personvern", href: "/personvern" },
  { label: "Salgsvilkår", href: "/vilkar" },
];
