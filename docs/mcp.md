# MCP-servere i arbeidsflyten

`.mcp.json` i repoet kobler Claude Code mot tjenestene byrået faktisk bruker.
Koblingene er prosjekt-scope, slik at hver kunde kan ha sitt eget sett.

> **Verifiser før bruk.** Claude-økosystemet endrer seg raskt. Adressene under var
> riktige høsten 2026, men sjekk i Claude Directory (claude.com/connectors) før du
> bygger en arbeidsflyt på dem. Flere av dem krever at du logger inn første gang.

| Server | Hva den brukes til |
|---|---|
| **Figma** | Design-til-kode. `get_design_context`, variabler og Code Connect. Også flytdiagrammer i FigJam til kundeworkshops. |
| **Supabase** | SQL, skjemaendringer, migreringer, edge functions og sikkerhetsrådgiveren. Kjør rådgiveren før hver lansering. |
| **Stripe** | Abonnementer, fakturaer og MRR for kunder på abonnementsavtale. |
| **GitHub** | Issues, pull requests og repo-administrasjon. |
| **Sentry** | Feilovervåkning på kundesider med driftsavtale. |

## Legge dem til

```bash
claude mcp add --transport http figma    https://mcp.figma.com/mcp
claude mcp add --transport http supabase https://mcp.supabase.com/mcp
claude mcp add --transport http stripe   https://mcp.stripe.com
claude mcp add --transport http sentry   https://mcp.sentry.dev/mcp
```

GitHub-serveren settes opp via Claude Directory fordi den krever OAuth.

## Arbeidsflyten de inngår i

1. **Lead inn** → Gmail og Calendar oppsummerer henvendelsen og foreslår møtetid.
2. **Etter møtet** → `kodekonsulentene-tilbud`-skillen lager tilbudet fra møtenotatene.
3. **Design** → Figma MCP + `kodekonsulentene-design` bygger komponentene.
4. **Backend** → Supabase MCP lager tabeller, RLS-regler og migreringer.
5. **Deploy** → `fly deploy`. Logger med `fly logs`.
6. **Faktura** → regnskapsprogram. Stripe for abonnementskunder.
7. **Oppfølging** → månedsrapport med ytelse, oppetid og endringer. Det er en del av abonnementsverdien, ikke en gratis tjeneste.

## Sikkerhet

En MCP-server får tilgang til det du gir den. Bruk prosjekt-scope per kunde, ikke
globale tilganger, og gi aldri en server bredere rettigheter enn oppgaven krever.
Se også `.claude/skills/kodekonsulentene-sikkerhetssjekk/SKILL.md`.
