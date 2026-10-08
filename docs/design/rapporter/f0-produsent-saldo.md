# f0-produsent-saldo: saldosjekk og modellkontroll via API-veien

Dato: 8. oktober 2026. Ingen generering. Kreditter brukt: 0.

Det som ble kjørt mot API-et: `GET /models` (liste), noen `GET`-prøver på mulige saldoendepunkt, og `POST /estimate/<modell>` (prisanslag, ikke generering). Nøkkelverdiene er ikke skrevet noe sted.

## Kort svar

1. Nøkkelfila finnes og lastes. Autentisering mot `/models` og `/estimate` gir 200.
2. `scripts/scene.mjs` dekker ikke del 9 slik den står. Den bruker Qwen Image 3 og Kling 3.0 4K, ikke Nano Banana og ikke `pro`/`std`. Den må tilpasses, eller produsenten må bruke et eget skript (forslag nederst).
3. Saldo kan ikke leses maskinelt. Eier leser den i console.higgsfield.ai.
4. API-et lister 85 modeller. `nano_banana_2`, `gpt_image_2` og `kling3_0` (under de navnene) finnes ikke. Kling 3.0 finnes med egne endepunkt per nivå. Nano Banana finnes ikke i det hele tatt.
5. Avvik fra tabellen i del 9 står i egen tabell under. De viktigste: ingen Nano Banana, ingen `--mode`-flagg (nivå er egne endepunkt), ingen `aspect_ratio`, `--sound`-verdier eller oppløsning på video, og "Wan 3.0 Prime" finnes.

## 1. Nøkkelfila

- Sti: `~/.config/kodekonsulentene/higgsfield.env`, rettigheter `-rw-------`, endret 6. okt.
- Innhold: to variabler, `HIGGSFIELD_API_KEY` og `HIGGSFIELD_API_SECRET`. Begge har verdi.
- Lasting: `set -a; . fila; set +a` virker. `Authorization: Key <id>:<hemmelighet>` godtas (200 på `/models` og `/estimate/...`).
- `scripts/scene.mjs` leser `HF_CREDENTIALS` eller de to variablene over fra miljøet. Den leser ikke fila selv. Den må kalles med fila lastet inn i miljøet først.
- Andre filer i mappa (`cal.env`, `godaddy.env`, `resend.env`) er ikke lest.

## 2. Hvordan `scripts/scene.mjs` kaller API-et

| Punkt | Slik skriptet gjør det |
|---|---|
| Klient | `@higgsfield/client` v0.2.6, `higgsfield.subscribe(slug, { input, withPolling: true })`. `maxPollTime` 30 min, `pollInterval` 5 s. |
| Bilde, grunnbilde | `alibaba/qwen-image-3/text-to-image`, `aspect_ratio: "16:9"`, `resolution: "2k"`, `negative_prompt`. |
| Bilde, redigering | `alibaba/qwen-image-3/edit`, `image_urls: [kilde]`, `resolution: "2k"`, `aspect_ratio: "16:9"`. |
| Video | `kling-video/v3.0/4k/image-to-video`, `image_url`, `last_image_url`, `duration` (standard 8), `sound: "off"`, `cfg_scale`. Ingen `aspect_ratio`, ingen `mode`. |
| Opplasting av lokale bilder | `POST /files/generate-upload-url`, så `PUT` til den signerte adressen. SDK-ens egne opplastinger gir 403 med denne nøkkelen (se kommentar i skriptet). |
| Nedlasting | Videoen hentes med `curl` til `.skudd/scene-tmp/<id>-4k.mp4` og kopieres til `assets/mastere/<id>-master.mp4`. Bilder lastes IKKE ned: bare URL-en lagres i `.skudd/scene-tmp/<id>-*.url`. |
| Videre | ffmpeg lager 1280/1920/2560-varianter og poster. Lisenslogg skrives til `assets/lisenser/<id>.md`, ikke `assets/LICENSES.md`. |
| Promptkilde | `assets/prompter/*.json` og `assets/prompter/stilkort.txt`, ikke `assets/higgsfield/prompter/*.txt`. |

Dekning av behovene i del 9:

