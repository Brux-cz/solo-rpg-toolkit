// Mythic GME 2e Fate Chart — diagonální reprezentace
// Každá buňka má TŘI prahy: [Výjimečné Ano, Ano, Výjimečné Ne]
// Pozice = oddsIndex + cf (odds 0-8, cf 1-9), rozsah 1-17
// Diagonální vlastnost: +1 likelihood = +1 CF
// Příklady z diagramu: 50/50@CF5=[10,50,91], Likely@CF5=[13,65,94], Unlikely@CF5=[7,35,88]
export const FATE_DIAG = [
  null,           // 0 — nepoužito
  [0,   1, 81],   // pos 1  (Impossible@CF1) — X = excYes impossible
  [0,   1, 81],   // pos 2
  [0,   1, 81],   // pos 3
  [1,   5, 82],   // pos 4
  [2,  10, 83],   // pos 5
  [3,  15, 84],   // pos 6
  [5,  25, 86],   // pos 7
  [7,  35, 88],   // pos 8  (Unlikely@CF5)
  [10, 50, 91],   // pos 9  (50/50@CF5)
  [13, 65, 94],   // pos 10 (Likely@CF5)
  [15, 75, 96],   // pos 11
  [17, 85, 98],   // pos 12
  [18, 90, 99],   // pos 13 (50/50@CF9)
  [19, 95, 100],  // pos 14
  [20, 99, 101],  // pos 15 — x = excNo impossible
  [20, 99, 101],  // pos 16
  [20, 99, 101],  // pos 17 (Certain@CF9)
];

// 9 úrovní pravděpodobnosti (Mythic 2e)
export const ODDS_LABELS = [
  "Impossible",
  "Nearly impossible",
  "Very unlikely",
  "Unlikely",
  "50/50",
  "Likely",
  "Very likely",
  "Nearly certain",
  "Certain",
];

export const ACTIONS = [
  "Attainment","Starting","Neglect","Fight","Recruit","Triumph","Violate","Oppose","Malice","Communicate",
  "Persecute","Increase","Decrease","Abandon","Gratify","Inquire","Antagonize","Move","Waste","Truce",
  "Release","Befriend","Judge","Desert","Dominate","Procrastinate","Praise","Separate","Take","Break",
  "Heal","Delay","Stop","Lie","Return","Imitate","Struggle","Inform","Bestow","Postpone",
  "Expose","Haggle","Imprison","Release","Celebrate","Develop","Travel","Block","Harm","Debase",
  "Overindulge","Adjourn","Adversity","Kill","Disrupt","Usurp","Create","Betray","Agree","Abuse",
  "Oppress","Inspect","Ambush","Spy","Attach","Carry","Open","Carelessness","Ruin","Extravagance",
  "Trick","Arrive","Propose","Divide","Refuse","Mistrust","Deceive","Cruelty","Intolerance","Trust",
  "Excitement","Activity","Assist","Care","Negligence","Passion","Work","Control","Attract","Failure",
  "Pursue","Vengeance","Proceedings","Dispute","Punish","Guide","Transform","Overthrow","Oppress","Change",
];

export const ACTIONS_CZ = [
  "Dosažení","Začátek","Zanedbání","Boj","Nábor","Triumf","Porušení","Odpor","Zloba","Komunikace",
  "Pronásledování","Nárůst","Pokles","Opuštění","Uspokojení","Vyšetřování","Provokace","Pohyb","Plýtvání","Příměří",
  "Propuštění","Sblížení","Soud","Útěk","Nadvláda","Odkládání","Chvála","Oddělení","Zabrání","Rozbití",
  "Uzdravení","Zdržení","Zastavení","Lež","Návrat","Napodobení","Zápas","Informování","Darování","Odložení",
  "Odhalení","Smlouvání","Uvěznění","Osvobození","Oslava","Rozvoj","Cestování","Zablokování","Ublížení","Ponížení",
  "Nestřídmost","Přerušení","Protivenství","Zabití","Narušení","Uzurpace","Tvorba","Zrada","Souhlas","Zneužití",
  "Útlak","Prozkoumání","Přepadení","Špehování","Připojení","Nesení","Otevření","Neopatrnost","Zničení","Rozmařilost",
  "Lest","Příchod","Návrh","Rozdělení","Odmítnutí","Nedůvěra","Podvod","Krutost","Nesnášenlivost","Důvěra",
  "Vzrušení","Činnost","Pomoc","Péče","Nedbalost","Vášeň","Práce","Kontrola","Přitažení","Selhání",
  "Pronásledování","Pomsta","Řízení","Spor","Potrestání","Vedení","Proměna","Svržení","Útisk","Změna",
];

