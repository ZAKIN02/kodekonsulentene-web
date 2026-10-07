/// <reference types="astro/client" />

/** Hemmeligheter som settes med `fly secrets set` i drift, og i .env lokalt. */
interface Env {
  /** PageSpeed Insights. Uten den får ytelsesraden status «neutral». */
  PAGESPEED_API_KEY?: string;
  /** Resend – sender rapport og skjemasvar på e-post. */
  RESEND_API_KEY?: string;
  RAPPORT_FRA?: string;
  /** Skannertjenesten med ekte nettleser (egen Fly-app). */
  SKANNER_URL?: string;
  SKANNER_NOKKEL?: string;
  RAPPORT_KOPI?: string;
  /**
   * Claude – AI-omskriveren på /apper-og-ai. Uten den svarer /api/ai-tekst med
   * at funksjonen ikke er skrudd på, og sender ingenting noe sted.
   * Settes med: fly secrets set ANTHROPIC_API_KEY=sk-ant-… -a kodekonsulentene
   */
  ANTHROPIC_API_KEY?: string;
  /** Overstyrer modellen. Standard står i src/lib/ai-tekst.ts (claude-haiku-4-5). */
  CLAUDE_MODELL?: string;
  /** Kall per IP per tidsvindu. Standard 3. */
  AI_PER_IP?: string;
  /** Kall per IP per døgn. Standard 8. */
  AI_IP_DOGN?: string;
  /** Hardt tak for hele tjenesten per døgn – beløpsgrensen. Standard 50. */
  AI_DOGNTAK?: string;
}

declare namespace App {
  interface Locals {}
}