| Behov | Dekket? |
|---|---|
| Bilder i 2k | Ja, via Qwen Image 3 (`resolution: "2k"`). Nano Banana finnes ikke i API-et. Faktisk pikselstørrelse for 16:9 i 2k er ikke dokumentert (kun 1536 x 1536 for kvadrat). Må måles. |
| Bilde A (stilkort + prompt) | Ja, men skriptet bygger prompt fra JSON-feltene, ikke fra `.txt`-filene i del 9. |
| Bilde B/C som redigering | Ja, `qwen-image-3/edit` med 1 til 3 referansebilder. Skriptet kjeder allerede B fra A. |
| Start- og sluttbilde | Ja, `image_url` og `last_image_url`. |
| `--mode pro` / `std` | Nei. Skriptet bruker bare 4K-endepunktet. `pro` og `std` er egne endepunkt (`.../v3.0/pro/...`, `.../v3.0/std/...`), og slugen er hardkodet. |
| 9:16 og 16:9 | Bilder: 16:9 er hardkodet, 9:16 støttes av Qwen. Video: ingen `aspect_ratio`-felt, formatet følger startbildet. |
| Lyd av | Ja, `sound: "off"`. |
| Nedlasting av bilder | Nei, bare URL lagres. URL-ene er midlertidige (minst sju dager). |
| Mål med ffprobe / 1080p-kontroll | Bare i `lag-scene.sh`, ikke i `scene.mjs`. |

Konklusjon: rørledningen er et godt grunnlag (opplasting, polling, mellomlagring), men for del 9 trengs en variant som tar modellslug, nivå og promptfiler som argument, laster ned alle resultater til `assets/higgsfield/bilder/` og `raa/`, og måler med ffprobe. Dette er ikke gjort her (utenfor eierskapet i dette oppdraget).

## 3. Saldo via API

Ikke lesbar. Prøvd med GET og gyldig nøkkel:

| Sti | Svar |
|---|---|
| `/credits`, `/user/credits`, `/v1/credits`, `/account`, `/me`, `/user`, `/balance`, `/billing/balance` | 405 `{"detail":"Method Not Allowed"}` |
| `/models/<slug>` | 405 |
| `/models` | 200 (modelliste, uten saldo) |

Den offentlige dokumentasjonen (`docs.higgsfield.ai/docs/llms.txt`, billing-siden, OpenAPI-fila) beskriver ikke noe saldoendepunkt. Det som finnes: `POST /estimate/<slug>` gir prisanslag, og `403` ved innsending betyr "insufficient credits".

**Eier må lese saldoen i console.higgsfield.ai.** Saldo før/etter kan derfor ikke måles av produsenten. Som erstatning: bruk `estimate` før hver generering, og før egen sum av anslagene i loggen. Be eier lese av saldoen før og etter hver bunke.

## 4. Modeller kontoen har (`GET /models`, 85 stk.)

Listen er kontoens synlige katalog. Den sier ikke at modellene er betalt tilgjengelige utover det. `base_credits` i svaret er 0 for nesten alle og kan ikke brukes. `input_schema` er `null`. Parametere hentes fra docs.higgsfield.ai.

Relevante for oss:

- Bilde: `alibaba/qwen-image-3/text-to-image`, `alibaba/qwen-image-3/edit`, `ideogram/v4.0` (generering og redigering), `recraft/v4.1/...` (kun tekst til bilde), `xai/grok-imagine-image-2.0` (generering og redigering), `z-image/turbo`, `higgsfield-ai/soul/...`.
- Kling 3.0 bilde til video: `kling-video/v3.0/std/image-to-video`, `.../pro/image-to-video`, `.../4k/image-to-video`, `kling-video/v3.0-turbo/image-to-video`. Også `kling-video/o3/first-last-frame` og `omni/first-last-frame`.
- Andre video: `wan/v2.7/image-to-video`, `wan/v2.6/...`, `alibaba/wan-3.0/...` og `wan-3.0-prime/...`, `bytedance/seedance-2.0` og `2.5`, `minimax/h3` og `hailuo-2.3`, `lightricks/ltx-2.5`, `pixverse/v6`, `alibaba/happy-horse`, `xai/grok-imagine-video`.
- Finnes IKKE: Nano Banana (noen versjon) og GPT Image 2.

Prisanslag (`POST /estimate`, parametere: prompt, 6 s, sound off; faktisk pris kan avvike):

| Endepunkt | Kreditter | USD | Merknad |
|---|---|---|---|
| `kling-video/v3.0/std/image-to-video` | 4,032 | 0,252 | svaret oppgir 50 % rabatt |
| `kling-video/v3.0/pro/image-to-video` | 5,376 | 0,336 | svaret oppgir 50 % rabatt |
| `kling-video/v3.0/4k/image-to-video` | 20,160 | 1,260 | svaret oppgir 50 % rabatt |
| `alibaba/qwen-image-3/edit` | 1,200 | 0,075 | uten rabatt |

Dokumentasjonen oppgir for Pro 0,21 USD per sekund (6 s = 1,26 USD) før rabatt. Estimatene her er altså langt under briefens anslag (ca. 25 til 30 kreditter per 6 s klipp). Rabatten kan utløpe (`discount_expires_at` var `null` på Pro-siden). Anslagene er ikke verifisert mot faktisk trekk.