export const DESCRIPTIONS = [
  "Abnormally","Adventurously","Aggressively","Angrily","Anxiously","Awkwardly","Beautifully","Bleakly","Boldly","Bravely",
  "Busily","Calmly","Carefully","Carelessly","Cautiously","Ceaselessly","Cheerfully","Combatively","Coolly","Crazily",
  "Curiously","Daintily","Dangerously","Defiantly","Deliberately","Delightfully","Dimly","Efficiently","Energetically","Enormously",
  "Enthusiastically","Excitedly","Fearfully","Ferociously","Fiercely","Foolishly","Fortunately","Freely","Frighteningly","Fully",
  "Generously","Gently","Gladly","Gracefully","Gratefully","Happily","Hastily","Healthily","Helpfully","Helplessly",
  "Heroically","Honestly","Hopelessly","Hungrily","Immediately","Impatiently","Independently","Innocently","Insistently","Intensely",
  "Interestingly","Irritatingly","Joyfully","Judgmentally","Kindly","Knowingly","Lazily","Lightly","Loosely","Loudly",
  "Lovingly","Loyally","Meanly","Mildly","Mysteriously","Naturally","Neatly","Nervously","Nicely","Oddly",
  "Offensively","Officially","Partially","Passively","Peacefully","Perfectly","Playfully","Politely","Positively","Powerfully",
  "Quaintly","Quarrelsomely","Quietly","Roughly","Rudely","Ruthlessly","Sadly","Savagely","Seriously","Sharply",
];

export const DESCRIPTIONS_CZ = [
  "Neobvykle","Dobrodružně","Agresivně","Rozzlobeně","Úzkostně","Neobratně","Krásně","Ponuře","Odvážně","Statečně",
  "Horlivě","Klidně","Opatrně","Bezstarostně","Obezřetně","Neústupně","Vesele","Bojovně","Chladně","Šíleně",
  "Zvědavě","Jemně","Nebezpečně","Vzdorovitě","Záměrně","Rozkošně","Matně","Účinně","Energicky","Ohromně",
  "Nadšeně","Vzrušeně","Bázlivě","Zuřivě","Prudce","Pošetile","Šťastně","Svobodně","Děsivě","Plně",
  "Štědře","Něžně","Radostně","Elegantně","Vděčně","Blaženě","Ukvapeně","Zdravě","Nápomocně","Bezmocně",
  "Hrdinně","Upřímně","Beznadějně","Hladově","Okamžitě","Netrpělivě","Nezávisle","Nevinně","Naléhavě","Intenzivně",
  "Zajímavě","Podrážděně","Radostně","Kriticky","Laskavě","Vědomě","Líně","Lehce","Volně","Hlasitě",
  "Láskyplně","Věrně","Zlomyslně","Mírně","Tajemně","Přirozeně","Úhledně","Nervózně","Příjemně","Podivně",
  "Útočně","Oficiálně","Částečně","Pasivně","Pokojně","Dokonale","Hravě","Zdvořile","Pozitivně","Mocně",
  "Svérázně","Hašteřivě","Tiše","Hrubě","Nevychovaně","Nelítostně","Smutně","Divoce","Vážně","Ostře",
];

