/// <reference types="astro/client" />

/** Hemmeligheter som settes med `fly secrets set` i drift, og i .env lokalt. */
interface Env {
  /** PageSpeed Insights. Uten den får ytelsesraden status «neutral». */
  PAGESPEED_API_KEY?: string;
  /** Resend – sender rapport og skjemasvar på e-post. */
  RESEND_API_KEY?: string;
  RAPPORT_FRA?: string;
  RAPPORT_KOPI?: string;
}

declare namespace App {
  interface Locals {}
}
