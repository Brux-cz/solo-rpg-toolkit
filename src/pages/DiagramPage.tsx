import { useState, useRef, useEffect } from "react";

interface Description {
  title: string;
  text: string;
}

const DESCRIPTIONS: Record<string, Description> = {
  _intro: {
    title: "Solo RPG — Jak to funguje",
    text: `Toto je diagram aplikace pro sólové hraní stolních RPG her (konkrétně Mausritter s Mythic GME).

Hráč je zároveň vypravěč — nemá Game Mastera. Místo toho používá sadu nástrojů (orákulum, generátory, tabulky), které mu pomáhají vymýšlet příběh a reagovat na nečekané situace.

HLAVNÍ PROBLÉM, který aplikace řeší: Při sólovém hraní se rychle hromadí informace — NPC, osady, frakce, úkoly, příběhové linky. Na papíře se v tom hráč po pár sezeních ztrácí. Aplikace drží všechno propojené na jednom místě.

STRUKTURA APLIKACE:
• Uprostřed je Kampáňová Wiki — propojená databáze všech entit kampaně
• Kolem ní běží Cyklus Scény — strukturovaný postup podle Mythic GME
• Po straně jsou Nástroje — generátory, orákulum, kostky — které hráč použije kdykoli potřebuje inspiraci

Diagram se čte jako smyčka: připrav scénu → otestuj chaos → urči typ → hraj → ukonči → zapiš do wiki → připrav další scénu.`,
  },
  wiki_bg: {
    title: "Kampáňová Wiki",
    text: `Jádro celé aplikace. Propojená databáze všech entit, které v kampani existují.

Klíčová hodnota: PROPOJENÍ. NPC není jen řádek v seznamu — patří do osady, je členem frakce, dal hráči úkol, byl potkán ve scéně 5. Klikneš na osadu a vidíš všechny NPC co tam žijí, všechny úkoly, všechny scény.

Tohle je to, co papír neumí a kde se hráč nejvíc ztrácí. Když máš 50 NPC rozházených po osadách a frakcích, potřebuješ filtrovat, hledat, propojovat.

Wiki se plní především během Bookkeepingu (krok 6) a čte se při přípravě další scény (krok 1).`,
  },
  postava: {
    title: "Postava",
    text: `Karta hráčovy postavy — v Mausritteru je to myš. Obsahuje vlastnosti (STR, DEX, WIL), inventář (slot-based systém), HP, stav, popis.

Na papíře je to typicky samostatný list. V aplikaci je propojená se vším ostatním — kde se nachází, jaké má úkoly, s kým mluvila.`,
  },
  npc: {
    title: "NPC (Nehráčské postavy)",
    text: `Všechny postavy, které hráč potkal nebo vytvořil. Každé NPC má jméno, popis, kde žije, ke které frakci patří, jaký má vztah k hráči.

Důležité: NPC se negenerují všechna najednou. Hráč generuje jen ty, se kterými se setkal. V jedné osadě může "žít" 100 NPC, ale v databázi jsou jen ti, kteří se objevili ve hře.

NPC vznikají buď vygenerováním (generátor z knihy nebo Meaning Tables) nebo vymyšlením hráče.`,
  },
  osady: {
    title: "Osady / Místa",
    text: `Lokace ve světě — osady, města, jeskyně, lesy, body zájmu na hexové mapě. Každé místo má popis, kdo tam žije (NPC), co se tam stalo (scény), jaké jsou tam úkoly.

Propojení s NPC a frakcemi je klíčové — osada není jen bod na mapě, ale živé místo s obyvateli a příběhy.`,
  },
  frakce: {
    title: "Frakce",
    text: `Organizované skupiny ve světě — cechy, bandy, šlechtické rody, náboženské řády. Mají členy (NPC), cíle, sídla (osady), vzájemné vztahy.

V Mausritteru jsou frakce důležitý motor příběhu — jejich konflikty a cíle generují hooky a úkoly pro hráče.`,
  },
  ukoly: {
    title: "Úkoly / Hooky",
    text: `Aktivní i splněné úkoly. Hook je "háček" — nabídka dobrodružství, důvod proč někam jít. Úkol je konkrétní zadání (donést balík, zabít krysu, najít artefakt).

Každý úkol je propojený — od koho je (NPC), kde se odehrává (osada), jaký má stav (otevřený/splněný), do které příběhové linky patří.`,
  },
  predmety: {
    title: "Předměty",
    text: `Důležité předměty ve hře — magické artefakty, klíčové dokumenty, poklady. Ne každý předmět v inventáři, ale ty, které mají příběhový význam.

Propojené s tím, kde byly nalezeny, kdo je dal, k jakému úkolu se vztahují.`,
  },
  threads: {
    title: "Příběhové linky (Threads)",
    text: `Koncept z Mythic GME. Thread je otevřená příběhová linie — něco, co se děje a ještě není vyřešené. Například: "Najít ztracenou princeznu", "Zastavit expanzi žabí armády", "Zjistit kdo otrávil studnu".

Threads jsou důležité pro systém — při generování náhodných událostí se Mythic odkazuje na aktivní threads. Čím víc threads, tím komplexnější a propojenější příběh.

Při Bookkeepingu se threads přidávají (nové zápletky) a odebírají (vyřešené).`,
  },
  chaos_val: {
    title: "Chaos Faktor",
    text: `Klíčová mechanika z Mythic GME. Číslo (typicky 1-9), které určuje jak nepředvídatelný je příběh.

Vyšší chaos = větší šance, že se scéna změní oproti očekávání (pozměněná nebo přerušená). Nižší chaos = příběh plyne klidněji, blíž k tomu co hráč očekává.

Mění se po každé scéně při Bookkeepingu:
• Hráč měl scénu pod kontrolou → chaos -1
• Scéna byla chaotická → chaos +1

Žije v wiki jako persistentní hodnota kampaně, ne jako parametr jedné scény.`,
  },
  denik: {
    title: "Deník kampaně",
    text: `Timeline toho, co se stalo. Heslovité záznamy scén ("les → kupec Bertram → úkol balík → Meadowsward") plus občas narativní shrnutí pro důležité momenty.

Slouží k tomu, aby se hráč mohl vrátit a najít "kdy jsem potkal toho kupce" nebo "co se stalo v osadě minule".

Záznamy jsou propojené s entitami — zmíníš NPC, osadu, úkol a automaticky se propojí.`,
  },
  ocekavani: {
    title: "1. Očekávání — Co by se mělo stát?",
    text: `První krok cyklu scény. Hráč si na základě kontextu a záměrů své postavy určí, co by se logicky mělo dít dál.

Může to být vlastní nápad ("postava jde do města prodat kořist") nebo si pomůže nástroji:
• Meaning Tables — hodí dvojici abstraktních slov a interpretuje je
• Metoda 4W (Kdo, Co, Kde, Proč) — strukturovaný způsob vytvoření scény
• Generátory z knih

V tomto kroku hráč čte z wiki — podívá se na aktivní threads, kde je postava, co je rozehrané.

VÝJIMKA: Úplně první scéna kampaně se netestuje proti chaosu (krok 2 se přeskočí).`,
  },
  test_chaosu: {
    title: "2. Test Chaosu — d10 vs Chaos Faktor",
    text: `Mechanický test, který rozhodne jestli scéna proběhne podle očekávání.

Hráč hodí 1d10 a porovná s aktuálním Chaos Faktorem (CF):

• Hod VYŠŠÍ než CF → Scéna proběhne přesně jak hráč čekal (Očekávaná)
• Hod STEJNÝ nebo NIŽŠÍ a je LICHÝ (1,3,5,7,9) → Scéna se změní (Pozměněná)
• Hod STEJNÝ nebo NIŽŠÍ a je SUDÝ (2,4,6,8) → Scéna je úplně jiná (Přerušená)

Čím vyšší chaos, tím větší šance na překvapení. To je elegantní mechanika — příběh se sám reguluje.`,
  },
  typ_sceny_bg: {
    title: "3. Typ Scény",
    text: `Výsledek testu chaosu určí jeden ze tří typů:

OČEKÁVANÁ — proběhne přesně jak hráč plánoval. Nejjednodušší varianta.

POZMĚNĚNÁ — vychází z původního nápadu, ale něco se změní. Hráč použije Scene Adjustment Table, která mu napoví jakou změnu udělat (přidat postavu, zvýšit intenzitu, změnit lokaci...).

PŘERUŠENÁ — úplně ignoruje původní plán. Hráč vygeneruje náhodnou událost pomocí Event Focus (na co se událost zaměřuje) a Meaning Tables (dvojice slov pro interpretaci). Výsledkem je úplně nová scéna.`,
  },
  hrani: {
    title: "4. Hraní Scény",
    text: `Nejdelší a nejdůležitější část. Hráč ví jaká scéna je a začne ji hrát.

Co se děje:
• Hráč vypráví a popisuje co postava dělá
• Když neví co se stane → ptá se Orákula (Fate Questions: "Je tam stráž?" → ano/ne)
• Když potřebuje inspiraci → Meaning Tables (dvojice slov k interpretaci)
• Když potřebuje konkrétní věc → Generátory z knih (NPC, poklady, místa)
• Když nastane konflikt → mechaniky boje podle pravidel Mausritteru
• Když potřebuje rozhodnout → hod kostkou

Hráč používá nástroje PODLE SEBE — není předepsané pořadí. Je to tvůrčí proces kde se střídá vymýšlení, generování a rozhodování.

Uvnitř scény může vzniknout cokoli — boj, dialog, nové NPC, nový úkol, objev místa.`,
  },
  ukonceni: {
    title: "5. Scéna Vyčerpána",
    text: `Hráč sám rozhodne kdy scéna končí. Strategie pro ukončení:

• ZÁJEM — scéna končí když už se neděje nic zajímavého (výchozí metoda)
• ČAS NEBO MÍSTO — postava změní lokaci nebo uplyne delší čas
• NARATIVNÍ POSUN — dojde k zásadnímu zvratu v příběhu

Neexistuje mechanický trigger — je to čistě hráčovo rozhodnutí. "Tohle je dost, pojďme dál."`,
  },
  bookkeeping: {
    title: "6. Bookkeeping — Zápis do Wiki",
    text: `Administrativa po scéně. Klíčový moment, kdy se aktualizuje wiki:

1. AKTUALIZACE SEZNAMŮ — přidej nové NPC, osady, předměty které se ve scéně objevily. Odstraň splněné úkoly. Přidej nové příběhové linky (threads).

2. ÚPRAVA CHAOS FAKTORU:
   • Postava měla scénu pod kontrolou → CF -1
   • Scéna byla chaotická, postava ztratila kontrolu → CF +1

3. ZÁPIS DO DENÍKU — heslovitý záznam co se stalo.

Tohle je moment, kde aplikace nejvíc pomáhá. Na papíře musí hráč být extrémně důsledný. V aplikaci: vygeneruješ NPC → je automaticky v osadě kde jsi. Zapíšeš scénu → propojí se s entitami.

Po bookkeepingu se cyklus opakuje — hráč vymyslí novou Očekávanou scénu.`,
  },
  zpet: {
    title: "Nová Scéna — Cyklus se opakuje",
    text: `Po bookkeepingu se vracíme na krok 1. Hráč na základě aktualizované wiki a aktuálního stavu kampaně vymyslí co by se mělo stát dál.

Tento cyklus je páteř celé hry. Může se opakovat desítky nebo stovky krát během jedné kampaně.`,
  },
  nastroje_bg: {
    title: "Panel Nástrojů",
    text: `Sada inspiračních nástrojů, které hráč používá kdykoli potřebuje. Nejsou navázané na konkrétní krok — jsou "po ruce na stole".

Všechny nástroje dělají v podstatě totéž: dávají hráči IMPULZ, ze kterého hráč vytvoří obsah. Ať je to abstraktní dvojice slov (Meaning Tables) nebo konkrétní výsledek (generátor z knihy) — výstup jde na stejné místo.

Hráč si vybere který nástroj zrovna sedí. Někdy chce konkrétní NPC z tabulky, jindy chce jen dva slova a domyslí si zbytek sám.`,
  },
  t_meaning: {
    title: "Meaning Tables",
    text: `Tabulky z Mythic GME. Hodíš a dostaneš dvojici abstraktních slov — například "Excited" + "Unusual" nebo "Fail" + "Portal".

TY z toho vytvoříš význam v kontextu aktuální situace. Nejsou to hotové výsledky — jsou to kreativní impulzy.

Používají se pro cokoli: NPC, scénu, místo, situaci, motivaci. Jsou univerzální.`,
  },
  t_orakulum: {
    title: "Orákulum (Fate Questions)",
    text: `Mechanika z Mythic GME pro odpovídání na otázky ano/ne.

Hráč se zeptá: "Je v místnosti někdo?" "Uteče ten strážný?" "Bude pršet?"

Systém odpoví na základě pravděpodobnosti a chaos faktoru. Může přidat i komplikaci nebo náhodnou událost.

Používá se jak uvnitř scény (během hraní), tak při přípravě scény.`,
  },
  t_gen: {
    title: "Generátory (z knih)",
    text: `Konkrétní tabulky z pravidlových knih — Mausritter, Mythic GME, dodatky a rozšíření.

Na rozdíl od Meaning Tables dávají konkrétní výsledky: "mlýn obývaný žábami", "kupec s jedním okem", "meč +1".

Hráč je používá podle potřeby a z různých zdrojů — je jedno z jaké knihy, výsledek jde na stejné místo.`,
  },
  t_kostky: {
    title: "Hod Kostkou",
    text: `Základní mechanika — d4, d6, d8, d10, d12, d20. Pro řešení konfliktů, hodů na dovednosti, náhodné tabulky.

V Mausritteru se používá především d20 pro save hody a d6 pro poškození.`,
  },
  param_bg: {
    title: "Parametry Scény",
    text: `Kreativní vstupy, které pomáhají zarámovat scénu. Hráč si je nastaví (nebo vygeneruje) před začátkem scény:

• TÉMA — o čem scéna bude (např. "obrana a zdraví" → opravují opevnění a léčí zraněné)
• NÁLADA — emoční tón scény
• ATMOSFÉRA — jak scéna vypadá a jak se cítí
• POČASÍ — praktický detail, který ovlivňuje vyprávění

Nejsou to mechanické hodnoty — jsou to kreativní vodítka, která hráči pomáhají držet scénu zaměřenou.`,
  },
  meritko: {
    title: "Měřítko (V hlavě)",
    text: `Hráčův mentální přepínač mezi dvěma módy přemýšlení:

ARCHITEKT — přemýšlí ve velkém měřítku. Nastavování světa, tvorba frakcí, plánování osad, hlavní příběhová linie. "Jak funguje tenhle svět?"

PRŮZKUMNÍK — přemýšlí v malém měřítku. Boj, zkoumání hexů, dialogy, směny (turny). "Co dělá moje myš právě teď?"

DŮLEŽITÉ: Tohle NENÍ funkce aplikace. Je to popis toho, jak hráč přirozeně přepíná v hlavě. Aplikace by to mohla podpořit (nabízet relevantní nástroje), ale neřídí to.`,
  },
  hrac: {
    title: "TY (Hráč + GM)",
    text: `Hráč je středem všeho. Je zároveň hráč (hraje postavu) i Game Master (vymýšlí svět, řídí NPC, rozhoduje o výsledcích).

Aplikace ho NENAHRAZUJE jako GM. Aplikace je sada nástrojů na stole — hráč si z nich bere co potřebuje, kdy potřebuje. Kreativní práce a rozhodování je vždy na něm.

Nástroje mu pomáhají když: neví co dál, potřebuje inspiraci, chce překvapení, nebo potřebuje rozhodnout něco nestranně.`,
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
  { id: "wiki_bg", x: 320, y: 230, w: 360, h: 280, type: "group", label: "KAMPÁŇOVÁ WIKI" },
  { id: "postava", x: 350, y: 268, w: 95, h: 32, type: "core", label: "POSTAVA" },
  { id: "npc", x: 455, y: 268, w: 70, h: 32, type: "core", label: "NPC" },
  { id: "osady", x: 535, y: 268, w: 110, h: 32, type: "core", label: "OSADY/MÍSTA" },
  { id: "frakce", x: 350, y: 310, w: 95, h: 32, type: "core", label: "FRAKCE" },
  { id: "ukoly", x: 455, y: 310, w: 70, h: 32, type: "core", label: "ÚKOLY" },
  { id: "predmety", x: 535, y: 310, w: 110, h: 32, type: "core", label: "PŘEDMĚTY" },
  { id: "threads", x: 350, y: 355, w: 295, h: 32, type: "core", label: "PŘÍBĚHOVÉ LINKY (THREADS)" },
  { id: "chaos_val", x: 350, y: 397, w: 140, h: 32, type: "core_highlight", label: "CHAOS FAKTOR" },
  { id: "denik", x: 500, y: 397, w: 145, h: 32, type: "core", label: "DENÍK" },
  { id: "propojeni", x: 390, y: 445, w: 220, h: 24, type: "sublabel", label: "⟷ vše propojené ⟷" },
  { id: "ocekavani", x: 380, y: 50, w: 240, h: 50, type: "cycle", label: "1. OČEKÁVÁNÍ\nco by se mělo stát?" },
  { id: "test_chaosu", x: 750, y: 140, w: 210, h: 50, type: "cycle", label: "2. TEST CHAOSU\nd10 vs chaos faktor" },
  { id: "typ_sceny_bg", x: 740, y: 240, w: 230, h: 170, type: "group", label: "3. TYP SCÉNY" },
  { id: "ocekavana", x: 760, y: 272, w: 190, h: 28, type: "scene_type", label: "Očekávaná (vyšší)" },
  { id: "pozmenena", x: 760, y: 306, w: 190, h: 28, type: "scene_type", label: "Pozměněná (lichý ≤ CF)" },
  { id: "prerusena", x: 760, y: 340, w: 190, h: 28, type: "scene_type", label: "Přerušená (sudý ≤ CF)" },
  { id: "adj_table", x: 770, y: 375, w: 180, h: 22, type: "sublabel_tool", label: "↳ Scene Adjustment Table" },
  { id: "event_focus", x: 770, y: 393, w: 180, h: 22, type: "sublabel_tool", label: "↳ Event Focus + Meaning" },
  { id: "hrani", x: 720, y: 450, w: 270, h: 60, type: "cycle_active", label: "4. HRANÍ SCÉNY\nvyprávím · rozhoduji · reaguji" },
  { id: "ukonceni", x: 380, y: 565, w: 240, h: 45, type: "cycle", label: "5. SCÉNA VYČERPÁNA" },
  { id: "bookkeeping", x: 40, y: 450, w: 230, h: 65, type: "cycle_write", label: "6. BOOKKEEPING\nNPC, threads, chaos ±1\nzápis do wiki" },
  { id: "zpet", x: 55, y: 140, w: 210, h: 50, type: "cycle", label: "→ NOVÁ SCÉNA\nzpět na očekávání" },
  { id: "nastroje_bg", x: 30, y: 240, w: 210, h: 190, type: "group", label: "PANEL NÁSTROJŮ" },
  { id: "t_meaning", x: 50, y: 268, w: 170, h: 28, type: "tool", label: "◈ Meaning Tables" },
  { id: "t_orakulum", x: 50, y: 302, w: 170, h: 28, type: "tool", label: "◈ Orákulum (Fate Q)" },
  { id: "t_gen", x: 50, y: 336, w: 170, h: 28, type: "tool", label: "⚄ Generátory (knihy)" },
  { id: "t_kostky", x: 50, y: 370, w: 170, h: 28, type: "tool", label: "⚅ Hod kostkou" },
  { id: "nastroje_sub", x: 50, y: 402, w: 170, h: 22, type: "sublabel", label: "použiješ kdy chceš" },
  { id: "param_bg", x: 100, y: 22, w: 250, h: 85, type: "group", label: "PARAMETRY SCÉNY" },
  { id: "tema", x: 120, y: 48, w: 100, h: 26, type: "tool", label: "Téma" },
  { id: "nalada", x: 230, y: 48, w: 100, h: 26, type: "tool", label: "Nálada" },
  { id: "atmosfera", x: 120, y: 78, w: 100, h: 26, type: "tool", label: "Atmosféra" },
  { id: "pocasi", x: 230, y: 78, w: 100, h: 26, type: "tool", label: "Počasí" },
  { id: "meritko", x: 740, y: 48, w: 230, h: 55, type: "note", label: "MĚŘÍTKO (V HLAVĚ)", bullets: ["architekt ↔ průzkumník"] },
  { id: "hrac", x: 430, y: 490, w: 140, h: 36, type: "player", label: "TY (hráč + GM)" },
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
  { from: "ukonceni", to: "bookkeeping", fromSide: "left", toSide: "right", style: "solid" },
  { from: "bookkeeping", to: "zpet", fromSide: "top", toSide: "bottom", style: "solid" },
  { from: "zpet", to: "ocekavani", fromSide: "right", toSide: "left", style: "solid" },
  { from: "bookkeeping", to: "wiki_bg", fromSide: "right", toSide: "left", style: "dashed" },
  { from: "wiki_bg", to: "ocekavani", fromSide: "top", toSide: "bottom", style: "dashed" },
  { from: "param_bg", to: "ocekavani", fromSide: "right", toSide: "left", style: "dashed" },
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
  if ((edge.fromSide === "right" && edge.toSide === "left") ||
      (edge.fromSide === "left" && edge.toSide === "right")) {
    const midX = (a.x + b.x) / 2;
    path = `M${a.x},${a.y} L${midX},${a.y} L${midX},${b.y} L${b.x},${b.y}`;
  } else if ((edge.fromSide === "bottom" && edge.toSide === "top") ||
             (edge.fromSide === "top" && edge.toSide === "bottom")) {
    const midY = (a.y + b.y) / 2;
    path = `M${a.x},${a.y} L${a.x},${midY} L${b.x},${midY} L${b.x},${b.y}`;
  } else {
    path = `M${a.x},${a.y} L${b.x},${b.y}`;
  }
  const dashArray = edge.style === "dashed" ? "6 4" : "none";
  const color = edge.style === "solid" ? "#555" : "#aaa";
  return (
    <g>
      <path d={path} fill="none" stroke={color} strokeWidth={1.4} strokeDasharray={dashArray} />
      <ArrowHead x={b.x} y={b.y} side={edge.toSide} color={color} />
    </g>
  );
}

const STYLES: Record<string, { fill: string; stroke: string; textFill: string; fontWeight: number; rx: number; fontSize: number }> = {
  core: { fill: "#2a2a2a", stroke: "#2a2a2a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 10 },
  core_highlight: { fill: "#4a3a2a", stroke: "#8a6a3a", textFill: "#faf9f6", fontWeight: 700, rx: 4, fontSize: 10 },
  cycle: { fill: "#faf9f6", stroke: "#555", textFill: "#333", fontWeight: 600, rx: 6, fontSize: 11 },
  cycle_active: { fill: "#e8e5dd", stroke: "#333", textFill: "#222", fontWeight: 700, rx: 6, fontSize: 11 },
  cycle_write: { fill: "#dde8dd", stroke: "#4a7a4a", textFill: "#2a4a2a", fontWeight: 700, rx: 6, fontSize: 11 },
  scene_type: { fill: "#f5f3ee", stroke: "#bbb", textFill: "#555", fontWeight: 500, rx: 4, fontSize: 10 },
  tool: { fill: "#faf9f6", stroke: "#888", textFill: "#444", fontWeight: 500, rx: 4, fontSize: 10 },
  sublabel: { fill: "transparent", stroke: "none", textFill: "#aaa", fontWeight: 400, rx: 0, fontSize: 9 },
  sublabel_tool: { fill: "transparent", stroke: "none", textFill: "#999", fontWeight: 400, rx: 0, fontSize: 9 },
  player: { fill: "#faf9f6", stroke: "#333", textFill: "#333", fontWeight: 800, rx: 20, fontSize: 12 },
};

function NodeBox({ node, selected, onSelect }: { node: NodeData; selected: string | null; onSelect: (id: string) => void }) {
  const hasDesc = DESCRIPTIONS[node.id];
  const isSelected = selected === node.id;
  const clickable = !!hasDesc;

  if (node.type === "group") {
    return (
      <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined}
         style={{ cursor: clickable ? "pointer" : "default" }}>
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={isSelected ? "rgba(100,100,200,0.06)" : "none"} stroke={isSelected ? "#666" : "#ccc"} strokeWidth={isSelected ? 1.5 : 1} strokeDasharray="6 3" rx={6} />
        <text x={node.x + node.w / 2} y={node.y - 8} textAnchor="middle"
          style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fill: isSelected ? "#555" : "#999",
            fontWeight: 600, letterSpacing: "0.08em" }}>
          {node.label}
        </text>
      </g>
    );
  }
  if (node.type === "note") {
    return (
      <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined}
         style={{ cursor: clickable ? "pointer" : "default" }}>
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={isSelected ? "#f0efe8" : "#faf9f6"} stroke={isSelected ? "#666" : "#bbb"} strokeWidth={isSelected ? 1.5 : 1} rx={4} />
        <text x={node.x + 12} y={node.y + 18}
          style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fill: "#888", fontWeight: 600 }}>
          {node.label}
        </text>
        {node.bullets?.map((b, i) => (
          <text key={i} x={node.x + 14} y={node.y + 36 + i * 16}
            style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fill: "#999" }}>
            {b}
          </text>
        ))}
      </g>
    );
  }
  const s = STYLES[node.type] || STYLES.tool;
  const lines = node.label.split("\n");
  const fontSize = s.fontSize || 11;
  const lineHeight = fontSize + 4;
  const totalH = lines.length * lineHeight;
  const startY = node.y + node.h / 2 - totalH / 2 + lineHeight * 0.72;

  const highlightStroke = isSelected ? (s.fill === "#2a2a2a" || s.fill === "#4a3a2a" ? "#8888cc" : "#555") : s.stroke;
  const highlightWidth = isSelected ? 2.5 : 1.2;

  return (
    <g onClick={clickable ? (e) => { e.stopPropagation(); onSelect(node.id); } : undefined}
       style={{ cursor: clickable ? "pointer" : "default" }}>
      {s.stroke !== "none" && (
        <rect x={node.x} y={node.y} width={node.w} height={node.h}
          fill={s.fill} stroke={highlightStroke} strokeWidth={highlightWidth} rx={s.rx} />
      )}
      {lines.map((line, i) => (
        <text key={i} x={node.x + node.w / 2} y={startY + i * lineHeight} textAnchor="middle"
          style={{ fontSize, fontFamily: "'IBM Plex Mono', monospace", fill: s.textFill,
            fontWeight: s.fontWeight, letterSpacing: "0.02em" }}>
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
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: "min(420px, 85vw)",
      background: "#faf9f6", borderLeft: "2px solid #333", zIndex: 20,
      display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid #e0ddd5",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#222",
          fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.3, paddingRight: 12 }}>
          {desc.title}
        </h2>
        <button onClick={onClose} style={{
          background: "#333", color: "#faf9f6", border: "none", borderRadius: 4,
          width: 32, height: 32, fontSize: 16, cursor: "pointer", flexShrink: 0,
          fontFamily: "'IBM Plex Mono', monospace", display: "flex", alignItems: "center",
          justifyContent: "center",
        }}>✕</button>
      </div>
      <div style={{
        padding: "16px 20px", overflowY: "auto", flex: 1,
      }}>
        {desc.text.split("\n\n").map((para, i) => (
          <p key={i} style={{
            margin: "0 0 14px 0", fontSize: 13, lineHeight: 1.65, color: "#444",
            fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "pre-wrap",
          }}>
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
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(z => Math.min(Math.max(z * (e.deltaY > 0 ? 0.92 : 1.08), 0.3), 3));
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
  const handleMouseMove = (e: React.MouseEvent) => { if (dragging) { setDidMove(true); setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }); } };
  const handleMouseUp = () => setDragging(false);

  const handleSvgClick = () => {
    if (!didMove) setSelected(null);
  };

  const handleNodeSelect = (id: string) => {
    if (!didMove) setSelected(id === selected ? null : id);
  };

  const btnStyle: React.CSSProperties = {
    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6,
    fontSize: 20, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer",
    WebkitTapHighlightColor: "transparent", userSelect: "none",
  };

  return (
    <div ref={containerRef} style={{
      width: "100%", height: "100vh", background: "#faf9f6",
      fontFamily: "'IBM Plex Mono', monospace", position: "relative", overflow: "hidden",
      touchAction: "pan-y",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, padding: "10px 16px",
        background: "rgba(250,249,246,0.92)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e0ddd5", display: "flex", justifyContent: "space-between",
        alignItems: "center", zIndex: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#333", letterSpacing: "0.05em" }}>
          SOLO RPG — CYKLUS SCÉNY + WIKI
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setSelected("_intro")} style={{
            fontSize: 10, padding: "5px 10px", background: selected === "_intro" ? "#555" : "#333",
            color: "#faf9f6", border: "none", borderRadius: 4, cursor: "pointer",
            fontFamily: "inherit", fontWeight: 600, letterSpacing: "0.05em",
          }}>O PROJEKTU</button>
          <span style={{ fontSize: 11, color: "#888" }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 20, right: selected ? "min(436px, calc(85vw + 16px))" : 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 10, transition: "right 0.2s" }}>
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} style={btnStyle}>+</button>
        <button onClick={() => setZoom(z => Math.max(z * 0.8, 0.3))} style={btnStyle}>−</button>
        <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} style={{ ...btnStyle, fontSize: 11 }}>↺</button>
      </div>

      <svg width="100%" height="100%"
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onClick={handleSvgClick}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      >
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

      <div style={{ position: "absolute", bottom: 8, left: 16, fontSize: 10, color: "#bbb" }}>
        KLIKNI NA BLOK PRO DETAIL · TÁHNI · PINCH ZOOM · CTRL+SCROLL
      </div>

      {selected && <InfoPanel descId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
