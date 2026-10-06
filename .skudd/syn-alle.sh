#!/bin/zsh
cd /Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web
run(){ node .skudd/syn-side.mjs "$1" "$2" >> .skudd/syn/logg.txt 2>>.skudd/syn/feil.txt; }
run "https://kodekonsulentene.no/" "forside" &
run "https://kodekonsulentene.no/apper-og-ai/" "apper-og-ai" &
run "https://kodekonsulentene.no/artikler/35-wcag-krav/" "artikler-35-wcag-krav" &
run "https://kodekonsulentene.no/artikler/cookies-for-samtykke/" "artikler-cookies-for-samtykke" &
wait
run "https://kodekonsulentene.no/artikler/orgnr-pa-nettsiden/" "artikler-orgnr-pa-nettsiden" &
run "https://kodekonsulentene.no/bransjer/handverkere/" "bransjer-handverkere" &
run "https://kodekonsulentene.no/bransjer/klinikker/" "bransjer-klinikker" &
run "https://kodekonsulentene.no/caser/" "caser" &
wait
run "https://kodekonsulentene.no/handbok/" "handbok" &
run "https://kodekonsulentene.no/historie/" "historie" &
run "https://kodekonsulentene.no/kontakt/" "kontakt" &
run "https://kodekonsulentene.no/nettsider/" "nettsider" &
wait
run "https://kodekonsulentene.no/om/" "om" &
run "https://kodekonsulentene.no/personvern/" "personvern" &
run "https://kodekonsulentene.no/priser/" "priser" &
run "https://kodekonsulentene.no/sikkerhet/" "sikkerhet" &
wait
run "https://kodekonsulentene.no/sjekk/" "sjekk" &
run "https://kodekonsulentene.no/status/" "status" &
run "https://kodekonsulentene.no/systemer/" "systemer" &
run "https://kodekonsulentene.no/terminal/" "terminal" &
wait
run "https://kodekonsulentene.no/verktoy/" "verktoy" &
run "https://kodekonsulentene.no/verktoy/cookie-sjekk/" "verktoy-cookie-sjekk" &
run "https://kodekonsulentene.no/verktoy/dmarc/" "verktoy-dmarc" &
run "https://kodekonsulentene.no/verktoy/priskalkulator/" "verktoy-priskalkulator" &
wait
run "https://kodekonsulentene.no/verktoy/uu-sjekk/" "verktoy-uu-sjekk" &
run "https://kodekonsulentene.no/vilkar/" "vilkar" &
wait
