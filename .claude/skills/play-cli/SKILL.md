---
name: play-cli
description: "Play the Solo RPG game via headless CLI agent (node src/agent/cli.js). Use when the user says 'hraj cli', 'hraj agent', 'odehraj scénu cli', 'agent hraj', or wants to play via terminal without browser. Produces save files importable into the browser app via Lobby."
---

# Play CLI — Headless Solo RPG Agent

CLI: `node src/agent/cli.js <cmd> --file <path>`
Pravidla: CLAUDE.md → "Mapa diagramu" → řádky v `src/docs/solo-rpg-diagram.jsx`

## Princip

**Think → Play → Check rules.** Pravidla NIKDY z paměti — vždy čti diagram. Boj je POSLEDNÍ MOŽNOST — vždy hledej vyjednávání, lest, útěk.

## Smyčka

1. `scene '<název>'` → hraj scénu (note, fate, meaning, detail, behavior, dice)
2. **BOOKKEEPING** (po KAŽDÉ scéně, PŘESNĚ v tomto pořadí):
   - `endscene yes|no`
   - `eat` (1× denně! zásoby 0 = zítra Hlad!)
   - NPC váhy (zvýšit důležité, snížit nepřítomné)
   - Thread váhy + progress
   - `time` + `weather` (pokud nový den)
   - Inventář odpovídá příběhu?
3. **AUDITOR AGENT** → po bookkeepingu spusť Agent tool NA POZADÍ (`run_in_background: true`):
   ```
   Prompt pro auditora:
   Jsi auditor solo RPG hry. Přečti save soubor <path> a log <path>-log.md.
   Zkontroluj POSLEDNÍ scénu:
   1. BOOKKEEPING: Jedl dnes? CF odpovídá (yes=−1, no=+1)? NPC váhy dávají smysl? Thready aktualizovány?
   2. PRAVIDLA: Přečti relevantní sekce z src/docs/solo-rpg-diagram.jsx (viz CLAUDE.md mapa řádků).
      Byly saves (d20 vs atribut) správně? Boj podle pravidel? Mechaniky Mythic GME správně?
   3. KONZISTENCE: Inventář odpovídá příběhu? Staty odpovídají zraněním/léčení?
   4. ZAPIŠ do log souboru (<save>-log.md) záznam o scéně.
   Vrať: OK nebo seznam problémů k opravě.
   ```
   Auditor běží na pozadí. Než začneš další scénu, POČKEJ na jeho výsledek. Pokud našel problém → oprav.
4. → zpět na 1

## Myší optika

- Svět je z pohledu myši obrovský a děsivý. Kaluž = jezero, stéblo = strom, déšť = padající balvany.
- Predátoři (kočky, sovy) = mýtická monstra. Hmyz = draci menšího kalibru.
- Lidské předměty NIKDY pravým jménem — špendlík = kopí, knoflík = štít, plechovka = jeskyně, sklenice = průhledná věž.
- Smysly: pachy, vibrace v zemi, proudění vzduchu. Myší čich je hlavní smysl.

## Narativní styl

- **Hraj POMALU.** Trávíš čas NA scéně. Rozhovory s hlasem — NPC mají osobnost.
- Meaning tables = motor příběhu. Interpretuj do konkrétního detailu, neříkej výsledek.
- Kontrasty jsou zajímavé (Agresivně + Laskavě = napětí).
- Taktické myšlení nahlas — Okřál přemýšlí před akcí.