// Scene Adjustment Table (d10) — pro pozměněné scény
// 7-10 = DVĚ úpravy (diagram: 4 ze 10 pozic = 40% šance)
export const SCENE_ADJ = [
  "Odeber postavu",
  "Přidej postavu",
  "Sniž/odeber aktivitu",
  "Zvyš aktivitu",
  "Odeber předmět",
  "Přidej předmět",
  "DVĚ úpravy",
  "DVĚ úpravy",
  "DVĚ úpravy",
  "DVĚ úpravy",
];

// Event Focus Table (d100) — diagram rozsahy
export const EVENT_FOCUS = [
  [5,   "Remote Event"],
  [10,  "Ambiguous Event"],
  [20,  "New NPC"],
  [40,  "NPC Action"],
  [45,  "NPC Negative"],
  [50,  "NPC Positive"],
  [55,  "Move toward thread"],
  [65,  "Move away from thread"],
  [70,  "Close thread"],
  [80,  "PC Negative"],
  [85,  "PC Positive"],
  [100, "Current Context"],
];

// Thread Discovery Check Table (1d10 + progress)
// [maxRoll, type, points, description]
export const THREAD_DISCOVERY = [
  [9,  "Progress",   2, "Objev posune blíž k vyřešení"],
  [10, "Flashpoint", 2, "Dramatická důležitá událost"],
  [14, "Track",      1, "Úsilí samo posouvá, nic konkrétního"],
  [17, "Progress",   3, "Významný objev"],
  [18, "Flashpoint", 3, "Velký dramatický zlom"],
  [19, "Track",      2, "Úsilí posouvá výrazněji"],
  [24, "Strengthen", 1, "Dřívější pokrok posílen/potvrzen"],
  [99, "Strengthen", 2, "Dřívější pokrok výrazně posílen"], // 25+
];

// === TVORBA POSTAVY ===

