import { useState } from "react";

// === DATA MODEL DEFINITION ===
const entities = {
  postava: {
    title: "Postava",
    emoji: "🐭",
    color: "#b45309",
    fields: [
      { name: "id", type: "string", note: "unikátní ID" },
      { name: "jmeno", type: "string", note: "d100 tabulka" },
      { name: "prijmeni", type: "string", note: "d20 tabulka" },
      { name: "str", type: "{aktualni, max}", note: "Síla (3d6 keep 2 highest → 2-12, swap povolený)" },
      { name: "dex", type: "{aktualni, max}", note: "Mrštnost" },
      { name: "wil", type: "{aktualni, max}", note: "Vůle" },
      { name: "bo", type: "{aktualni, max}", note: "Body Odolnosti (úr.1=1d6, úr.2=2d6, úr.3=3d6, úr.4+=4d6 STROP). Level up: hoď nové kostky, vyšší=nové max, nižší=+1." },
      { name: "uroven", type: "number", note: "1–?" },
      { name: "zk", type: "number", note: "1ď pokladu v osadě = 1 zk. Investice do komunity: 10ď = 1 zk." },
      { name: "-- postup na úroveň --", type: "---", note: "" },
      { name: "tabulkaPostupu", type: "note", note: "Úr.2=1000zk(2d6 BO, 1 kuráž), Úr.3=3000(3d6, 2), Úr.4=6000(4d6, 2), Úr.5+=+5000(4d6, 3+)" },
      { name: "levelUpPostup", type: "note", note: "1) d20 per vlastnost (> MAX = max+1, akt+1). Dělá se v osadě po odpočinku (akt==max). 2) Hoď nové kostky BO (vyšší=nové BO, nižší=+1). 3) Kuráž dle tabulky." },
      { name: "puvod", type: "string", note: "Background (d6+d6 z tabulky)" },
      { name: "barvaSrsti", type: "string", note: "d6 tabulka (bílá, hnědá, černá, šedá...)" },
      { name: "vzorSrsti", type: "string", note: "d6 tabulka (jednolitá, mourovatá, skvrnitá...)" },
      { name: "vyraznyRys", type: "string", note: "d66 tabulka (jizvy, moudrý pohled, chápavý ocásek...)" },
      { name: "znameni", type: "string", note: "Rodné znamení (d6) → určuje i povahu" },
      { name: "dobky", type: "number", note: "Měna. Prvních 250 zdarma, pak 1 slot/250ď!" },
      { name: "inventar", type: "Slot[10]", note: "2 packy + 2 tělo + 6 batoh" },
      { name: "stavy", type: "Stav[]", note: "Podmínky zabírající sloty! Každý má podmínku odstranění." },
      { name: "kuraz", type: "number (0-3+)", note: "Grit: úr.2=1, úr.3=2, úr.4=2, úr.5+=3+. Stav v kuráži nezabírá inventář, ale stále platí podmínka odstranění!" },
    ],
    ada: {
      jmeno: "Ada", prijmeni: "Katzenreiserová",
      str: "8/8", dex: "10/10", wil: "7/7", bo: "0/4",
      uroven: 1, zk: 0, dobky: 12,
      puvod: "Kuchyňský slídil",
      barvaSrsti: "Hnědá", vzorSrsti: "Mourovatá", vyraznyRys: "Nervózní čumáček",
      znameni: "Kolo (odvážná/zbrklá)", kuraz: "0 (úroveň 1 — zatím nemá)",
      inventar: "Packy: [jehla d6 2/3] [pochodeň 2/3] | Tělo: [lehká zbroj] [Poranění!] | Batoh: [zásoby 2/3] [motouz] [zápalky] [—] [—] [—]",
      stavy: "Poranění (zabírá slot na těle!)",
    }
  },
  tvorbaPostavy: {
    title: "Tvorba postavy",
    emoji: "🎲",
    color: "#d97706",
    fields: [
      { name: "-- krok 1: vlastnosti --", type: "---", note: "" },
      { name: "str, dex, wil", type: "3d6 keep 2", note: "V pořadí STR→DEX→WIL. Rozsah 2-12. Po vygenerování všech tří lze prohodit libovolné DVĚ." },
      { name: "-- krok 2: BO a ďobky --", type: "---", note: "" },
      { name: "bo", type: "d6", note: "Body ochrany — vstup do tabulky původu" },
      { name: "dobky", type: "d6", note: "Počáteční ďobky — vstup do tabulky původu" },
      { name: "-- krok 3: původ --", type: "---", note: "" },
      { name: "puvod", type: "cross-ref BO×ďobky", note: "Tabulka 6×6 = 36 původů. Určuje název + Předmět A + Předmět B." },
      { name: "-- krok 4: vybavení --", type: "---", note: "" },
      { name: "zakladniVybava", type: "note", note: "KAŽDÁ myš: pochodeň + zásoby + 2 předměty z původu (A,B) + 1 zbraň dle výběru" },
      { name: "zachrannaSit", type: "note", note: "Nejvyšší vlastnost ≤9: +1 předmět (A nebo B) z nového hodu. ≤7: +2 předměty (oba)." },
      { name: "zbrane", type: "note", note: "Improvizovaná d6 1ď (vždy škrtá tečku!) | Lehká d6 10ď | Střední d6/d8 20ď | Těžká d10 40ď | Lehká střelná d6 10ď | Těžká střelná d8 40ď" },
      { name: "-- krok 5: vzhled --", type: "---", note: "" },
      { name: "znameni", type: "d6", note: "1=Hvězda(statečná/zbrklá) 2=Kolo(pracovitá/nenápaditá) 3=Žalud(zvědavá/paličatá) 4=Bouřka(štědrá/popudlivá) 5=Měsíc(moudrá/záhadná) 6=Matka(pečující/ustaraná)" },
      { name: "barvaSrsti", type: "d6", note: "1=Čokoládová 2=Černá 3=Bílá 4=Světle hnědá 5=Šedá 6=Namodralá" },
      { name: "vzorSrsti", type: "d6", note: "1=Jednolitá 2=Mourovatá 3=Strakatá 4=Pruhovaná 5=Tečkovaná 6=Skvrnitá" },
      { name: "vyraznyRys", type: "d66", note: "36 rysů (11-66). Tělo, oblečení, obličej, srst, oči, ocásek." },
      { name: "jmeno", type: "volba/d100+d20", note: "Vlastní jména (99 položek, d100, č.50 chybí) + mateřská jména (20 položek, d20). Volba nebo hod. Viz kompletní seznamy v diagramu sekce tvorba_postavy." },
    ],
    ada: {
      priklad: [
        "Krok 1: STR 3d6=[4,5,2]→9, DEX 3d6=[6,3,1]→9, WIL 3d6=[5,6,4]→11 → swap STR↔WIL → STR 11, DEX 9, WIL 9",
        "Krok 2: BO d6=4, Ďobky d6=3 → tabulka: BO 4 × 3ď = Vlaštovkář (Rybářský háček + Ochranné brýle)",
        "Krok 4: Pochodeň + Zásoby + Rybářský háček + Ochranné brýle + Jehla (lehká, d6) dle výběru",
        "Krok 5: Znamení d6=3 Žalud (zvědavá/paličatá), Srst d6=1+d6=2 Čokoládová mourovatá, Rys d66=54 Moudrý pohled",
      ]
    }
  },
  pomocnik: {
    title: "Pomocník",
    emoji: "🐹",
    color: "#0369a1",
    fields: [
      { name: "id", type: "string", note: "" },
      { name: "jmeno, prijmeni", type: "string", note: "d100 + d20" },
      { name: "vzhled", type: "string", note: "d20 (zafačovaný ocásek, velký klobouk...)" },
      { name: "povaha", type: "string", note: "Rodné znamení → povaha (statečná, pracovitá...)" },
      { name: "vztahKHraci", type: "string", note: "d20 (sourozenec, dlužník, přítel z dětství...)" },
      { name: "str, dex, wil", type: "{aktualni, max}", note: "2d6 přímo (NE 3d6 keep 2 jako hráč!). Rozsah 2-12. Žádný swap." },
      { name: "bo", type: "{aktualni, max}", note: "Začíná na d6. Level up = stejný postup jako hráč." },
      { name: "uroven", type: "number", note: "Stejná tabulka jako hráč! 1000/3000/6000/+5000 zk." },
      { name: "zk", type: "number", note: "1 zk za každý ďobek z podílu NAD mzdu. Mzda = 0 zk!" },
      { name: "inventar", type: "Slot[6]", note: "2 packy + 2 tělo + 2 batoh (ne 10!)" },
      { name: "denniMzda", type: "number", note: "Dle typu: světlonoš 1ď(d6), dělník 2ď(d6), kopáč chodeb 5ď(d4), zbrojíř/kovář 8ď(d2), místní průvodce 10ď(d4), zbrojmyš 10ď(d6), učenec 20ď(d2), rytíř 25ď(d3), tlumočník 30ď(d2). V závorce = kostka dostupnosti v osadě." },
      { name: "vernost", type: "'běžný' | 'věrný'", note: "Věrný = WIL morálka s výhodou (2d20, nižší). ŽÁDNÁ stupnice/body — narativní stav, GM rozhodne (štědré dělení kořisti, záchrana života, dlouhodobé dobré zacházení). Některé původy dávají věrného společníka od začátku (Honák brouků)." },
      { name: "role", type: "string", note: "Dohodnutý úkol (světlonoš, bojovník...)" },
      { name: "moralkaTrigger", type: "note", note: "Spouštěče WIL záchrany: krit. zranění, nevýhoda v boji, nezaplacení mzdy, nedostatek stravy, nebezpečnější úkol než dohodnutý, vyřazení hráče. Tlupy: ztráta STR/2 = WIL nebo panika." },
      { name: "aktivni", type: "boolean", note: "false = utekl/mrtvý" },
    ],
    ada: {
      note: "Ada zatím nemá pomocníka — proto je po boji s krysou v ohrožení života!",
    }
  },
  predmet: {
    title: "Předmět",
    emoji: "⚔️",
    color: "#7c3aed",
    fields: [
      { name: "id", type: "string", note: "" },
      { name: "nazev", type: "string", note: "" },
      { name: "typ", type: "enum", note: "zbraň | zbroj | kouzlo | zásoby | světlo | nástroj | poklad | stav" },
      { name: "podminkaOdstraneni", type: "string?", note: "Jen stavy: jak se zbavit (odpočinek, jídlo, léčení...)" },
      { name: "tecky", type: "{aktualni, max}", note: "Většina 3 (i pochodeň!), lampa 6 (výjimka)" },
      { name: "sloty", type: "number (1-6)", note: "Většina 1-2, objemné poklady až 4-6" },
      { name: "span", type: "{rows,cols}?", note: "Rozměry v gridu pro multi-slot (2×1 nebo 1×2). Jen pokud sloty>1." },
      { name: "_preset", type: "string?", note: "Interní: název vybraného presetu. Umožňuje přejmenování bez ztráty vazby na šablonu." },
      { name: "hodnota", type: "number", note: "Cena v ďobcích" },
      { name: "cenaOpravy", type: "number?", note: "10% hodnoty za tečku. Jen zbraně/zbroje v osadě." },
      { name: "-- jen zbraně --", type: "---", note: "" },
      { name: "kostkaZraneni", type: "'d4'–'d10'", note: "d6 lehká, d8 těžká, d10 těžká 2-ruční" },
      { name: "ruce", type: "1 | 2", note: "Kolik pacek potřebuje" },
      { name: "jeDalkova", type: "boolean", note: "Prak, luk — kryt = d4" },
      { name: "jeKouzelna", type: "boolean", note: "Tečka jen na hod 6" },
      { name: "jePostribrena", type: "boolean", note: "Postříbřené — VŽDY škrtá tečku po boji (ne d6)" },
      { name: "jeImprovizovana", type: "boolean", note: "Improvizovaná — d6 normálně, ale VŽDY škrtá tečku po boji (ne d6 test)" },
      { name: "ucinekPriNoseni", type: "string?", note: "Jen kouzelné — pasivní efekt (mluvení s rybami...)" },
      { name: "kritickyUcinek", type: "string?", note: "Jen kouzelné — efekt při kritickém zranění" },
      { name: "kletba", type: "string?", note: "Jen kouzelné — popis prokletí" },
      { name: "podminkaZruseniKletby", type: "string?", note: "Jak se kletby zbavit" },
      { name: "-- jen zbroje --", type: "---", note: "" },
      { name: "hodnotaObrany", type: "number", note: "FIXNÍ hodnota! Lehká=1, Těžká=1. Odečte se od zranění." },
      { name: "poziceZbroje", type: "string", note: "Informativní (ne validační). Lehká: packa+tělo. Těžká: 2×tělo. Štít: 1 packa. Hráč může umístit kamkoliv." },
      { name: "-- jen kouzla --", type: "---", note: "" },
      { name: "popisUcinku", type: "string", note: "Text efektu s [POČET] a [SOUČET]. Kouzlo = obsidiánová destička!" },
      { name: "ritualDobijeni", type: "string", note: "Unikátní per kouzlo" },
      { name: "-- jen světlo --", type: "---", note: "" },
      { name: "smenZaTecku", type: "number", note: "VŠECHNY = 6 směn/tečka! Pochodeň 3 tečky, lucerna 3, lampa 6." },
    ],
    ada: {
      priklad: [
        "Jehla (zbraň, d6, 1 ruka, 2/3 teček, 6ď)",
        "Pochodeň (světlo, 6 směn/tečka, 2/3 teček, 1ď)",
        "Lehká zbroj (zbroj, obrana 1 FIXNÍ, packa+tělo, 3/3 teček, 20ď)",
        "Cestovní zásoby (zásoby, tečka/jídlo, 2/3, 5ď)",
        "Motouz (nástroj, 3/3, 1ď)",
        "Zápalky (nástroj, 3/3, 1ď)",
      ]
    }
  },
  frakce: {
    title: "Frakce",
    emoji: "⚑",
    color: "#dc2626",
    fields: [
      { name: "id", type: "string", note: "" },
      { name: "nazev", type: "string", note: "" },
      { name: "zdroje", type: "string[]", note: "Free-text! Žádný enum. 3+ = může mít tlupu" },
      { name: "cile", type: "Cíl[]", note: "Pole cílů s progress tracky" },
      { name: "  → popis", type: "string", note: "Co frakce chce" },
      { name: "  → policka", type: "{aktualni, max}", note: "2=triviální, 3=lokální, 4=střední, 5=přelomové" },
      { name: "  → protikomu", type: "frakceId?", note: "Konkurent (pro modifikátor -1/zdroj)" },
      { name: "osadyIds", type: "string[]", note: "Propojení na osady" },
      { name: "-- mechaniky --", type: "---", note: "" },
      { name: "hracuvZasah", type: "note", note: "Hráč může ±1-3 políček. Splnění cíle = nový zdroj + odebrat zdroj konkurentovi!" },
    ],
    ada: {
      nazev: "Šedivec a jeho banda",
      zdroje: '["Hrůzostrašnost", "Najatí žoldáci"]',
      cile: 'Vymáhat daň z medu (3 políčka, 0/3 splněno)',
    }
  },
  osada: {
    title: "Osada",
    emoji: "🏘️",
    color: "#059669",
    fields: [
      { name: "id", type: "string", note: "" },
      { name: "nazev", type: "string", note: "2×d12 (začátek+konec)" },
      { name: "velikost", type: "1–6", note: "2d6 keep lower" },
      { name: "kategorieVelikosti", type: "string", note: "Farma → Velkoměsto" },
      { name: "obyvatelstvo", type: "string", note: "'1-3 rodin' → '1000+'" },
      { name: "zrizeni", type: "string", note: "d6+velikost → Stařešinové – Sídlo moci" },
      { name: "vyraznyPrvek", type: "string[]", note: "d20 (velkoměsta 2×)" },
      { name: "obyvatele", type: "string", note: "Zvyklosti d20" },
      { name: "zivnost", type: "string[]", note: "d20 (města+ 2×)" },
      { name: "udalost", type: "string", note: "d20 — co se děje teď" },
      { name: "hostinec", type: "{nazev, specialita}?", note: "Vísky+ mají (3×d11)" },
      { name: "frakceIds", type: "string[]", note: "Kdo tu vládne/operuje" },
      { name: "hexId", type: "string?", note: "Pozice na mapě" },
      { name: "jePoblizLidi", type: "boolean", note: "Přístup k lidským předmětům (jed, zápalky, pastičky)" },
      { name: "banka", type: "{dobky, predmety[]}", note: "Úložiště! Poplatek 1% při výběru." },
      { name: "investiceHrace", type: "number", note: "Ďobky investované do osady (1 zk/10ď)" },
      { name: "dostupneSluzby", type: "string[]", note: "Ubytování 1-50ď, opravy, verbování (filtr dle velikosti)" },
    ],
    ada: {
      nazev: "Mechová Lhota",
      velikost: "3 (Víska, 50-150 myší)",
      zrizeni: "Stařešinové",
      zivnost: "Sběr medu",
      udalost: "Svátek sklizně",
      hostinec: "U Tlustého Čmeláka (specialita: medový koláč)",
      jePoblizLidi: "ne (čistě myší víska)",
      banka: "Ada tu nemá nic uložené (zatím)",
    }
  },
  npc: {
    title: "NPC",
    emoji: "🎭",
    color: "#ca8a04",
    fields: [
      { name: "id", type: "string", note: "" },
      { name: "jmeno, prijmeni", type: "string", note: "d100 + d20" },
      { name: "druh", type: "enum", note: "Myš | Hlodavec | Savec | Ostatní. Savec=WIL záchrana pro komunikaci!" },
      { name: "spolecenskePostaveni", type: "string", note: "d6: Chuďas, Prostá, Měšťan, Cech, Šlechtic → určuje bohatství" },
      { name: "vzhled", type: "string", note: "d20 tabulka" },
      { name: "zvlastnost", type: "string", note: "d20 (osobnost)" },
      { name: "znameni", type: "string", note: "d6 (základní povaha)" },
      { name: "motivace", type: "string", note: "d20 (po čem touží)" },
      { name: "vztah", type: "string", note: "d20 (k jiným NPC)" },
      { name: "reakce", type: "{hod, stav}", note: "2d6 → stav: 2=Agresivní, 3-5=Nepřátelský, 6-8=Opatrný, 9-11=Povídavý, 12=Nápomocný" },
      { name: "osadaId", type: "string?", note: "Kde žije" },
      { name: "frakceId", type: "string?", note: "Kam patří" },
      { name: "-- bojové staty --", type: "---", note: "" },
      { name: "str, dex, wil", type: "{akt, max}?", note: "Běžná myš: 9/9/9. Nemusí být vyplněné dokud nedojde k boji." },
      { name: "bo", type: "{akt, max}?", note: "Běžná myš: 3 BO" },
      { name: "zbran", type: "string?", note: "Co drží v pacce (meč d6, luk d6...)" },
      { name: "zbroj", type: "number?", note: "Fixní obrana (0-1)" },
      { name: "predmetyUSebe", type: "string[]?", note: "Cetky, drobnosti, poklady" },
      { name: "poznamky", type: "string", note: "Volné poznámky hráče" },
    ],
    ada: {
      priklad: [
        "Hrách (hostinský, tlusťoučký, zjizvený, reakce 9=povídavý, Mechová Lhota)",
        "Šedivec (kočičí pán, nepřátelský, frakce: Šedivec a jeho banda)",
        "Líska (uprchlice, vystrašená, Abandon+Danger)",
        "Kříž (synovec Hrácha, nosič medu)",
      ]
    }
  },
  mythic: {
    title: "Mythic GME",
    emoji: "🎲",
    color: "#6d28d9",
    fields: [
      { name: "cf", type: "number (1–9)", note: "Chaos Factor — startuje na 5" },
      { name: "npcSeznam", type: "NpcEntry[]", note: "Max 25 aktivních (váhy 1-3×). Váha 0 = wiki-only (existuje v databázi, ale není v aktivním seznamu pro Mythic hody)." },
      { name: "  → id", type: "string", note: "Odkaz na NPC" },
      { name: "  → vaha", type: "number", note: "0 = wiki-only (ne v seznamu), 1-3 = aktivní v seznamu" },
      { name: "threadSeznam", type: "ThreadEntry[]", note: "Max 25, váhy 1-3×" },
      { name: "  → popis", type: "string", note: "Aktivní dějová linka" },
      { name: "  → progressTrack", type: "{progress, total}", note: "2e! total: 10(krátký)/15(standard)/20(komplexní). Body: +2 standard, +2 flashpoint, Discovery Check: 1d10+progress → tabulka (1-9:Progress+2, 10:Flashpoint+2, 11-14:Track+1, 15-17:Progress+3, 18:Flashpoint+3, 19:Track+2, 20-24:Strengthen+1, 25+:Strengthen+2). 4 typy: Progress(objev), Flashpoint(drama), Track(úsilí), Strengthen(potvrzení). Fáze po 5 bodech → vynucený flashpoint. Konec = Conclusion + Plot Armor zmizí. Discovery Check: ExcNo=blokace VŠECH dalších Discovery Checks ve scéně. Meaning Tables dle výběru hráče (Actions/Descriptions/Elements)." },
      { name: "  → vaha", type: "number", note: "Kolikrát v seznamu" },
      { name: "-- 2e mechaniky --", type: "---", note: "" },
      { name: "keyedScenes", type: "KeyedScene[]", note: "Plánované události s triggerem (2e novinka)" },
      { name: "  → trigger", type: "string", note: "Podmínka spuštění (např. 'CF ≥ 7' nebo 'frakce splní cíl')" },
      { name: "  → udalost", type: "string", note: "Co se stane když trigger nastane" },
      { name: "  → spustena", type: "boolean", note: "Už proběhla?" },
      { name: "adventureFeatures", type: "string[]", note: "Prvky modulu/hexcrawlu pro Random Events (2e)" },
      { name: "perilPoints", type: "{aktualni, max}", note: "Start: doporučení 2. Cena: 1 bod = záchrana před koncem. Obnova: volba hráče (per sezení NEBO nikdy)." },
      { name: "chaosFlavor", type: "enum", note: "'standard' | 'low' | 'mid' | 'no' — jak moc CF ovlivňuje Fate Questions" },
      { name: "-- Meaning Tables --", type: "---", note: "" },
      { name: "actions", type: "string[100]", note: "Slovesa/činnosti — 'co se děje'. Fixní tabulka." },
      { name: "descriptions", type: "string[100]", note: "Příslovce/popisy — 'jak to vypadá'. Fixní tabulka." },
      { name: "elements", type: "Record<string, string[]>", note: "45 tématických tabulek × 100 položek. Hod: 2×d100 → dvojice slov. Tabulky: Adventure Tone, Alien Species Descriptors, Animal Actions, Army Descriptors, Cavern Descriptors, Characters, Character Actions Combat, Character Actions General, Character Appearance, Character Background, Character Conversations, Character Descriptors, Character Identity, Character Motivations, Character Personality, Character Skills, Character Traits & Flaws, City Descriptors, Civilization Descriptors, Creature Abilities, Creature Descriptors, Cryptic Message, Curses, Domicile Descriptors, Dungeon Descriptors, Dungeon Traps, Forest Descriptors, Gods, Legends, Locations, Magic Item Descriptors, Mutation Descriptors, Names, Noble House, Objects, Plot Twists, Powers, Scavenging Results, Smells, Sounds, Spell Effects, Starship Descriptors, Terrain Descriptors, Undead Descriptors, Visions & Dreams." },
    ],
    ada: {
      cf: 5,
      npcSeznam: "Hrách(1×), Šedivec(3×!), Líska(2×), Kříž(1×), Krysy(2×) = 9/25",
      threadSeznam: "Kočičí daň(2×, progress 3/10), Adino zajetí(1×, progress 1/10) = 3/25",
      keyedScenes: "Šedivec zaútočí na Mechovou Lhotu (trigger: jeho cíl splněn)",
      adventureFeatures: "Medové úly, Kočičí území, Tajná cesta",
      perilPoints: "2/2 (obnova: per sezení)",
      chaosFlavor: "standard",
    }
  },
  scena: {
    title: "Scéna",
    emoji: "🎬",
    color: "#be185d",
    fields: [
      { name: "id", type: "string", note: "" },
      { name: "cislo", type: "number", note: "Pořadí ve hře" },
      { name: "ocekavani", type: "string", note: "Co hráč očekává" },
      { name: "testChaosu", type: "enum", note: "'očekávaná' | 'pozměněná' | 'přerušená'" },
      { name: "sceneAdjustment", type: "string[]", note: "d10: 1=odeber postavu, 2=přidej postavu, 3=sniž/odeber aktivitu, 4=zvyš aktivitu, 5=odeber předmět, 6=přidej předmět, 7-10=DVĚ úpravy (reroll dokud 2 různé; nemožný=reroll)." },
      { name: "interruptFocus", type: "string?", note: "Jen u přerušené — Event Focus (NPC Action, PC Negative...)" },
      { name: "interruptMeaning", type: "string?", note: "Jen u přerušené — 2 slova z Meaning Tables" },
      { name: "fateOtazky", type: "FateQ[]", note: "Otázky osudu během scény" },
      { name: "  → otazka", type: "string", note: "" },
      { name: "  → pravdepodobnost", type: "enum", note: "Impossible|Nearly impossible|Very unlikely|Unlikely|50/50|Likely|Very likely|Nearly certain|Certain (9 úrovní, Mythic 2e)" },
      { name: "  → hod", type: "number", note: "d100" },
      { name: "  → vysledek", type: "enum", note: "ANO/NE + Exceptional?" },
      { name: "  → randomEvent", type: "Event?", note: "Pokud padly doubles ≤ CF" },
      { name: "narativ", type: "Block[]", note: "Příběh scény — pole inline bloků (viz entita InlineBlock)" },
      { name: "bookkeeping", type: "note", note: "Konec scény: 1) změna CF, 2) aktualizace NPC seznamu, 3) aktualizace Thread seznamu (váhy 1-3×)" },
      { name: "zmenaCF", type: "number", note: "Kritérium: KONTROLA. PC pod kontrolou=-1, PC bez kontroly=+1. CF vždy 1-9!" },
    ],
    ada: {
      priklad: 'Scéna 4: Očekávání "Ada zkoumá Šedivcovo území" → d10=2 ≤ CF4 → PŘERUŠENÁ! → interruptFocus: Ambiguous Event → interruptMeaning: "Trick + Danger" → Krysí hlídka! → Bookkeeping: CF 4→5 (Ada ztratila kontrolu), +Krysy do NPC seznamu',
    }
  },
  hexcrawl: {
    title: "Hexcrawl Mapa",
    emoji: "🗺️",
    color: "#0891b2",
    fields: [
      { name: "hexy", type: "Hex[]", note: "Pole hexů na mapě" },
      { name: "  → id", type: "string", note: "" },
      { name: "  → x, y", type: "number", note: "Pozice v gridu" },
      { name: "  → teren", type: "enum", note: "d6: Otevřená(1-2), Les(3-4), Řeka(5), Lidské město(6)" },
      { name: "  → bodyZajmu", type: "string[]", note: "Co tu hráč našel" },
      { name: "  → osadaId", type: "string?", note: "Je tu osada?" },
      { name: "  → jeNarocnyTeren", type: "boolean", note: "Potoky, silnice, skály, kopce → 2 hlídky/hex místo 1" },
      { name: "  → detailPrvku", type: "string?", note: "Výrazný prvek terénu (tabulka per typ)" },
      { name: "  → tabulkaSetkani", type: "string[]?", note: "Hexcrawl: RÁNO+VEČER (2×/den). Dungeon: každé 3 směny + při randálu! Oboje d6: 1=setkání, 2=předzvěst." },
      { name: "  → navstiveny", type: "boolean", note: "Fog of war — start: jen známé body (osada, startovní dobrodružství)" },
      { name: "aktualniHexId", type: "string", note: "Kde je postava teď" },
      { name: "velikostMapy", type: "note", note: "Standard: 5×5 hexů. Uprostřed 1 osada, 2-4 dobrodružná místa." },
      { name: "rychlostPohybu", type: "note", note: "1 hex/hlídku. Náročný terén = 2 hlídky/hex." },
    ],
    ada: {
      hexy: "Hex 1: Les (nic). Hex 2: Les s pavouky (bod zájmu!). Hex 3: Hranice Šedivce (mrtvá krysa). Mechová Lhota: Víska.",
    }
  },
  cas: {
    title: "Čas a Počasí",
    emoji: "⏳",
    color: "#4338ca",
    fields: [
      { name: "den", type: "number", note: "Kolikátý den kampaně" },
      { name: "hlidka", type: "enum", note: "4 hlídky/den! 'ráno' | 'odpoledne' | 'večer' | 'noc'. 1 hlídka = 6 hod = 36 směn." },
      { name: "smena", type: "number (1-36)", note: "Průzkumná směna (10 min). 6 směn = 1 hodina. 36 směn = 1 hlídka." },
      { name: "rocniObdobi", type: "enum", note: "'jaro' | 'léto' | 'podzim' | 'zima'" },
      { name: "pocasi", type: "string", note: "2d6 jednou/den per roční období" },
      { name: "jeNepriznive", type: "boolean", note: "Tučné počasí = STR záchrana KAŽDOU hlídku cestování, jinak Vyčerpání!" },
      { name: "sezonniUdalost", type: "string?", note: "d6 per období (povodně, migrace motýlů, slavnosti...)" },
      { name: "odpocinutoDnes", type: "boolean", note: "Min 1 hlídka odpočinku/den POVINNÁ, jinak Vyčerpání!" },
      { name: "-- odpočinek --", type: "---", note: "" },
      { name: "kratkyOdpocinek", type: "note", note: "1 směna (10 min). Obnoví d6+1 BO (NE max!). Stačí doušek vody." },
      { name: "dlouhyOdpocinek", type: "note", note: "1 hlídka (6 hod). Obnoví VŠECHNA BO. Pokud BO plná → d6 jedné vlastnosti. Vyžaduje jídlo+spánek." },
      { name: "uplnyOdpocinek", type: "note", note: "1 TÝDEN v bezpečí (~20ď). Obnoví VŠECHNY vlastnosti + odstraní většinu stavů." },
      { name: "foraging", type: "note", note: "1 hlídka hledání. Pravidla nespecifikují mechaniku — použij hod na štěstí (d6, Průvodce určí X ze 6)." },
    ],
    ada: {
      den: 2, hlidka: "ráno (1/4)", rocniObdobi: "podzim", pocasi: "Zataženo, lehký vítr (nepříznivé: NE)", odpocinutoDnes: "zatím ne",
    }
  },
  zvesti: {
    title: "Zvěsti",
    emoji: "💬",
    color: "#78716c",
    fields: [
      { name: "polozky", type: "Zvest[6]", note: "Vždy 6 per hexcrawl" },
      { name: "  → text", type: "string", note: "Co se říká" },
      { name: "  → pravdivost", type: "enum", note: "'pravda'(1-3) | 'částečně'(4-5) | 'lež'(6)" },
      { name: "  → odhalena", type: "boolean", note: "Hráč ji už slyšel?" },
      { name: "  → souvisiFrakce", type: "string?", note: "Propojení na frakci/osadu" },
      { name: "  → souvisiHexId", type: "string?", note: "Propojení na hex/místo na mapě" },
      { name: "aktualizace", type: "note", note: "Živý dokument! Při postupu frakcí nahrazuj staré zvěsti novými. Odhalení: při průzkumu nebo odpočinku v osadě." },
    ],
    ada: {
      priklad: "1. Šedivec sídlí za třetím lesem (PRAVDA). 2. Má 20 žoldáků (ČÁSTEČNĚ — jen 8). ...",
    }
  },
  boj: {
    title: "Bojový Stav",
    emoji: "⚔️",
    color: "#991b1b",
    fields: [
      { name: "aktivni", type: "boolean", note: "Je boj v běhu?" },
      { name: "meritko", type: "enum", note: "'jednotlivci' | 'tlupy' | 'smisene'. Tlupa vs jednotlivec = d12 útok + ignoruje dmg!" },
      { name: "iniciativa", type: "'myši' | 'nepřátelé'", note: "Skupinová! DEX záchrana" },
      { name: "kolo", type: "number", note: "Aktuální kolo" },
      { name: "prekvapeni", type: "boolean", note: "true = auto myši první + zesílený d12 útok PRO CELOU MYŠÍ STRANU (hráč + pomocníci)" },
      { name: "-- modifikátory útoku --", type: "---", note: "" },
      { name: "zeslabenyUtok", type: "note", note: "d4 bez ohledu na zbraň: kryt, omezení pohybu, tma/šero" },
      { name: "zesilenyUtok", type: "note", note: "d12: lest, slabina nepřítele, překvapení, tlupa vs jednotlivec" },
      { name: "dveZbrane", type: "note", note: "Obě kostky, použij LEPŠÍ výsledek" },
      { name: "ucastnici", type: "Bojovník[]", note: "Nepřátelé v boji" },
      { name: "  → nazev", type: "string", note: "Krysa, Pavouk..." },
      { name: "  → str, dex, wil", type: "{akt, max}", note: "Z bestiáře" },
      { name: "  → bo", type: "{akt, max}", note: "" },
      { name: "  → utok", type: "string", note: "d6/d8/d10 + popis" },
      { name: "  → zbroj", type: "number?", note: "FIXNÍ obrana (0-1), NE kostka!" },
      { name: "  → kritickeZraneni", type: "string?", note: "Co se stane na krit" },
      { name: "  → moralka", type: "string?", note: "Kdy utíká" },
      { name: "  → meritkoTvora", type: "enum?", note: "'jednotlivec' | 'tlupa'. Tlupa: krit=rozvrácení, STR/2=WIL záchrana nebo panika" },
      { name: "-- po boji --", type: "---", note: "" },
      { name: "teckyPoBoji", type: "note", note: "Za KAŽDOU použitou zbraň/zbroj (hráč I pomocník): d6, hod 4-6 = škrtni tečku!" },
      { name: "smrtPodminky", type: "note", note: "STR 0 = MRTVÝ. Krit. zranění + 6 směn bez ošetření = smrt. Boj = 1 směna v dungeonu." },
    ],
    ada: {
      priklad: "Scéna 4: 2 krysy (STR 4, BO 2, d6 zbraň). Iniciativa: Ada DEX 10 → hod 7 → úspěch → myši první. Kolo 1: Ada útočí d6=3, krysa zbroj 0 → 3 dmg → BO 2→0, STR 4→3 → záchrana STR d20=15 → fail → Poranění!",
    }
  },
  inlineBlock: {
    title: "Inline Blok (deník)",
    emoji: "📝",
    color: "#475569",
    fields: [
      { name: "-- text --", type: "---", note: "Volný text" },
      { name: "type", type: "'text'", note: "" },
      { name: "text", type: "string", note: "Obsah textu (včetně 💤 prefix pro odpočinek)" },
      { name: "-- fate --", type: "---", note: "Fate Question výsledek" },
      { name: "type", type: "'fate'", note: "" },
      { name: "question", type: "string", note: "Otázka hráče" },
      { name: "oddsLabel", type: "string", note: "Pravděpodobnost (Likely, 50/50...)" },
      { name: "d100", type: "number", note: "Hod" },
      { name: "yes", type: "boolean", note: "Odpověď" },
      { name: "exceptional", type: "boolean", note: "Výjimečný výsledek?" },
      { name: "randomEvent", type: "boolean", note: "Doubles ≤ CF?" },
      { name: "eventFocus", type: "string?", note: "Event Focus při random event" },
      { name: "eventMeaning", type: "{d1,d2,word1,word2}?", note: "Meaning při random event" },
      { name: "-- meaning --", type: "---", note: "Meaning Tables výsledek" },
      { name: "type", type: "'meaning'", note: "" },
      { name: "word1, word2", type: "string", note: "Dvojice slov" },
      { name: "d1, d2", type: "number", note: "Hody d100" },
      { name: "table", type: "string", note: "'Actions' | 'Descriptions' | název Elements tabulky (např. 'Character Appearance')" },
      { name: "-- detail --", type: "---", note: "Detail Check výsledek" },
      { name: "type", type: "'detail'", note: "" },
      { name: "word1, word2", type: "string", note: "Dvojice slov" },
      { name: "d1, d2", type: "number", note: "Hody d100" },
      { name: "table", type: "string", note: "'Actions' | 'Descriptions' | název Elements tabulky" },
      { name: "-- scene --", type: "---", note: "Nová scéna" },
      { name: "type", type: "'scene'", note: "" },
      { name: "sceneNum", type: "number", note: "Číslo scény" },
      { name: "title", type: "string", note: "Název scény" },
      { name: "sceneType", type: "'expected'|'altered'|'interrupt'", note: "Typ scény (test chaosu)" },
      { name: "cf", type: "number", note: "CF v momentě testu" },
      { name: "d10", type: "number", note: "Hod testu chaosu" },
      { name: "adj", type: "string?", note: "Scene Adjustment (jen u altered)" },
      { name: "focus", type: "string?", note: "Event Focus (jen u interrupt)" },
      { name: "meaning", type: "{d1,d2,word1,word2}?", note: "Meaning (jen u interrupt)" },
      { name: "-- combat --", type: "---", note: "Bojový log" },
      { name: "type", type: "'combat'", note: "" },
      { name: "enemyName", type: "string", note: "Jména nepřátel" },
      { name: "enemies", type: "{name,str,bo,weapon}[]", note: "Staty nepřátel" },
      { name: "initiativeText", type: "string", note: "Popis iniciativy" },
      { name: "log", type: "string[]", note: "Záznam kol boje" },
      { name: "result", type: "'victory'|'fled'|'wounded'|'death'|'escape'|'escape_hit'", note: "Výsledek boje" },
      { name: "hirelingName", type: "string?", note: "Jméno pomocníka v boji" },
      { name: "hirelingResult", type: "string?", note: "Výsledek pro pomocníka" },
      { name: "-- dice --", type: "---", note: "Hod kostkou" },
      { name: "type", type: "'dice'", note: "" },
      { name: "die", type: "string", note: "Typ kostky (d4, d6, d8, d10, d12, d20, d100)" },
      { name: "value", type: "number", note: "Výsledek hodu" },
      { name: "-- behavior --", type: "---", note: "NPC Behavior" },
      { name: "type", type: "'behavior'", note: "" },
      { name: "npc", type: "string", note: "Jméno NPC" },
      { name: "word1, word2", type: "string", note: "Dvojice slov (Actions + Descriptions)" },
      { name: "d1, d2", type: "number", note: "Hody d100" },
      { name: "-- discovery --", type: "---", note: "Discovery Check" },
      { name: "type", type: "'discovery'", note: "" },
      { name: "threadName", type: "string", note: "Název threadu" },
      { name: "fateD100", type: "number", note: "Hod na Fate Q (musí být Yes)" },
      { name: "fateYes", type: "boolean", note: "Vždy true (jinak se blok nevkládá)" },
      { name: "fateExceptional", type: "boolean", note: "Výjimečné Ano?" },
      { name: "discoveryD10", type: "number", note: "Hod d10" },
      { name: "discoveryTotal", type: "number", note: "d10 + progress" },
      { name: "discoveryType", type: "'Progress'|'Flashpoint'|'Track'|'Strengthen'", note: "Typ objevu" },
      { name: "discoveryPoints", type: "number", note: "Body k přičtení" },
      { name: "discoveryDesc", type: "string", note: "Popis výsledku" },
      { name: "meaning", type: "{d1,d2,word1,word2}", note: "Meaning pro interpretaci" },
      { name: "meaningTable", type: "string", note: "Která tabulka byla použita (actions/descriptions/název Elements)" },
      { name: "randomEvent", type: "boolean?", note: "Doubles ≤ CF při Fate hodu?" },
      { name: "eventFocus", type: "string?", note: "Event Focus (jen při random event)" },
      { name: "eventMeaning", type: "{d1,d2,word1,word2}?", note: "Meaning random eventu" },
    ],
    ada: {
      priklad: '{ type: "fate", question: "Je tam stráž?", oddsLabel: "Likely", d100: 37, yes: true, exceptional: false, randomEvent: false }',
    }
  },
};

