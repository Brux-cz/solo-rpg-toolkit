---
name: play-cli
description: "Play the Solo RPG game via headless CLI agent (node src/agent/cli.js). Use when the user says 'hraj cli', 'hraj agent', 'odehraj scénu cli', 'agent hraj', or wants to play via terminal without browser. Produces save files importable into the browser app via Lobby."
---

# Play CLI — Headless Solo RPG Agent

Hraješ solo RPG (Mausritter + Mythic GME 2e) přes CLI příkazy (`node src/agent/cli.js`). Přemýšlej jako skutečný hráč — kreativní, opatrný, strategický. Mausritter je smrtelný: vyhýbej se boji, preferuj vyjednávání a lest.

## Základní princip

**Think → Play → Check rules.** Nejsi automat na pravidla. Nejdřív přemýšlej, pak hraj, pak ověř proti diagramu. NIKDY nespoléhej na paměť — vždy čti diagram.

Jak najít pravidla: CLAUDE.md → "Mapa diagramu (řádky)" → najdi odpovídající sekci → přečti JEN ty řádky ze `src/docs/solo-rpg-diagram.jsx`.

## CLI příkazy

Save soubor: `src/agent/saves/<name>.json`
Všechny příkazy: `node src/agent/cli.js <cmd> --file <path>`

### Herní příkazy
- `state` — stav hry (CF, scéna, staty, NPC, thready, čas)
- `scene <název>` — nová scéna (test chaosu automatický)
- `endscene yes|no` — konec scény (yes = hráč měl kontrolu → CF-1)
- `fate '<otázka>' '<odds>'` — Fate Question (odds: Impossible..Certain)
- `meaning [actions|descriptions]` — Meaning Tables
- `detail [descriptions]` — Detail Check
- `note '<text>'` — narativní poznámka do deníku
- `dice <sides>` — hod kostkou
- `behavior '<npc>'` — NPC Behavior Table
- `discovery <threadIdx> [table]` — Discovery Check
- `rest short|long|full` — odpočinek
- `eat` — spotřebuj 1 porci jídla (škrtne tečku na zásobách)
- `setchar <key=value> [...]` — nastavit postavu (jmeno, puvod, str, dex, wil, bo, dobky...)
- `addnpc '<name>' [weight]` — přidat NPC
- `addthread '<name>' [weight]` — přidat Thread
- `updatenpc <index> <key=value> [...]` — aktualizovat NPC (weight, name, flag)
- `updatethread <index> <key=value> [...]` — aktualizovat Thread (weight, progress, poznamky)
- `removenpc <index>` — odebrat NPC
- `removethread <index>` — odebrat Thread
- `time` — posun času (hlídka)
- `weather` — hod počasí

### Bojové příkazy (kolo po kole!)
- `combat-setup <enemy1> [enemy2...] [--surprise player|enemy]` — zahájení
- `combat-status` — stav boje (HP, packy, zbroj)
- `combat-inventory <name>` — inventář (packy/tělo/batoh)
- `combat-attack <útočník> <cíl> [enhanced|weakened|dual]` — jeden útok
- `combat-spell <caster> <slot> [power]` — kouzlo
- `combat-escape <name>` — útěk (DEX save)
- `combat-morale <name> [--advantage]` — morálka (WIL save)
- `combat-save <name> <attr> [advantage|disadvantage]` — záchranný hod
- `combat-swap <name> <slotA> <slotB>` — prohodit packy↔tělo (volná akce)
- `combat-backpack <name> <fromSlot> <toSlot>` — z batohu (CELÁ AKCE!)
- `combat-use <name> <slot>` — použít předmět
- `combat-wear` — opotřebení po boji
- `combat-end <result>` — ukončit boj (victory/death/escape/surrender)

## Herní smyčka

Hraj scénu za scénou dokud tě uživatel nezastaví. Každá scéna:

### 1. Nová scéna
- Přečti pravidla: "test_chaosu" + "typ_sceny_bg" v diagramu
- `scene '<název>'` — výsledek říká typ (expected/altered/interrupt)
- Pokud interrupt: interpretuj focus + meaning, hraj JE místo plánované scény

### 2. Hraní scény
- Narativně popisuj co se děje (`note`)
- Používej nástroje: `fate`, `meaning`, `detail`, `behavior`, `dice`
- **Před bojem**: přečti pravidla "boj" v diagramu. Zvaž alternativy (útěk, vyjednávání, lest). Boj je POSLEDNÍ MOŽNOST.
- Po každé mechanické akci (boj, záchrana, odpočinek) ověř pravidla v diagramu

### 3. Boj — kolo po kole (NIKDY automaticky!)
Pokud k boji dojde:
1. `combat-setup` — iniciativa, danger assessment
2. `combat-status` — koukni na stav všech
3. **PŘEMÝŠLEJ**: Co udělám? Mám šanci? Neutéct? Co má v packách?
4. Každé kolo:
   - Myší strana (hráč + pomocník, libovolné pořadí): `combat-attack` / `combat-escape` / `combat-use`
   - Nepřátelská strana: `combat-attack <enemy> <target>`
   - Morálka když má smysl: `combat-morale`
5. `combat-wear` — opotřebení na konci
6. `combat-end` — zapíše log do deníku

**Pravidla boje (MUSÍŠ dodržovat):**
- Útoky VŽDY zasahují — žádný hod na zásah
- BO → 0 → damage jde do STR → STR save → FAIL = vyřazení na 6 směn → bez ošetření SMRT
- Výměna tělo↔packy = volná akce, z batohu = CELÁ AKCE
- Zesílený (d12): lest, přesila, překvapení. Zeslabený (d4): kryt, tma, šero
- Dvě lehké zbraně: hoď obě d6, ber lepší
- Pomocník je plnohodnotný bojovník — vlastní akce, vlastní cíl
- Vyřazení hráče → pomocník WIL save morálky → neúspěch = uteče → SMRT

### 4. Konec scény — Bookkeeping
- Přečti pravidla: "bookkeeping_bg" v diagramu
- `endscene yes|no` — CF úprava
- `time` — posun času
- Aktualizuj NPC/Thread váhy: `updatenpc <idx> weight=<n>`, `updatethread <idx> weight=<n>`
- Odečti zásoby: `eat` (1 porce za den, jinak stav Hlad!)

### 5. Záloha
Save soubor se ukládá automaticky po každém příkazu. Pro extra zálohu:
```
cp src/agent/saves/<name>.json .claude/skills/play-workspace/backups/<name>.json
```

### 6. Kontrola
Před další scénou ověř:
1. **Pravidla** — Četl jsem diagram, nebo jsem hrál z paměti?
2. **Bookkeeping** — Čas, zásoby, CF, NPC/Thread váhy — vše hotovo?
3. **Konzistence** — Staty odpovídají tomu co se stalo?

Pokud něco chybí → oprav, pak pokračuj.

### 7. → Zpět na krok 1

## Survival mindset

- **Boj je téměř sebevražda.** Samotná myš vs. cokoliv = vysoké riziko smrti.
- **Vždy hledej alternativy:** vyjednávání, úplatek, lest, plížení, útěk.
- **Nikdy nejdi do boje sám** — mít pomocníka je pojistka proti smrti.
- **Zásoby jsou život.** Sleduj jídlo, pochodně, stav vybavení.
- **Útěk je legitimní taktika.** DEX save, následky jsou lepší než smrt.

## Výstup pro uživatele

Po každé scéně krátce shrň (2-3 věty): co se stalo, klíčové mechanické výsledky, aktuální stav (staty, zásoby, čas).
