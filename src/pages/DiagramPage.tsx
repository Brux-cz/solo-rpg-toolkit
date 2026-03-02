import { useState, useRef, useEffect } from "react";

interface Description {
  title: string;
  text: string;
}

const DESCRIPTIONS: Record<string, Description> = {
  _intro: {
    title: "Solo RPG Toolkit — Kompletní přehled",
    text: `Toto je diagram aplikace pro sólové hraní stolních RPG (Mausritter + Mythic GME 2. edice).

Hráč je zároveň vypravěč — nemá Game Mastera. Místo toho používá sadu mechanik a nástrojů z Mythic GME, které simulují rozhodování GM a vnáší do příběhu nepředvídatelnost.

HLAVNÍ PROBLÉM: Při sólovém hraní se hromadí informace — NPC, osady, frakce, úkoly, příběhové linky. Na papíře se v tom hráč ztrácí. Navíc Mythic pracuje s AKTIVNÍMI SEZNAMY, na které mechaniky přímo cílí — to papír prostě nezvládne.

TŘI VRSTVY APLIKACE:

1. KAMPÁŇOVÁ WIKI (střed) — propojená databáze entit + mechanické seznamy NPC a Threads, na které cílí náhodné události

2. CYKLUS SCÉNY (kolem wiki) — strukturovaný postup: připrav → testuj chaos → urči typ → hraj → ukonči → bookkeeping → opakuj

3. PANEL NÁSTROJŮ (vlevo) — Fate Chart, Meaning Tables, generátory, Detail Check — hráč je použije kdykoli potřebuje

KLÍČOVÝ MECHANISMUS: Chaos Faktor (1-9) prolíná vším. Ovlivňuje Fate Chart (pravděpodobnosti), test scény (typ), random events (doubles) a celkové tempo příběhu.`,
  },

  // === WIKI ===
  wiki_bg: {
    title: "Kampáňová Wiki",
    text: `Jádro aplikace. Propojená databáze VŠECH entit kampaně.

Klíčová hodnota: PROPOJENÍ. NPC není jen řádek — patří do osady, je členem frakce, dal hráči úkol, byl potkán ve scéně 5.

DŮLEŽITÉ: Wiki obsahuje dva typy dat:

1. PASIVNÍ ENTITY — postava, osady, frakce, předměty, deník. Jsou to zápisky, které hráč čte a upravuje.

2. AKTIVNÍ MECHANICKÉ SEZNAMY — NPC Seznam a Thread Seznam. Na ty přímo cílí mechaniky Mythic (Event Focus, Random Events). Mají váhy, bloky po 5 řádcích, vlastní kostku pro výběr.

Wiki se plní během Bookkeepingu (krok 6) a čte při přípravě scény (krok 1). Propojení entit je to, co papír neumí — 50 NPC rozházených po osadách, frakcích a scénách.`,
  },
  postava: {
    title: "Postava (hráčova myš)",
    text: `Karta hráčovy postavy. V Mausritteru: vlastnosti (STR, DEX, WIL), slot-based inventář, HP, podmínky (zraněný, vyčerpaný...).

Propojená se vším — kde se nachází, jaké má úkoly, s kým mluvila, co vlastní.`,
  },
  npc_seznam: {
    title: "NPC Seznam (AKTIVNÍ MECHANICKÝ)",
    text: `Tohle NENÍ jen seznam NPC ve wiki. Je to AKTIVNÍ MECHANICKÁ KOMPONENTA, na kterou přímo cílí Mythic.

STRUKTURA: 25 řádků, 5 sekcí po 5. Každý řádek = jeden slot (i opakovaný zápis).

VÝBĚR KOSTKY (podle zaplněných sekcí):
• 1-5 řádků (1 sekce) → žádná kostka sekce, automaticky 1. sekce
• 6-10 řádků (2 sekce) → d4 pro sekci
• 11-15 řádků (3 sekce) → d6 pro sekci
• 16-20 řádků (4 sekce) → d8 pro sekci
• 21-25 řádků (5 sekcí) → d10 pro sekci
Pak VŽDY d10 pro konkrétní řádek v sekci (1-2, 3-4, 5-6, 7-8, 9-10 = 5 řádků).
Pokud kostka ukáže na neaktivní sekci = "Choose" (vyber sám nebo hoď znovu).

VÁŽENÍ (WEIGHTING):
• NPC důležité ve scéně se při bookkeepingu zapíše na seznam ZNOVU (max 3× celkem)
• Každý zápis obsadí řádek → zvětšuje seznam → může zvýšit kostku!
• Příklad: 5 unikátních NPC + 1 důležité zapsané 3× = 7 řádků → aktivuje 2. sekci → d4
• Tohle dělá ze seznamu "paměť" — důležité NPC se vrací častěji

ŠIROKÁ DEFINICE: Můžeš psát i skupiny ("vesničané"), organizace ("Žabí armáda") nebo prostředí ("samotné podzemí").

CLEANUP (úklid): Když se zaplní 25 řádků → přepiš na nový list. NPC s 3 zápisy → 2, zbytek → 1. Pravidlo "I Dunno": pokud NPC padne a nevíš jak ho interpretovat, odstraň ho.

PRÁZDNÝ SEZNAM: Pokud seznam je prázdný a Event Focus na něj cílí → výsledek se mění na Current Context.`,
  },
  thread_seznam: {
    title: "Thread Seznam (AKTIVNÍ MECHANICKÝ)",
    text: `Stejná struktura a mechanika jako NPC Seznam (25 řádků, 5 sekcí, dvoustupňový hod), ale pro PŘÍBĚHOVÉ LINKY.

Thread = něco co se děje a ještě není vyřešené. "Najít ztracenou princeznu", "Zastavit expanzi žabí armády", "Zjistit kdo otrávil studnu".

JAK MYTHIC POUŽÍVÁ THREADS:
• Event Focus "Move Toward A Thread" (51-55) → hoď na seznam → KTERÝ thread se posunul
• Event Focus "Move Away From A Thread" (56-65) → komplikace u konkrétního threadu
• Event Focus "Close A Thread" (66-70) → thread se uzavře (pokud nemá Plot Armor!)

VÁŽENÍ funguje stejně — thread aktivní ve scéně dostane další zápis (max 3×). Každý zápis obsadí řádek a zvětšuje seznam.

CLEANUP: Při zaplnění 25 řádků přepiš. "I Dunno" rule platí i zde.

Pokud je seznam prázdný (začátek hry), mechanika přesměruje na "Current Context".`,
  },
  osady: {
    title: "Osady / Místa",
    text: `Lokace ve světě — osady, města, jeskyně, lesy, body zájmu. Každé místo má popis, obyvatele (NPC), události (scény), úkoly.

Propojení: osada není bod na mapě, ale živé místo s obyvateli a příběhy. Klikneš na osadu a vidíš všechny NPC co tam žijí.`,
  },
  frakce: {
    title: "Frakce",
    text: `Organizované skupiny — cechy, bandy, šlechtické rody, náboženské řády. Členové (NPC), cíle, sídla (osady), vzájemné vztahy.

V Mausritteru jsou frakce motor příběhu — jejich konflikty generují hooky a úkoly.`,
  },
  ukoly: {
    title: "Úkoly / Hooky",
    text: `Aktivní i splněné úkoly. Hook = nabídka dobrodružství, důvod proč někam jít. Úkol = konkrétní zadání.

Propojené: od koho (NPC), kde (osada), stav (otevřený/splněný), do které příběhové linky patří (thread).`,
  },
  predmety: {
    title: "Předměty",
    text: `Příběhově důležité předměty — artefakty, dokumenty, poklady. Ne celý inventář, ale věci s příběhovým významem.

Propojené: kde nalezeny, kdo dal, k jakému úkolu se vztahují.`,
  },
  chaos_val: {
    title: "Chaos Faktor (CF)",
    text: `ÚSTŘEDNÍ MECHANIKA celého systému. Číslo 1-9 (výchozí 5), které prolíná VŠÍM:

1. FATE CHART — vyšší CF = větší šance na "Ano". Příklad: otázka "Likely" má při CF 3 práh 35%, ale při CF 7 už 85%. CF mění pravděpodobnosti v reálném čase.

2. TEST SCÉNY — vyšší CF = větší šance na pozměněnou/přerušenou scénu.

3. RANDOM EVENTS — vyšší CF = víc doubles spouští eventy (CF 3 → jen 11,22,33; CF 9 → jakýkoli double).

4. TEMPO PŘÍBĚHU — CF simuluje střídání napětí. Snowball efekt: čím víc chaotické, tím pravděpodobněji bude ještě chaotičtější.

ROZSAH: Striktně 1-9. Nemůže klesnout pod 1 ani přesáhnout 9.

ÚPRAVA po scéně (bookkeeping):
• Postava měla scénu pod kontrolou, dosáhla pokroku → CF -1
• Scéna byla chaotická, postava musela ustoupit → CF +1

VARIANTY: Mid-Chaos, Low-Chaos, No-Chaos (alternativní tabulky pro jiný styl hry).`,
  },
  denik: {
    title: "Deník kampaně",
    text: `Timeline scén. Heslovité záznamy + občas narativní shrnutí pro důležité momenty.

Propojené s entitami — zmíníš NPC, osadu, úkol a automaticky se propojí. Slouží k "kdy jsem potkal toho kupce" nebo "co se stalo v osadě minule".`,
  },
  progress_track: {
    title: "Thread Progress Track",
    text: `VOLITELNÝ systém pro udržení zaměření příběhu na konkrétní cíl. Zabraňuje rozbíhání do šířky.

JAK FUNGUJE:
• Vyber thread a přiřaď mu track: 10 bodů (krátký), 15 (standardní) nebo 20 (komplexní)
• Sleduj Progress Points na stupnici

PROGRESS POINTS:
• Standardní pokrok ve scéně → +2 body
• Flashpoint (dramatický moment) → +2 body
• Discovery Check Table → variabilní: +1, +2 nebo +3 body

FLASHPOINTS (zlomové momenty):
• Dramatické události přímo spojené s threadem
• Můžou vyplynout z hraní nebo být vynucené
• Track je rozdělený do fází po 5 bodech:
  — Track 10 = 2 fáze (bod 5 a 10)
  — Track 15 = 3 fáze (bod 5, 10, 15)
  — Track 20 = 4 fáze (bod 5, 10, 15, 20)
• Pokud v rámci fáze nenastane flashpoint přirozeně, je na konci fáze VYNUCEN (náhodná událost zaměřená na thread)

DISCOVERY CHECK:
• Když se příběh zasekne a nevíš jak pohnout threadem
• Postava vyvine úsilí (konzultace, pátrání...)
• Fate Question "Je něco objeveno?" — šance minimálně 50/50
• Úspěch → Thread Discovery Check Table → typ objevu + bonusové body (+1 až +3)

PLOT ARMOR:
• Dokud nedosáhneš konce stupnice, thread NEMŮŽE být náhodně uzavřen
• I když Event Focus řekne "Close A Thread" — musíš interpretovat jako komplikaci
• Na konci tracku (bod 10/15/20) nastává ZÁVĚR (Conclusion) → Plot Armor zmizí → generuješ dramatickou scénu, ve které je konečně možné vlákno uzavřít`,
  },

  // === CYKLUS SCÉNY ===
  ocekavani: {
    title: "1. Očekávání — Co by se mělo stát?",
    text: `První krok cyklu. Hráč určí co by se logicky mělo dít dál.

ZPŮSOBY:
• Vlastní nápad ("postava jde do města prodat kořist")
• Meaning Tables — hodí dvojici slov a interpretuje
• Metoda 4W (Kdo, Co, Kde, Proč)
• Generátory z knih

V tomto kroku hráč ČTE Z WIKI — podívá se na aktivní threads, kde je postava, co je rozehrané.

SCÉNICKÉ PARAMETRY (volitelné): téma, nálada, atmosféra, počasí — kreativní vodítka pro zarámování scény.

VÝJIMKA: Úplně první scéna kampaně se netestuje (krok 2 se přeskočí). Hráč ji určí třemi způsoby: vlastním nápadem (Inspired Idea), náhodnou událostí (Random Event), nebo Meaning Tables.`,
  },
  test_chaosu: {
    title: "2. Test Chaosu — d10 vs CF",
    text: `Mechanický test: proběhne scéna podle plánu?

Hráč hodí 1d10 a porovná s Chaos Faktorem (CF):

• Hod VYŠŠÍ než CF → Očekávaná (proběhne jak plánováno)
• Hod STEJNÝ nebo NIŽŠÍ, LICHÝ (1,3,5,7,9) → Pozměněná
• Hod STEJNÝ nebo NIŽŠÍ, SUDÝ (2,4,6,8) → Přerušená

PŘÍKLAD (CF = 5):
• Hod 6-10 → Očekávaná
• Hod 1, 3, 5 → Pozměněná (5 = rovná se CF, je lichá → pozměněná)
• Hod 2, 4 → Přerušená

DETAIL: Hod ROVNÝ CF vždy znamená změnu. Jestli Altered nebo Interrupt závisí na paritě CF — pokud je CF liché (5,7,9) → hod rovný CF = Altered. Pokud CF sudé (4,6,8) → hod rovný CF = Interrupt.

Čím vyšší chaos, tím větší šance na překvapení:
• CF 1 → jen hod 1 mění scénu (10% šance)
• CF 5 → hod 1-5 mění scénu (50% šance)
• CF 9 → hod 1-9 mění scénu (90% šance, jen 10 projde!)

VÝJIMKA: Úplně první scéna kampaně se NETESTUJE.`,
  },
  typ_sceny_bg: {
    title: "3. Typ Scény — Tři cesty",
    text: `Výsledek testu chaosu. Každý typ má jiný postup:

OČEKÁVANÁ — proběhne přesně jak hráč plánoval. Nejjednodušší.

POZMĚNĚNÁ — vychází z původního nápadu, ale něco se změní. Hráč má dvě možnosti:
1. Scene Adjustment Table (d10) — konkrétní instrukce
2. Vlastní logická úvaha nebo Meaning Tables

PŘERUŠENÁ — úplně ignoruje původní plán. Generuje se NOVÁ scéna:
1. Event Focus Table (d100) → kategorie (NPC Action, Move Toward Thread, PC Negative...)
2. Pokud kategorie cílí na seznam → hoď na NPC/Thread seznam
3. Meaning Tables → dvojice slov pro detaily
4. Hráč interpretuje v kontextu`,
  },
  scene_adj: {
    title: "Scene Adjustment Table (d10)",
    text: `Konkrétní instrukce pro POZMĚNĚNOU scénu. Hod d10:

1. ODEBER POSTAVU — nejdostupnější postavu ze scény odstraň (např. doprovodný voják se vyděsí a odmítne jít dál)

2. PŘIDEJ POSTAVU — do scény vstoupí NPC ze seznamu nebo nová postava

3. SNIŽ/ODEBER AKTIVITU — zmírni intenzitu nebo zruš (požár je jen trocha kouře)

4. ZVYŠ AKTIVITU — zvyš intenzitu (požár je mnohem větší)

5. ODEBER PŘEDMĚT — odstraň důležitý předmět (pochodně zhasnou)

6. PŘIDEJ PŘEDMĚT — přidej významný předmět (meč na zemi)

7-10. DVĚ ÚPRAVY — hoď dvakrát a zkombinuj

PRAVIDLA:
• Interpretuj v kontextu aktuální situace
• Nemožný výsledek → hoď znovu
• Cíl: scéna zůstane v základu stejná, ale jeden aspekt překvapí`,
  },
  event_focus: {
    title: "Event Focus Table (d100)",
    text: `Určuje ZAMĚŘENÍ náhodné události. Používá se u přerušených scén a random events (doubles). Hod d100:

01-05: REMOTE EVENT — událost mimo přímou přítomnost postavy
06-10: AMBIGUOUS EVENT — záměrně vágní, záhada k prozkoumání
11-20: NEW NPC — do příběhu vstupuje nová postava
21-40: NPC ACTION — existující NPC (ze seznamu!) něco podnikne
41-45: NPC NEGATIVE — něco špatného se stane NPC ze seznamu
46-50: NPC POSITIVE — něco dobrého se stane NPC ze seznamu
51-55: MOVE TOWARD A THREAD — příběh se přiblíží k vyřešení threadu
56-65: MOVE AWAY FROM A THREAD — komplikace u threadu
66-70: CLOSE A THREAD — thread se uzavře (pokud nemá Plot Armor!)
71-80: PC NEGATIVE — něco špatného pro hráčovu postavu
81-85: PC POSITIVE — něco dobrého pro hráčovu postavu
86-100: CURRENT CONTEXT — událost se týká toho co se právě děje

KLÍČOVÉ: Kategorie jako "NPC Action" nebo "Move Toward A Thread" přímo CÍLÍ na mechanické seznamy. Proto jsou seznamy tak důležité.

Pokud seznam je prázdný → výsledek se mění na Current Context.

Po Event Focus vždy následují Meaning Tables pro detaily.`,
  },
  hrani: {
    title: "4. Hraní Scény",
    text: `Nejdelší část. Hráč ví jaká scéna je a hraje ji.

CO SE DĚJE:
• Vyprávění — hráč popisuje co postava dělá
• Fate Questions — "Je tam stráž?" → Fate Chart → Ano/Ne (+ možný random event z doubles!)
• Meaning Tables — inspirace pro detaily
• Generátory z knih — konkrétní výsledky (NPC, poklady)
• Konflikty — mechaniky boje podle Mausritteru
• Detail Check — "Nevím co je v truhle" → hoď na Meaning Tables
• NPC Behavior — ptáš se na NPC → interpretační instrukce

RANDOM EVENTS BĚHEM HRANÍ:
Při KAŽDÉM hodu na Fate Chart se kontrolují doubles!
• Hod je double (11, 22, 33... 99) AND číslice ≤ CF → RANDOM EVENT
• Hod stále odpovídá na původní otázku Ano/Ne
• Event je BONUS navíc → Event Focus → Meaning Tables

Hráč používá nástroje PODLE SEBE — žádné předepsané pořadí.`,
  },
  ukonceni: {
    title: "5. Scéna Vyčerpána",
    text: `Hráč sám rozhodne kdy scéna končí. Mythic nabízí 5 strategií jako "čočky":

• INTEREST (výchozí) — scéna končí když je vyřešena hlavní aktivita (boj skončil, úkol splněn)
• MOOD (nálada) — scéna končí když hráč cítí že "ztrácí dech", chce novou energii. Neřeší se konkrétní úkoly, jen vibe.
• NARRATIVE SHIFT — scéna končí jakmile se objeví zásadní nová informace měnící kontext (spojenec je zrádce!)
• ZMĚNA ČASU/MÍSTA — postava změní lokaci nebo uplyne čas
• DRAMATIC CUT — scéna končí v napínavém momentě ("střih jako ve filmu")

Žádný mechanický trigger — čistě hráčovo rozhodnutí. Appka může připomínat zvolenou strategii, ale neřídí ji.

Po ukončení scény VŽDY následuje Bookkeeping (krok 6).`,
  },
  bookkeeping_bg: {
    title: "6. Bookkeeping — Nejdůležitější krok",
    text: `Administrativa po scéně. V Mythic 2e je bookkeeping KOMPLEXNÍ a KLÍČOVÝ — je to "palivo pro motor hry".

POVINNÉ KROKY:

1. AKTUALIZACE NPC SEZNAMU
   • Přidej nová NPC co se ve scéně objevila
   • Zvyš váhu (další zápis, max 3×) u NPC co byla důležitá
   • "I Dunno" rule: odstraň NPC co nedávají smysl
   • Zaplněný seznam → přepiš (3 zápisy → 2, zbytek → 1)

2. AKTUALIZACE THREAD SEZNAMU
   • Přidej nové příběhové linky
   • Odeber vyřešené/opuštěné
   • Zvyš váhu u aktivních threadů
   • Zkontroluj Thread Progress Track (pokud používáš):
     — Přidej Progress Points za pokrok (+2)
     — Nastal Flashpoint? Pokud ne a konec fáze → vynuť ho
     — Dosáhl track konce → Conclusion, Plot Armor zmizí

3. ÚPRAVA CHAOS FAKTORU
   • Postava měla kontrolu, dosáhla pokroku → CF -1
   • Chaotická scéna, ústup, komplikace → CF +1
   • Min 1, max 9

4. ZÁPIS DO DENÍKU
   • Heslovitý záznam co se stalo
   • Propojení s entitami

5. AKTUALIZACE WIKI
   • Nové osady, frakce, předměty, úkoly
   • Aktualizace existujících entit

Tohle je moment kde appka NEJVÍC pomáhá. Na papíře musí hráč být extrémně disciplinovaný. V appce: přidáš NPC → automaticky v osadě. Zvýšíš váhu → seznam se přepočítá.`,
  },
  zpet: {
    title: "Nová Scéna — Cyklus se opakuje",
    text: `Po bookkeepingu zpět na krok 1. Hráč na základě aktualizované wiki, seznamů a CF vymyslí co dál.

Tento cyklus je páteř celé hry — desítky až stovky opakování za kampaň.`,
  },

  // === NÁSTROJE ===
  nastroje_bg: {
    title: "Panel Nástrojů — Kompletní sada",
    text: `Všechny nástroje Mythic GME na jednom místě. Používáš je KDYKOLI — nejsou navázané na konkrétní krok.

Nástroje se dělí do dvou kategorií:

1. MECHANICKÉ (mají pravidla, ovlivňují hru):
   • Fate Chart — orákulum pro Ano/Ne otázky
   • Test scény — d10 vs CF
   • Scene Adjustment Table — d10 pro pozměněné scény
   • Event Focus — d100 pro náhodné události

2. INSPIRAČNÍ (generují impulz, hráč interpretuje):
   • Meaning Tables — Actions, Descriptions, 45 Elements
   • Detail Check — "co je v truhle?" → Meaning Tables
   • Generátory z knih (Mausritter tabulky)

Společný princip: nástroj dá IMPULZ → hráč vytvoří OBSAH → zapíše do WIKI.`,
  },
  t_fate: {
    title: "Fate Chart (Orákulum)",
    text: `ÚSTŘEDNÍ NÁSTROJ pro otázky Ano/Ne. Simuluje rozhodování GM.

POSTUP:
1. Polož otázku Ano/Ne ("Jsou dveře zamčené?")
2. Zvol pravděpodobnost (Odds/Likelihood):
   Impossible → Nearly Impossible → Very Unlikely → Unlikely → 50/50 → Likely → Very Likely → Nearly Certain → Certain
3. V tabulce najdi TŘI PRAHY (průsečík pravděpodobnosti × CF)
4. Hoď d100 a porovnej:

ČTYŘI TYPY ODPOVĚDÍ (každá buňka má tři prahy: VýjAno / Ano / VýjNe):
• VÝJIMEČNÉ ANO — hod ≤ práh pro Výjimečné Ano
• ANO — hod ≤ práh pro Ano (ale > práh pro Výjimečné Ano)
• VÝJIMEČNÉ NE — hod ≥ práh pro Výjimečné Ne
• NE — hod > práh pro Ano (ale < práh pro Výjimečné Ne)

PŘÍKLADY (formát: VýjAno / Ano / VýjNe):
50/50 při CF 5 → 10/50/91 (hoď ≤10 = výj.ano, ≤50 = ano, ≥91 = výj.ne)
Likely při CF 5 → 13/65/94
Unlikely při CF 5 → 7/35/88
50/50 při CF 9 → 18/90/99 (chaos zvyšuje šance dramaticky!)
Impossible při CF 1 → X/1/81 (1% šance, výjimečné ano nemožné)
Certain při CF 9 → 20/99/X (99% šance, výjimečné ne nemožné)

ELEGANTNÍ VZOR: Tabulka je diagonální — +1 likelihood = +1 CF. Takže Likely při CF 4 = 50/50 při CF 5 = Unlikely při CF 6.

INTERAKCE S CF:
• Vysoký CF (6-9) → vyšší šance na Ano → svět je aktivnější
• Nízký CF (1-4) → vyšší šance na Ne → svět je stabilnější

RANDOM EVENT TRIGGER:
Při KAŽDÉM hodu kontroluj: je to double (11,22,33...99) A je číslice ≤ CF?
→ ANO = Random Event! (Event Focus + Meaning Tables)
→ Hod stále platí jako odpověď na původní otázku

CF 3 → jen 11, 22, 33 spustí event (3 z 9 doubles)
CF 9 → jakýkoli double (9 z 9 doubles)

ALTERNATIVA: Fate Check (2d10 sčítání) — jednodušší, bez tabulky.`,
  },
  t_meaning: {
    title: "Meaning Tables (Tabulky významů)",
    text: `Generátor inspirace. Hodíš d100 dvakrát → dvojice slov → interpretuješ v kontextu.

TŘI VARIANTY:

1. ACTIONS — slovesa/činnosti. Pro "co se děje", "co NPC dělá".
   Příklad: "Fight" + "Outside" → venku vypukne boj

2. DESCRIPTIONS — přídavná jména/popisy. Pro "jak to vypadá", "jaká je nálada".
   Příklad: "Ancient" + "Mysterious" → prastarý záhadný objekt

3. ELEMENTS (45 TÉMATICKÝCH TABULEK) — specifické pro kontext:
   • Character: Appearance, Personality, Motivations, Skills, Identity
   • Dungeon: Descriptors, Traps, Contents
   • Location: City, Starship, Wilderness
   • Magic: Spell Effects, Artifacts
   • Plot: Twists, Cryptic Messages
   • A mnoho dalších...

POUŽITÍ:
• Detail Check ("co je v truhle?" → Objects Elements)
• Event interpretation (Event Focus řekne kategorii → Meaning Tables dodají detaily)
• Scene preparation (inspirace pro novou scénu)
• NPC creation (kdo to je, jak vypadá, co chce)

MINING FOR MEANING: Pokud výsledek nedává smysl → hoď znovu na jinou tabulku, nebo použij jednu Fate Question k upřesnění.`,
  },
  t_detail: {
    title: "Detail Check (Discovering Meaning)",
    text: `Mechanika pro získávání podrobností BEZ otázky Ano/Ne.

KDY POUŽÍT:
• Nemáš tušení co by se mělo stát ("Potkávám NPC v jiné dimenzi")
• Otázka není binární ("Jak to vypadá?", "Co postava dělá?")
• Nechceš řetěz mnoha Ano/Ne otázek

POSTUP:
1. Urči potřebu detailu
2. Vyber Meaning Table (Actions, Descriptions, nebo příslušný Element)
3. Hoď d100 dvakrát → dvojice slov
4. Interpretuj v kontextu → narativní fakt
5. Volitelně: Mining for Meaning nebo doplňující Fate Question

ŽÁDNÝ TEST — není threshold ani pravděpodobnost. Je to přímý hod a interpretace.

PŘÍKLAD: Pirát najde zavřenou truhlu. Netuší co v ní je. Objects Elements → "Natural" + "Moving" → truhla plná živých krabů.

ROZDÍL OD FATE QUESTION: Fate Question testuje pravděpodobnost ("Je v truhle zlato?" → Ano/Ne). Detail Check generuje obsah ("Co je v truhle?" → dvojice slov → interpretace).`,
  },
  t_npc_behav: {
    title: "NPC Behavior Table",
    text: `INTERPRETAČNÍ VRSTVA pro Fate Questions o chování NPC. Není to samostatný hod — je to návod jak číst výsledky orákula.

KDY: Ptáš se "Udělá NPC [konkrétní věc]?" přes Fate Chart.

JAK INTERPRETOVAT VÝSLEDEK:
• ANO → NPC udělá přesně co jsi čekal
• NE → NPC neudělá co jsi čekal. Udělá DALŠÍ NEJPRAVDĚPODOBNĚJŠÍ akci.
• VÝJIMEČNÉ ANO → Očekávaná akce s MNOHEM VĚTŠÍ INTENZITOU
• VÝJIMEČNÉ NE → PŘESNÝ OPAK toho co jsi čekal, nebo jiná akce s velkou intenzitou

POKUD NEVÍŠ co je "další nejpravděpodobnější akce" → hoď na Meaning Tables (Actions nebo Character Actions).

KOMBINACE: Lze doplnit 12 specializovanými Elements tabulkami (Character Identity, Personality, Conversations...) pro komplexní fleshing-out NPC.`,
  },
  t_gen: {
    title: "Generátory (z knih)",
    text: `Konkrétní tabulky z pravidlových knih — Mausritter, Mythic GME, dodatky.

Na rozdíl od Meaning Tables dávají KONKRÉTNÍ výsledky: "mlýn obývaný žábami", "kupec s jedním okem".

Hráč je používá podle potřeby a z různých zdrojů.`,
  },
  t_kostky: {
    title: "Hod Kostkou",
    text: `Základní mechanika — d4, d6, d8, d10, d12, d20, d100.

V Mausritteru: d20 pro save hody, d6 pro poškození.
V Mythic: d100 pro Fate Chart a tabulky, d10 pro test scény a Scene Adjustment.`,
  },

  // === DOPLŇKY ===
  param_bg: {
    title: "Parametry Scény",
    text: `Kreativní vstupy pro zarámování scény:

• TÉMA — o čem scéna bude
• NÁLADA — emoční tón
• ATMOSFÉRA — jak se scéna cítí
• POČASÍ — praktický detail

Nejsou mechanické hodnoty — jsou to vodítka. Můžeš je vymyslet sám nebo vygenerovat (Meaning Tables → Descriptions).`,
  },
  meritko: {
    title: "Měřítko (V hlavě)",
    text: `Mentální přepínač:

ARCHITEKT — velké měřítko. Svět, frakce, osady, hlavní příběh. "Jak funguje tenhle svět?"

PRŮZKUMNÍK — malé měřítko. Boj, hex, dialog, obchod. "Co dělá moje myš teď?"

NENÍ funkce appky. Appka to může podpořit (relevantní nástroje), ale neřídí.`,
  },
  hrac: {
    title: "TY (Hráč + GM)",
    text: `Hráč je středem. Je zároveň hráč i Game Master.

Appka ho NENAHRAZUJE jako GM. Je to sada nástrojů — hráč si bere co potřebuje. Kreativní práce a rozhodování je VŽDY na něm.

Mythic říká: nástroje dávají IMPULZ, hráč tvoří OBSAH. Bez hráčovy interpretace jsou dvojice slov z Meaning Tables jen náhodná slova.`,
  },
  random_event_flow: {
    title: "Random Event Flow",
    text: `Random Events vznikají DVĚMA způsoby:

1. INTERRUPT SCÉNA — test chaosu (krok 2) určí přerušenou scénu
   → Event Focus (d100) → Meaning Tables → nová scéna

2. DOUBLES NA FATE CHART — během hraní (krok 4)
   → Hod na Fate Chart je double (11,22...99)
   → AND číslice ≤ aktuální CF
   → Event Focus (d100) → případně hoď na NPC/Thread seznam → Meaning Tables
   → Event je BONUS k odpovědi Ano/Ne

OBĚ CESTY VEDOU STEJNÝM POSTUPEM:
Event Focus → (seznam NPC/Threads) → Meaning Tables → interpretace

Frekvence roste s chaosem:
CF 1 → jen double 11 (11% doubles = event)
CF 5 → doubles 11-55 (56% doubles = event)
CF 9 → všechny doubles (100% doubles = event)`,
  },
};

