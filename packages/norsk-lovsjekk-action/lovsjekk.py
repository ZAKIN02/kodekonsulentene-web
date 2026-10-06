#!/usr/bin/env python3
"""
Kjører nettsidesjekken og oversetter svaret til GitHub Actions.

Kalles fra action.yml. Ligger som egen fil og ikke som heredoc i YAML-en, fordi
et heredoc inne i en «run: |»-blokk er avhengig av innrykk på en måte som går i
stykker ved første redigering.

Argumenter: <api> <url> <terskel> <tillat-brudd>
Exit 0 når sjekken er innenfor, 1 når den ikke er.
"""

import json
import os
import sys
import urllib.error
import urllib.request

ORD = {"ok": "bestått", "warn": "bør fikses", "fail": "BRUDD", "neutral": "ikke sjekket"}


def hent(api: str, sti: str, kropp: dict) -> dict:
    data = json.dumps(kropp).encode("utf-8")
    req = urllib.request.Request(
        f"{api}{sti}",
        data=data,
        headers={"content-type": "application/json", "accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as svar:
            return json.loads(svar.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read().decode("utf-8"))
        except Exception:
            return {"feil": f"Tjenesten svarte {e.code}."}
    except Exception as e:  # nettverk, tidsavbrudd
        return {"feil": f"Fikk ikke kontakt med {api}: {e}"}


def skriv(fil_env: str, tekst: str) -> None:
    sti = os.environ.get(fil_env)
    if sti:
        with open(sti, "a", encoding="utf-8") as fh:
            fh.write(tekst)


def tabell(rader: list[dict], kolonne: str) -> str:
    linjer = [f"| {kolonne} | Status | Verdi | Hva det betyr |", "|---|---|---|---|"]
    for x in rader:
        linjer.append(f'| {x["name"]} | {ORD[x["status"]]} | `{x["value"]}` | {x["note"]} |')
    return "\n".join(linjer)


def main() -> int:
    api, url, terskel_raa, tillat_raa = sys.argv[1:5]
    terskel = int(terskel_raa)
    tillat_brudd = tillat_raa.strip().lower() == "true"

    r = hent(api, "/api/sjekk", {"url": url})
    if "feil" in r:
        print(f'::error::{r["feil"]}')
        return 1

    brudd = [x for x in r["rader"] if x["status"] == "fail"]

    skriv(
        "GITHUB_STEP_SUMMARY",
        f'## Norsk lovsjekk: {r["url"]}\n\n'
        f'**{r["totalt"]} av 100** (terskel {terskel})\n\n'
        + tabell(r["rader"], "Sjekk")
        + "\n\n<sub>Teknisk hjelpemiddel, ikke juridisk rådgivning. "
        "Det som ikke kan måles maskinelt står som «ikke sjekket».</sub>\n",
    )

    skriv(
        "GITHUB_OUTPUT",
        f'score={r["totalt"]}\nbrudd={len(brudd)}\n'
        "rapport<<KKEOF\n" + json.dumps(r, ensure_ascii=False) + "\nKKEOF\n",
    )

    for x in r["rader"]:
        if x["status"] == "fail":
            print(f'::error title={x["name"]}::{x["note"]}')
        elif x["status"] == "warn":
            print(f'::warning title={x["name"]}::{x["note"]}')

    feilet = False
    if brudd and not tillat_brudd:
        print(f"::error::{len(brudd)} rad(er) har status brudd.")
        feilet = True
    if r["totalt"] < terskel:
        print(f'::error::Score {r["totalt"]} er under terskelen {terskel}.')
        feilet = True
    return 1 if feilet else 0


if __name__ == "__main__":
    sys.exit(main())
