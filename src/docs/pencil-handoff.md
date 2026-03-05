# Solo RPG Companion — UI Handoff pro Pencil.dev

## O projektu
Mobilní PWA aplikace pro solo stolní RPG (Mausritter + Mythic GME 2e).
Stack: React + Tailwind + TipTap (editor) + Dexie (offline DB).
Cílová platforma: mobil (390×844pt, iPhone 14 proporce).

## Designový jazyk
- **Font:** IBM Plex Mono (monospace)
- **Pozadí:** #faf9f6 (teplá bílá)
- **Hlavní barvy:**
  - Text: #2a2a2a
  - Zelená (ANO/úspěch): #4a7a4a
  - Červená (NE/neúspěch): #aa4444
  - Žlutá/oranžová (akce/chaos): #c89030
  - Fialová (meaning/magie): #7a5aaa
  - Modrá (scéna): #8888cc
  - Šedá (poznámky/neaktivní): #bbb
- **Styl:** Minimalistický, monospace, funkční. Žádné dekorace. Barvy jen pro rozlišení typů obsahu.
- **Border radius:** 6-8px pro karty, 12px pro bottom sheets, 20px pro telefon
- **UI kit:** shadcn/ui jako základ

---

## KOMPONENTY K VYGENEROVÁNÍ

### 1. App Shell (layout)
Obal celé aplikace. Tři stavy:

**Stav A — Editor aktivní (bez klávesnice):**
```
[Header — rozkliknutelný]        ~5%
[TipTap editor — scrolluje]      ~80%
[Akční toolbar]                   ~7%
[Bottom navigation — 3 taby]     ~8%
```

**Stav B — Editor s klávesnicí:**
```
[TipTap editor — zmenšený]       ~50%
[Mini toolbar — 1 řádek ikon]    ~3%
[Systémová klávesnice]           ~47%
```
- Header ZMIZÍ
- Bottom nav ZMIZÍ
- Mini toolbar se přesune NAD klávesnici

**Stav C — Bottom sheet otevřený:**
```
[TipTap editor — viditelný nahoře] ~50%
[Dim overlay]
[Bottom sheet — vysunout zespodu]  ~45%
```
- Klávesnice ZMIZÍ
- Sheet ji NAHRADÍ (ne otevře nad ní)
- Sheet má handle nahoře (swipe down = zavřít)

---

### 2. Header
Kompaktní, rozkliknutelný.

**Sbalený stav (default):**
```
Scéna 4 · CF 5                    Den 2 · ráno
```
Jedna řádka. Vlevo scéna + chaos factor, vpravo čas.

**Rozbalený stav (po tapnutí):**
```
Scéna 4 · CF 5                    Den 2 · ráno · Zataženo
STR 8/8  DEX 10/10  WIL 7/7      BO 0/4  Peril 2/2
Kuráž: 0  Ďobky: 12              Úr. 1  ZK 3/6
```
Dvě řádky navíc — staty postavy + zdroje. Tapnutí znovu = sbalí.

---

### 3. Bottom Navigation
Tři taby. Vždy viditelná (kromě stavu B).

```
[📖 Deník]    [🐭 Postava]    [🗺️ Svět]
```
- Aktivní tab: tučný text + horní čárka (accent)
- Neaktivní: šedý text
- Výška: ~48px

---

### 4. Akční Toolbar
Řádka tlačítek nad bottom nav. Slouží k vkládání mechanických bloků do editoru.

