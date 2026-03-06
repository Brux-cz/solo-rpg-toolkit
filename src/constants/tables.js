// Fate Chart (threshold tabulka: odds[row] x CF[col])
// Rows: Impossible(0)..Has to be(9), Cols: CF 1..9
// Value = threshold for YES on d100 (roll <= threshold = YES)
export const FATE_CHART = [
  /* Impossible   */ [10, 5, 5, 5, 5, 4, 3, 2, 1],
  /* No way       */ [15, 10, 7, 5, 5, 5, 4, 4, 2],
  /* V.unlikely   */ [16, 15, 10, 7, 5, 5, 5, 4, 4],
  /* Unlikely     */ [20, 18, 15, 10, 8, 5, 5, 5, 5],
  /* 50/50        */ [50, 45, 35, 25, 15, 10, 8, 5, 5],
  /* Likely       */ [85, 80, 75, 65, 50, 45, 35, 25, 15],
  /* V.likely     */ [90, 85, 85, 80, 75, 65, 50, 45, 25],
  /* Near sure    */ [95, 95, 90, 85, 85, 80, 75, 55, 50],
  /* Sure thing   */ [95, 95, 95, 90, 90, 85, 80, 75, 55],
  /* Has to be    */ [99, 99, 95, 95, 95, 90, 85, 80, 75],
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

export const SCENE_ADJ = [
  "Odeber postavu","Odeber předmět","Přidej postavu","Přidej předmět",
  "Změň lokaci","Změň motivaci","Změň atmosféru","DVĚ úpravy",
  "Přidej překvapení","Odeber překážku",
];

export const EVENT_FOCUS = [
  [7,"Remote Event"],[28,"NPC Action"],[35,"New NPC"],
  [45,"Move toward thread"],[52,"Move away from thread"],
  [55,"Close thread"],[67,"PC Negative"],[75,"PC Positive"],
  [83,"Ambiguous"],[92,"NPC Negative"],[100,"NPC Positive"],
];
