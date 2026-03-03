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

1. PASIVNÍ ENTITY — postava, pomocník, NPC, osady, frakce, threads, úkoly, předměty, deník. Jsou to zápisky, které hráč čte a upravuje.

2. AKTIVNÍ MECHANICKÉ SEZNAMY — NPC Seznam a Thread Seznam. Na ty přímo cílí mechaniky Mythic (Event Focus, Random Events). Mají váhy, bloky po 5 řádcích, vlastní kostku pro výběr.

PROPOJENÍ DVOU SVĚTŮ: Každý řádek mechanického seznamu odkazuje na wiki entitu. NPC "Kupec Hrách" má wiki kartu (popis, lokace, frakce) A zároveň řádek(y) v NPC Seznamu (váha 1-3×). Thread "Najít princeznu" má wiki kartu (popis, progress track) A řádek(y) v Thread Seznamu.

Wiki se plní během Bookkeepingu (krok 6) a čte při přípravě scény (krok 1). Propojení entit je to, co papír neumí — 50 NPC rozházených po osadách, frakcích a scénách.`,
  },
  postava: {
    title: "Postava (hráčova myš)",
    text: `Karta hráčovy postavy. Centrální entita — propojená se vším.

IDENTITA:
• Jméno: vlastní + mateřské (např. "Ada Katzenreiserová")
• Původ (Background): určen z tabulky podle počátečních BO × ďobků. Ne volná volba — výsledek říká co myš dělala předtím (kuchyňský slídil, dráteník, uprchlík z klece...) a určuje 2 startovní předměty.
• Rodné znamení (Birthsign): hod d6. Hvězda, Kolo, Žalud, Matka... Každé nese dvojici povahových rysů (statečná/zbrklá, pečující/ustaraná).
• Srst: barva + vzor (čokoládová mourovatá, namodralá tečkovaná...)
• Výrazný rys: páska přes oko, tělo plné jizev, zakroucený ocásek, dredy...

ATRIBUTY (rozsah 2-12, generovány 3d6 keep 2):
• STR (Síla) — fyzická síla a odolnost
• DEX (Mrštnost) — rychlost a obratnost
• WIL (Vůle) — odhodlání a kouzlo osobnosti

BODY OCHRANY (BO):
• Aktuální / Maximum (generováno d6 na úroveň)
• BO NENÍ zdraví — je to schopnost vyhnout se zranění
• Když BO = 0, poškození jde přímo do STR!
• Pokud STR poškozena → záchrana na STR, jinak kritické zranění

INVENTÁŘ (10 slotů, vizuální grid):
• Packy: 2 sloty (silnější / slabší) — aktivně držené, volná akce k použití
• Tělo: 2 sloty — rychlý přístup, výměna s packami = volná akce
• Batoh: 6 slotů — vyndání v boji stojí akci!
• Velké předměty (obouruční zbraně, těžká zbroj) zabírají 2 sloty
• PODMÍNKY ZABÍRAJÍ SLOT: Hlad, Vyčerpání, Poranění, Vystrašení, Pomatení — každý stav je "kartička" v inventáři
• Přetížení (víc věcí než slotů): nemůže běhat, záchrany s nevýhodou

PODMÍNKY (stavy):
• Hlad — nezjedl celý den → zabírá slot → zbavíš se jídlem
• Vyčerpání — nespal 6 hodin → zbavíš se dlouhým odpočinkem
• Poranění — kritické zranění v boji → ošetření + krátký odpočinek
• Vystrašení — neúspěšná záchrana WIL → kouzlo nebo odpočinek
• Pomatení — neúspěšné kouzlení → odpočinek
• Úplný odpočinek (týden v bezpečí) odstraní většinu stavů

KURÁŽ (od úrovně 2):
• Speciální sloty (1 na úr.2, roste až na 3 na úr.5+)
• Podmínka v kuráži NEMÁ negativní efekt, ale stále existuje
• Musíš ji stejně odstranit splněním podmínky

PENÍZE:
• Ďobky (Pips) — základní a jediná měna
• Prvních 250 ďobků zdarma (po kapsách)
• Každých dalších 250 zabírá 1 slot v inventáři
• Banka v osadě: úschova s 1% poplatkem

POSTUP (leveling):
• zk. = 1 za každý ďobek pokladu přineseného do bezpečí
• Bonus: 1 zk. za 10 ďobků utracených pro komunitu
• Úroveň 2 = 1000 zk., úroveň 3 = 3000, úroveň 4 = 6000
• Při postupu: d20 vs každý atribut (vyšší = +1), nový hod na BO

LÉČENÍ (tři typy odpočinku):
• Krátký (10 min, voda): obnoví d6+1 BO
• Dlouhý (6 hod, jídlo + spánek): obnoví všechny BO. Pokud BO plné → d6 bodů jedné vlastnosti.
• Úplný (týden v bezpečí): obnoví VŠE + odstraní většinu stavů

PROPOJENÍ: aktuální lokace (osada), úkoly, zmínky v deníku, předměty.`,
  },
  pomocnik: {
    title: "Pomocník (Hireling)",
    text: `Najatý spolucestující. V Mausritteru NENÍ overkill — pomocníci slouží jako "nosiči" pro poklady a rozšiřují omezenou kapacitu inventáře.

IDENTITA:
• Jméno, typ (světlonoš, dělník, zbrojmyš, rytíř, špion...)

ATRIBUTY (2d6 na každý, tedy 2-12):
• STR, DEX, WIL

BODY OCHRANY:
• BO aktuální / max (d6)

