# Solo RPG Playthrough Log — Test-Baseline-B (Without Skill)

## Save Game
- **Name:** Test-Baseline-B
- **Character:** Horacio Maselnik (Kovář / Blacksmith mouse)
- **Starting state:** Scene 2 completed, CF 4
- **Scenes played:** 5 (Scenes 3-7)

---

## Scene 3 — Negotiating with the Mayor
- **Expectation:** Horacio goes to the mayor to negotiate terms for using the empty forge
- **Chaos Test:** d10=5 (5 > CF 4) -> **Expected**
- **CF at start:** 4

### Events
1. Horacio finds Mayor Bertik at the town hall
2. **Fate Q:** Is Mayor Bertik willing to let Horacio use the forge? (Likely, d100=35, threshold 50) -> **YES**
3. **Detail Check:** Actions d100=55, d100=57 -> **Disrupt + Create** (Narušeni + Tvorba)
   - Interpretation: The forge needs major renovation. Old furnace is broken, roof leaky. Bertik offers free use if Horacio repairs at his own expense. First year no rent.
4. Bertik mentions an old iron mine in the forest behind the village

### Bookkeeping
- Added NPC: Bertik (starosta Oříškova)
- Added Thread: Prozkoumat starý důl za vesnicí (materiál pro kovárnu)
- Thread "Obnovit kovárnu" advanced +1 (now 1/10)
- **CF: 4 -> 3** (ANO, player had control)

---

## Scene 4 — Exploring the Old Mine
- **Expectation:** Horacio heads to the forest to explore the old mine for iron ore
- **Chaos Test:** d10=3 (3 <= CF 3, odd) -> **Altered!** Scene Adjustment d10=5: "Remove an item"
- **CF at start:** 3

### Events
1. Horacio finds the mine entrance blocked by fallen tree trunks
2. His torch gets stuck between rocks and breaks -> **Lost Torch** (scene alteration: remove item)
3. **Fate Q:** Can Horacio clear the fallen trunks with his hammer? (50/50, d100=50, threshold 25) -> **NO**
4. **Meaning (Descriptions):** d100=74, d100=50 -> **Mildly + Helplessly** (Mirne + Bezmocne)
   - Only mildly rusted iron scraps scattered helplessly in the grass, nothing usable
5. **Fate Q:** Is there a dangerous creature in the bushes? (50/50, d100=79, threshold 25) -> **NO**
   - Just a large hare that runs away