interface NodeData {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  label: string;
  bullets?: string[];
}

const NODES: NodeData[] = [
  // === WIKI ===
  { id: "wiki_bg", x: 280, y: 200, w: 420, h: 340, type: "group", label: "KAMPÁŇOVÁ WIKI" },
  { id: "postava", x: 305, y: 238, w: 90, h: 28, type: "core", label: "POSTAVA" },
  { id: "osady", x: 405, y: 238, w: 130, h: 28, type: "core", label: "OSADY / MÍSTA" },
  { id: "frakce", x: 545, y: 238, w: 80, h: 28, type: "core", label: "FRAKCE" },
  { id: "ukoly", x: 305, y: 274, w: 90, h: 28, type: "core", label: "ÚKOLY" },
  { id: "predmety", x: 405, y: 274, w: 130, h: 28, type: "core", label: "PŘEDMĚTY" },
  { id: "denik", x: 545, y: 274, w: 80, h: 28, type: "core", label: "DENÍK" },

  // Mechanické seznamy — zvýrazněné
  { id: "npc_seznam", x: 305, y: 320, w: 170, h: 42, type: "mech_list", label: "NPC SEZNAM\n25 řádků · 5 sekcí · váhy" },
  { id: "thread_seznam", x: 490, y: 320, w: 170, h: 42, type: "mech_list", label: "THREAD SEZNAM\n25 řádků · 5 sekcí · váhy" },

  { id: "chaos_val", x: 305, y: 378, w: 130, h: 32, type: "core_highlight", label: "CHAOS FAKTOR" },
  { id: "progress_track", x: 490, y: 378, w: 170, h: 32, type: "core_progress", label: "PROGRESS TRACK" },

  { id: "propojeni", x: 350, y: 420, w: 260, h: 22, type: "sublabel", label: "vše propojené · váhy · bloky" },

  // Random event flow annotation
  { id: "random_event_flow", x: 770, y: 510, w: 200, h: 50, type: "note_alert", label: "RANDOM EVENT\ndoubles ≤ CF → Event Focus\n→ seznam → Meaning Tables" },

  // === CYKLUS SCÉNY ===
  { id: "ocekavani", x: 360, y: 40, w: 240, h: 50, type: "cycle", label: "1. OČEKÁVÁNÍ\nco by se mělo stát?" },
  { id: "test_chaosu", x: 780, y: 100, w: 210, h: 50, type: "cycle", label: "2. TEST CHAOSU\nd10 vs chaos faktor" },

  { id: "typ_sceny_bg", x: 770, y: 180, w: 230, h: 200, type: "group", label: "3. TYP SCÉNY" },
  { id: "ocekavana", x: 790, y: 212, w: 190, h: 24, type: "scene_type", label: "Očekávaná (hod > CF)" },
  { id: "pozmenena", x: 790, y: 242, w: 190, h: 24, type: "scene_type", label: "Pozměněná (lichý ≤ CF)" },
  { id: "prerusena", x: 790, y: 272, w: 190, h: 24, type: "scene_type", label: "Přerušená (sudý ≤ CF)" },
  { id: "scene_adj", x: 800, y: 306, w: 170, h: 20, type: "sublabel_tool", label: "↳ Scene Adjustment (d10)" },
  { id: "event_focus", x: 800, y: 328, w: 170, h: 20, type: "sublabel_tool", label: "↳ Event Focus (d100)" },
  { id: "scene_meaning", x: 800, y: 350, w: 170, h: 20, type: "sublabel_tool", label: "↳ + Meaning Tables" },

  { id: "hrani", x: 750, y: 420, w: 270, h: 60, type: "cycle_active", label: "4. HRANÍ SCÉNY\nFate Q · Meaning · Detail Check\ndoubles → random events!" },
  { id: "ukonceni", x: 370, y: 580, w: 220, h: 40, type: "cycle", label: "5. SCÉNA VYČERPÁNA" },

  { id: "bookkeeping_bg", x: 20, y: 430, w: 215, h: 130, type: "cycle_write", label: "6. BOOKKEEPING\n· NPC seznam (váhy ±)\n· Thread seznam (váhy ±)\n· Chaos faktor ±1\n· Progress Track\n· Deník + Wiki" },

  { id: "zpet", x: 30, y: 100, w: 210, h: 50, type: "cycle", label: "→ NOVÁ SCÉNA\nzpět na očekávání" },

  // === NÁSTROJE ===
  { id: "nastroje_bg", x: 20, y: 200, w: 215, h: 215, type: "group", label: "PANEL NÁSTROJŮ" },
  { id: "t_fate", x: 40, y: 228, w: 175, h: 28, type: "tool_primary", label: "Fate Chart (d100)" },
  { id: "t_meaning", x: 40, y: 262, w: 175, h: 28, type: "tool_primary", label: "Meaning Tables" },
  { id: "t_detail", x: 40, y: 296, w: 175, h: 24, type: "tool", label: "Detail Check" },
  { id: "t_npc_behav", x: 40, y: 324, w: 175, h: 24, type: "tool", label: "NPC Behavior" },
  { id: "t_gen", x: 40, y: 352, w: 110, h: 24, type: "tool", label: "Generátory" },
  { id: "t_kostky", x: 160, y: 352, w: 55, h: 24, type: "tool", label: "Kostky" },
  { id: "nastroje_sub", x: 40, y: 382, w: 175, h: 22, type: "sublabel", label: "použiješ kdy chceš" },

  // === PARAMETRY ===
  { id: "param_bg", x: 80, y: 15, w: 250, h: 70, type: "group", label: "PARAMETRY SCÉNY" },
  { id: "tema", x: 100, y: 38, w: 100, h: 22, type: "tool", label: "Téma" },
  { id: "nalada", x: 210, y: 38, w: 100, h: 22, type: "tool", label: "Nálada" },
  { id: "atmosfera", x: 100, y: 62, w: 100, h: 22, type: "tool", label: "Atmosféra" },
  { id: "pocasi", x: 210, y: 62, w: 100, h: 22, type: "tool", label: "Počasí" },

  // === META ===
  { id: "meritko", x: 760, y: 30, w: 230, h: 50, type: "note", label: "MĚŘÍTKO (V HLAVĚ)", bullets: ["architekt ↔ průzkumník"] },
  { id: "hrac", x: 410, y: 510, w: 140, h: 36, type: "player", label: "TY (hráč + GM)" },
];

