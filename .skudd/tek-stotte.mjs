import { chromium, firefox } from "@playwright/test";
const EGENSKAPER = [
  ["field-sizing", "content"],
  ["interpolate-size", "allow-keywords"],
  ["content-visibility", "auto"],
  ["transition-behavior", "allow-discrete"],
];
for (const [navn, motor] of [["chromium", chromium], ["firefox", firefox]]) {
  const b = await motor.launch();
  const s = await b.newPage();
  const r = await s.evaluate(
    ([egenskaper]) => ({
      versjon: navigator.userAgent.match(/(Chrome|Firefox)\/[\d.]+/)?.[0],
      css: Object.fromEntries(egenskaper.map(([p, v]) => [p, CSS.supports(p, v)])),
      har: {
        "::details-content": CSS.supports("selector(details::details-content)"),
        ":user-invalid": CSS.supports("selector(:user-invalid)"),
        "@starting-style": typeof CSSStartingStyleRule !== "undefined",
        ":has()": CSS.supports("selector(:has(*))"),
      },
    }),
    [EGENSKAPER],
  );
  console.log(navn, JSON.stringify(r, null, 1));
  await b.close();
}