### Bookkeeping
- Removed Torch from inventory (5/10 -> 5/10 without torch)
- Removed duplicate NPC "Starosta Oříškova" (kept Bertik)
- **CF: 3 -> 4** (NE, chaos prevailed — lost torch, couldn't open mine)

---

## Scene 5 — Confrontation with the Mayor
- **Expectation:** Horacio returns to the village seeking help to open the mine
- **Chaos Test:** d10=2 (2 <= CF 4, even) -> **Interrupted!**
  - Event Focus: NPC Action
  - Meaning: **Mistrust + Adversity** (Nedůvěra + Protivenství)
- **CF at start:** 4

### Events
1. Bertik confronts Horacio at the forge with two strong farmers — rumors say Horacio is a fraud trying to steal ore
2. **Fate Q:** Can Horacio convince Bertik of his honest intentions (showing hammer and file as proof of craft)? (50/50, d100=12, threshold 35) -> **YES**
3. **Fate Q:** Will Bertik offer help with the mine as reconciliation? (Unlikely, d100=67, threshold 25) -> **NO**
   - Villagers are busy with harvest. Bertik mentions a vagabond named Ruda at the tavern U Kapucky who might help for pay.

### Bookkeeping
- Added NPC: Ruda (tulák, hledá práci)
- **CF: 4 -> 3** (ANO, player ultimately had control)

---

## Scene 6 — Freeing Ruda from Debt
- **Expectation:** Horacio goes to the tavern U Kapucky to find vagabond Ruda
- **Chaos Test:** d10=2 (2 <= CF 3, even) -> **Interrupted!**
  - Event Focus: Current Context
  - Meaning: **Overthrow + Trust** (Svržení + Důvěra)
- **CF at start:** 3

### Events
1. Horacio finds Ruda being exploited by innkeeper Vach — Ruda trusted Vach who used him as cheap labor and now demands payment (Overthrow + Trust)
2. **Dice Roll:** d6=2 -> Ruda's debt is 2 dobky
3. **Fate Q:** Will Vach accept 2 dobky to settle the debt? (Likely, d100=49, threshold 35) -> **NO**
4. **Fate Q:** Will Vach accept 2 dobky PLUS blacksmith repair work? (Likely, d100=41, threshold 35) -> **NO**
5. Horacio intimidates Vach — threatens to report him to the mayor for treating people like slaves
6. **Dice Roll (WIL save):** d20=4 vs WIL 9 -> **SUCCESS!**
7. Vach relents, accepts 3 dobky. Returns Ruda's backpack and old pickaxe. Ruda pledges loyalty to Horacio.

### Bookkeeping
- Added NPC: Vach (hostinskej U Kapucky)
- Spent 3 dobky (5 -> 2)
- **CF: 3 -> 2** (ANO, player had control — successful intimidation)

---

## Scene 7 — Sabotage at the Mine
- **Expectation:** Horacio and Ruda go together to clear the mine entrance
- **Chaos Test:** d10=2 (2 <= CF 2, even) -> **Interrupted!**
  - Event Focus: PC Negative
  - Meaning: **Disrupt + Malice** (Narušení + Zloba)
- **CF at start:** 2

### Events
1. Horacio and Ruda arrive at the mine to find it sabotaged — someone deliberately piled MORE fresh-cut logs over the entrance, with a skull carved as warning
2. **Fate Q:** Can they find tracks of who did this? (50/50, d100=44, threshold 15) -> **NO**
3. **Fate Q:** Can Horacio and Ruda together clear the trunks despite the sabotage? (50/50, d100=48, threshold 15) -> **NO**
4. The saboteur was careful — no tracks. The combined weight is too much even for two. Someone in Oříškovo doesn't want the mine opened. Horacio decides to report the sabotage to the mayor and investigate who is behind it.

### Bookkeeping
- Added Thread: Kdo sabotuje důl a proč?
- **CF: 2 -> 3** (NE, chaos prevailed — sabotage disrupted plans)

---

## Final Character State (end of Scene 7)

### Stats
| Stat | Current | Max |
|------|---------|-----|
| STR  | 6       | 6   |
| DEX  | 8       | 8   |
| WIL  | 9       | 9   |
| BO   | 2       | 2   |

- **Dobky:** 2
- **XP:** 0/1000
- **Level:** 1
- **Peril Points:** 2/2

### Inventory (5/10 slots used)
1. Stredni zbran (mec) — d8, weapon
2. Kladivo — d8, weapon
3. (empty — Batoh)
4. (empty — Batoh)
5. (empty — Batoh, was torch)
6. Cestovni zasoby — supplies
7. Pilnik na zelezo — tool
8. Plsteny klobouk — tool
9. (empty — Batoh)
10. (empty — Batoh)

### NPCs (3)
1. Bertik (starosta Oříškova) — importance 1
2. Ruda (tulák, hledá práci) — importance 1
3. Vach (hostinskej U Kapucky) — importance 1

### Threads (3)
1. Obnovit kovárnu v Oříškově — 1/10
2. Prozkoumat starý důl za vesnicí (materiál pro kovárnu) — 0/10
3. Kdo sabotuje důl a proč? — 0/10

### Chaos Factor: 3
### Time: Den 1, ráno (not advanced during play)

---

## All Dice Rolls Summary

| Scene | Roll Type | Question/Context | Die | Result | Threshold | Outcome |
|-------|-----------|-----------------|-----|--------|-----------|---------|
| 3 | Chaos Test | Scene test | d10 | 5 | CF 4 | Expected |
| 3 | Fate Q | Mayor willing to share forge? | d100 | 35 | 50 | YES |
| 3 | Detail Check | What conditions? | d100+d100 | 55, 57 | — | Disrupt + Create |
| 4 | Chaos Test | Scene test | d10 | 3 | CF 3 | Altered (odd) |
| 4 | Fate Q | Can Horacio clear trunks alone? | d100 | 50 | 25 | NO |
| 4 | Meaning | What's around the mine? | d100+d100 | 74, 50 | — | Mildly + Helplessly |
| 4 | Fate Q | Dangerous creature? | d100 | 79 | 25 | NO |
| 5 | Chaos Test | Scene test | d10 | 2 | CF 4 | Interrupted (even) |
| 5 | Event Focus | — | — | — | — | NPC Action: Mistrust + Adversity |
| 5 | Fate Q | Can Horacio convince Bertik? | d100 | 12 | 35 | YES |
| 5 | Fate Q | Will Bertik help with mine? | d100 | 67 | 25 | NO |
| 6 | Chaos Test | Scene test | d10 | 2 | CF 3 | Interrupted (even) |
| 6 | Event Focus | — | — | — | — | Current Context: Overthrow + Trust |
| 6 | Dice | Ruda's debt | d6 | 2 | — | 2 dobky |
| 6 | Fate Q | Will Vach accept 2 dobky? | d100 | 49 | 35 | NO |
| 6 | Fate Q | Will Vach accept 2 + work? | d100 | 41 | 35 | NO |
| 6 | WIL Save | Intimidation | d20 | 4 | 9 | SUCCESS |
| 7 | Chaos Test | Scene test | d10 | 2 | CF 2 | Interrupted (even) |
| 7 | Event Focus | — | — | — | — | PC Negative: Disrupt + Malice |
| 7 | Fate Q | Find saboteur tracks? | d100 | 44 | 15 | NO |
| 7 | Fate Q | Can they clear mine together? | d100 | 48 | 15 | NO |