interface EdgeData {
  from: string;
  to: string;
  fromSide: string;
  toSide: string;
  style: string;
}

const EDGES: EdgeData[] = [
  { from: "ocekavani", to: "test_chaosu", fromSide: "right", toSide: "left", style: "solid" },
  { from: "test_chaosu", to: "typ_sceny_bg", fromSide: "bottom", toSide: "top", style: "solid" },
  { from: "typ_sceny_bg", to: "hrani", fromSide: "bottom", toSide: "top", style: "solid" },
  { from: "hrani", to: "ukonceni", fromSide: "left", toSide: "right", style: "solid" },
  { from: "ukonceni", to: "bookkeeping_bg", fromSide: "left", toSide: "right", style: "solid" },
  { from: "bookkeeping_bg", to: "zpet", fromSide: "top", toSide: "bottom", style: "solid" },
  { from: "zpet", to: "ocekavani", fromSide: "right", toSide: "left", style: "solid" },
  { from: "bookkeeping_bg", to: "wiki_bg", fromSide: "right", toSide: "left", style: "dashed" },
  { from: "wiki_bg", to: "ocekavani", fromSide: "top", toSide: "bottom", style: "dashed" },
  { from: "param_bg", to: "ocekavani", fromSide: "right", toSide: "left", style: "dashed" },
  { from: "hrani", to: "random_event_flow", fromSide: "right", toSide: "top", style: "dashed" },
];

