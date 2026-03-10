---
name: check-docs
description: "This skill should be used BEFORE implementing any code change in solo-rpg-toolkit. It verifies the implementation plan against reference documentation (datovy-model.jsx and solo-rpg-diagram.jsx). Triggers on: any feature implementation, bug fix, refactoring, data model change, new component, game mechanic change, migration, adding fields, or when the user says /check-docs. Also use this skill when delegating work to subagents — pass the verification workflow to them."
---

# Check Docs — Reference Documentation Verification

Solo-rpg-toolkit has two authoritative reference documents that define all data structures and game mechanics. Every implementation MUST be verified against these docs before writing code. This prevents the most common class of bugs: implementing something that contradicts the docs, missing a migration, or inventing fields that don't exist in the model.

## Reference Files

1. **Datovy model** — `src/docs/datovy-model.jsx`
   - All entities: postava, pomocnik, predmet, NPC, mythic, scena, hexcrawl, cas, frakce, osada, zvesti, boj
   - Each entity: fields, types, constraints, notes, example data (Ada)

2. **Diagram** — `src/docs/solo-rpg-diagram.jsx`
   - Game mechanics: scene cycle, fate chart, meaning tables, combat, time/weather
   - Line map in CLAUDE.md section "Mapa diagramu" — use it to read only relevant sections

## Verification Workflow

### Phase 1: Classify the Change

Before reading any docs, determine the change category:

- **DATA** — adds/modifies entity fields, types, default values, or relationships
- **MECHANIC** — changes game logic (combat, scene cycle, fate, bookkeeping, dice)
- **UI-ONLY** — changes only how existing data is displayed (colors, layout, labels)
- **MIX** — combination of the above

UI-ONLY changes need a quick sanity check (correct field names, types). DATA and MECHANIC changes require full verification.

### Phase 2: Read Relevant Docs

Based on the category, read the specific sections:

**For DATA changes:**
1. Open `src/docs/datovy-model.jsx` and find the relevant entity
2. Check: Does the field exist? Does the type match? Do the constraints match?
3. If adding a new field — is it defined in the model? If not — STOP (Phase 4)
4. Does this need a MIGRATION? Rule of thumb:
   - **Optional field** on a dynamic object (NPC wiki fields, items with `|| fallback`) = NO migration needed, existing objects just won't have it
   - **Required field**, structural change, or rename = YES, bump CURRENT_VERSION in gameStore.js and add MIGRATIONS entry

**For MECHANIC changes:**
1. Check CLAUDE.md section "Mapa diagramu" for line numbers
2. Open `src/docs/solo-rpg-diagram.jsx` at the relevant lines
3. Check: Does the logic match? Correct tables? Correct conditions? Correct dice?

**For UI-ONLY changes:**
1. Quick check that displayed field names and data types match the model
2. No deep verification needed

### Phase 2b: Cross-check Between Docs

If both docs were read (DATA+MECHANIC or MIX), compare them against each other. The two docs were written at different times and may contradict each other — different field names, different enum values, different dice. When a contradiction is found, flag it as NESROVNALOST even if the implementation plan matches one of them. Both docs need to agree before proceeding.

### Phase 3: Report Result

Output one of three verdicts:

**SEDI** — Implementation matches docs, and docs are consistent with each other. State which sections were checked. Proceed with implementation.

**NESROVNALOST** — Docs say X, but the plan does Y. Or: doc A says X, but doc B says Y. State the exact conflict. Ask the user which is correct before proceeding. If the docs are wrong, update them first, then implement.

**CHYBI V DOCS** — The implementation requires something not documented. Proceed to Phase 4.

### Phase 4: NotebookLM Query (ALWAYS when CHYBI V DOCS)

When the docs don't cover what's needed, ALWAYS formulate a query — even if the feature seems like a pure user request. The purpose is to check whether the source rulebooks have something relevant that should inform the implementation (an existing mechanic, a related concept, a constraint). Not asking means assuming the rulebooks have nothing to say, which has led to mistakes before.

```
NOTEBOOKLM DOTAZ:
Kontext: [what is being implemented]
Otazka: [what exactly needs to be answered — e.g. "Does Mausritter define NPC occupations or a similar concept?"]
Zdroj: [which source should answer — Mausritter rulebook? Mythic GME 2e?]
```

Then WAIT for the user's answer. After receiving the answer:
1. Update the relevant doc file (`datovy-model.jsx` or `solo-rpg-diagram.jsx`) with the new information
2. Confirm the update with the user
3. Only then proceed with implementation

## Delegating to Subagents

When using the Agent tool to delegate work, include this in the subagent prompt:

```
PRED IMPLEMENTACI — povinny checklist:
1. Meni se data? Precti src/docs/datovy-model.jsx (relevantni entitu)
2. Meni se mechanika? Precti src/docs/solo-rpg-diagram.jsx (relevantni sekci — radky viz CLAUDE.md "Mapa diagramu")
3. Nesedi implementace s docs? ZASTAV SE a report uzivateli
4. Chybi neco v docs? ZASTAV SE a report uzivateli
5. Potrebujes migraci? (nove pole = ANO, zvys CURRENT_VERSION v gameStore.js)
```

This is non-negotiable. Subagents that skip verification cause the hardest bugs to find.

## Common Pitfalls

These are real mistakes that happened in this project:

- **Missing migration**: Added a field to an entity without bumping CURRENT_VERSION and adding a MIGRATIONS entry. Old saves broke on load.
- **Invented field**: Added `weight`/`progress` to a thread without checking the model first. The model uses `vaha` and `progressTrack`.
- **Wrong dice**: Implemented d20 for a mechanic that uses 2d6. The diagram specifies the exact dice for each mechanic.
- **Wrong constraint**: Set BO max to 6 for all levels. The model says level 1 = 1d6, level 2 = 2d6, etc., with a cap at 4d6.

## Quick Reference: Line Maps

### Datovy model (datovy-model.jsx)
- Postava: lines 5-42
- Tvorba postavy: lines 43-74
- Pomocnik: lines 75-99
- Predmet: lines 100-143
- Frakce: lines 144-165
- Osada: lines 166-199
- NPC: lines 200-233
- Mythic GME: lines 234-265
- Scena: lines 266-291
- Hexcrawl: lines 292-314
- Cas a Pocasi: lines 315-337
- Zvesti: lines 338-354
- Boj: lines 355-385

### Diagram (solo-rpg-diagram.jsx) — see CLAUDE.md "Mapa diagramu" for full map
Key sections:
- Wiki entities: lines 23-640
- Scene cycle: lines 571-758
- Tools (fate, meaning, detail): lines 759-901
- Mausritter combat: lines 1082-1162
- Time/travel/weather: lines 1163-1215