INVENTÁŘ (6 slotů):
• Packy: 2 sloty
• Tělo: 2 sloty
• Batoh: 2 sloty (méně než hráč!)
• Podmínky zabírají slot stejně jako u hráče

PLATBA A MORÁLKA:
• Denní mzda v ďobcích (světlonoš 1ď, zbrojmyš 10ď, rytíř 25ď)
• Morálka: stres, nezaplacení nebo nebezpečí → záchrana WIL, jinak uteče
• Věrní pomocníci hází s výhodou

VERBOVÁNÍ:
• Hledání v osadě (1 den)
• Záchrana na WIL nebo zaplacení 20ď
• Počet dostupných závisí na typu (d6 světlonošů, d3 rytířů)

POSTUP:
• zk. = 1 za každý ďobek vyplacený NAD rámec mzdy
• Úroveň 2 při 1000 zk.

PROČ JE DŮLEŽITÝ: Inventář v Mausritteru je extrémně omezený (10 slotů). Pomocník s 6 sloty výrazně zvyšuje kapacitu — víc pokladů = víc zk. = rychlejší postup.`,
  },
  npc: {
    title: "NPC (Wiki záznam)",
    text: `Každá postava ve světě (mimo hráčovu myš) — od kupce přes šlechtice po kočičího pána.

POLE:
• Jméno (např. "Kupec Hrách", "Lord Blín")
• Popis — kdo to je, jak vypadá, čím je zajímavý
• Lokace (odkaz na osadu) — kde žije/operuje
• Frakce (odkaz) — ke komu patří
• Vztah k hráči: přátelský / neutrální / nepřátelský
• Reakce (z 2d6 tabulky): agresivní → nápomocná
• Poznámky — tajemství, plány, citáty

BOJOVÉ STATISTIKY (volitelné, pro tvory/rivaly):
• STR, DEX, WIL
• BO, zbroj
• Útok (kostka), kritické zranění
• Motivace ("co chce")

PROPOJENÍ:
• Osada kde žije
• Frakce ke které patří
• Úkoly co zadal
• Scény kde se objevil (z deníku)
• Pozice v mechanickém NPC Seznamu (váha 1-3×)

DŮLEŽITÉ: NPC má DVĚ TVÁŘE v appce:
1. Wiki záznam (tento) — kdo to je, kde žije, co ví
2. Řádek(y) v NPC Seznamu (mechanický) — váha pro Mythic hody
Obojí musí být propojené. Přidáš NPC do wiki → nabídne přidání do seznamu.`,
  },
  thread: {
    title: "Thread / Příběhová linka (Wiki záznam)",
    text: `Otevřená zápletka — něco co se děje a ještě není vyřešené.

PŘÍKLADY: "Najít ztracenou princeznu", "Zastavit expanzi žabí armády", "Zjistit kdo otrávil studnu".

POLE:
• Název
• Popis — o co jde, jaké jsou sázky
• Stav: aktivní / vyřešený / opuštěný
• Typ: hlavní / vedlejší / osobní
• Poznámky — postup, stopy, komplikace

VOLITELNÝ PROGRESS TRACK:
• Délka: 10 (krátký), 15 (standardní), 20 (komplexní)
• Aktuální body
• Fáze (po 5 bodech)
• Flashpointy (zaznamenané/vynucené)
• Plot Armor status (aktivní / zrušen při Conclusion)

PROPOJENÍ:
• NPC zapojené do threadu
• Osady kde se thread odehrává
• Úkoly spojené s threadem
• Scény z deníku kde se thread posunul
• Pozice v mechanickém Thread Seznamu (váha 1-3×)

DŮLEŽITÉ: Thread má DVĚ TVÁŘE v appce:
1. Wiki záznam (tento) — popis, kontext, progress
2. Řádek(y) v Thread Seznamu (mechanický) — váha pro Mythic hody
Obojí propojené. Event Focus "Move Toward Thread" → hoď na seznam → klikni na výsledek → otevře wiki záznam.`,
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

PRÁZDNÝ SEZNAM: Pokud seznam je prázdný a Event Focus na něj cílí → výsledek se mění na Current Context.

PROPOJENÍ S WIKI: Každý řádek seznamu odkazuje na NPC wiki záznam (👤). Klikneš na řádek → otevře wiki kartu s popisem, lokací, vztahem. Seznam je MECHANIKA, wiki je OBSAH.`,
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

Pokud je seznam prázdný (začátek hry), mechanika přesměruje na "Current Context".

PROPOJENÍ S WIKI: Každý řádek seznamu odkazuje na Thread wiki záznam (🧵). Klikneš na řádek → otevře wiki kartu s popisem, progress trackem, Plot Armor stavem. Seznam je MECHANIKA, wiki je OBSAH.`,
  },
  osady: {
    title: "Osady / Místa",
    text: `Lokace ve světě hry. Od farem po velkoměsta, od jeskyní po hexcrawl body zájmu.

STRUKTURA OSADY:
• Velikost (2d6, použij nižší): 1=Farma (1-3 rodiny), 2=Křižovatka (3-5 rodin), 3=Víska (50-150 myší), 4=Vesnice (150-300), 5=Město (300-1000), 6=Velkoměsto (1000+)
• Společenské zřízení (d6 + velikost) — kdo vládne (stařešinové, šlechtic, cech)
• Výrazný prvek — unikátní rys (dům v kravské lebce...)
• Obyvatelé — zvyklosti (vyšívané oblečení, rituální stříhání ocásků...)
• Živnost — čím osada obchoduje (uleželý sýr, hedvábí, těžba cínu...)
• Událost — co se děje při příchodu hráčů (svatba, epidemie, unášení myší...)
• Hospoda — název a specialita
• Jména (d12+d12) — kombinace začátků a konců (Dubov, Měsíční Hrob, Černá Lhota...)