```
[🎬 Scéna] [❓ Fate] [🔮] [⚔️] [📝] [⋯]
```
- Fate Q tlačítko zvýrazněné (vyplněná zelená #4a7a4a, bílý text) — nejčastější akce
- Ostatní: outline styl
- Label "VLOŽIT:" malým textem vlevo nahoře
- [⋯] otevře overflow menu: Konec scény, Discovery check, Odpočinek, Čas, Cestování

**Mini toolbar (stav B — nad klávesnicí):**
Stejné ikony ale menší, bez labelů, jednořádkový. 24px výška.
```
[🎬][❓][🔮][⚔️][📝][📕][🎲][⋯]
```

---

### 5. Inline bloky (pro TipTap editor)
Mechanické výsledky zobrazené v toku textu. Malé, kompaktní karty.

**5a. Fate Q blok — ANO:**
```
┌ ❓ Je tu stráž? · Likely · d100=34 → ANO ──────┐
└─────────────────────────────────────────────────┘
```
- Levý border: 3px zelený (#4a7a4a)
- Pozadí: jemně zelené (#4a7a4a15)
- Výška: ~16px (1 řádka)
- Font: menší než okolní text

**5b. Fate Q blok — NE:**
- Stejné, ale červený (#aa4444)

**5c. Fate Q blok — Exceptional ANO:**
- Zelený border, tučnější, text "VÝJ. ANO"
- Pokud Random Event: druhý řádek "⚡ Random Event: [focus] · [meaning slova]"

**5d. Meaning blok:**
```
┌ 🔮 Abandon + Danger ───────────────────────────┐
└─────────────────────────────────────────────────┘
```
- Levý border: fialový (#7a5aaa)
- Pozadí: jemně fialové

**5e. Scéna start blok:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 SCÉNA 5: Ada prochází jeskyní
Očekávaná · CF 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- Funguje jako nadpis sekce / kapitoly
- Modrý (#8888cc) levý border
- Šíře na celou šířku editoru
- Odděluje scény vizuálně

**5f. Scéna start — pozměněná:**
- Žlutý/oranžový border (#c89030)
- Text "POZMĚNĚNÁ" + Scene Adjustment výsledek

**5g. Konec scény blok:**
```
┌ 📕 KONEC SCÉNY 4 · CF 5→4 · [thready aktualizovány] ┐
└───────────────────────────────────────────────────────┘
```
- Šedý border, separátor

**5h. Boj blok:**
```
┌ ⚔️ Boj: Pavouk (STR 3, BO 1, d6) → mrtvý         ┐
│   Ada: d6=4 dmg → pavouk STR 0                      │
└──────────────────────────────────────────────────────┘
```
- Červený border (#aa4444)
- Může mít 1-3 řádky dle složitosti boje

---

### 6. Bottom Sheet — Fate Question
Nejvíc používaný sheet. DVA STAVY:

**6a. Vstupní stav:**
```
        ─── (handle) ───

     ❓ FATE QUESTION

Otázka:
┌─────────────────────────────────┐
│ Je tu stráž?                  │ │
└─────────────────────────────────┘

Odds (swipe):
[Unlikely] [50/50] [Likely✓] [V.likely]

CF: 5

     ┌─────────────────────┐
     │    🎲  HODIT        │
     └─────────────────────┘
```
- Výška: ~45% obrazovky (nahrazuje klávesnici)
- Otázka: textové pole s autofocus
- Odds: horizontální scrollovatelný výběr, 10 úrovní, pamatuje poslední volbu
  Kompletní seznam: Impossible | No way | Very unlikely | Unlikely | 50/50 | Likely | Very likely | Near sure | A sure thing | Has to be
- CF zobrazený jako reminder
- Velké HODIT tlačítko (zelené)

**6b. Výsledkový stav:**
```
        ─── (handle) ───

     ❓ VÝSLEDEK

Je tu stráž? · Likely · CF 5
d100 = 34

     ┌─────────────────────┐
     │                     │
     │      A N O          │
     │                     │
     └─────────────────────┘

Exceptional: ne
Random Event: ne

     ┌─────────────────────┐
     │  VLOŽIT DO TEXTU    │
     └─────────────────────┘
```
- Velký výsledek ANO (zelené pozadí) nebo NE (červené)
- Pokud Exceptional: tučnější, "VÝJIMEČNÉ ANO"
- Pokud Random Event: zobrazí Event Focus + nabídne Meaning hod
- VLOŽIT = vloží inline blok na pozici kurzoru a zavře sheet

---

### 7. Bottom Sheet — Nová Scéna
```
        ─── (handle) ───

     🎬 NOVÁ SCÉNA

Co očekáváš?
┌─────────────────────────────────┐
│ Ada projde jeskyní bez boje     │
└─────────────────────────────────┘

CF: 5 · Test: d10 vs CF

     ┌─────────────────────┐
     │  TESTOVAT CHAOS     │
     └─────────────────────┘

─── po hodu: ───

d10 = 3 (3 ≤ 5 = pod CF, lichý)

     ┌─────────────────────┐
     │    POZMĚNĚNÁ!       │
     └─────────────────────┘

Scene Adjustment (d10=7): DVĚ úpravy
1. Přidej postavu  2. Zvyš aktivitu

     ┌─────────────────────┐
     │    VLOŽIT SCÉNU     │
     └─────────────────────┘
```
- 3 možné výsledky: Očekávaná / Pozměněná / Přerušená
- Pozměněná → automaticky hodí Scene Adjustment (d10)
- Přerušená → automaticky hodí Event Focus (d100) + Meaning
- VLOŽIT = vloží scéna-start blok jako nadpis + separator

---

### 8. Bottom Sheet — Meaning
Nejrychlejší sheet — 2 tapy.
```
        ─── (handle) ───

     🔮 MEANING TABLES

Typ:
[Actions] [Descriptions] [Elements ▾]

─── výsledek: ───

d100 = 67, d100 = 23

     ┌─────────────────────┐
     │                     │
     │  Abandon + Danger   │
     │                     │
     └─────────────────────┘

Interpretuj v kontextu scény

     ┌─────────────────────┐
     │   VLOŽIT DO TEXTU   │
     └─────────────────────┘
```
- Typ: Actions (slovesa), Descriptions (přídavná jména), Elements (45 tematických tabulek — dropdown)
- Po výběru typu se automaticky hodí 2×d100
- Velká 2 slova ve fialovém rámečku
- Vložit = inline blok [🔮 slovo + slovo]

---

### 9. Bottom Sheet — Konec Scény
Nejkomplexnější sheet. Scrollovatelný.
```
        ─── (handle) ───

     📕 KONEC SCÉNY 4

Měla postava kontrolu?
[ANO → CF-1]     [NE → CF+1]

CF: 5 → 4 ✓

── THREADY ──
┌ Kočičí daň    ███░░░░ 3/10   [+] ┐
└ Adino zajetí   █░░░░░░ 1/10   [+] ┘
[+ Přidat thread]

── NPC V TÉTO SCÉNĚ ──
☑ Šedivec (3×)
☑ Líska (2×)
☐ Hrách (1×)
[+ Přidat NPC]

── DISCOVERY CHECK ──
(automatický test na aktivní thready)

     ┌─────────────────────┐
     │   UKONČIT SCÉNU     │
     └─────────────────────┘
```
- CF úprava: dva tlačítka, jedno aktivní
- Thready: seznam s progress barem, [+] přidá 1 progress
- NPC: checklist kdo se v scéně objevil
- Vložit = separator blok [📕 KONEC SCÉNY 4 · CF 5→4]

---

### 10. Bottom Sheet — Boj
```
        ─── (handle) ───

     ⚔️ BOJ

Nepřítel:
┌──────────────────────────────┐
│ Pavouk          [Z DB ▾]     │
│ STR 3  BO 1  Zbraň d6       │
└──────────────────────────────┘

Režim: [Rychlý (1 hod)] [Detailní (kola)]

── INICIATIVA ──
Ada DEX 10 vs Pavouk DEX 6 → Ada začíná

── KOLO 1 ──
Ada útočí: d6 = 4 → Pavouk STR 3→0

     ┌─────────────────────┐
     │    VÍTĚZSTVÍ!       │
     │ Ada: bez zranění    │
     └─────────────────────┘

     ┌─────────────────────┐
     │   VLOŽIT DO TEXTU   │
     └─────────────────────┘
```
- Výběr nepřítele z databáze (33 tvorů) nebo ruční zadání
- Dva režimy: rychlý (jeden hod) a detailní (kolo po kole)
- Vložit = boj blok s výsledkem

---

### 11. Postava Tab (🐭)
Kompletní character sheet.
```
┌─ IDENTITA ─────────────────────┐
│ Ada Katzenreiserová  Úr.1      │
│ Kuchařka · ZK 3/6 · Ďobky 12  │
└────────────────────────────────┘

┌─ STATY ────────────────────────┐
│ STR ████████░░ 8/8             │
│ DEX ██████████ 10/10           │
│ WIL █████████░ 7/7             │
│ BO  ░░░░░░░░░░ 0/4            │
└────────────────────────────────┘

┌ Kuráž: 0 ┐  ┌ Peril: 2/2 ┐

┌─ INVENTÁŘ (10 slotů) ─────────┐
│ Packy  [Nůž d6] [Provaz]      │
│ Tělo   [Kožená zbroj] [—]     │
│ Batoh  [Pochodně 3×] [Jídlo]  │
│        [Léčivé bylinky] [—]   │
│        [—] [—]                 │
└────────────────────────────────┘

┌─ POMOCNÍK ─────────────────────┐
│ Hrách (najatý)                 │
│ STR 4  BO 0  Mzda: 2ď/den     │
│ [Dýka d6] [—]                  │
└────────────────────────────────┘
```
- Sloty: tapnutí = detail předmětu
- Drag & drop pro přesouvání předmětů
- STR/DEX/WIL: tapnutí = editace (po boji/odpočinku)

---

### 12. Svět Tab (🗺️)
Sub-záložky nahoře.
```
[Mythic] [Mapa] [NPC] [Thready] [Frakce] [Zvěsti]
```

**12a. Mythic sub-tab:**
```
CF: 5  ████░░░░░  (min 1, max 9)

NPC Seznam (9/25):
  Hrách (1×) · Šedivec (3×!) · Líska (2×)
  Kříž (1×) · Krysy (2×)

Thread Seznam (3/25):
  Kočičí daň (2×) ███░░ 3/10
  Adino zajetí (1×) █░░░ 1/10

Keyed Scenes:
  ⏳ Šedivec zaútočí (trigger: jeho cíl splněn)

Adventure Features:
  Medové úly · Kočičí území · Tajná cesta
```

**12b. NPC sub-tab:** Karty NPC s popisem, vztah k postavě, počet výskytů
**12c. Thready sub-tab:** Progress bary, popis, Discovery Check tlačítko
**12d. Mapa sub-tab:** Hexcrawl mapa (later — jen placeholder)

---

## INTERAKCE A ANIMACE

### Bottom sheet chování:
- Vysune se zespodu s animací (300ms ease-out)
- Handle nahoře — swipe dolů = zavřít
- Tapnutí na dim overlay = zavřít
- Sheet NAHRADÍ klávesnici (ne otevře nad ní)
- Po zavření sheetu + vložení bloku → klávesnice se vrátí

### Inline blok chování:
- Po vložení: krátká highlight animace (0.5s fade žlutého pozadí)
- Tapnutí na blok: zobrazí detail (expand na celou šířku s více info)
- Dlouhé podržení: nabídka (smazat, upravit, znovu hodit)

### Editor přechody:
- Otevření klávesnice: header + bottom nav zmizí animací nahoru/dolů
- Zavření klávesnice: header + bottom nav se vrátí
- Scrollování v editoru: smooth, momentum

---

## CO PENCIL NEMÁ ŘEŠIT
- TipTap editor logiku (inline bloky jsou TipTap extensions)
- Herní mechaniky (Fate Chart, kostky, tabulky)
- Databázi (Dexie.js)
- Offline/PWA
- State management

Pencil řeší POUZE vizuální komponenty — jak vypadají, rozměry, barvy, layout.
Ty se pak napojí na logiku přes React props/callbacks.

---

## DOPORUČENÝ POSTUP
1. Začni s App Shell (layout 3 stavů)
2. Pak Bottom Navigation + Header
3. Pak Akční Toolbar (oba stavy)
4. Pak Bottom Sheets (Fate Q první — nejpoužívanější)
5. Pak Inline bloky (jako samostatné karty)
6. Pak Postava tab
7. Pak Svět tab
8. Nakonec: animace a přechody