// Relationships between entities
const relationships = [
  { from: "postava", to: "predmet", label: "inventář obsahuje", type: "has-many" },
  { from: "postava", to: "pomocnik", label: "vede", type: "has-many" },
  { from: "pomocnik", to: "predmet", label: "inventář (6 slotů)", type: "has-many" },
  { from: "osada", to: "frakce", label: "ovládána / cíl", type: "many-many" },
  { from: "osada", to: "npc", label: "obyvatelé", type: "has-many" },
  { from: "npc", to: "frakce", label: "patří k", type: "belongs-to" },
  { from: "frakce", to: "zvesti", label: "cíle → zvěsti", type: "generates" },
  { from: "hexcrawl", to: "osada", label: "hex obsahuje", type: "has-many" },
  { from: "scena", to: "mythic", label: "používá CF + seznamy", type: "uses" },
  { from: "mythic", to: "npc", label: "NPC seznam → odkaz", type: "references" },
  { from: "boj", to: "postava", label: "účastníci", type: "references" },
  { from: "boj", to: "pomocnik", label: "účastníci", type: "references" },
  { from: "cas", to: "scena", label: "kdy se odehrává", type: "context" },
];

function EntityCard({ id, entity, isExpanded, onToggle, showAda }) {
  const hasAdaData = entity.ada && Object.keys(entity.ada).length > 0;
  
  return (
    <div
      style={{
        background: '#1a1a2e',
        border: `2px solid ${entity.color}`,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isExpanded ? `0 0 20px ${entity.color}40` : 'none',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          background: `${entity.color}20`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isExpanded ? `1px solid ${entity.color}40` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{entity.emoji}</span>
          <span style={{ color: entity.color, fontWeight: 700, fontSize: '15px', fontFamily: "'JetBrains Mono', monospace" }}>
            {entity.title}
          </span>
        </div>
        <span style={{ color: '#888', fontSize: '12px' }}>
          {entity.fields.filter(f => f.type !== '---').length} polí {isExpanded ? '▲' : '▼'}
        </span>
      </div>
      
      {isExpanded && (
        <div style={{ padding: '12px 16px' }}>
          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {entity.fields.map((field, i) => (
              field.type === '---' ? (
                <div key={i} style={{ borderTop: '1px solid #333', margin: '4px 0', paddingTop: '4px' }}>
                  <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>{field.name}</span>
                </div>
              ) : (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: '13px' }}>
                  <span style={{
                    color: field.name.startsWith('  →') ? '#8b8b8b' : '#e0e0e0',
                    fontFamily: "'JetBrains Mono', monospace",
                    minWidth: field.name.startsWith('  →') ? undefined : '140px',
                    fontWeight: field.name.startsWith('  →') ? 400 : 600,
                    fontSize: field.name.startsWith('  →') ? '12px' : '13px',
                  }}>
                    {field.name}
                  </span>
                  <span style={{ color: entity.color, fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", opacity: 0.8 }}>
                    {field.type}
                  </span>
                  {field.note && (
                    <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>
                      {field.note}
                    </span>
                  )}
                </div>
              )
            ))}
          </div>
          
          {/* Ada example */}
          {showAda && hasAdaData && (
            <div style={{
              marginTop: '12px',
              padding: '10px',
              background: '#0f172a',
              borderRadius: '8px',
              border: '1px solid #334155',
            }}>
              <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {entity.ada.note ? '' : '🐭'} Příklad: Ada Katzenreiserová
              </div>
              {entity.ada.note ? (
                <div style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>{entity.ada.note}</div>
              ) : entity.ada.priklad ? (
                Array.isArray(entity.ada.priklad) ? (
                  entity.ada.priklad.map((p, i) => (
                    <div key={i} style={{ color: '#cbd5e1', fontSize: '12px', padding: '2px 0' }}>• {p}</div>
                  ))
                ) : (
                  <div style={{ color: '#cbd5e1', fontSize: '12px' }}>{entity.ada.priklad}</div>
                )
              ) : (
                Object.entries(entity.ada).filter(([k]) => k !== 'note' && k !== 'priklad').map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', gap: '8px', padding: '2px 0', fontSize: '12px' }}>
                    <span style={{ color: '#64748b', minWidth: '100px', fontFamily: "'JetBrains Mono', monospace" }}>{key}:</span>
                    <span style={{ color: '#cbd5e1' }}>{String(val)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DataModelDiagram() {
  const [expanded, setExpanded] = useState(new Set(["postava"]));
  const [showAda, setShowAda] = useState(false);
  const [showRelations, setShowRelations] = useState(false);
  const [filter, setFilter] = useState("all");
  
  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const expandAll = () => setExpanded(new Set(Object.keys(entities)));
  const collapseAll = () => setExpanded(new Set());
  
  const groups = {
    "Jádro hry": ["postava", "tvorbaPostavy", "pomocnik", "predmet"],
    "Svět": ["osada", "frakce", "npc", "zvesti", "hexcrawl"],
    "Mechaniky": ["mythic", "scena", "boj", "cas"],
  };
  
  const filteredGroups = filter === "all" ? groups : { [filter]: groups[filter] };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#e0e0e0',
      padding: '20px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#fbbf24',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          🐭 Mausritter Solo — Datový Model
        </h1>
        <p style={{ color: '#888', fontSize: '13px', margin: '6px 0 0' }}>
          {Object.keys(entities).length} entit (v5 — ověřeno NotebookLM) · {Object.values(entities).reduce((s, e) => s + e.fields.filter(f => f.type !== '---').length, 0)} polí · Klikni pro detail
        </p>
      </div>
      
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '20px',
      }}>
        <button
          onClick={() => setShowAda(!showAda)}
          style={{
            background: showAda ? '#fbbf24' : '#1e293b',
            color: showAda ? '#000' : '#94a3b8',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {showAda ? '🐭 Ada: ZAP' : '🐭 Ada: VYP'}
        </button>
        <button
          onClick={() => setShowRelations(!showRelations)}
          style={{
            background: showRelations ? '#7c3aed' : '#1e293b',
            color: showRelations ? '#fff' : '#94a3b8',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {showRelations ? '🔗 Vztahy: ZAP' : '🔗 Vztahy: VYP'}
        </button>
        <button onClick={expandAll} style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}>
          Rozbalit vše
        </button>
        <button onClick={collapseAll} style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}>
          Sbalit vše
        </button>
      </div>
      
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '20px' }}>
        {["all", ...Object.keys(groups)].map(g => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            style={{
              background: filter === g ? '#334155' : 'transparent',
              color: filter === g ? '#fff' : '#64748b',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: filter === g ? 600 : 400,
            }}
          >
            {g === "all" ? "Vše" : g}
          </button>
        ))}
      </div>
      
      {/* Relations panel */}
      {showRelations && (
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #7c3aed40',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <h3 style={{ color: '#7c3aed', margin: '0 0 10px', fontSize: '14px' }}>🔗 Vztahy mezi entitami</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {relationships.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: entities[r.from].color, fontWeight: 600, minWidth: '120px' }}>
                  {entities[r.from].emoji} {entities[r.from].title}
                </span>
                <span style={{ color: '#4338ca' }}>→</span>
                <span style={{ color: '#94a3b8', fontStyle: 'italic', minWidth: '160px' }}>{r.label}</span>
                <span style={{ color: '#4338ca' }}>→</span>
                <span style={{ color: entities[r.to].color, fontWeight: 600 }}>
                  {entities[r.to].emoji} {entities[r.to].title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Entity groups */}
      {Object.entries(filteredGroups).map(([groupName, entityIds]) => (
        <div key={groupName} style={{ marginBottom: '24px' }}>
          <h2 style={{
            color: '#64748b',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 700,
            margin: '0 0 10px 4px',
            borderBottom: '1px solid #1e293b',
            paddingBottom: '6px',
          }}>
            {groupName}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '12px',
          }}>
            {entityIds.map(id => (
              <EntityCard
                key={id}
                id={id}
                entity={entities[id]}
                isExpanded={expanded.has(id)}
                onToggle={() => toggle(id)}
                showAda={showAda}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Summary stats */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#1a1a2e',
        borderRadius: '12px',
        border: '1px solid #334155',
        textAlign: 'center',
      }}>
        <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8 }}>
          <strong style={{ color: '#fbbf24' }}>Souhrn:</strong>{' '}
          <span style={{ color: '#b45309' }}>3 herní entity</span> (postava, pomocník, předmět) ·{' '}
          <span style={{ color: '#059669' }}>5 světových entit</span> (osada, frakce, NPC, zvěsti, hexcrawl) ·{' '}
          <span style={{ color: '#be185d' }}>4 mechanické entity</span> (Mythic, scéna, boj, čas)
          <br />
          <span style={{ color: '#64748b', fontSize: '12px' }}>
            Zapni 🐭 Ada pro konkrétní příklad dat z dry runu · Zapni 🔗 Vztahy pro propojení entit
          </span>
        </div>
      </div>
    </div>
  );
}