MECHANICKÝ DOPAD VELIKOSTI:
• Určuje dostupné pomocníky (rytíře ve farmě nenajdeš!)
• Určuje společenské zřízení
• Ovlivňuje dostupnost služeb a obchodu

SLUŽBY A CENÍK (v ďobcích):
• Ubytování: společná ubikace 1ď/noc, soukromý pokoj 5ď, horká koupel 2ď
• Jídlo: 1 jídlo 2ď, cestovní zásoby 5ď, hostina 50ď, prohýřená noc 100ď
• Léčení: úplný odpočinek (týden) 20ď
• Banka: úschova s 1% poplatkem za výběr
• Verbování: 20ď nebo záchrana WIL. Mzda: světlonoš 1ď/den, zbrojmyš 10ď, rytíř 25ď
• Doprava: králičí vůz 5ď/hex, holub 200ď/hex
• Prodej kouzel: plně nabité kouzlo za d6×100ď

HEXCRAWL MAPA (typicky 5×5 hexů, 1 hex = 1 míle):
• Terén (d6): 1-2 otevřená krajina, 3-4 les, 5 řeka, 6 lidské město
• Body zájmu (d20 per terén): liščí nora, obličej v prastarém dubu, betonová přehrada, vodopády...
• Detaily (d6/d8): skrýš loupežníků, vílí kruh, zřícená vzducholoď...

PROPOJENÍ: NPC obyvatelé, frakce, úkoly, scény z deníku, předměty.`,
  },
  frakce: {
    title: "Frakce",
    text: `Mocné síly ve světě, které žijí vlastním životem. V Mausritteru NEJSOU jen popisné — mají vlastní MECHANIKU s progress trackem.

STRUKTURA FRAKCE:
• Název (Kočičí pán Baltazar, Cech tunelářů, Krysí loupežníci...)
• Popis — kdo to je, jak fungují
• ZDROJE — odrážejí moc a vliv (bohatství, armáda žoldáků, magie, tajná skrýš, solidarita s dělnictvem...). Pokud má frakce 3+ zdroje, může utvořit tlupu (warband).
• CÍLE — o co frakce usiluje. Každý cíl má 2-5 POLÍČEK POKROKU podle složitosti. Cíle by měly být provázané s jinými frakcemi (soupeření o zdroje).

MECHANIKA MEZI SEZENÍMI (Tah frakcí):
Po každém herním sezení se vyhodnocuje pokrok frakcí:
1. Hod 1d6 za každou frakci
2. Modifikátory: +1 za každý relevantní zdroj, -1 za každý zdroj konkurenční frakce
3. Výsledek 4-5 → 1 políčko pokroku. Výsledek 6+ → 2 políčka.
4. Dokončení cíle (všechna políčka) → frakce získá NOVÝ ZDROJ (roste!). Pokud cíl škodil jiné frakci → ta může přijít o zdroj.

ZÁSAHY HRÁČŮ:
• Pomoc frakci → Průvodce zaškrtne 1-3 políčka pokroku
• Zdržení frakce → Průvodce vymaže 1-3 políčka
• Přímý útok → frakce může přijít o zdroje
• Cíle frakcí se objevují v tabulce zvěstí (hooky pro hráče!)

PŘÍKLADY:
• Kočičí pán (hrůzostrašnost + žoldáci) → cíl: vymáhat úplatky
• Myší šlechtic (rytíři + sklady) → cíl: vybírat daně
• Krysí loupežníci (gang + skrýš) → cíl: ovládnout obchodní trasu
• Cech tunelářů (solidarita) → cíl: založit svobodnou obec
• Kultisti → cíl: přivolat prastarého boha

PROPOJENÍ:
• Členové (NPC)
• Sídla (osady)
• Úkoly / hooky spojené s cíli frakce
• Konflikty s jinými frakcemi

PRO APPKU: Frakce potřebuje vlastní progress track pro cíle (2-5 políček), seznam zdrojů, a mechaniku hodu d6 + modifikátory. Tohle se vyhodnocuje při bookkeepingu nebo mezi sezeními.`,
  },
  ukoly: {
    title: "Úkoly / Hooky / Dobrodružná místa",
    text: `Aktivní i dokončené úkoly, příběhové hooky a dobrodružná místa.

GENEROVÁNÍ ZÁPLETEK (Semínka dobrodružství):
Tabulka d66 × 3 hody:
1. Tvor (d66): Rybář, Kočičí pán, Šlechtic...
2. Problém (d66): Obviněn ze zločinu, Chce se nechat bavit...
3. Komplikace (d66): Může za to pomocník, Uvěznil hráče...
→ Kombinace: "Kočičí pán se chce nechat bavit a uvěznil hráčské myši"

POČÁTEČNÍ HÁČKY (d6): Pro začátek kampaně:
• Hledání ztraceného člena rodiny
• Vyšetřování na příkaz šlechtice
• Úkryt před bouřkou
• ... a další

TABULKA ZVĚSTÍ (d6 per oblast):
• 1-3: PRAVDIVÉ zvěsti
• 4-5: ČÁSTEČNĚ PRAVDIVÉ
• 6: NEPRAVDIVÁ
Propojení s frakcemi: cíle frakcí se objevují jako zvěsti! Hráči se tak dozvídají o plánech frakcí a mohou zasáhnout.