function getAnchor(node: NodeData, side: string) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  switch (side) {
    case "top": return { x: cx, y: node.y };
    case "bottom": return { x: cx, y: node.y + node.h };
    case "left": return { x: node.x, y: cy };
    case "right": return { x: node.x + node.w, y: cy };
    default: return { x: cx, y: cy };
  }
}

function ArrowHead({ x, y, side, color = "#555" }: { x: number; y: number; side: string; color?: string }) {
  const s = 6;
  const pts: Record<string, string> = {
    left: `${x},${y} ${x+s},${y-s/2} ${x+s},${y+s/2}`,
    right: `${x},${y} ${x-s},${y-s/2} ${x-s},${y+s/2}`,
    top: `${x},${y} ${x-s/2},${y+s} ${x+s/2},${y+s}`,
    bottom: `${x},${y} ${x-s/2},${y-s} ${x+s/2},${y-s}`,
  };
  return pts[side] ? <polygon points={pts[side]} fill={color} /> : null;
}

function EdgePath({ edge, nodes }: { edge: EdgeData; nodes: NodeData[] }) {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;
  const a = getAnchor(fromNode, edge.fromSide);
  const b = getAnchor(toNode, edge.toSide);
  let path;
  if ((edge.fromSide === "right" && edge.toSide === "left") || (edge.fromSide === "left" && edge.toSide === "right")) {
    const midX = (a.x + b.x) / 2;
    path = `M${a.x},${a.y} L${midX},${a.y} L${midX},${b.y} L${b.x},${b.y}`;
  } else if ((edge.fromSide === "bottom" && edge.toSide === "top") || (edge.fromSide === "top" && edge.toSide === "bottom")) {
    const midY = (a.y + b.y) / 2;
    path = `M${a.x},${a.y} L${a.x},${midY} L${b.x},${midY} L${b.x},${b.y}`;
  } else {
    path = `M${a.x},${a.y} L${b.x},${b.y}`;
  }
  const color = edge.style === "solid" ? "#555" : "#aaa";
  return (
    <g>
      <path d={path} fill="none" stroke={color} strokeWidth={1.4} strokeDasharray={edge.style === "dashed" ? "6 4" : "none"} />
      <ArrowHead x={b.x} y={b.y} side={edge.toSide} color={color} />
    </g>
  );
}

