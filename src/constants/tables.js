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