DOBRODRUŽNÁ MÍSTA (dungeony):
Generování krok za krokem:
1. Téma: typ budovy (chrám kultu, stoka, čarodějova věž)
2. Chátrání: zatopení, magická nehoda, plísně
3. Místnosti (3d6 per místnost):
   • d6 Typ: prázdná / překážka / past / hlavolam / doupě
   • d6 Tvor: šance na bytost (liší se podle typu)
   • d6 Poklad: šance na cennosti
4. Překážky (d8): zamčené dveře, strmé lezení, zaplavená chodba
5. Pasti (d8): padající dveře, elektrifikovaná voda, výbušný plyn
6. Hlavolamy (d6): elektrifikovaná podlaha, míchání tekutin, poklad ve studni
7. Doupata (d6): dočasný tábor, trvalý domov s mladými

POKLADY (tabulky drobností → cenných → neobvyklých):
• Drobnosti: zlatý prsten, soudek brandy
• Cenné: magické předměty
• Neobvyklé: mapa k dalšímu pokladu
• Hod 2d20, +kostky za nebezpečnost/šelmu/magii

POLE ÚKOLU V APPCE:
• Název, popis, stav (otevřený/splněný/neúspěšný)
• Zadavatel (NPC), lokace (osada), thread (příběhová linka)
• Typ: hook / quest / dungeon / zvěst
• Poznámky`,
  },
  predmety: {
    title: "Předměty / Vybavení / Kouzla",
    text: `Vše co může postava vlastnit, najít nebo koupit. V Mausritteru je inventář JÁDRO hry.

ZBRANĚ (kostka zranění / sloty / cena):
• Improvizovaná: d6, 1 slot, 1ď (škrtá tečku použití!)
• Lehká (dýka, jehla): d6, 1 slot, 10ď. Dvě najednou → bereš lepší výsledek
• Střední (meč, sekera): d6 jednou rukou / d8 oběma, 20ď
• Těžká (kopí, hákopí): d10, obě packy, 40ď
• Lehká střelná (prak): d6, 1 slot, 10ď
• Těžká střelná (luk): d8, obě packy, 40ď

ZBROJE (snižují zranění o 1):
• Lehká (150ď): 1 slabší packa + 1 tělo
• Těžká (500ď): 2 sloty těla

KOUZLA — FYZICKÉ PŘEDMĚTY:
• Jsou to přírodní duchové uvěznění v runách na OBSIDIÁNOVÝCH DESTIČKÁCH
• Sesílání: drž v pacce, čti nahlas, zvol moc (1-3)
• Mechanika: hoď tolik d6 kolik je moc. Za každou 4-6 škrtni tečku použití.
• Účinek závisí na POČTU kostek a SOUČTU hodnot
• RIZIKO (Vymknutí): za každou hozenou 6 → d6 zranění do WIL. Neúspěšná záchrana WIL → Pomatení
• Dobíjení: specifický rituál (Ohnivou kouli péct 3 dny v plamenech)
• 15 základních kouzel: Ohnivá koule, Zahojení, Kouzelná střela, Strach, Tma, Neviditelnost, Přízračný brouk...

MAGICKÉ PŘEDMĚTY:
• Kouzelné meče: tečka se škrtne jen na 6 (odolnější!). Unikátní schopnosti (Hadí zub → zranění do DEX). Šance 1 ze 6 na PROKLETÍ (d6 tabulka kleteb). Prokletý meč nelze odložit — sňatí vyžaduje splnění úkolu (např. usmířit se s nepřítelem).
• Artefakty/Drobnosti: Přízračná lucerna, Mluvící ulity, Dýchací slámka...
• Generování: 2d20, +kostky za nebezpečnost/šelmu/magii

STANDARDNÍ VYBAVENÍ (výběr, ceny v ďobcích):
• Pochodeň 10, Lucerna 50, Elektrická lampa 200
• Lano/Motouz 40, Páčidlo 10, Šperháky 100
• Jehla 20, Rybářský háček 20, Zápalky 80
• Stan 80, Síť 10, Zámek 20, Jed 100
• Kniha prázdná 300, Hudební nástroj 200

CO JE V APPCE "PŘEDMĚT" (wiki entita):
• Příběhově důležité předměty (artefakty, quest itemy, kouzla)
• NE celý inventář (ten je na kartě postavy v 10 slotech)
• Pole: název, popis, kdo má, kde nalezeno, od koho, k čemu
• Kouzlo: navíc počet teček, rituál dobíjení, efekt

REFERENČNÍ CENÍK (statická tabulka v appce, ne wiki entity):
• Zbraně, zbroje, vybavení — viz ceník výše
• Hráč konzultuje při nákupu v osadě`,
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
    title: "Deník kampaně (Scény)",
    text: `Chronologický záznam všech scén. Páteř příběhu — "co se stalo a kdy".

KAŽDÁ SCÉNA OBSAHUJE:
• Číslo scény (automatické)
• Typ: očekávaná / pozměněná / přerušená
• CF na začátku a na konci scény (sledování trendu)
• Shrnutí — heslovité "co se stalo" (povinné)
• Narativní text — delší popis pro důležité momenty (volitelné)
• Zmíněné entity — NPC, osady, předměty, úkoly co se ve scéně objevily