interface StyleDef {
  fill: string;
  stroke: string;
  textFill: string;
  fontWeight: number;
  rx: number;
  fontSize: number;
}

const STYLES: Record<string, StyleDef> = {
  core: { fill: "#2a2a2a", stroke: "#2a2a2a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 9 },
  core_highlight: { fill: "#4a3a2a", stroke: "#8a6a3a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 10 },
  core_progress: { fill: "#2a3a4a", stroke: "#4a6a8a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 9 },
  mech_list: { fill: "#3a1a1a", stroke: "#8a3a3a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 8.5 },
  cycle: { fill: "#faf9f6", stroke: "#555", textFill: "#333", fontWeight: 600, rx: 6, fontSize: 11 },
  cycle_active: { fill: "#e8e5dd", stroke: "#333", textFill: "#222", fontWeight: 700, rx: 6, fontSize: 10 },
  cycle_write: { fill: "#dde8dd", stroke: "#4a7a4a", textFill: "#2a4a2a", fontWeight: 600, rx: 6, fontSize: 9.5 },
  scene_type: { fill: "#f5f3ee", stroke: "#bbb", textFill: "#555", fontWeight: 500, rx: 4, fontSize: 9.5 },
  tool: { fill: "#faf9f6", stroke: "#888", textFill: "#444", fontWeight: 500, rx: 4, fontSize: 9.5 },
  tool_primary: { fill: "#faf9f6", stroke: "#555", textFill: "#222", fontWeight: 700, rx: 4, fontSize: 9.5 },
  sublabel: { fill: "transparent", stroke: "none", textFill: "#aaa", fontWeight: 400, rx: 0, fontSize: 8.5 },
  sublabel_tool: { fill: "transparent", stroke: "none", textFill: "#999", fontWeight: 400, rx: 0, fontSize: 8.5 },
  note: { fill: "#faf9f6", stroke: "#bbb", textFill: "#888", fontWeight: 600, rx: 4, fontSize: 10 },
  note_alert: { fill: "#faf5ee", stroke: "#c89030", textFill: "#6a4a10", fontWeight: 600, rx: 4, fontSize: 8.5 },
  player: { fill: "#faf9f6", stroke: "#333", textFill: "#333", fontWeight: 800, rx: 20, fontSize: 12 },
};

function NodeBox({ node, selected, onSelect }: { node: NodeData; selected: string | null; onSelect: (id: string) => void }) {
  const hasDesc = DESCRIPTIONS[node.id];
  const isSelected = selected === node.id;
  const clickable = !!hasDesc;

  if (node.type === "group") {
    return (
      <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined} style={{ cursor: clickable ? "pointer" : "default" }}>
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={isSelected ? "rgba(100,100,200,0.06)" : "none"} stroke={isSelected ? "#666" : "#ccc"} strokeWidth={isSelected ? 1.5 : 1} strokeDasharray="6 3" rx={6} />
        <text x={node.x + node.w / 2} y={node.y - 6} textAnchor="middle"
          style={{ fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace", fill: isSelected ? "#555" : "#999", fontWeight: 600, letterSpacing: "0.08em" }}>
          {node.label}
        </text>
      </g>
    );
  }
  if (node.type === "note" || node.type === "note_alert") {
    const s = STYLES[node.type];
    return (
      <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined} style={{ cursor: clickable ? "pointer" : "default" }}>
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={isSelected ? "#f0efe8" : s.fill} stroke={isSelected ? "#666" : s.stroke} strokeWidth={isSelected ? 1.5 : 1} rx={s.rx} />
        {node.type === "note" ? (
          <>
            <text x={node.x + 12} y={node.y + 18}
              style={{ fontSize: s.fontSize, fontFamily: "'IBM Plex Mono', monospace", fill: s.textFill, fontWeight: 600 }}>
              {node.label}
            </text>
            {node.bullets?.map((b, i) => (
              <text key={i} x={node.x + 14} y={node.y + 36 + i * 16}
                style={{ fontSize: s.fontSize, fontFamily: "'IBM Plex Mono', monospace", fill: "#999" }}>
                {b}
              </text>
            ))}
          </>
        ) : (
          node.label.split("\n").map((line, i) => (
            <text key={i} x={node.x + node.w / 2} y={node.y + 14 + i * 13} textAnchor="middle"
              style={{ fontSize: s.fontSize, fontFamily: "'IBM Plex Mono', monospace", fill: s.textFill, fontWeight: i === 0 ? 700 : 500 }}>
              {line}
            </text>
          ))
        )}
      </g>
    );
  }

  const s = STYLES[node.type] || STYLES.tool;
  const lines = node.label.split("\n");
  const fontSize = s.fontSize || 10;
  const lineHeight = fontSize + 3.5;
  const totalH = lines.length * lineHeight;
  const startY = node.y + node.h / 2 - totalH / 2 + lineHeight * 0.72;
  const hlStroke = isSelected ? (s.fill.startsWith("#2") || s.fill.startsWith("#3") || s.fill.startsWith("#4") ? "#8888cc" : "#555") : s.stroke;
  const hlWidth = isSelected ? 2.5 : 1.2;

  return (
    <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined} style={{ cursor: clickable ? "pointer" : "default" }}>
      {s.stroke !== "none" && (
        <rect x={node.x} y={node.y} width={node.w} height={node.h} fill={s.fill} stroke={hlStroke} strokeWidth={hlWidth} rx={s.rx} />
      )}
      {lines.map((line, i) => (
        <text key={i} x={node.x + node.w / 2} y={startY + i * lineHeight} textAnchor="middle"
          style={{ fontSize, fontFamily: "'IBM Plex Mono', monospace", fill: s.textFill, fontWeight: i === 0 ? s.fontWeight : Math.min(s.fontWeight, 500), letterSpacing: "0.02em" }}>
          {line}
        </text>
      ))}
    </g>
  );
}

function getTouchDist(t1: { clientX: number; clientY: number }, t2: { clientX: number; clientY: number }) {
  return Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
}

function InfoPanel({ descId, onClose }: { descId: string; onClose: () => void }) {
  const desc = DESCRIPTIONS[descId];
  if (!desc) return null;
  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(460px, 88vw)",
      background: "#faf9f6", borderLeft: "2px solid #333", zIndex: 20,
      display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #e0ddd5",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#222",
          fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.3, paddingRight: 12 }}>
          {desc.title}
        </h2>
        <button onClick={onClose} style={{ background: "#333", color: "#faf9f6", border: "none",
          borderRadius: 4, width: 30, height: 30, fontSize: 15, cursor: "pointer", flexShrink: 0,
          fontFamily: "'IBM Plex Mono', monospace", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ padding: "14px 18px", overflowY: "auto", flex: 1 }}>
        {desc.text.split("\n\n").map((para, i) => (
          <p key={i} style={{ margin: "0 0 12px 0", fontSize: 12.5, lineHeight: 1.65, color: "#444",
            fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "pre-wrap" }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

export function DiagramPage() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<string | null>("_intro");
  const [didMove, setDidMove] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef(pan);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { panRef.current = pan; }, [pan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.min(Math.max(z * (e.deltaY > 0 ? 0.92 : 1.08), 0.3), 3));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDidMove(false);
    if (e.touches.length === 1) {
      setDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX - panRef.current.x, y: e.touches[0].clientY - panRef.current.y };
    } else if (e.touches.length === 2) {
      setDragging(false);
      pinchRef.current = { dist: getTouchDist(e.touches[0], e.touches[1]), zoom };
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setDidMove(true);
    if (e.touches.length === 1 && dragging) {
      setPan({ x: e.touches[0].clientX - dragStartRef.current.x, y: e.touches[0].clientY - dragStartRef.current.y });
    } else if (e.touches.length === 2 && pinchRef.current) {
      setZoom(Math.min(Math.max(pinchRef.current.zoom * (getTouchDist(e.touches[0], e.touches[1]) / pinchRef.current.dist), 0.3), 3));
    }
  };
  const handleTouchEnd = () => { setDragging(false); pinchRef.current = null; };
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { setDragging(true); setDidMove(false); dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) { setDidMove(true); setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }); }
  };
  const handleMouseUp = () => setDragging(false);
  const handleSvgClick = () => { if (!didMove) setSelected(null); };
  const handleNodeSelect = (id: string) => { if (!didMove) setSelected(id === selected ? null : id); };

  const btnStyle: React.CSSProperties = {
    width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 18,
    fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", WebkitTapHighlightColor: "transparent", userSelect: "none",
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh", background: "#faf9f6",
      fontFamily: "'IBM Plex Mono', monospace", position: "relative", overflow: "hidden", touchAction: "pan-y" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "8px 14px",
        background: "rgba(250,249,246,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e0ddd5",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#333", letterSpacing: "0.05em" }}>
          SOLO RPG — MYTHIC GME 2E + MAUSRITTER
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setSelected("_intro")} style={{
            fontSize: 9, padding: "4px 10px", background: selected === "_intro" ? "#555" : "#333",
            color: "#faf9f6", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            O PROJEKTU
          </button>
          <span style={{ fontSize: 10, color: "#888" }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 20, right: selected ? "min(476px, calc(88vw + 16px))" : 16,
        display: "flex", flexDirection: "column", gap: 6, zIndex: 10, transition: "right 0.2s" }}>
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} style={btnStyle}>+</button>
        <button onClick={() => setZoom(z => Math.max(z * 0.8, 0.3))} style={btnStyle}>−</button>
        <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} style={{ ...btnStyle, fontSize: 11 }}>↺</button>
      </div>

      <svg width="100%" height="100%" style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onClick={handleSvgClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="0.5" fill="#ddd" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {EDGES.map((edge, i) => <EdgePath key={i} edge={edge} nodes={NODES} />)}
          {NODES.map(node => <NodeBox key={node.id} node={node} selected={selected} onSelect={handleNodeSelect} />)}
        </g>
      </svg>

      <div style={{ position: "absolute", bottom: 6, left: 14, fontSize: 9, color: "#bbb" }}>
        KLIKNI NA BLOK PRO DETAIL · TÁHNI · PINCH ZOOM · CTRL+SCROLL
      </div>

      {selected && <InfoPanel descId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