## 5. Avvik fra tabellen i del 9

| Del 9 sier | Virkeligheten via API |
|---|---|
| Vei: CLI anbefalt, API "ikke nødvendig" | Eier har valgt API. `higgsfield account`, `model list`, `model get` og `generate create` finnes ikke som kommandoer her. Erstatninger: `GET /models`, `POST /estimate`, `subscribe(slug, input)`, saldo i konsollen. |
| Nano Banana Pro, `nano_banana_2` | Finnes ikke i API-katalogen. Reserve `gpt_image_2` finnes heller ikke. Tilgjengelig tilsvarende: Qwen Image 3 (generering + redigering, 1k/2k, 1 til 3 referanser). Ideogram 4.0 og Grok Imagine Image 2.0 kan også redigere. Dette er et valg for dirigent/eier: bildestilen vil endre seg, og promptene i del 9 er skrevet for Nano Banana. |
| `--resolution 1k/2k/4k` for bilde | Qwen: bare `1k` og `2k`. Ingen `4k`. 16:9 i 2k: pikselmål ukjent, må måles. |
| `--image` 0 til 14 referanser | Qwen edit: 1 til 3 URL-er, påkrevd. Lokale filer lastes ikke opp automatisk: må via `/files/generate-upload-url`. |
| `kling3_0` med `--mode std/pro/4k` | Tre separate endepunkt. Én modellslug per nivå. |
| `--start-image`, `--end-image` | `image_url` og `last_image_url`. Må være offentlige URL-er. |
| `--duration` 3 til 15 | Stemmer (heltall 3 til 15). |
| `--sound on/off` | Stemmer for std/pro/4k. Turbo-endepunktet har ikke `sound` og ikke `last_image_url`. |
| `--aspect_ratio` 16:9/9:16/1:1 på video | Ikke et felt på pro. Formatet følger startbildet. Lag 9:16-bildene først. |
| `--mode pro` = 1080p, `std` = 720p | Ikke verifisert. Dokumentasjonen oppgir ingen oppløsning for pro/std. Skriptets 4K-endepunkt ga 3840 x 2160 (målt på masterne). Mål første pro-klipp med ffprobe, og vurder 4K-endepunktet (20 kreditter anslått) hvis pro ikke gir 1080p. |
| Wan 2.7 `wan2_7`, `--resolution 1080p` | Slug er `wan/v2.7/image-to-video`. Parametere ikke undersøkt. |
| "Wan 3.0 Prime står ikke i MODELS.md" | Finnes: `alibaba/wan-3.0-prime/image-to-video` m.fl. |
| Kreditter ca. 400 totalt / 20 kreditter per dollar | Estimatene gir 16 kreditter per dollar (0,0625 USD per kreditt) og lavere pris per klipp. Planlegg nytt anslag med `/estimate` før bunkene. |
| "Mislykkede forsøk belastes ikke" | Stemmer i API-dokumentasjonen: `failed` og `nsfw` belastes ikke og refunderes. Minnepunkt fra skriptet: klient-timeout mens jobben fullfører hos leverandøren kostet penger tidligere. Bruk lang `maxPollTime`. |
| Prompt maks | Kling: 2 500 tegn. `multi_prompt`: 512 tegn per skudd. Kling har `cfg_scale` (0 til 1, standard 0,5) men ingen negativ prompt. |
| Lagring i 7 dager | Stemmer ("minst sju dager"). Kreditter utløper etter ett år. |
| Forhåndsbetalt saldo, fylt 7. oktober | Kan ikke bekreftes maskinelt. Beløpet er ukjent for produsenten. |

## Anbefalte avklaringer før "utkast"-oppdraget

1. Eier leser saldo i console.higgsfield.ai og oppgir beløpet i kreditter.
2. Dirigent/eier velger bildemodell: Qwen Image 3 (tilgjengelig, brukt i drift) eller en annen fra listen, siden Nano Banana ikke finnes. Promptene i del 9 kan måtte justeres.
3. Avklar om `pro` gir 1080p (mål ett klipp) eller om `4k`-endepunktet skal brukes og nedskaleres til 1080p i ffmpeg (nedskalering er ikke oppskalering).
4. Produsent får lov til å lage et eget skript under `assets/higgsfield/` eller `scripts/` som bruker slug, nivå og promptfil som argument, laster ned alt, og skriver logg.

## Filer

- Opprettet: denne rapporten og den tomme mappa `.design/arbeid/produsent/`.
- Ikke opprettet: `assets/higgsfield/` (ingenting å legge der ennå).
- Logg: `assets/higgsfield/logg.md` er ikke skrevet, fordi ingen generering fant sted.