PROPOJENÍ:
• Klikneš na NPC v deníku → detail NPC
• Klikneš na osadu → detail osady
• Filtr: "ukaž mi všechny scény kde se objevil NPC Kupec Hrách"
• Timeline: vizuální přehled jak se CF vyvíjel, kde byly interrupty

HODNOTA: Bez deníku po 20 scénách nevíš co se stalo ve scéně 3. S deníkem máš kompletní příběh s propojením na vše.`,
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

6. TAH FRAKCÍ (mezi sezeními nebo po X scénách)
   • Hod d6 za každou frakci s cílem
   • +1 za relevantní zdroj, -1 za zdroj konkurenční frakce
   • Výsledek 4-5 → 1 políčko, 6+ → 2 políčka
   • Dokončený cíl → nový zdroj pro frakci
   • Zásah hráčů ±1-3 políčka podle vlivu akce

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

  // === PRAVIDLA MAUSRITTER (reference) ===
  boj: {
    title: "Boj (Mausritter pravidla)",
    text: `Rychlý a smrtelný. Útoky VŽDY ZASAHUJÍ — žádný hod na zásah!

INICIATIVA:
• Překvapení → hráči jednají první
• Jinak: záchrana na DEX. Úspěch = jednáš před nepřítelem.
• Pořadí zůstává celý boj.

AKCE V KOLE:
• Pohyb až 30 cm + JEDNA akce (útok, sesílání, vyjednávání, útěk)
• Výměna předmětu z těla do packy = volná akce
• Vyndání z batohu = celá akce!

ÚTOK:
• Hoď kostkou zbraně, odečti zbroj nepřítele, zbytek = zranění
• Zeslabený (kryt, omezený pohyb): jen d4
• Zesílený (lest, slabina): d12

ZRANĚNÍ:
1. Nejdřív se odečítá z BO
2. Když BO = 0, jde do STR → ZÁCHRANA NA STR
3. Neúspěch = Poranění + vyřazení z boje
4. STR = 0 → SMRT
5. Vyřazená myš bez ošetření do 6 směn (1 hodina) → SMRT
6. DEX = 0 → nemůže se hýbat. WIL = 0 → nepříčetnost.

MORÁLKA NEPŘÁTEL (NPC):
• Záchrana na WIL při jasné nevýhodě NEBO prvním kritickém zranění
• Neúspěch → vzdá se nebo uteče
• V appce: tlačítko "Morale check" u NPC v boji

ZÁCHRANNÉ HODY:
• Hoď d20 ≤ hodnota atributu → úspěch
• Výhoda: 2d20, ber nižší. Nevýhoda: 2d20, ber vyšší.
• Vzdorovaná záchrana: oba hází, nižší úspěšný hod vyhrává.
• Používá se i mimo boj (past, lezení, vyjednávání...)

HODY NA ŠTĚSTÍ:
• Když situaci nepokrývá záchrana → Průvodce určí šanci X ze 6 → hoď d6`,
  },
  cas_cestovani: {
    title: "Čas, Cestování a Počasí",
    text: `Mausritter striktně sleduje čas ve třech měřítkách.

TŘI MĚŘÍTKA ČASU:
• KOLO — boj, necelá minuta
• SMĚNA (Turn) — průzkum dungeonu, 10 minut. Prozkoumání místnosti, boj, past = 1 směna. Každé 3 směny → hod na náhodné setkání.
• HLÍDKA (Watch) — cestování divočinou, 6 hodin (= 36 směn)
• DEN = 4 hlídky

CESTOVÁNÍ PO HEXCRAWLU:
• Rychlost: 1 hex za hlídku (6 hodin)
• Náročný terén (potoky, skály, kopce): 1 hex za 2 hlídky
• Povinný odpočinek: minimálně 1 hlídka/den, jinak → Vyčerpání
• Teoretický max: 3 hexy/den (3 cestování + 1 odpočinek)
• Hledání potravy: 1 hlídka místo cestování

POČASÍ (2d6 denně, podle ročního období):
• Výsledek podle tabulky sezóny (jaro/léto/podzim/zima)
• Nepříznivé počasí (bouřka, vánice, úmorné vedro):
  → záchrana STR za každou hlídku cestování, jinak Vyčerpání

NÁHODNÁ SETKÁNÍ:
• Hod d6 na začátku ranní a večerní hlídky
• 1 = SETKÁNÍ (hoď na encounter tabulku)
• 2 = PŘEDZVĚST (stopy, zvuky, znamení)
• 3-6 = nic
• Čas setkání: d12 (kolik hodin od začátku hlídky)
• Encounter tabulka (d6 per oblast): 1-3 běžné, 4-5 neobvyklé, 6 nebezpečné

DOPRAVA (cena za hex):
• Pěšky: zdarma (1 hlídka/hex)
• Králičí vůz: 5ď/hex
• Říční vor: 10ď/hex
• Let na holubovi: 200ď/hex

BUDOVY A KOPÁNÍ:
• 3 myši vykopou v hlíně 15cm krychli za den
• Chodba: 10ď, místnosti: 100-2000ď
• Údržba: 1% měsíčně`,
  },
  reakce_npc: {
    title: "Reakce NPC (2d6)",
    text: `Když potkáš tvora a není jasné jak se zachová → hoď 2d6:

2: AGRESIVNÍ — okamžitě zaútočí
3-5: NEPŘÁTELSKÁ — nepřátelský, ale lze zkusit uchlácholit
6-8: NEJISTÁ — váhá, myši ho mohou přesvědčit
9-11: POVÍDAVÁ — ochoten mluvit, možná obchod
12: NÁPOMOCNÁ — přátelský, aktivně pomůže

