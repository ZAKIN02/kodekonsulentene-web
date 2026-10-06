cd /Users/zakaria/Zakaria/02-Prosjekter/kodekonsulentene-web
for p in "" sjekk priser nettsider historie om caser; do
  u="https://kodekonsulentene.no/${p:+$p/}"
  n="${p:-forside}"
  node .skudd/syn-side.mjs "$u" "m390-$n" 390 844 2>&1|tail -1
done
for p in "" sjekk nettsider; do
  u="https://kodekonsulentene.no/${p:+$p/}"
  node .skudd/syn-side.mjs "$u" "m412-${p:-forside}" 412 915 2>&1|tail -1
done
