/**
 * Opptellingen i åpningen. Ren pynt oppå noe som allerede virker.
 *
 * Tallene står som ferdig tekst i HTML-en, og bortgangen av overlegget ligger i
 * en CSS-keyframe. Kommer denne fila aldri fram, står riktige verdier der og
 * åpningen forsvinner likevel. Derfor ingen feilhåndtering: det finnes ingen
 * tilstand der en feil her låser siden.
 *
 * Flagget står på <html>, flaten har sin egen attributt. Ett felles navn gjorde at
 * querySelector traff html-elementet i stedet for overlegget.
 *
 * Samme regnestykke som Nokkeltall: bare sifrene tolkes, prefiks og suffiks blir
 * stående, og teksten settes tilbake til originalen til slutt.
 */
(function () {
  if (!document.documentElement.dataset.apning) return;
  var rot = document.querySelector("[data-apning-flate]");
  if (!rot) return;

  var tall = rot.querySelectorAll("[data-apning-tell]");
  var VARIGHET = 300; // som radens innanimasjon
  var TRAPP = 200; // som mellomrommet i CSS-en

  for (var i = 0; i < tall.length; i++) {
    (function (el, rad) {
      var ferdig = el.textContent || "";
      var m = /^(\D*)(\d+(?:[.,]\d+)?)(.*)$/.exec(ferdig);
      if (!m) return;
      var foer = m[1];
      var maal = Number(m[2].replace(",", "."));
      var des = m[2].indexOf(",") > -1 ? 1 : 0;
      var etter = m[3];
      var start = performance.now() + 150 + rad * TRAPP;

      function steg(naa) {
        var t = Math.min(1, Math.max(0, (naa - start) / VARIGHET));
        var e = 1 - Math.pow(1 - t, 3);
        el.textContent = foer + (maal * e).toFixed(des).replace(".", ",") + etter;
        if (t < 1) requestAnimationFrame(steg);
        else el.textContent = ferdig;
      }
      requestAnimationFrame(steg);
    })(tall[i], i);
  }
})();