MORÁLKA (v boji):
• Záchrana WIL při nevýhodě nebo prvním kritickém zranění
• Neúspěch → vzdá se / uteče

JAZYKY A KOMUNIKACE:
• Myš ↔ myš: bez problémů
• Myš ↔ hlodavec (krysa): s obtížemi
• Myš ↔ jiný savec (kočka): záchrana WIL
• Myš ↔ hmyz/plaz: komunikace NEMOŽNÁ

SPOLEČENSKÉ POSTAVENÍ NPC (d6):
• Určuje jestli je NPC chuďas, měšťan nebo šlechtic
• Ovlivňuje cenu služeb (od d6ď po d4×1000ď)

PRO APPKU: Reaction roll jako nástroj. Výsledek rovnou zapsat k NPC.`,
  },
  bestiar: {
    title: "Bestiář (Tvorové)",
    text: `Tvorové mají: BO, STR/DEX/WIL, zbroj, útok(y), kritické zranění a MOTIVACI ("co chce").

PŘÍKLADY:
• Myš (rival): 3 BO, 9/9/9. Meč d6 nebo luk d6. Chce se cítit bezpečně.
• Krysa: 3 BO, 12/8/8. Sekáček d6. Chce zbohatnout na úkor slabších.
• Had: 12 BO, 12/10/10, zbroj 2. Kousnutí d8. Krit: spolkne oběť zaživa.
• Pavouk: 6 BO, 8/15/10, zbroj 1. Jed d6→DEX. Krit: odnese v kokonu.
• Kočka: 15 BO, 15/15/10, zbroj 1. Seknutí d6, kousnutí d8. MĚŘÍTKO TLUPY. Vyžaduje dary.
• Sova: 15 BO, WIL 15. Kousnutí d10. Létá 3× rychleji, 2 kouzla. Čarodějka hledající vědomosti.
• Duch: 9 BO, 5/10/10. Mrazivý dotyk d8→WIL. Krit: ovládne zasaženého.

DALŠÍ TVOROVÉ: Stonožka (žravá bestie), Vrána (strážkyně tajemství), Víla (podivné plány), Žába (potulný rytíř).

TLUPY V BOJI:
• 20+ myší, d6 BO, vlastnosti 10, útok d6
• Tlupa vs jednotlivec: ZESÍLENÝ útok (d12!)
• Jednotlivec vs tlupa: zranění se IGNORUJE (kromě výjimečných útoků)
• Tlupa vs tlupa: normální boj
• Kritické zranění → rozvrácená. Polovina STR → záchrana WIL nebo útěk. STR 0 → pobitá.

TEČKY POUŽITÍ (opotřebení předmětů):
• Většina předmětů má 3 tečky
• Po boji: d6, na 4-6 škrtni tečku zbraně/zbroje
• Oprava jedné tečky = 10% ceny předmětu
• Pochodeň: 6 teček (1 za setkání/směnu)
• Elektrická lampa: 6 teček
• Improvizovaná zbraň: VŽDY škrtá tečku

