#!/usr/bin/env python3
"""
E-postsjekken (SPF, DKIM, DMARC) som et valgfritt steg i action-en.

Argumenter: <api> <url-eller-domene> [dkim-selektor]

Feiler aldri bygget. E-postoppsett er sjelden noe en PR endrer, så funnene
rapporteres som advarsler og i sammendraget – ikke som en stoppende feil.
"""

import re
import sys

from lovsjekk import ORD, hent, skriv, tabell  # noqa: F401  (ORD brukes av tabell)


def til_domene(s: str) -> str:
    s = re.sub(r"^[a-z]+://", "", s.strip().lower())
    s = re.sub(r"/.*$", "", s)
    return re.sub(r":\d+$", "", s)


def main() -> int:
    api, raa = sys.argv[1:3]
    dkim = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else None

    r = hent(api, "/api/dmarc", {"domene": til_domene(raa), "dkim": dkim})
    if "feil" in r:
        print(f'::warning::E-postsjekken kunne ikke kjøres: {r["feil"]}')
        return 0

    skriv(
        "GITHUB_STEP_SUMMARY",
        f'\n## E-postsikkerhet: {r["domene"]}\n\n**{r["totalt"]} av 100**\n\n'
        + tabell(r["rader"], "Post")
        + "\n",
    )
    for x in r["rader"]:
        if x["status"] == "fail":
            print(f'::warning title={x["name"]}::{x["note"]}')
    return 0


if __name__ == "__main__":
    sys.exit(main())