// Tabulka původu 6×6: BACKGROUND_TABLE[bo-1][dobky-1] → { nazev, itemA, itemB }
export const BACKGROUND_TABLE = [
  // BO 1
  [
    { nazev: "Pokusná myš", itemA: "Kouzlo:Kouzelná střela", itemB: "Olověný plášť" },
    { nazev: "Kuchyňský slídil", itemA: "Štít a kabátec", itemB: "Hrnce" },
    { nazev: "Uprchlík z klece", itemA: "Kouzlo:Srozumitelnost", itemB: "Láhev mléka" },
    { nazev: "Čarodějnice", itemA: "Kouzlo:Zahojení", itemB: "Vonná tyčka" },
    { nazev: "Kožešník", itemA: "Štít a kabátec", itemB: "Silné nůžky" },
    { nazev: "Pouliční rváč", itemA: "Dýka d6", itemB: "Láhev kávy" },
  ],
  // BO 2
  [
    { nazev: "Žebravý kněz", itemA: "Kouzlo:Zotavení", itemB: "Svatý symbol" },
    { nazev: "Honák brouků", itemA: "Pomocník:věrný brouk", itemB: "Tyč 15cm" },
    { nazev: "Sládek", itemA: "Pomocník:opilý světlonoš", itemB: "Soudek piva" },
    { nazev: "Rybář", itemA: "Síť", itemB: "Jehla d6" },
    { nazev: "Kovář", itemA: "Kladivo d6/d8", itemB: "Pilník na železo" },
    { nazev: "Dráteník", itemA: "Drát", itemB: "Elektrická lampa" },
  ],
  // BO 3
  [
    { nazev: "Dřevorubec", itemA: "Sekera d6/d8", itemB: "Motouz" },
    { nazev: "Člen netopýřího kultu", itemA: "Kouzlo:Tma", itemB: "Pytlík netopýřích zubů" },
    { nazev: "Horník v cínovém dole", itemA: "Krumpáč d6/d8", itemB: "Lucerna" },
    { nazev: "Sběrač odpadků", itemA: "Hák na odpadky d10", itemB: "Zrcátko" },
    { nazev: "Stěnolezec", itemA: "Rybářský háček", itemB: "Nit" },
    { nazev: "Kupec", itemA: "Pomocník:tažná krysa", itemB: "Směnka 20ď" },
  ],
  // BO 4
  [
    { nazev: "Vorař", itemA: "Kladivo d6/d8", itemB: "Dřevěné klíny" },
    { nazev: "Honák žížal", itemA: "Tyč 15cm", itemB: "Mýdlo" },
    { nazev: "Vlaštovkář", itemA: "Rybářský háček", itemB: "Ochranné brýle" },
    { nazev: "Kanálník", itemA: "Pilník na železo", itemB: "Nit" },
    { nazev: "Žalářník", itemA: "Řetěz 15cm", itemB: "Kopí d10" },
    { nazev: "Pěstitel hub", itemA: "Sušené houby", itemB: "Maska proti spórám" },
  ],
  // BO 5
  [
    { nazev: "Stavitel hrází", itemA: "Lopata", itemB: "Dřevěné klíny" },
    { nazev: "Kartograf", itemA: "Brk a inkoust", itemB: "Kompas" },
    { nazev: "Vykradač pastiček", itemA: "Kus sýra", itemB: "Lepidlo" },
    { nazev: "Tulák", itemA: "Stan", itemB: "Mapa k pokladu" },
    { nazev: "Pěstitel obilí", itemA: "Kopí d10", itemB: "Píšťalka" },
    { nazev: "Poslíček", itemA: "Deka", itemB: "Dokumenty zapečetěné" },
  ],
  // BO 6
  [
    { nazev: "Trubadúr", itemA: "Hudební nástroj", itemB: "Maskovací sada" },
    { nazev: "Hazardní hráč", itemA: "Zatížené kostky", itemB: "Zrcátko" },
    { nazev: "Sběrač mízy", itemA: "Vědro", itemB: "Dřevěné klíny" },
    { nazev: "Včelař", itemA: "Sklenice medu", itemB: "Síť" },
    { nazev: "Knihovník", itemA: "Útržek ze starodávné knihy", itemB: "Brk a inkoust" },
    { nazev: "Zchudlý šlechtic", itemA: "Plstěný klobouk", itemB: "Parfém" },
  ],
];

// Zbraně na výběr (krok 4)
export const WEAPON_CHOICES = [
  { nazev: "Improvizovaná", dmg: "d6", sloty: 1, span: { rows: 1, cols: 1 }, jeImprovizovana: true, tecky: 1 },
  { nazev: "Lehká (dýka, jehla)", dmg: "d6", sloty: 1, span: { rows: 1, cols: 1 }, tecky: 3 },
  { nazev: "Střední (meč, sekera)", dmg: "d8", sloty: 1, span: { rows: 1, cols: 1 }, tecky: 3 },
  { nazev: "Těžká (kopí, hákopí)", dmg: "d10", sloty: 2, span: { rows: 2, cols: 1 }, tecky: 3 },
  { nazev: "Lehká střelná (prak)", dmg: "d6", sloty: 1, span: { rows: 1, cols: 1 }, jeDalkova: true, tecky: 3 },
  { nazev: "Těžká střelná (luk)", dmg: "d8", sloty: 2, span: { rows: 2, cols: 1 }, jeDalkova: true, tecky: 3 },
];

// Rodné znamení (d6)
export const BIRTHSIGN = [
  "Hvězda (statečná/zbrklá)",
  "Kolo (pracovitá/nenápaditá)",
  "Žalud (zvědavá/paličatá)",
  "Bouřka (štědrá/popudlivá)",
  "Měsíc (moudrá/záhadná)",
  "Matka (pečující/ustaraná)",
];