PRO APPKU: Bestiář jako referenční knihovna. Tvorové se přidávají jako 👤 NPC wiki záznamy s bojovými statistikami (STR/DEX/WIL, BO, zbroj, útok, motivace).`,
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

interface EdgeData {
  from: string;
  to: string;
  fromSide: string;
  toSide: string;
  style: string;
}

interface StyleDef {
  fill: string;
  stroke: string;
  textFill: string;
  fontWeight: number;
  rx: number;
  fontSize: number;
}

const NODES: NodeData[] = [
  // === WIKI ===
  { id: "wiki_bg", x: 270, y: 190, w: 440, h: 460, type: "group", label: "KAMPÁŇOVÁ WIKI" },

  // Mausritter postavy
  { id: "postavy_label", x: 290, y: 216, w: 180, h: 14, type: "sublabel", label: "postavy (Mausritter)" },
  { id: "postava", x: 290, y: 234, w: 200, h: 36, type: "core", label: "🐭 POSTAVA\nSTR DEX WIL · 10 slotů · BO" },
  { id: "pomocnik", x: 500, y: 234, w: 190, h: 36, type: "core", label: "🐭 POMOCNÍK\n6 slotů · mzda · morálka" },

  // Svět a příběh
  { id: "svet_label", x: 290, y: 278, w: 180, h: 14, type: "sublabel", label: "svět a příběh (wiki entity)" },
  { id: "npc", x: 290, y: 296, w: 100, h: 36, type: "core", label: "👤 NPC\nlokace · frakce · vztah" },
  { id: "osady", x: 398, y: 296, w: 100, h: 36, type: "core", label: "🏠 OSADY\nhex · služby" },
  { id: "frakce", x: 506, y: 296, w: 95, h: 36, type: "core", label: "⚔ FRAKCE\nzdroje · cíle" },
  { id: "predmety", x: 609, y: 296, w: 85, h: 36, type: "core", label: "💎 PŘEDMĚTY\nkouzla · loot" },
  { id: "thread", x: 290, y: 340, w: 120, h: 30, type: "core", label: "🧵 THREADS\nprogress · plot armor" },
  { id: "ukoly", x: 418, y: 340, w: 120, h: 30, type: "core", label: "📌 ÚKOLY\nd66 · zvěsti" },
  { id: "denik", x: 546, y: 340, w: 148, h: 30, type: "core", label: "📖 DENÍK\nscéna po scéně" },

  // Mythic mechaniky — oddělené
  { id: "mythic_label", x: 290, y: 380, w: 300, h: 14, type: "sublabel", label: "── aktivní mechaniky (Mythic GME) ──" },
  { id: "npc_seznam", x: 290, y: 398, w: 200, h: 40, type: "mech_list", label: "📋 NPC SEZNAM\n25 řádků · 5 sekcí · váhy" },
  { id: "thread_seznam", x: 500, y: 398, w: 190, h: 40, type: "mech_list", label: "📋 THREAD SEZNAM\n25 řádků · 5 sekcí · váhy" },

  { id: "chaos_val", x: 290, y: 448, w: 200, h: 30, type: "core_highlight", label: "⚡ CHAOS FAKTOR (1-9)" },
  { id: "progress_track", x: 500, y: 448, w: 190, h: 30, type: "core_progress", label: "⬛⬛⬛⬜⬜ PROGRESS TRACK" },

  { id: "propojeni", x: 350, y: 488, w: 260, h: 18, type: "sublabel", label: "⟷ vše propojené · klikni pro detail ⟷" },

  // Mausritter pravidla — referenční bloky
  { id: "pravidla_label", x: 290, y: 514, w: 300, h: 14, type: "sublabel", label: "── pravidla reference (Mausritter) ──" },
  { id: "boj", x: 290, y: 532, w: 100, h: 36, type: "tool", label: "⚔️ BOJ\niniciativa · smrt" },
  { id: "cas_cestovani", x: 398, y: 532, w: 112, h: 36, type: "tool", label: "🗺️ ČAS & CESTY\nhex · hlídka · počasí" },
  { id: "reakce_npc", x: 518, y: 532, w: 85, h: 36, type: "tool", label: "🎭 REAKCE\n2d6 postoj" },
  { id: "bestiar", x: 611, y: 532, w: 85, h: 36, type: "tool", label: "🐍 BESTIÁŘ\ntvorové" },

  // Random event flow annotation
  { id: "random_event_flow", x: 1050, y: 560, w: 200, h: 50, type: "note_alert", label: "⚡ RANDOM EVENT\ndoubles ≤ CF → Event Focus\n→ seznam → Meaning Tables" },

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

  { id: "hrani", x: 750, y: 460, w: 270, h: 60, type: "cycle_active", label: "4. HRANÍ SCÉNY\nFate Q · Meaning · Detail Check\ndoubles → random events!" },
  { id: "ukonceni", x: 370, y: 720, w: 220, h: 40, type: "cycle", label: "5. SCÉNA VYČERPÁNA" },

  { id: "bookkeeping_bg", x: 20, y: 560, w: 215, h: 140, type: "cycle_write", label: "6. BOOKKEEPING\n· NPC seznam (váhy ±)\n· Thread seznam (váhy ±)\n· Chaos faktor ±1\n· Progress Track\n· Tah frakcí (d6)\n· Deník + Wiki" },

  { id: "zpet", x: 30, y: 100, w: 210, h: 50, type: "cycle", label: "→ NOVÁ SCÉNA\nzpět na očekávání" },

  // === NÁSTROJE ===
  { id: "nastroje_bg", x: 20, y: 200, w: 215, h: 215, type: "group", label: "PANEL NÁSTROJŮ" },
  { id: "t_fate", x: 40, y: 228, w: 175, h: 28, type: "tool_primary", label: "◈ Fate Chart (d100)" },
  { id: "t_meaning", x: 40, y: 262, w: 175, h: 28, type: "tool_primary", label: "◈ Meaning Tables" },
  { id: "t_detail", x: 40, y: 296, w: 175, h: 24, type: "tool", label: "◇ Detail Check" },
  { id: "t_npc_behav", x: 40, y: 324, w: 175, h: 24, type: "tool", label: "◇ NPC Behavior" },
  { id: "t_gen", x: 40, y: 352, w: 110, h: 24, type: "tool", label: "⚄ Generátory" },
  { id: "t_kostky", x: 160, y: 352, w: 55, h: 24, type: "tool", label: "⚅ Kostky" },
  { id: "nastroje_sub", x: 40, y: 382, w: 175, h: 22, type: "sublabel", label: "použiješ kdy chceš" },

  // === PARAMETRY ===
  { id: "param_bg", x: 80, y: 15, w: 250, h: 70, type: "group", label: "PARAMETRY SCÉNY" },
  { id: "tema", x: 100, y: 38, w: 100, h: 22, type: "tool", label: "Téma" },
  { id: "nalada", x: 210, y: 38, w: 100, h: 22, type: "tool", label: "Nálada" },
  { id: "atmosfera", x: 100, y: 62, w: 100, h: 22, type: "tool", label: "Atmosféra" },
  { id: "pocasi", x: 210, y: 62, w: 100, h: 22, type: "tool", label: "Počasí" },

  // === META ===
  { id: "meritko", x: 760, y: 30, w: 230, h: 50, type: "note", label: "MĚŘÍTKO (V HLAVĚ)", bullets: ["architekt ↔ průzkumník"] },
];

const EDGES: EdgeData[] = [
  { from: "ocekavani", to: "test_chaosu", fromSide: "right", toSide: "left", style: "solid" },
  { from: "test_chaosu", to: "typ_sceny_bg", fromSide: "bottom", toSide: "top", style: "solid" },
  { from: "typ_sceny_bg", to: "hrani", fromSide: "bottom", toSide: "top", style: "solid" },
  { from: "hrani", to: "ukonceni", fromSide: "bottom", toSide: "top", style: "solid" },
  { from: "ukonceni", to: "bookkeeping_bg", fromSide: "left", toSide: "right", style: "solid" },
  { from: "bookkeeping_bg", to: "zpet", fromSide: "top", toSide: "bottom", style: "solid" },
  { from: "zpet", to: "ocekavani", fromSide: "right", toSide: "left", style: "solid" },
  { from: "bookkeeping_bg", to: "wiki_bg", fromSide: "right", toSide: "left", style: "dashed" },
  { from: "wiki_bg", to: "ocekavani", fromSide: "top", toSide: "bottom", style: "dashed" },
  { from: "param_bg", to: "ocekavani", fromSide: "right", toSide: "left", style: "dashed" },
  { from: "hrani", to: "random_event_flow", fromSide: "right", toSide: "left", style: "dashed" },
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

function EdgePath({ edge, nodes }: { edge: EdgeData; nodes: NodeData[] }) {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;
  const a = getAnchor(fromNode, edge.fromSide);
  const b = getAnchor(toNode, edge.toSide);
  const fs = edge.fromSide;
  const ts = edge.toSide;
  let path: string;

  if ((fs === "right" && ts === "left") || (fs === "left" && ts === "right")) {
    const midX = (a.x + b.x) / 2;
    path = `M${a.x},${a.y} L${midX},${a.y} L${midX},${b.y} L${b.x},${b.y}`;
  } else if ((fs === "bottom" && ts === "top") || (fs === "top" && ts === "bottom")) {
    const midY = (a.y + b.y) / 2;
    path = `M${a.x},${a.y} L${a.x},${midY} L${b.x},${midY} L${b.x},${b.y}`;
  } else if (fs === "bottom" && ts === "right") {
    path = `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
  } else if (fs === "bottom" && ts === "left") {
    path = `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
  } else if (fs === "left" && ts === "bottom") {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  } else if (fs === "right" && ts === "bottom") {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  } else if (fs === "left" && ts === "top") {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  } else if (fs === "right" && ts === "top") {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  } else if (fs === "top" && ts === "left") {
    path = `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
  } else if (fs === "top" && ts === "right") {
    path = `M${a.x},${a.y} L${a.x},${b.y} L${b.x},${b.y}`;
  } else {
    path = `M${a.x},${a.y} L${b.x},${a.y} L${b.x},${b.y}`;
  }

  return (
    <g>
      <path d={path} fill="none" stroke={edge.style === "solid" ? "#555" : "#aaa"} strokeWidth={1.4} strokeDasharray={edge.style === "dashed" ? "6 4" : "none"} />
      <ArrowHead x={b.x} y={b.y} side={edge.toSide} color={edge.style === "solid" ? "#555" : "#aaa"} />
    </g>
  );
}

function ArrowHead({ x, y, side, color }: { x: number; y: number; side: string; color: string }) {
  const s = 6;
  const pts: Record<string, string> = {
    left: `${x},${y} ${x+s},${y-s/2} ${x+s},${y+s/2}`,
    right: `${x},${y} ${x-s},${y-s/2} ${x-s},${y+s/2}`,
    top: `${x},${y} ${x-s/2},${y+s} ${x+s/2},${y+s}`,
    bottom: `${x},${y} ${x-s/2},${y-s} ${x+s/2},${y-s}`,
  };
  return pts[side] ? <polygon points={pts[side]} fill={color} /> : null;
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
        {node.label.split("\n").map((line, i) => (
          <text key={i} x={node.x + node.w / 2} y={node.y + 14 + i * 13} textAnchor="middle"
            style={{ fontSize: s.fontSize, fontFamily: "'IBM Plex Mono', monospace", fill: s.textFill, fontWeight: i === 0 ? 700 : 500 }}>
            {line}
          </text>
        ))}
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

function getTouchDist(t1: { clientX: number; clientY: number }, t2: { clientX: number; clientY: number }) {
  return Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
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
    const handler = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.min(Math.max(z * (e.deltaY > 0 ? 0.92 : 1.08), 0.3), 3)); } };
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
    if (e.touches.length === 1) { setDragging(true); dragStartRef.current = { x: e.touches[0].clientX - panRef.current.x, y: e.touches[0].clientY - panRef.current.y }; }
    else if (e.touches.length === 2) { setDragging(false); pinchRef.current = { dist: getTouchDist(e.touches[0], e.touches[1]), zoom }; }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setDidMove(true);
    if (e.touches.length === 1 && dragging) setPan({ x: e.touches[0].clientX - dragStartRef.current.x, y: e.touches[0].clientY - dragStartRef.current.y });
    else if (e.touches.length === 2 && pinchRef.current) setZoom(Math.min(Math.max(pinchRef.current.zoom * (getTouchDist(e.touches[0], e.touches[1]) / pinchRef.current.dist), 0.3), 3));
  };
  const handleTouchEnd = () => { setDragging(false); pinchRef.current = null; };
  const handleMouseDown = (e: React.MouseEvent) => { if (e.button === 0) { setDragging(true); setDidMove(false); dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; } };
  const handleMouseMove = (e: React.MouseEvent) => { if (dragging) { setDidMove(true); setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }); } };
  const handleMouseUp = () => setDragging(false);
  const handleSvgClick = () => { if (!didMove) setSelected(null); };
  const handleNodeSelect = (id: string) => { if (!didMove) setSelected(id === selected ? null : id); };

  const btnStyle: React.CSSProperties = { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 18,
    fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", WebkitTapHighlightColor: "transparent", userSelect: "none" };

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
            ℹ O PROJEKTU
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