// Barva srsti (d6)
export const FUR_COLOR = ["Čokoládová", "Černá", "Bílá", "Světle hnědá", "Šedá", "Namodralá"];

// Vzor srsti (d6)
export const FUR_PATTERN = ["Jednolitá", "Mourovatá", "Strakatá", "Pruhovaná", "Tečkovaná", "Skvrnitá"];

// Výrazný rys (d66)
export const TRAIT = {
  11: "Tělo plné jizev", 12: "Korpulentní tělo", 13: "Vychrtlé tělo", 14: "Klackovité tělo", 15: "Drobné tělíčko", 16: "Rozložité tělo",
  21: "Válečné malování", 22: "Cizokrajné oblečení", 23: "Elegantní oblečení", 24: "Záplatované oblečení", 25: "Módní oblečení", 26: "Neprané oblečení",
  31: "Useknuté ucho", 32: "Neforemný obličej", 33: "Krásný obličej", 34: "Baculatý obličej", 35: "Jemné rysy v obličeji", 36: "Protáhlý obličej",
  41: "Načesaná srst", 42: "Dredy", 43: "Nabarvená srst", 44: "Oholená srst", 45: "Kudrnatá srst", 46: "Sametová srst",
  51: "Oči temné jako noc", 52: "Páska přes oko", 53: "Krvavě rudé oči", 54: "Moudrý pohled", 55: "Pronikavý pohled", 56: "Blyštivé oči",
  61: "Zastřižený ocásek", 62: "Ocásek jako bič", 63: "Chocholatý ocásek", 64: "Pahýl ocásku", 65: "Chápavý ocásek", 66: "Zakroucený ocásek",
};

// Vlastní jména (d100, č.50 chybí → reroll)
export const NAMES = [
  "Ada", "Agáta", "Akácie", "Aloe", "Ambrož", "Anežka", "Anýz", "Apríl", "Astra", "Augustín",
  "Azalka", "Bazalka", "Berylie", "Bobek", "Bodlák", "Bříz", "Čedar", "Čekanka", "Devětsil", "Edmund",
  "Eidam", "Elza", "Emil", "Erina", "Estragon", "Fenykl", "Fialka", "Filip", "Františka", "Gouda",
  "Grácie", "Gvendolína", "Habrovec", "Háta", "Hložek", "Horácio", "Hyacint", "Iris", "Jalovec", "Janek",
  "Jasan", "Jaspis", "Jeřabinka", "Jílovec", "Jiřička", "Karmína", "Klára", "Kmínek", "Konrád",
  /* 50 chybí */
  "Krokus", "Kuklík", "Květa", "Levandule", "Lilie", "Líska", "Lorenz", "Magnolie", "Majoránka", "Makovec",
  "Máslena", "Meduňka", "Měsíček", "Muškát", "Myrta", "Niva", "Nora", "Okřál", "Oliver", "Olivie",
  "Olša", "Opál", "Otýlie", "Pelyňka", "Pepřík", "Perla", "Rípčíp", "Rokfór", "Routa", "Rozmarín",
  "Rulík", "Řebřík", "Sedmikráska", "Slídie", "Smaragd", "Svízel", "Šafrán", "Šimon", "Šípek", "Šťavel",
  "Tis", "Vavřinec", "Vilík", "Višňa", "Vlnka", "Vrbena", "Vřesena", "Vřesík", "Zuzanka",
];

// Mateřská jména / příjmení (d20)
export const SURNAMES = [
  "Bílý/á", "Černý/á", "Čihař/ová", "Darček/ová", "Durman/ová",
  "Hrabal/ová", "Chalva/ová", "Jařinka/ová", "Jeleňák/ová", "Jeseň/ová",
  "Katzenreiser/ová", "Máselník/ová", "Píp/ová", "Řešetlák/ová", "Semínko/vá",
  "Sníh/Sněhová", "Strážný/á", "Trnka/ová", "Urobil/ová", "Žvanil/ová",
];
