import{r as v,j as t}from"./index-DxPlbsBH.js";const C={_intro:{title:"Solo RPG Toolkit — Kompletní přehled",text:`Toto je diagram aplikace pro sólové hraní stolních RPG (Mausritter + Mythic GME 2. edice).

Hráč je zároveň vypravěč — nemá Game Mastera. Místo toho používá sadu mechanik a nástrojů z Mythic GME, které simulují rozhodování GM a vnáší do příběhu nepředvídatelnost.

HLAVNÍ PROBLÉM: Při sólovém hraní se hromadí informace — NPC, osady, frakce, úkoly, příběhové linky. Na papíře se v tom hráč ztrácí. Navíc Mythic pracuje s AKTIVNÍMI SEZNAMY, na které mechaniky přímo cílí — to papír prostě nezvládne.

TŘI VRSTVY APLIKACE:

1. KAMPÁŇOVÁ WIKI (střed) — propojená databáze entit + mechanické seznamy NPC a Threads, na které cílí náhodné události

2. CYKLUS SCÉNY (kolem wiki) — strukturovaný postup: připrav → testuj chaos → urči typ → hraj → ukonči → bookkeeping → opakuj

3. PANEL NÁSTROJŮ (vlevo) — Fate Chart, Meaning Tables, generátory, Detail Check — hráč je použije kdykoli potřebuje

KLÍČOVÝ MECHANISMUS: Chaos Faktor (1-9) prolíná vším. Ovlivňuje Fate Chart (pravděpodobnosti), test scény (typ), random events (doubles) a celkové tempo příběhu.`},wiki_bg:{title:"Kampáňová Wiki",text:`Jádro aplikace. Propojená databáze VŠECH entit kampaně.

Klíčová hodnota: PROPOJENÍ. NPC není jen řádek — patří do osady, je členem frakce, dal hráči úkol, byl potkán ve scéně 5.

DŮLEŽITÉ: Wiki obsahuje dva typy dat:

1. PASIVNÍ ENTITY — postava, pomocník, NPC, osady, frakce, threads, úkoly, předměty, deník. Jsou to zápisky, které hráč čte a upravuje.

2. AKTIVNÍ MECHANICKÉ SEZNAMY — NPC Seznam a Thread Seznam. Na ty přímo cílí mechaniky Mythic (Event Focus, Random Events). Mají váhy, bloky po 5 řádcích, vlastní kostku pro výběr.

PROPOJENÍ DVOU SVĚTŮ: Každý řádek mechanického seznamu odkazuje na wiki entitu. NPC "Kupec Hrách" má wiki kartu (popis, lokace, frakce) A zároveň řádek(y) v NPC Seznamu (váha 1-3×). Thread "Najít princeznu" má wiki kartu (popis, progress track) A řádek(y) v Thread Seznamu.

Wiki se plní během Bookkeepingu (krok 6) a čte při přípravě scény (krok 1). Propojení entit je to, co papír neumí — 50 NPC rozházených po osadách, frakcích a scénách.`},postava:{title:"Postava (hráčova myš)",text:`Karta hráčovy postavy. Centrální entita — propojená se vším.

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
• Data: kurazSloty: Slot[] (délka = kuraz). Stejná struktura jako inventář, ale přijímá POUZE typ 'stav'.
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
• Při postupu: d20 vs každý atribut MAX (vyšší = max+1, akt+1), nový hod na BO
  → Level-up se dělá v osadě po úplném odpočinku (akt == max). Porovnání vs MAX (base stat).

LÉČENÍ (tři typy odpočinku):
• Krátký (10 min, voda): obnoví d6+1 BO. NEOBNOVUJE vlastnosti!
• Dlouhý (6 hod, jídlo + spánek): obnoví všechny BO. Vyžaduje 1 porci jídla (škrtni tečku zásob!). Pokud BO PLNÉ → d6 bodů jedné vlastnosti.
• Úplný (týden v bezpečí): obnoví VŠE + odstraní většinu stavů
→ DŮLEŽITÉ: Léčení vlastností (STR/DEX/WIL) je DVOUSTUPŇOVÉ:
  1. Nejdřív krátký odpočinek → doplň BO na maximum
  2. Pak dlouhý odpočinek → teprve pak se léčí vlastnosti (d6 bodů)
  Bez plných BO dlouhý odpočinek léčí JEN BO, ne vlastnosti!

GENERÁTORY NPC (ověřeno NotebookLM):
• Vlastní jména: d100 tabulka (99 jmen)
• Mateřská jména: d20 tabulka
• Vzhled: d20
• Zvláštnost/Osobnost: d20
• Rodné znamení: d6
• Motivace: d20
• Vztah: d20
• Bestiář: obecná motivace per druh

PROPOJENÍ: aktuální lokace (osada), úkoly, zmínky v deníku, předměty.`},tvorba_postavy:{title:"Tvorba postavy (Character Creation)",text:`Pevně daný 5-krokový postup kombinující náhodné hody a volby hráče.

KROK 1 — VLASTNOSTI (3d6 keep 2):
Citace: "Na každou vlastnost hoď v uvedeném pořadí 3k6. Dva nejvyšší výsledky sečti, dostaneš hodnotu mezi 2 a 12. Nakonec můžeš hodnoty dvou vlastností vzájemně prohodit."
1. STR (Síla) — fyzická síla a odolnost
2. DEX (Mrštnost) — rychlost a obratnost
3. WIL (Vůle) — síla odhodlání a kouzlo osobnosti
Rozsah: 2-12. Swap: po vygenerování všech tří lze prohodit libovolné DVĚ.

KROK 2 — BO A DOBKY (d6 + d6):
Citace: "Hodem k6 urči svoje body ochrany (BO)." + "Hodem k6 urči svůj počáteční počet ďobků."
Oba hody jsou nezávislé a slouží jako vstupy do tabulky původu.

KROK 3 — PŮVOD (Background, cross-reference BO x ďobky):
Citace: "Porovnej hodnotu svých BO s počtem ďobků v tabulce původu. Tak zjistíš, co tvoje myš dělala, než se stala dobrodruhem."
Tabulka 6x6 = 36 různých původů. Každý určuje:
1. Název/popis (co myš dělala dříve)
2. Předmět A + Předmět B (konkrétní startovní vybavení)

KOMPLETNÍ TABULKA PŮVODU:
BO 1: Pokusná myš (Kouzlo: Kouzelná střela + Olověný plášť) | Kuchyňský slídil (Štít a kabátec + Hrnce) | Uprchlík z klece (Kouzlo: Srozumitelnost + Láhev mléka) | Čarodějnice (Kouzlo: Zahojení + Vonná tyčka) | Kožešník (Štít a kabátec + Silné nůžky) | Pouliční rváč (Dýka d6 + Láhev kávy)
BO 2: Žebravý kněz (Kouzlo: Zotavení + Svatý symbol) | Honák brouků (Pomocník: věrný brouk + Tyč 15cm) | Sládek (Pomocník: opilý světlonoš + Soudek piva)
POZNÁMKA K POMOCNÍKŮM Z BACKGROUNDU: Zdarma a hned (ne hledání v osadě). Světlonoš = standardní pomocník (d6 BO, 2d6 vlastnosti). Tažná krysa = staty z bestiáře (3 BO, STR 12, DEX 8, WIL 8). Brouk = pravidla neřeší (vodítko: kouzlo Přízračný brouk, unese 6 slotů). Všichni mají 6 slotů inventáře. | Rybář (Síť + Jehla d6) | Kovář (Kladivo d6/d8 + Pilník na železo) | Dráteník (Drát + Elektrická lampa)
BO 3: Dřevorubec (Sekera d6/d8 + Motouz) | Člen netopýřího kultu (Kouzlo: Tma + Pytlík netopýřích zubů) | Horník v cínovém dole (Krumpáč d6/d8 + Lucerna) | Sběrač odpadků (Hák na odpadky d10 + Zrcátko) | Stěnolezec (Rybářský háček + Nit) | Kupec (Pomocník: tažná krysa + Směnka 20ď)
BO 4: Vorař (Kladivo d6/d8 + Dřevěné klíny) | Honák žížal (Tyč 15cm + Mýdlo) | Vlaštovkář (Rybářský háček + Ochranné brýle) | Kanálník (Pilník na železo + Nit) | Žalářník (Řetěz 15cm + Kopí d10) | Pěstitel hub (Sušené houby + Maska proti spórám)
BO 5: Stavitel hrází (Lopata + Dřevěné klíny) | Kartograf (Brk a inkoust + Kompas) | Vykradač pastiček (Kus sýra + Lepidlo) | Tulák (Stan + Mapa k pokladu) | Pěstitel obilí (Kopí d10 + Píšťalka) | Poslíček (Deka + Dokumenty zapečetěné)
BO 6: Trubadúr (Hudební nástroj + Maskovací sada) | Hazardní hráč (Zatížené kostky + Zrcátko) | Sběrač mízy (Vědro + Dřevěné klíny) | Včelař (Sklenice medu + Síť) | Knihovník (Útržek ze starodávné knihy + Brk a inkoust) | Zchudlý šlechtic (Plstěný klobouk + Parfém)

KROK 4 — POČÁTEČNÍ VYBAVENÍ:
Citace: "Do začátku má tvoje myš: Pochodně a Zásoby. Dva předměty podle svého původu (A + B). Jednu zbraň podle tvého výběru."

Záchranná síť pro slabší postavy:
- Nejvyšší vlastnost <= 9: hoď znovu na tabulku původů, vezmi si A NEBO B navíc.
- Nejvyšší vlastnost <= 7: hoď znovu, vezmi si OBA (A i B) navíc.

SEZNAM ZBRANÍ NA VÝBĚR:
- Improvizovaná (klacek, kámen): k6 normálně, 1 packa, 1ď. Vždy škrtá tečku po boji (ne d6 test jako u běžných zbraní).
- Lehká (dýka, jehla): k6, 1 packa, 10ď. Dvě lehké = hoď obě, použij lepší.
- Střední (meč, sekera): k6 jedna packa / k8 obě packy, 20ď.
- Těžká (kopí, hákopí): k10, obě packy, 40ď.
- Lehká střelná (prak, ruční kuše): k6, 1 packa, 10ď. Potřebuje munici.
- Těžká střelná (luk): k8, obě packy, 40ď. Potřebuje munici.
Munice: toulec šípů 5ď, váček kamenů 1ď.

KROK 5 — PODROBNOSTI A VZHLED:
Citace: "Nahoď nebo vyber si rodné znamení, srst a výrazný rys."
Hráč si může vybrat, nebo použít rychlý generátor:

Rodné znamení (k6):
1=Hvězda (statečná/zbrklá), 2=Kolo (pracovitá/nenápaditá), 3=Žalud (zvědavá/paličatá), 4=Bouřka (štědrá/popudlivá), 5=Měsíc (moudrá/záhadná), 6=Matka (pečující/ustaraná)

Barva srsti (k6):
1=Čokoládová, 2=Černá, 3=Bílá, 4=Světle hnědá, 5=Šedá, 6=Namodralá

Vzor srsti (k6):
1=Jednolitá, 2=Mourovatá, 3=Strakatá, 4=Pruhovaná, 5=Tečkovaná, 6=Skvrnitá

Výrazný rys (k66 — první k6 desítky, druhá jednotky):
11=Tělo plné jizev, 12=Korpulentní tělo, 13=Vychrtlé tělo, 14=Klackovité tělo, 15=Drobné tělíčko, 16=Rozložité tělo
21=Válečné malování, 22=Cizokrajné oblečení, 23=Elegantní oblečení, 24=Záplatované oblečení, 25=Módní oblečení, 26=Neprané oblečení
31=Useknuté ucho, 32=Neforemný obličej, 33=Krásný obličej, 34=Baculatý obličej, 35=Jemné rysy v obličeji, 36=Protáhlý obličej
41=Načesaná srst, 42=Dredy, 43=Nabarvená srst, 44=Oholená srst, 45=Kudrnatá srst, 46=Sametová srst
51=Oči temné jako noc, 52=Páska přes oko, 53=Krvavě rudé oči, 54=Moudrý pohled, 55=Pronikavý pohled, 56=Blyštivé oči
61=Zastřižený ocásek, 62=Ocásek jako bič, 63=Chocholatý ocásek, 64=Pahýl ocásku, 65=Chápavý ocásek, 66=Zakroucený ocásek

Jméno: "Vyber si jméno vhodné pro statečnou myš." Volba nebo hod kostkou:

Vlastní jména (d100/d99, položka 50 chybí):
1=Ada, 2=Agáta, 3=Akácie, 4=Aloe, 5=Ambrož, 6=Anežka, 7=Anýz, 8=Apríl, 9=Astra, 10=Augustín, 11=Azalka, 12=Bazalka, 13=Berylie, 14=Bobek, 15=Bodlák, 16=Bříz, 17=Čedar, 18=Čekanka, 19=Devětsil, 20=Edmund, 21=Eidam, 22=Elza, 23=Emil, 24=Erina, 25=Estragon, 26=Fenykl, 27=Fialka, 28=Filip, 29=Františka, 30=Gouda, 31=Grácie, 32=Gvendolína, 33=Habrovec, 34=Háta, 35=Hložek, 36=Horácio, 37=Hyacint, 38=Iris, 39=Jalovec, 40=Janek, 41=Jasan, 42=Jaspis, 43=Jeřabinka, 44=Jílovec, 45=Jiřička, 46=Karmína, 47=Klára, 48=Kmínek, 49=Konrád, 51=Krokus, 52=Kuklík, 53=Květa, 54=Levandule, 55=Lilie, 56=Líska, 57=Lorenz, 58=Magnolie, 59=Majoránka, 60=Makovec, 61=Máslena, 62=Meduňka, 63=Měsíček, 64=Muškát, 65=Myrta, 66=Niva, 67=Nora, 68=Okřál, 69=Oliver, 70=Olivie, 71=Olša, 72=Opál, 73=Otýlie, 74=Pelyňka, 75=Pepřík, 76=Perla, 77=Rípčíp, 78=Rokfór, 79=Routa, 80=Rozmarín, 81=Rulík, 82=Řebřík, 83=Sedmikráska, 84=Slídie, 85=Smaragd, 86=Svízel, 87=Šafrán, 88=Šimon, 89=Šípek, 90=Šťavel, 91=Tis, 92=Vavřinec, 93=Vilík, 94=Višňa, 95=Vlnka, 96=Vrbena, 97=Vřesena, 98=Vřesík, 99=Zuzanka

Mateřská jména / příjmení (d20):
1=Bílý/á, 2=Černý/á, 3=Čihař/ová, 4=Darček/ová, 5=Durman/ová, 6=Hrabal/ová, 7=Chalva/ová, 8=Jařinka/ová, 9=Jeleňák/ová, 10=Jeseň/ová, 11=Katzenreiser/ová, 12=Máselník/ová, 13=Píp/ová, 14=Řešetlák/ová, 15=Semínko/vá, 16=Sníh/Sněhová, 17=Strážný/á, 18=Trnka/ová, 19=Urobil/ová, 20=Žvanil/ová

PRAVIDLA TOTO NEŘEŠÍ: Věk, rodinné vazby, ani motivace nejsou povinnou součástí tvorby postavy.`},pomocnik:{title:"Pomocník (Hireling)",text:`Najatý spolucestující. V Mausritteru NENÍ overkill — pomocníci slouží jako "nosiči" pro poklady a rozšiřují omezenou kapacitu inventáře. V sólo hře navíc POJISTKA PROTI SMRTI.

IDENTITA:
• Jméno, typ (světlonoš, dělník, kopáč chodeb, zbrojíř/kovář, místní průvodce, zbrojmyš, učenec, rytíř, tlumočník)

ATRIBUTY (2d6 na každý, tedy 2-12):
• STR, DEX, WIL

BODY OCHRANY:
• BO aktuální / max (d6)

INVENTÁŘ (6 slotů):
• Packy: 2 sloty
• Tělo: 2 sloty
• Batoh: 2 sloty (méně než hráč!)
• Podmínky zabírají slot stejně jako u hráče

BOJ — SAMOSTATNÁ BOJOVÁ JEDNOTKA (ověřeno):
• Pomocník je PLNOHODNOTNÝ bojovník — vlastní akce, vlastní cíl útoku
• Každé kolo: pohyb 30cm + 1 akce (útok, útěk, vyjednávání...)
• SKUPINOVÁ INICIATIVA: sdílí iniciativu s hráčem (myší strana vs. nepřátelé). V rámci myší strany jednají hráč + pomocníci v libovolném pořadí.
• PŘEKVAPENÍ sdílené: pokud myší strana překvapí, pomocník MÁ zesílený útok (d12) v 1. kole — stejně jako hráč (ověřeno NotebookLM: "společníci, kteří o plánu vědí, hrají první").
• MODIFIKÁTORY ÚTOKU: zesílený (d12) a zeslabený (d4) platí UNIVERZÁLNĚ — i pro pomocníka dle jeho pozice v boji (tma, kryt, lest, slabina). Mohou se lišit od hráče.
• NEMŮŽE dát výhodu na útok (útoky vždy zasahují). Může pomoci se záchranným hodem → výhoda (2d20, nižší).
• Zranění: BO → STR → záchrana STR → krit. zranění (stejně jako hráč)
• OPOTŘEBENÍ vybavení: po boji d6 za každou použitou zbraň/zbroj pomocníka, 4-6 = škrt tečky (ověřeno: stejná pravidla jako hráč)
• ROZDĚLENÍ ÚTOKŮ nepřátel: pravidla neřeší — Průvodce rozhoduje dle fikce (kdo je nejblíž, kdo ohrožuje). Appka aproximuje mechanickým dělením.
• ÚTĚK: každý hází DEX save zvlášť. Hráč může utéct a pomocník ne (nebo naopak). Neúspěch ≠ volný útok, ale "následky určené Průvodcem" (zranění d4-d20, stavy, ztráta předmětu).

MORÁLKA — KOMPLETNÍ SEZNAM SPOUŠTĚČŮ (ověřeno):
Záchrana WIL, neúspěch = uteče. Věrní pomocníci s výhodou (2d20, nižší).
VĚRNOST = narativní stav, ŽÁDNÁ stupnice ani body. GM rozhodne na základě fikce (štědré dělení kořisti, záchrana života, dlouhodobé dobré zacházení). Některé původy dávají věrného společníka od začátku (Honák brouků).
Spouštěče:
1. V boji: první kritické zranění pomocníka, viditelná nevýhoda
2. Ekonomické: nezaplacení mzdy, nedostatek jídla, žádný podíl na pokladu
3. Překročení dohody: nebezpečnější úkol než smluveno
4. Stres: vyřazení hráče z boje, psychicky náročná situace
5. Tlupy: ztráta poloviny STR → panika

VYŘAZENÍ HRÁČE (kritické pro sólo hru!):
• Pomocník MUSÍ hájet záchranu WIL (morálka)
• Neúspěch → uteče. Úspěch → zůstane a může ošetřit.
• BEZ OŠETŘENÍ DO 6 SMĚN (60 min) = SMRT HRÁČE!
→ UX: Appka varuje "Jsi sám! Vyřazení = smrt bez pomocníka!"

PLATBA:
• Denní mzda: světlonoš 1ď, dělník 2ď, kopáč chodeb 5ď, zbrojíř/kovář 8ď, místní průvodce 10ď, zbrojmyš 10ď, učenec 20ď, rytíř 25ď, tlumočník 30ď
• Žádný hard limit na počet — omezeno ekonomicky a morálkou
→ UX: Appka zobrazuje celkové denní náklady (burn rate)

VERBOVÁNÍ:
• Hledání v osadě (1 den)
• Záchrana na WIL nebo zaplacení 20ď
• Počet dostupných (hod po úspěšném verbování): d6 = světlonoš, dělník, zbrojmyš; d4 = kopáč chodeb, místní průvodce; d3 = rytíř; d2 = zbrojíř/kovář, učenec, tlumočník
• Velikost osady omezuje dostupné typy (malá osada = jen základní)

TLUPY (20+ myší):
• Jedná jako jeden celek, útok na jednotlivce: zesílený (d12!)
• Jednotlivec vs tlupa: zranění se IGNORUJE
• Týdenní žold 1000ď. Polovina STR → WIL záchrana nebo útěk.

POSTUP:
• zk. = 1 za každý ďobek vyplacený NAD rámec mzdy
• Úroveň 2 při 1000 zk.`},npc:{title:"NPC (Wiki záznam)",text:`Každá postava ve světě (mimo hráčovu myš) — od kupce přes šlechtice po kočičího pána.

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
• Pozice v mechanickém NPC Seznamu (váha 0-3×, kde 0 = wiki-only)

DŮLEŽITÉ: NPC má DVĚ TVÁŘE v appce:
1. Wiki záznam (tento) — kdo to je, kde žije, co ví
2. Řádek(y) v NPC Seznamu (mechanický) — váha pro Mythic hody
Obojí musí být propojené. Přidáš NPC do wiki → nabídne přidání do seznamu.
VÁHA 0 = wiki-only: NPC existuje v databázi (wiki karta), ale NENÍ v aktivním seznamu pro Mythic hody. Zobrazí se s badgem "jen wiki". Zvýšením váhy na 1+ se aktivuje v seznamu.`},thread:{title:"Thread / Příběhová linka (Wiki záznam)",text:`Otevřená zápletka — něco co se děje a ještě není vyřešené.

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
Obojí propojené. Event Focus "Move Toward Thread" → hoď na seznam → klikni na výsledek → otevře wiki záznam.`},npc_seznam:{title:"NPC Seznam (AKTIVNÍ MECHANICKÝ)",text:`Tohle NENÍ jen seznam NPC ve wiki. Je to AKTIVNÍ MECHANICKÁ KOMPONENTA, na kterou přímo cílí Mythic.

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

PROPOJENÍ S WIKI: Každý řádek seznamu odkazuje na NPC wiki záznam (👤). Klikneš na řádek → otevře wiki kartu s popisem, lokací, vztahem. Seznam je MECHANIKA, wiki je OBSAH.`},thread_seznam:{title:"Thread Seznam (AKTIVNÍ MECHANICKÝ)",text:`Stejná struktura a mechanika jako NPC Seznam (25 řádků, 5 sekcí, dvoustupňový hod), ale pro PŘÍBĚHOVÉ LINKY.

Thread = něco co se děje a ještě není vyřešené. "Najít ztracenou princeznu", "Zastavit expanzi žabí armády", "Zjistit kdo otrávil studnu".

JAK MYTHIC POUŽÍVÁ THREADS:
• Event Focus "Move Toward A Thread" (51-55) → hoď na seznam → KTERÝ thread se posunul
• Event Focus "Move Away From A Thread" (56-65) → komplikace u konkrétního threadu
• Event Focus "Close A Thread" (66-70) → thread se uzavře (pokud nemá Plot Armor!)

VÁŽENÍ funguje stejně — thread aktivní ve scéně dostane další zápis (max 3×). Každý zápis obsadí řádek a zvětšuje seznam.

CLEANUP: Při zaplnění 25 řádků přepiš. "I Dunno" rule platí i zde.

Pokud je seznam prázdný (začátek hry), mechanika přesměruje na "Current Context".

PROPOJENÍ S WIKI: Každý řádek seznamu odkazuje na Thread wiki záznam (🧵). Klikneš na řádek → otevře wiki kartu s popisem, progress trackem, Plot Armor stavem. Seznam je MECHANIKA, wiki je OBSAH.`},osady:{title:"Osady / Místa",text:`Lokace ve světě hry. Od farem po velkoměsta, od jeskyní po hexcrawl body zájmu.

STRUKTURA OSADY:
• Velikost (2d6, použij nižší): 1=Farma (1-3 rodiny), 2=Křižovatka (3-5 rodin), 3=Víska (50-150 myší), 4=Vesnice (150-300), 5=Město (300-1000), 6=Velkoměsto (1000+)
• Společenské zřízení (d6 + velikost) — kdo vládne (stařešinové, šlechtic, cech)
• Výrazný prvek — unikátní rys (dům v kravské lebce...)
• Obyvatelé — zvyklosti (vyšívané oblečení, rituální stříhání ocásků...)
• BANKA (ověřeno NotebookLM): úložiště ďobků + předmětů, poplatek 1% při výběru
• POBLÍŽ LIDÍ (ověřeno NotebookLM): osada blízko lidí = přístup k jedu, zápalkám, pastičkám
• POSTUP NA ÚROVEŇ (ověřeno NotebookLM): 1ď pokladu v osadě=1zk. Investice 10ď=1zk. Tabulka: Úr.2=1000zk(2d6 BO, 1 kuráž), Úr.3=3000(3d6,2), Úr.4=6000(4d6,2), Úr.5+=+5000(4d6,3+). Level up: d20>vlastnost=+1, nové kostky BO.
• INVESTICE (ověřeno NotebookLM): hráč investuje ďobky do osady → 1 zk za každých 10ď
• Živnost — čím osada obchoduje (uleželý sýr, hedvábí, těžba cínu...)
• Událost — co se děje při příchodu hráčů (svatba, epidemie, unášení myší...)
• Hospoda — název a specialita
• Jména (d12+d12) — kombinace začátků a konců (Dubov, Měsíční Hrob, Černá Lhota...)

SPOLEČENSKÉ ZŘÍZENÍ (d6+velikost, ověřeno NotebookLM):
• 2-3 Stařešinové, 4-5 Rytíř, 6-7 Cech, 8-9 Rada, 10-11 Šlechtic, 12 Sídlo moci

ZVĚSTI (d6, ověřeno NotebookLM):
• 6 položek: 1-3 pravda, 4-5 částečně, 6 lež. Obsah=místa+frakce.

MECHANICKÝ DOPAD VELIKOSTI:
• Určuje dostupné pomocníky (rytíře ve farmě nenajdeš!)
• Určuje společenské zřízení
• Ovlivňuje dostupnost služeb a obchodu

SLUŽBY A CENÍK (v ďobcích):
• Ubytování: společná ubikace 1ď/noc, soukromý pokoj 5ď, horká koupel 2ď
• Jídlo: 1 jídlo 2ď, cestovní zásoby 5ď, hostina 50ď, prohýřená noc 100ď
• Léčení: úplný odpočinek (týden) 20ď
• Banka: úschova s 1% poplatkem za výběr
• Verbování: 20ď nebo záchrana WIL. Mzda: světlonoš 1ď, dělník 2ď, kopáč 5ď, zbrojíř 8ď, průvodce 10ď, zbrojmyš 10ď, učenec 20ď, rytíř 25ď, tlumočník 30ď
• Doprava: králičí vůz 5ď/hex, holub 200ď/hex
• Prodej kouzel: plně nabité kouzlo za d6×100ď

HEXCRAWL MAPA (typicky 5×5 hexů, 1 hex = 1 míle):
• Terén (d6): 1-2 otevřená krajina, 3-4 les, 5 řeka, 6 lidské město
• Body zájmu (d20 per terén): liščí nora, obličej v prastarém dubu, betonová přehrada, vodopády...
• Detaily (d6/d8): skrýš loupežníků, vílí kruh, zřícená vzducholoď...

PROPOJENÍ: NPC obyvatelé, frakce, úkoly, scény z deníku, předměty.`},frakce:{title:"Frakce",text:`Mocné síly ve světě, které žijí vlastním životem. V Mausritteru NEJSOU jen popisné — mají vlastní MECHANIKU s progress trackem.

STRUKTURA FRAKCE:
• Název (Kočičí pán Baltazar, Cech tunelářů, Krysí loupežníci...)
• Popis — kdo to je, jak fungují
• ZDROJE — odrážejí moc a vliv (bohatství, armáda žoldáků, magie, tajná skrýš, solidarita s dělnictvem...). Pokud má frakce 3+ zdroje, může utvořit tlupu (warband).
• CÍLE — o co frakce usiluje. Každý cíl má 2-5 POLÍČEK POKROKU podle složitosti. Cíle by měly být provázané s jinými frakcemi (soupeření o zdroje).

MECHANIKA MEZI SEZENÍMI (Tah frakcí) — ověřeno NotebookLM:
Po každém HERNÍM SEZENÍ se vyhodnocuje pokrok frakcí:
1. Hod 1d6 za každou frakci
2. Modifikátory: +1 za každý relevantní zdroj, -1 za každý zdroj konkurenční frakce
3. Výsledek 4-5 → 1 políčko pokroku. Výsledek 6+ → 2 políčka.
4. Dokončení cíle (všechna políčka) → frakce získá NOVÝ ZDROJ (roste!).
   Pokud cíl škodil jiné frakci → ta může přijít o zdroj.
V SÓLO HŘE: Nemáme "session" → hráč si zvolí frekvenci (každých X scén nebo manuálně).

ZÁSAHY HRÁČŮ:
• Pomoc frakci → Průvodce zaškrtne 1-3 políčka pokroku
• Zdržení frakce → Průvodce vymaže 1-3 políčka
• Přímý útok → frakce může přijít o zdroje
• Cíle frakcí se objevují v tabulce zvěstí (hooky pro hráče!)

ZDROJE — VOLNÝ POPIS, ŽÁDNÝ ENUM (ověřeno NotebookLM):
• Žádný pevný seznam ani maximum počtu zdrojů
• Zdroje jsou slovní popisy moci a vlivu frakce
• Příklady: Bohatství, Žoldnéři, Magie, Hrůzostrašnost, Záludní právníci,
  Skryté cesty, Kouzelné písně, Věštecká věž, Nenápadní zvědové,
  Ctižádostiví rytíři, Gangy zocelenech dělníků...
• KLÍČOVÁ HRANICE: 3+ zdroje = může postavit TLUPU (20+ bojovníků)
• Získávání: splnění cíle → nový zdroj + ODEBRAT zdroj konkurentovi (ověřeno NotebookLM)
• Ztráta: konkurence uspěje nebo hráči zasáhnou

POLÍČKA POKROKU — VODÍTKO Z PŘÍKLADŮ (ověřeno NotebookLM):
• Žádná tabulka, ale jasný vzor:
• 2 políčka: prakticky nepoužívané, jen triviální cíle
• 3 políčka: lokální/jednodušší (vybírání daní, zastrašování)
• 4 políčka: středně složité (vymáhání úplatků, vražda stařešiny)
• 5 políček: přelomové (podmanení osady, přivolání boha)

PRO APPKU: Frakce potřebuje progress track (2-5 políček, default 3-4),
seznam zdrojů (free-text, ne enum), mechaniku hodu d6 + modifikátory,
a nabídku "Vyhodnotit tah frakcí?" v bookkeepingu.`},ukoly:{title:"Úkoly / Hooky / Dobrodružná místa",text:`Aktivní i dokončené úkoly, příběhové hooky a dobrodružná místa.

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
• Poznámky`},predmety:{title:"Předměty / Vybavení / Kouzla",text:`Vše co může postava vlastnit, najít nebo koupit. V Mausritteru je inventář JÁDRO hry.

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

TEČKY POUŽITÍ (ověřeno NotebookLM):
• Většina předmětů 3 tečky. Zbraně: d6 po boji (4-6=škrtni).
• Světlo: tečka/6 směn. Lampa=6 teček.
• Lucerna: 3 tečky / 6 směn. Pochodeň: 3 tečky / 6 směn (= 18 směn celkem = 3 hodiny).
• Tma/šero = ZESLABENÝ útok d4 (ověřeno NotebookLM). Zásoby: tečka/jídlo.
• Kouzelné meče: tečka jen na 6. 3 pryč=zničeno.

ZBROJ = FIXNÍ HODNOTA (ověřeno NotebookLM):
• Lehká zbroj: obrana 1, pozice packa+tělo
• Těžká zbroj: obrana 1, pozice 2×tělo
• Štít: obrana 1, pozice 1 packa
• NENÍ KOSTKA! Fixně odečti od zranění.

KOUZELNÉ MEČE (ověřeno NotebookLM):
• Tečka jen na hod 6. Pasívní účinek při nošení.
• Kritický účinek při kritu. Možná kletba + podmínka zrušení.
• Postříbřené zbraně: VŽDY škrtá tečku (ne d6). Klíčové proti duchům.

OPRAVY (ověřeno NotebookLM):
• 10% ceny/tečka v osadě. Divočina: kovář pomocník 8ď/den.

STANDARDNÍ VYBAVENÍ (výběr, ceny v ďobcích):
• Cestovní zásoby 5ď — 3 TEČKY (= 3 porce jídla). Jedno jídlo = škrtni tečku. Po 3 tečkách vymaž ze slotu.
• Jídlo v hospodě: 2ď za porci (dražší než zásoby)
• Hlad: pokud myš CELÝ DEN nejí → stav Hlad (zabírá slot!)
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
• Hráč konzultuje při nákupu v osadě`},chaos_val:{title:"Chaos Faktor (CF)",text:`ÚSTŘEDNÍ MECHANIKA celého systému. Číslo 1-9 (výchozí 5), které prolíná VŠÍM:

1. FATE CHART — vyšší CF = větší šance na "Ano". Příklad: otázka "Likely" má při CF 3 práh 35%, ale při CF 7 už 85%. CF mění pravděpodobnosti v reálném čase.

2. TEST SCÉNY — vyšší CF = větší šance na pozměněnou/přerušenou scénu.

3. RANDOM EVENTS — vyšší CF = víc doubles spouští eventy (CF 3 → jen 11,22,33; CF 9 → jakýkoli double).

4. TEMPO PŘÍBĚHU — CF simuluje střídání napětí. Snowball efekt: čím víc chaotické, tím pravděpodobněji bude ještě chaotičtější.

ROZSAH: Striktně 1-9. Nemůže klesnout pod 1 ani přesáhnout 9.

ÚPRAVA po scéně (bookkeeping):
• Postava měla scénu pod kontrolou, dosáhla pokroku → CF -1
• Scéna byla chaotická, postava musela ustoupit → CF +1

VARIANTY: Mid-Chaos, Low-Chaos, No-Chaos (alternativní tabulky pro jiný styl hry).`},denik:{title:"Deník kampaně (Scény)",text:`Chronologický záznam všech scén. Páteř příběhu — "co se stalo a kdy".

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

HODNOTA: Bez deníku po 20 scénách nevíš co se stalo ve scéně 3. S deníkem máš kompletní příběh s propojením na vše.`},progress_track:{title:"Thread Progress Track",text:`VOLITELNÝ systém pro udržení zaměření příběhu na konkrétní cíl. Zabraňuje rozbíhání do šířky.

JAK FUNGUJE:
• Vyber thread a přiřaď mu track: 10 bodů (krátký), 15 (standardní) nebo 20 (komplexní)
• Sleduj Progress Points na stupnici

PROGRESS POINTS:
• Standardní pokrok ve scéně → +2 body (subjektivní volba hráče: "přiblížila tato scéna postavu k vyřešení threadu?")
• Flashpoint (dramatický moment) → +2 body
• Discovery Check Table → variabilní: +1, +2 nebo +3 body
• Body se přidávají kdykoli (během scény i při bookkeepingu). Překročení hranice fáze = okamžitý Flashpoint.
• Pravidla NEDEFINUJÍ snižování progress — body se pouze přidávají.

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
• Postava vyvine úsilí (konzultace, pátrání...) — NE pasivní čekání!
• Fate Question "Je něco objeveno?" — šance minimálně 50/50
• Random Event může nastat (doubles ≤ CF) — zapíše se + Discovery Check pokračuje
• Úspěch → hod 1d10 + aktuální progress → Thread Discovery Check Table:
• Exceptional No → BLOKACE: žádný další Discovery Check po zbytek scény (jakýkoli thread!)
• Běžné No → nic nenalezeno, pravidla nezakazují další pokus, ale Discovery Check je pro zaseknutí

THREAD DISCOVERY CHECK TABLE (1d10 + progress):
  1-9:   Progress +2 (objev posune blíž k vyřešení)
  10:    Flashpoint +2 (dramatická důležitá událost)
  11-14: Track +1 (úsilí samo posouvá, nic konkrétního)
  15-17: Progress +3 (významný objev)
  18:    Flashpoint +3 (velký dramatický zlom)
  19:    Track +2 (úsilí posouvá výrazněji)
  20-24: Strengthen +1 (dřívější pokrok posílen/potvrzen)
  25+:   Strengthen +2 (dřívější pokrok výrazně posílen)

4 TYPY VÝSLEDKŮ:
  • Progress — objev posouvající k vyřešení threadu
  • Flashpoint — dramatická událost spojená s threadem
  • Track — žádný konkrétní objev, ale úsilí samo posouvá
  • Strengthen — dřívější pokrok je posílen nebo potvrzen
Po hodu: Meaning Tables DLE VÝBĚRU HRÁČE pro interpretaci (Actions, Descriptions, nebo 45 Elements tabulek — dle kontextu).

PLOT ARMOR:
• Dokud nedosáhneš konce stupnice, thread NEMŮŽE být náhodně uzavřen
• I když Event Focus řekne "Close A Thread" — musíš interpretovat jako komplikaci
• Na konci tracku (bod 10/15/20) nastává ZÁVĚR (Conclusion) → Plot Armor zmizí → generuješ dramatickou scénu, ve které je konečně možné vlákno uzavřít`},ocekavani:{title:"1. Očekávání — Co by se mělo stát?",text:`První krok cyklu. Hráč určí co by se logicky mělo dít dál.

ZPŮSOBY:
• Vlastní nápad ("postava jde do města prodat kořist")
• Meaning Tables — hodí dvojici slov a interpretuje
• Metoda 4W (Kdo, Co, Kde, Proč)
• Generátory z knih

V tomto kroku hráč ČTE Z WIKI — podívá se na aktivní threads, kde je postava, co je rozehrané.

SCÉNICKÉ PARAMETRY (volitelné): téma, nálada, atmosféra, počasí — kreativní vodítka pro zarámování scény.

VÝJIMKA: Úplně první scéna kampaně se netestuje (krok 2 se přeskočí). Hráč ji určí třemi způsoby: vlastním nápadem (Inspired Idea), náhodnou událostí (Random Event), nebo Meaning Tables.`},test_chaosu:{title:"2. Test Chaosu — d10 vs CF",text:`Mechanický test: proběhne scéna podle plánu?

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

VÝJIMKA: Úplně první scéna kampaně se NETESTUJE.`},typ_sceny_bg:{title:"3. Typ Scény — Tři cesty",text:`Výsledek testu chaosu. Každý typ má jiný postup:

OČEKÁVANÁ — proběhne přesně jak hráč plánoval. Nejjednodušší.

POZMĚNĚNÁ — vychází z původního nápadu, ale něco se změní. Hráč má dvě možnosti:
1. Scene Adjustment Table (d10) — konkrétní instrukce
2. Vlastní logická úvaha nebo Meaning Tables

PŘERUŠENÁ — úplně ignoruje původní plán. Generuje se NOVÁ scéna:
1. Event Focus Table (d100) → kategorie (NPC Action, Move Toward Thread, PC Negative...)
2. Pokud kategorie cílí na seznam → hoď na NPC/Thread seznam
3. Meaning Tables → dvojice slov pro detaily
4. Hráč interpretuje v kontextu`},scene_adj:{title:"Scene Adjustment Table (d10)",text:`Konkrétní instrukce pro POZMĚNĚNOU scénu. Hod d10:

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
• Cíl: scéna zůstane v základu stejná, ale jeden aspekt překvapí`},event_focus:{title:"Event Focus Table (d100)",text:`Určuje ZAMĚŘENÍ náhodné události. Používá se u přerušených scén a random events (doubles). Hod d100:

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

Po Event Focus vždy následují Meaning Tables pro detaily.`},hrani:{title:"4. Hraní Scény",text:`Nejdelší část. Hráč ví jaká scéna je a hraje ji.

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

Hráč používá nástroje PODLE SEBE — žádné předepsané pořadí.`},ukonceni:{title:"5. Scéna Vyčerpána",text:`Hráč sám rozhodne kdy scéna končí. Mythic nabízí 5 strategií jako "čočky":

• INTEREST (výchozí) — scéna končí když je vyřešena hlavní aktivita (boj skončil, úkol splněn)
• MOOD (nálada) — scéna končí když hráč cítí že "ztrácí dech", chce novou energii. Neřeší se konkrétní úkoly, jen vibe.
• NARRATIVE SHIFT — scéna končí jakmile se objeví zásadní nová informace měnící kontext (spojenec je zrádce!)
• ZMĚNA ČASU/MÍSTA — postava změní lokaci nebo uplyne čas
• DRAMATIC CUT — scéna končí v napínavém momentě ("střih jako ve filmu")

Žádný mechanický trigger — čistě hráčovo rozhodnutí. Appka může připomínat zvolenou strategii, ale neřídí ji.

Po ukončení scény VŽDY následuje Bookkeeping (krok 6).`},bookkeeping_bg:{title:"6. Bookkeeping — Nejdůležitější krok",text:`Administrativa po scéně. V Mythic 2e je bookkeeping KOMPLEXNÍ a KLÍČOVÝ — je to "palivo pro motor hry".

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
   • Dokončený cíl → nový zdroj + odebrat zdroj konkurentovi
   • Zásah hráčů ±1-3 políčka podle vlivu akce

Tohle je moment kde appka NEJVÍC pomáhá. Na papíře musí hráč být extrémně disciplinovaný. V appce: přidáš NPC → automaticky v osadě. Zvýšíš váhu → seznam se přepočítá.`},zpet:{title:"Nová Scéna — Cyklus se opakuje",text:`Po bookkeepingu zpět na krok 1. Hráč na základě aktualizované wiki, seznamů a CF vymyslí co dál.

Tento cyklus je páteř celé hry — desítky až stovky opakování za kampaň.`},nastroje_bg:{title:"Panel Nástrojů — Kompletní sada",text:`Všechny nástroje Mythic GME na jednom místě. Používáš je KDYKOLI — nejsou navázané na konkrétní krok.

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

Společný princip: nástroj dá IMPULZ → hráč vytvoří OBSAH → zapíše do WIKI.`},t_fate:{title:"Fate Chart (Orákulum)",text:`ÚSTŘEDNÍ NÁSTROJ pro otázky Ano/Ne. Simuluje rozhodování GM.

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

KOMPLETNÍ DIAGONÁLNÍ TABULKA (pozice = oddsIndex + CF):
Pos  VýjAno  Ano  VýjNe   Příklad
 1     X      1    81     Impossible@CF1
 2     X      1    81
 3     X      1    81
 4     1      5    82
 5     2     10    83
 6     3     15    84
 7     5     25    86
 8     7     35    88     Unlikely@CF5
 9    10     50    91     50/50@CF5
10    13     65    94     Likely@CF5
11    15     75    96
12    17     85    98
13    18     90    99     50/50@CF9
14    19     95   100
15    20     99    X      Certain@CF7
16    20     99    X
17    20     99    X      Certain@CF9

ELEGANTNÍ VZOR: Tabulka je diagonální — +1 likelihood = +1 CF. Takže Likely při CF 4 = 50/50 při CF 5 = Unlikely při CF 6.
X = výjimečný výsledek není při těchto pravděpodobnostech možný.

INTERAKCE S CF:
• Vysoký CF (6-9) → vyšší šance na Ano → svět je aktivnější
• Nízký CF (1-4) → vyšší šance na Ne → svět je stabilnější

RANDOM EVENT TRIGGER:
Při KAŽDÉM hodu kontroluj: je to double (11,22,33...99) A je číslice ≤ CF?
→ ANO = Random Event! (Event Focus + Meaning Tables)
→ Hod stále platí jako odpověď na původní otázku

CF 3 → jen 11, 22, 33 spustí event (3 z 9 doubles)
CF 9 → jakýkoli double (9 z 9 doubles)

ALTERNATIVA: Fate Check (2d10 sčítání) — jednodušší, bez tabulky.`},t_meaning:{title:"Meaning Tables (Tabulky významů)",text:`Generátor inspirace. Hodíš d100 dvakrát → dvojice slov → interpretuješ v kontextu.

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

MINING FOR MEANING: Pokud výsledek nedává smysl → hoď znovu na jinou tabulku, nebo použij jednu Fate Question k upřesnění.`},t_detail:{title:"Detail Check (Discovering Meaning)",text:`Mechanika pro získávání podrobností BEZ otázky Ano/Ne.

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

ROZDÍL OD FATE QUESTION: Fate Question testuje pravděpodobnost ("Je v truhle zlato?" → Ano/Ne). Detail Check generuje obsah ("Co je v truhle?" → dvojice slov → interpretace).`},t_npc_behav:{title:"NPC Behavior Table",text:`INTERPRETAČNÍ VRSTVA pro Fate Questions o chování NPC. Není to samostatný hod — je to návod jak číst výsledky orákula.

KDY: Ptáš se "Udělá NPC [konkrétní věc]?" přes Fate Chart.

JAK INTERPRETOVAT VÝSLEDEK:
• ANO → NPC udělá přesně co jsi čekal
• NE → NPC neudělá co jsi čekal. Udělá DALŠÍ NEJPRAVDĚPODOBNĚJŠÍ akci.
• VÝJIMEČNÉ ANO → Očekávaná akce s MNOHEM VĚTŠÍ INTENZITOU
• VÝJIMEČNÉ NE → PŘESNÝ OPAK toho co jsi čekal, nebo jiná akce s velkou intenzitou

POKUD NEVÍŠ co je "další nejpravděpodobnější akce" → hoď na Meaning Tables (Actions nebo Character Actions).

KOMBINACE: Lze doplnit 12 specializovanými Elements tabulkami (Character Identity, Personality, Conversations...) pro komplexní fleshing-out NPC.`},t_gen:{title:"Generátory (z knih)",text:`Konkrétní tabulky z pravidlových knih — Mausritter, Mythic GME, dodatky.

Na rozdíl od Meaning Tables dávají KONKRÉTNÍ výsledky: "mlýn obývaný žábami", "kupec s jedním okem".

Hráč je používá podle potřeby a z různých zdrojů.`},t_kostky:{title:"Hod Kostkou",text:`Základní mechanika — d4, d6, d8, d10, d12, d20, d100.

V Mausritteru: d20 pro save hody, d6 pro poškození.
V Mythic: d100 pro Fate Chart a tabulky, d10 pro test scény a Scene Adjustment.`},param_bg:{title:"Parametry Scény",text:`Kreativní vstupy pro zarámování scény:

• TÉMA — o čem scéna bude
• NÁLADA — emoční tón
• ATMOSFÉRA — jak se scéna cítí
• POČASÍ — praktický detail

Nejsou mechanické hodnoty — jsou to vodítka. Můžeš je vymyslet sám nebo vygenerovat (Meaning Tables → Descriptions).`},meritko:{title:"Měřítko (V hlavě)",text:`Mentální přepínač:

ARCHITEKT — velké měřítko. Svět, frakce, osady, hlavní příběh. "Jak funguje tenhle svět?"

PRŮZKUMNÍK — malé měřítko. Boj, hex, dialog, obchod. "Co dělá moje myš teď?"

NENÍ funkce appky. Appka to může podpořit (relevantní nástroje), ale neřídí.`},poznatky_test:{title:"📝 Poznatky ze suchého průchodu (4 scény, ověřeno NotebookLM)",text:`Suchý průchod: Ada Katzenreiserová, Mechová Lhota, kočičí pán Šedivec.
Scéna 1: Příchod do hospody (očekávaná, první scéna).
Scéna 2: Rozhovor s uprchlicí Lískou (pozměněná — Scene Adj přidala Hrácha).
Scéna 3: Cesta divočinou s Křížem (očekávaná, cestování 2 hexy).
Scéna 4: Léčka dvou krys na hranici (přerušená — NPC Action Šedivec).
Boj ověřen proti pravidlům přes NotebookLM — všechny výpočty správné.

═══════════════════════════════════════
✅ CO FUNGUJE — OVĚŘENO:
═══════════════════════════════════════

CYKLUS SCÉNY (6 kroků):
• Celý flow je logický a plynulý — žádný mrtvý krok
• Test chaosu → tři typy scén fungují přirozeně
• Pozměněná scéna (Scene Adj) přinesla nečekaný twist (Hrách u stolu)
• Přerušená scéna kompletně změnila plán — Ada vpadla do léčky místo průzkumu
• Bookkeeping je klíčový — bez něj by se data rozpadla

MYTHIC MECHANIKY:
• KEYED SCENES (2e, ověřeno NotebookLM): Plánované události s triggerem (podmínka → událost)
• ADVENTURE FEATURES (2e, ověřeno NotebookLM): Prvky hexcrawlu/modulu pro Random Events
• THREAD PROGRESS TRACK (2e): každý thread má vlastní progress 0-10
• PERIL POINTS (2e, ověřeno NotebookLM): Start 2 body. 1 bod = záchrana před koncem. Obnova: volba hráče (per sezení nebo nikdy).
• DISCOVERY CHECK (2e, ověřeno NotebookLM): Zaseknutý thread → akce → Fate Q "Je něco objeveno?" (min 50/50!) → Yes=d10+progress na Thread Discovery Table. ExcNo=blokuje VŠECHNY další Discovery Checks ve scéně! Random Event může nastat (standardní doubles ≤ CF). Meaning Tables dle výběru hráče.
• DETERMINING NPC STATISTICS (ověřeno NotebookLM): Odhad → Fate Q → Yes=přesně, ExcYes=+25%, No=-25%, ExcNo=-50%
• NPC BEHAVIOR TABLE (ověřeno NotebookLM): Rozhodovací strom: 1) Jasná představa + neklíčová akce → improvizace. 2) Důležitá akce → Fate Q + interpretační rámec (YES=přesně, EXC YES=intenzivněji, NO=druhá nejpravděpodobnější/Meaning, EXC NO=opak/Meaning intenzivně, Random Event=Meaning pro další akci). 3) Žádná představa → rovnou Meaning Tables. Kontextové tabulky: Character Actions General, Character Actions Combat, Character Conversations, Animal Actions
• DISCOVERING MEANING (ověřeno NotebookLM): 2×d100 na Meaning Tables (core + 45 tematických Elements). Není Fate Q — otevřená odpověď bez Ano/Ne
• CHAOS FLAVORS (2e): Varianty chaosu — standard/low/mid/no. Nastavení hry
• Fate Chart Ano/Ne funguje intuitivně
• INTERRUPT SCENE (ověřeno NotebookLM): Přerušená scéna → Event Focus + 2 slova z Meaning Tables
• SCENE ADJUSTMENT (ověřeno NotebookLM): d10: 1=odstraň postavu, 2=přidej, 3=sniž/ODSTRAŇ aktivitu, 4=zvyš, 5=odstraň předmět, 6=přidej, 7-10=DVĚ úpravy (reroll dokud 2 různé; konflikt=ignoruj 2.; nemožný kontext=reroll). Přidání: nejlogičtější NPC ze seznamu.
• CF ZMĚNA (ověřeno NotebookLM): Kritérium KONTROLA — PC pod kontrolou=-1, bez kontroly=+1. Vždy 1-9.
• Random Events z doubles fungují organicky — překvapí ale neruší tok hry
• Event Focus "NPC Action" vtáhne NPC mimo scénu (Šedivec posílá posla z dálky)
• NPC Seznam + váhy → Šedivec (3 zápisy) padá nejčastěji — správně, je hlavní záporák
• Seznam přirozeně roste: 0 → 3 → 6 → 8 → 9 řádků za 4 scény
• Přechod z 1 sekce na 2 sekce (d4) proběhl automaticky
• CF kolísá smysluplně: 5 → 5 → 5 → 4 → 5
• Detail Check pro "co je v hospodě" = přirozené použití

MAUSRITTER MECHANIKY:
• MĚŘÍTKO BOJE (ověřeno NotebookLM): jednotlivec vs tlupa. Tlupa=d12 útok + ignoruje dmg od jednotlivců. Velcí tvorové (kočky)=warband scale!
• MODIFIKÁTORY ÚTOKU (ověřeno NotebookLM): Zeslabený=d4 (kryt, tma, omezení). Zesílený=d12 (lest, slabina, překvapení). Dvě zbraně=obě kostky, lepší.
• TEČKY PO BOJI (ověřeno NotebookLM): Za každou zbraň/zbroj d6, hod 4-6=škrtni tečku. Postříbřené=VŽDY škrtni.
• SMRT (ověřeno NotebookLM): STR 0=mrtvý. Krit + 6 směn bez ošetření=smrt.
• Boj je RYCHLÝ a SMRTELNÝ — 1 kolo, Ada vyřazena (ověřeno NotebookLM)
• Přenos zranění BO → STR → záchrana STR → kritické zranění = správně
• Morálka: krysa BEZ kritického zranění morálku neháže = správně
• Podmínka Poranění zabírá slot v inventáři = funguje
• Cestovní mechaniky (hlídky, počasí, setkání d6) se přirozeně zapojily
• Předzvěst (d6=2) je skvělý narativní nástroj (mrtvá krysa na stromě)
• Reakce NPC 2d6 (Hrách=povídavý, krysy=nepřátelské) dává smysl

PROPOJENÍ ENTIT:
• NPC → osada → frakce → thread → úkol — řetěz funguje
• Wiki se plní přirozeně během hry (ne jako domácí úkol)
• Deník s propojením na entity = užitečný zpětný přehled

═══════════════════════════════════════
⚠️ CO APPKA MUSÍ ŘEŠIT (UX požadavky):
═══════════════════════════════════════

1. BOOKKEEPING — ZRYCHLIT
   Problém: 5-6 kroků po KAŽDÉ scéně. Na papíře otrava.
   Řešení: Checkboxy "kdo/co bylo ve scéně?" → hromadná aktualizace.
   Klikni NPC → automaticky zvýší váhu + nabídne doplnění wiki karty.
   CF ±1 jako jedno tlačítko s potvrzením.

2. RANDOM EVENT UPROSTŘED FATE QUESTION
   Problém: Ptáš se otázku → padne double → musíš odbočit na Event Focus + Meaning Tables → pak zpět k odpovědi.
   Řešení: Appka zobrazí odpověď (Ano/Ne) A event VEDLE sebe. Obojí najednou.

3. KONTEXT PŘI INTERPRETACI
   Problém: Meaning Tables řeknou "Control + Attention" — ale co to ZNAMENÁ závisí na tom kdo je kde a co se děje.
   Řešení: Vedle výsledku hodu zobrazit: aktivní NPC ve scéně, lokace, aktivní threads.

4. SÓLO VAROVÁNÍ PŘED BOJEM
   Problém: Ada sama vs 2 krysy = téměř jistá prohra za 1 kolo. Sólo hráč nemá zálohu.
   Řešení: "Danger assessment" — appka ukáže porovnání sil před bojem.
   + Varování: "Jsi sám! Vyřazení = potenciální smrt bez pomocníka!"

5. HEXCRAWL MAPA
   Problém: Hexy s body zájmu vznikají za pochodu. Potřebuju je vidět vizuálně.
   Řešení: Vizuální grid/mapa. Klikni na hex → NPC, setkání, terén, body zájmu.

6. ENCOUNTER TABULKY PER OBLAST
   Problém: Při setkání (d6=1) nemáme připravenou tabulku pro danou oblast.
   Řešení: Generátor encounter tabulek per oblast. Nebo hráč vytvoří vlastní d6 tabulku při prvním vstupu do oblasti.

═══════════════════════════════════════
⚠️ DOPLNĚNÍ DO PRAVIDEL:
═══════════════════════════════════════

7. LÉČENÍ VLASTNOSTÍ — DVOUSTUPŇOVÉ (ověřeno NotebookLM)
   Dlouhý odpočinek obnoví d6 bodů vlastnosti JEN když jsou BO PLNÉ.
   Takže: nejdřív krátký odpočinek (BO) → pak dlouhý (vlastnosti).
   → Doplnit do popisu POSTAVA.

8. CESTOVNÍ ZÁSOBY — VYŘEŠENO (NotebookLM)
   3 tečky = 3 porce. Jedno jídlo = škrtni tečku. Celý den bez jídla = Hlad.
   Cestovní zásoby 5ď (1,6ď/porce) vs hospoda 2ď/porce.

9. NARATIVNÍ POŠKOZENÍ PŘEDMĚTŮ
   Random Event "Break + Weapon" — mechanicky nejasné.
   → ROZHODNUTÍ: narativní event = hráč rozhodne. Appka nabídne "škrtni tečku?"

10. TAH FRAKCÍ — FREKVENCE
    Za 4 scény jsme ho nepoužili. Kdy přesně se vyhodnocuje?
    → ROZHODNUTÍ: appka nabídne "Vyhodnotit tah frakcí?" v bookkeepingu. Hráč si zvolí frekvenci (každé X scén nebo "po sezení").

═══════════════════════════════════════
🔲 OTEVŘENÉ OTÁZKY:
═══════════════════════════════════════

• PASTI (ověřeno NotebookLM): DEX/STR prevence. Uvěznění=self-rescue. Krit=smrt bez pomoci.

• Hexcrawl mapa — grid nebo volná mapa? Jak velká?
• Pomocník vs NPC — Kříž měl být pomocník (inventářová karta) nebo jen NPC s poznámkou?
• Encounter tabulky — VYŘEŠENO: hráč tvoří sám d6 per oblast. Appka nabídne šablonu.
• Inventář při zajetí — zabavené předměty? Pravidla neřeší.
• Tah frakcí — frekvence?

═══════════════════════════════════════
📊 STATISTIKA PRŮCHODU:
═══════════════════════════════════════

4 scény: 1× očekávaná (S1), 1× pozměněná (S2), 1× očekávaná (S3), 1× přerušená (S4)
Fate Questions: 7 (5× ANO, 2× NE)
Random Events: 3 (S1: New NPC, S2: NPC Action, S3: PC Negative)
Bojů: 1 (prohra — Ada vyřazena za 1 kolo)
CF vývoj: 5 → 5 → 5 → 4 → 5
NPC Seznam: 0 → 3 → 6 → 8 → 9 řádků
Wiki entity vytvořené: 5 NPC, 1 osada, 1 frakce, 1 thread, 1 úkol, 3 hexy`},random_event_flow:{title:"Random Event Flow",text:`Random Events vznikají DVĚMA způsoby:

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
CF 9 → všechny doubles (100% doubles = event)`},boj:{title:"Boj (Mausritter pravidla)",text:`Rychlý a smrtelný. Útoky VŽDY ZASAHUJÍ — žádný hod na zásah!

INICIATIVA (ověřeno):
• SKUPINOVÁ — myší strana vs. nepřátelé (ne individuální pořadí!)
• Překvapení → hráči + pomocníci jednají první
• Jinak: záchrana na DEX. Úspěch = myší strana první.
• V rámci strany: hráč + pomocníci v LIBOVOLNÉM pořadí
• Pořadí stran zůstává celý boj.

AKCE V KOLE:
• Pohyb až 30 cm + JEDNA akce (útok, sesílání, vyjednávání, útěk)
• Výměna předmětu z těla do packy = volná akce
• Vyndání z batohu = celá akce!

ÚTOK:
• Hoď kostkou zbraně, odečti zbroj nepřítele, zbytek = zranění
• Zeslaběný (kryt, tma, omezený pohyb): jen d4
• Zesílený (lest, slabina, přesila): d12
• Každý nepřítel útočí SAMOSTATNĚ v každém kole — přesila je extrémně nebezpečná!
• Hráč si VOLNĚ VYBÍRÁ cíl útoku

DÁLKOVÝ BOJ (ověřeno):
• Útoky vždy zasahují (stejně jako melee)
• Kryt nebo špatná viditelnost → zeslaběný (d4)
• Vzdálenost řešena NARATIVNĚ (GM rozhodne), žádné tabulky
• Kouzla mají pevný dostřel (Ohnivá koule 60cm)
• Munice zabírá 1 slot inventáře

ÚNIK Z BOJE (ověřeno):
• Útěk = akce v kole (pohyb 30cm + akce)
• Záchrana DEX (riskantí činnost)
• Úspěch → bezpečný únik
• Neúspěch → následek (zranění, pád) — Průvodce určí předem
• ŽÁDNÝ ATTACK OF OPPORTUNITY — místo toho následky neúspěchu DEX
• Pokud nepřítel neschopen reagovat → automatický únik

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

TLUPY V BOJI:
• 20+ myší/krys = tlupa, jedná jako celek
• Tlupa vs jednotlivec: ZESÍLENÝ útok (d12!)
• Jednotlivec vs tlupa: zranění se IGNORUJE
• Kritické zranění → rozvrácená. Polovina STR → WIL záchrana.

ZÁCHRANNÉ HODY:
• Hoď d20 ≤ hodnota atributu → úspěch
• Výhoda: 2d20, ber nižší. Nevýhoda: 2d20, ber vyšší.
• Vzdorovaná záchrana: oba hází, nižší úspěšný hod vyhrává.
• Používá se i mimo boj (past, lezení, vyjednávání...)

HODY NA ŠTĚSTI:
• Když situaci nepokrývá záchrana → Průvodce určí šanci X ze 6 → hoď d6

PLÍŽENÍ A SKRÝVÁNÍ (ověřeno NotebookLM):
• Záchrana DEX (riskantní činnost)
• Aktivní hledání = VZDOROVANÁ záchrana (DEX myši vs DEX/WIL stráže)
• Nižší úspěšný hod vyhrává
• Chytrý plán bez rizika = automatický úspěch BEZ HODU
• Kouzelné předměty mohou dát výhodu nebo eliminovat hod

PŘEKVAPENÍ / AMBUSH (ověřeno NotebookLM):
• Překvapený nepřítel = AUTOMATICKY myši první (žádný hod na iniciativu)
• Překvapivý útok může být ZESÍLENÝ (d12!)
• Dosažení překvapení = DEX záchrana na tiché přiblížení
• Pokud myši jsou překvapeny = mohou mít ZESLABENÝ útok (d4)`},cas_cestovani:{title:"Čas, Cestování a Počasí",text:`Mausritter striktně sleduje čas ve třech měřítkách.

TŘI MĚŘÍTKA ČASU:
• KOLO — boj, necelá minuta
• SMĚNA (Turn) — průzkum dungeonu, 10 minut. Prozkoumání místnosti, boj, past = 1 směna. Každé 3 směny → hod na setkání (d6: 1=setkání, 2=předzvěst). TAKÉ při randálu/rozruchu!
• HLÍDKA (Watch) — cestování divočinou, 6 hodin (= 36 směn)
• DEN = 4 hlídky

CESTOVÁNÍ PO HEXCRAWLU:
• Rychlost: 1 hex za hlídku (6 hodin)
• Náročný terén (potoky, skály, kopce): 1 hex za 2 hlídky
• Povinný odpočinek: minimálně 1 hlídka/den, jinak → Vyčerpání
• Teoretický max: 3 hexy/den (3 cestování + 1 odpočinek)
• Hledání potravy: 1 hlídka místo cestování

POČASÍ (2d6 denně, podle ročního období):
TABULKA:
• 2:  Jaro=Přívalové deště★  Léto=Bouřka★  Podzim=Silný vítr★  Zima=Vánice★
• 3-5: Jaro=Mrholení  Léto=Úmorné vedro★  Podzim=Slejvák★  Zima=Mrznoucí déšť★
• 6-8: Jaro=Zataženo  Léto=Jasno a teplo  Podzim=Chladno  Zima=Třeskutá zima★
• 9-11: Jaro=Jasno a slunečno  Léto=Příjemně slunečno  Podzim=Přeháňky  Zima=Zataženo
• 12: Jaro=Jasno  Léto=Krásně  Podzim=Jasno  Zima=Jasno
★ = NEPŘÍZNIVÉ → záchrana STR za každou hlídku cestování, jinak Vyčerpání
Nepříznivé: Jaro jen hod 2. Léto 2-5. Podzim 2-5. Zima 2-8 (většina!)
→ Zima je extrémně nebezpečná pro cestování.

NÁHODNÁ SETKÁNÍ:
• Hází se POUZE 2× DENNĚ: začátek ranní hlídky + začátek večerní hlídky
• Hod d6: 1 = SETKÁNÍ, 2 = PŘEDZVĚST, 3-6 = nic
• Při setkání: d12 určí hodinu v 12h bloku (může padnout i na noc/poledne!)
• Encounter tabulka: HRÁČ SI TVOŘÍ SÁM pro každou oblast (d6):
  1-3 = běžné, 4-5 = neobvyklé, 6 = nebezpečné/divné
• V dungeonu jiné tempo: každé 3 směny (30 min) nebo při hluku

VÝRAZNÉ PRVKY HEXU (per terén — pro inspiraci encounter tabulek):
• Otevřená krajina: mraveniště, kostra krávy, pšeničné pole
• Les: slunečná mýtina, liščí nora, obličej v dubu
• Řeka: vodopády, betonová přehrada, potopená loďka
• Lidské město: opuštěné auto, skleník, kontejner s odpadky

DOPRAVA (cena za hex):
• Pěšky: zdarma (1 hlídka/hex)
• Králičí vůz: 5ď/hex
• Říční vor: 10ď/hex
• Let na holubovi: 200ď/hex

BUDOVY A KOPÁNÍ:
• 3 myši vykopou v hlíně 15cm krychli za den
• Chodba: 10ď, místnosti: 100-2000ď
• Údržba: 1% měsíčně`},reakce_npc:{title:"Reakce NPC (2d6)",text:`Když potkáš tvora a není jasné jak se zachová → hoď 2d6:

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

VYJEDNÁVÁNÍ — TŘI PILÍŘE (ověřeno NotebookLM):
• ŽÁDNÝ "sociální souboj" — kombinace tří nástrojů:
1. Reaction roll 2d6 → počáteční postoj NPC
2. Záchrana WIL → riskantní přesvědčování/manipulace
3. Narativ → chytrý plán = automatický úspěch bez hodu

RŮZNÉ PŘÍSTUPY:
• Přesvědčování: reaction roll + WIL záchrana
• Zastrašování: vynucení morálky (WIL záchrana u NPC)
• Podvádění: vzdorovaná záchrana WIL vs WIL
• Komunikace s jinými savci: vyžaduje WIL záchranu vůbec

PRO APPKU: Reaction roll jako nástroj. Výsledek rovnou zapsat k NPC.
Vyjednávání = WIL záchrana (nebo vzdorovaná WIL vs WIL).`},bestiar:{title:"Bestiář (Tvorové)",text:`Tvorové mají: BO, STR/DEX/WIL, zbroj, útok(y), kritické zranění a MOTIVACI ("co chce").

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
• Pochodeň: 3 tečky (1 tečka/6 směn, celkem 18 směn = 3h)
• Elektrická lampa: 6 teček
• Improvizovaná zbraň: VŽDY škrtá tečku

PRO APPKU: Bestiář jako referenční knihovna. Tvorové se přidávají jako 👤 NPC wiki záznamy s bojovými statistikami (STR/DEX/WIL, BO, zbroj, útok, motivace).`}},O=[{id:"wiki_bg",x:270,y:190,w:440,h:460,type:"group",label:"KAMPÁŇOVÁ WIKI"},{id:"postavy_label",x:290,y:216,w:180,h:14,type:"sublabel",label:"postavy (Mausritter)"},{id:"postava",x:290,y:234,w:200,h:36,type:"core",label:`🐭 POSTAVA
STR DEX WIL · 10 slotů · BO`},{id:"pomocnik",x:500,y:234,w:190,h:36,type:"core",label:`🐭 POMOCNÍK
6 slotů · mzda · morálka`},{id:"svet_label",x:290,y:278,w:180,h:14,type:"sublabel",label:"svět a příběh (wiki entity)"},{id:"npc",x:290,y:296,w:100,h:36,type:"core",label:`👤 NPC
lokace · frakce · vztah`},{id:"osady",x:398,y:296,w:100,h:36,type:"core",label:`🏠 OSADY
hex · služby`},{id:"frakce",x:506,y:296,w:95,h:36,type:"core",label:`⚔ FRAKCE
zdroje · cíle`},{id:"predmety",x:609,y:296,w:85,h:36,type:"core",label:`💎 PŘEDMĚTY
kouzla · loot`},{id:"thread",x:290,y:340,w:120,h:30,type:"core",label:`🧵 THREADS
progress · plot armor`},{id:"ukoly",x:418,y:340,w:120,h:30,type:"core",label:`📌 ÚKOLY
d66 · zvěsti`},{id:"denik",x:546,y:340,w:148,h:30,type:"core",label:`📖 DENÍK
scéna po scéně`},{id:"mythic_label",x:290,y:380,w:300,h:14,type:"sublabel",label:"── aktivní mechaniky (Mythic GME) ──"},{id:"npc_seznam",x:290,y:398,w:200,h:40,type:"mech_list",label:`📋 NPC SEZNAM
25 řádků · 5 sekcí · váhy`},{id:"thread_seznam",x:500,y:398,w:190,h:40,type:"mech_list",label:`📋 THREAD SEZNAM
25 řádků · 5 sekcí · váhy`},{id:"chaos_val",x:290,y:448,w:200,h:30,type:"core_highlight",label:"⚡ CHAOS FAKTOR (1-9)"},{id:"progress_track",x:500,y:448,w:190,h:30,type:"core_progress",label:"⬛⬛⬛⬜⬜ PROGRESS TRACK"},{id:"propojeni",x:350,y:488,w:260,h:18,type:"sublabel",label:"⟷ vše propojené · klikni pro detail ⟷"},{id:"pravidla_label",x:290,y:514,w:300,h:14,type:"sublabel",label:"── pravidla reference (Mausritter) ──"},{id:"boj",x:290,y:532,w:100,h:36,type:"tool",label:`⚔️ BOJ
iniciativa · smrt`},{id:"cas_cestovani",x:398,y:532,w:112,h:36,type:"tool",label:`🗺️ ČAS & CESTY
hex · hlídka · počasí`},{id:"reakce_npc",x:518,y:532,w:85,h:36,type:"tool",label:`🎭 REAKCE
2d6 postoj`},{id:"bestiar",x:611,y:532,w:85,h:36,type:"tool",label:`🐍 BESTIÁŘ
tvorové`},{id:"random_event_flow",x:1050,y:560,w:200,h:50,type:"note_alert",label:`⚡ RANDOM EVENT
doubles ≤ CF → Event Focus
→ seznam → Meaning Tables`},{id:"ocekavani",x:360,y:40,w:240,h:50,type:"cycle",label:`1. OČEKÁVÁNÍ
co by se mělo stát?`},{id:"test_chaosu",x:780,y:100,w:210,h:50,type:"cycle",label:`2. TEST CHAOSU
d10 vs chaos faktor`},{id:"typ_sceny_bg",x:770,y:180,w:230,h:200,type:"group",label:"3. TYP SCÉNY"},{id:"ocekavana",x:790,y:212,w:190,h:24,type:"scene_type",label:"Očekávaná (hod > CF)"},{id:"pozmenena",x:790,y:242,w:190,h:24,type:"scene_type",label:"Pozměněná (lichý ≤ CF)"},{id:"prerusena",x:790,y:272,w:190,h:24,type:"scene_type",label:"Přerušená (sudý ≤ CF)"},{id:"scene_adj",x:800,y:306,w:170,h:20,type:"sublabel_tool",label:"↳ Scene Adjustment (d10)"},{id:"event_focus",x:800,y:328,w:170,h:20,type:"sublabel_tool",label:"↳ Event Focus (d100)"},{id:"scene_meaning",x:800,y:350,w:170,h:20,type:"sublabel_tool",label:"↳ + Meaning Tables"},{id:"hrani",x:750,y:460,w:270,h:60,type:"cycle_active",label:`4. HRANÍ SCÉNY
Fate Q · Meaning · Detail Check
doubles → random events!`},{id:"ukonceni",x:370,y:720,w:220,h:40,type:"cycle",label:"5. SCÉNA VYČERPÁNA"},{id:"bookkeeping_bg",x:20,y:560,w:215,h:140,type:"cycle_write",label:`6. BOOKKEEPING
· NPC seznam (váhy ±)
· Thread seznam (váhy ±)
· Chaos faktor ±1
· Progress Track
· Tah frakcí (d6)
· Deník + Wiki`},{id:"zpet",x:30,y:100,w:210,h:50,type:"cycle",label:`→ NOVÁ SCÉNA
zpět na očekávání`},{id:"nastroje_bg",x:20,y:200,w:215,h:215,type:"group",label:"PANEL NÁSTROJŮ"},{id:"t_fate",x:40,y:228,w:175,h:28,type:"tool_primary",label:"◈ Fate Chart (d100)"},{id:"t_meaning",x:40,y:262,w:175,h:28,type:"tool_primary",label:"◈ Meaning Tables"},{id:"t_detail",x:40,y:296,w:175,h:24,type:"tool",label:"◇ Detail Check"},{id:"t_npc_behav",x:40,y:324,w:175,h:24,type:"tool",label:"◇ NPC Behavior"},{id:"t_gen",x:40,y:352,w:110,h:24,type:"tool",label:"⚄ Generátory"},{id:"t_kostky",x:160,y:352,w:55,h:24,type:"tool",label:"⚅ Kostky"},{id:"nastroje_sub",x:40,y:382,w:175,h:22,type:"sublabel",label:"použiješ kdy chceš"},{id:"param_bg",x:80,y:15,w:250,h:70,type:"group",label:"PARAMETRY SCÉNY"},{id:"tema",x:100,y:38,w:100,h:22,type:"tool",label:"Téma"},{id:"nalada",x:210,y:38,w:100,h:22,type:"tool",label:"Nálada"},{id:"atmosfera",x:100,y:62,w:100,h:22,type:"tool",label:"Atmosféra"},{id:"pocasi",x:210,y:62,w:100,h:22,type:"tool",label:"Počasí"},{id:"meritko",x:760,y:30,w:230,h:50,type:"note",label:"MĚŘÍTKO (V HLAVĚ)",bullets:["architekt ↔ průzkumník"]},{id:"poznatky_test",x:270,y:670,w:440,h:30,type:"note_alert",label:"📝 POZNATKY Z TESTU (4 scény) — 10 zjištění · 6 otázek · klikni"}],V=[{from:"ocekavani",to:"test_chaosu",fromSide:"right",toSide:"left",style:"solid"},{from:"test_chaosu",to:"typ_sceny_bg",fromSide:"bottom",toSide:"top",style:"solid"},{from:"typ_sceny_bg",to:"hrani",fromSide:"bottom",toSide:"top",style:"solid"},{from:"hrani",to:"ukonceni",fromSide:"bottom",toSide:"top",style:"solid"},{from:"ukonceni",to:"bookkeeping_bg",fromSide:"left",toSide:"right",style:"solid"},{from:"bookkeeping_bg",to:"zpet",fromSide:"top",toSide:"bottom",style:"solid"},{from:"zpet",to:"ocekavani",fromSide:"right",toSide:"left",style:"solid"},{from:"bookkeeping_bg",to:"wiki_bg",fromSide:"right",toSide:"left",style:"dashed"},{from:"wiki_bg",to:"ocekavani",fromSide:"top",toSide:"bottom",style:"dashed"},{from:"param_bg",to:"ocekavani",fromSide:"right",toSide:"left",style:"dashed"},{from:"hrani",to:"random_event_flow",fromSide:"right",toSide:"left",style:"dashed"}];function A(e,r){const i=e.x+e.w/2,k=e.y+e.h/2;switch(r){case"top":return{x:i,y:e.y};case"bottom":return{x:i,y:e.y+e.h};case"left":return{x:e.x,y:k};case"right":return{x:e.x+e.w,y:k};default:return{x:i,y:k}}}function I({edge:e,nodes:r}){const i=r.find(p=>p.id===e.from),k=r.find(p=>p.id===e.to);if(!i||!k)return null;const n=A(i,e.fromSide),o=A(k,e.toSide);let s;const l=e.fromSide,d=e.toSide;if(l==="right"&&d==="left"||l==="left"&&d==="right"){const p=(n.x+o.x)/2;s=`M${n.x},${n.y} L${p},${n.y} L${p},${o.y} L${o.x},${o.y}`}else if(l==="bottom"&&d==="top"||l==="top"&&d==="bottom"){const p=(n.y+o.y)/2;s=`M${n.x},${n.y} L${n.x},${p} L${o.x},${p} L${o.x},${o.y}`}else l==="bottom"&&d==="right"?s=`M${n.x},${n.y} L${n.x},${o.y} L${o.x},${o.y}`:l==="bottom"&&d==="left"?s=`M${n.x},${n.y} L${n.x},${o.y} L${o.x},${o.y}`:l==="left"&&d==="bottom"?s=`M${n.x},${n.y} L${o.x},${n.y} L${o.x},${o.y}`:l==="right"&&d==="bottom"?s=`M${n.x},${n.y} L${o.x},${n.y} L${o.x},${o.y}`:l==="left"&&d==="top"?s=`M${n.x},${n.y} L${o.x},${n.y} L${o.x},${o.y}`:l==="right"&&d==="top"?s=`M${n.x},${n.y} L${o.x},${n.y} L${o.x},${o.y}`:l==="top"&&d==="left"?s=`M${n.x},${n.y} L${n.x},${o.y} L${o.x},${o.y}`:l==="top"&&d==="right"?s=`M${n.x},${n.y} L${n.x},${o.y} L${o.x},${o.y}`:s=`M${n.x},${n.y} L${o.x},${n.y} L${o.x},${o.y}`;return t.jsxs("g",{children:[t.jsx("path",{d:s,fill:"none",stroke:e.style==="solid"?"#555":"#aaa",strokeWidth:1.4,strokeDasharray:e.style==="dashed"?"6 4":"none"}),t.jsx(g,{x:o.x,y:o.y,side:e.toSide,color:e.style==="solid"?"#555":"#aaa"})]})}function g({x:e,y:r,side:i,color:k}){const o={left:`${e},${r} ${e+6},${r-3} ${e+6},${r+3}`,right:`${e},${r} ${e-6},${r-3} ${e-6},${r+3}`,top:`${e},${r} ${e-3},${r+6} ${e+3},${r+6}`,bottom:`${e},${r} ${e-3},${r-6} ${e+3},${r-6}`};return o[i]?t.jsx("polygon",{points:o[i],fill:k}):null}const E={core:{fill:"#2a2a2a",stroke:"#2a2a2a",textFill:"#faf9f6",fontWeight:700,rx:4,fontSize:9},core_highlight:{fill:"#4a3a2a",stroke:"#8a6a3a",textFill:"#faf9f6",fontWeight:700,rx:4,fontSize:10},core_progress:{fill:"#2a3a4a",stroke:"#4a6a8a",textFill:"#faf9f6",fontWeight:700,rx:4,fontSize:9},mech_list:{fill:"#3a1a1a",stroke:"#8a3a3a",textFill:"#faf9f6",fontWeight:700,rx:4,fontSize:8.5},cycle:{fill:"#faf9f6",stroke:"#555",textFill:"#333",fontWeight:600,rx:6,fontSize:11},cycle_active:{fill:"#e8e5dd",stroke:"#333",textFill:"#222",fontWeight:700,rx:6,fontSize:10},cycle_write:{fill:"#dde8dd",stroke:"#4a7a4a",textFill:"#2a4a2a",fontWeight:600,rx:6,fontSize:9.5},scene_type:{fill:"#f5f3ee",stroke:"#bbb",textFill:"#555",fontWeight:500,rx:4,fontSize:9.5},tool:{fill:"#faf9f6",stroke:"#888",textFill:"#444",fontWeight:500,rx:4,fontSize:9.5},tool_primary:{fill:"#faf9f6",stroke:"#555",textFill:"#222",fontWeight:700,rx:4,fontSize:9.5},sublabel:{fill:"transparent",stroke:"none",textFill:"#aaa",fontWeight:400,rx:0,fontSize:8.5},sublabel_tool:{fill:"transparent",stroke:"none",textFill:"#999",fontWeight:400,rx:0,fontSize:8.5},note:{fill:"#faf9f6",stroke:"#bbb",textFill:"#888",fontWeight:600,rx:4,fontSize:10},note_alert:{fill:"#faf5ee",stroke:"#c89030",textFill:"#6a4a10",fontWeight:600,rx:4,fontSize:8.5},player:{fill:"#faf9f6",stroke:"#333",textFill:"#333",fontWeight:800,rx:20,fontSize:12}};function L({node:e,selected:r,onSelect:i}){const k=C[e.id],n=r===e.id,o=!!k;if(e.type==="group")return t.jsxs("g",{onClick:o?c=>{c.stopPropagation(),i(e.id)}:void 0,style:{cursor:o?"pointer":"default"},children:[t.jsx("rect",{x:e.x,y:e.y,width:e.w,height:e.h,fill:n?"rgba(100,100,200,0.06)":"none",stroke:n?"#666":"#ccc",strokeWidth:n?1.5:1,strokeDasharray:"6 3",rx:6}),t.jsx("text",{x:e.x+e.w/2,y:e.y-6,textAnchor:"middle",style:{fontSize:9.5,fontFamily:"'IBM Plex Mono', monospace",fill:n?"#555":"#999",fontWeight:600,letterSpacing:"0.08em"},children:e.label})]});if(e.type==="note"||e.type==="note_alert"){const c=E[e.type];return t.jsxs("g",{onClick:o?u=>{u.stopPropagation(),i(e.id)}:void 0,style:{cursor:o?"pointer":"default"},children:[t.jsx("rect",{x:e.x,y:e.y,width:e.w,height:e.h,fill:n?"#f0efe8":c.fill,stroke:n?"#666":c.stroke,strokeWidth:n?1.5:1,rx:c.rx}),e.label.split(`
`).map((u,N)=>t.jsx("text",{x:e.x+e.w/2,y:e.y+14+N*13,textAnchor:"middle",style:{fontSize:c.fontSize,fontFamily:"'IBM Plex Mono', monospace",fill:c.textFill,fontWeight:N===0?700:500},children:u},N))]})}const s=E[e.type]||E.tool,l=e.label.split(`
`),d=s.fontSize||10,p=d+3.5,h=l.length*p,z=e.y+e.h/2-h/2+p*.72,m=n?s.fill.startsWith("#2")||s.fill.startsWith("#3")||s.fill.startsWith("#4")?"#8888cc":"#555":s.stroke,j=n?2.5:1.2;return t.jsxs("g",{onClick:o?c=>{c.stopPropagation(),i(e.id)}:void 0,style:{cursor:o?"pointer":"default"},children:[s.stroke!=="none"&&t.jsx("rect",{x:e.x,y:e.y,width:e.w,height:e.h,fill:s.fill,stroke:m,strokeWidth:j,rx:s.rx}),l.map((c,u)=>t.jsx("text",{x:e.x+e.w/2,y:z+u*p,textAnchor:"middle",style:{fontSize:d,fontFamily:"'IBM Plex Mono', monospace",fill:s.textFill,fontWeight:u===0?s.fontWeight:Math.min(s.fontWeight,500),letterSpacing:"0.02em"},children:c},u))]})}function D({descId:e,onClose:r}){const i=C[e];return i?t.jsxs("div",{style:{position:"absolute",top:0,right:0,bottom:0,width:"min(460px, 88vw)",background:"#faf9f6",borderLeft:"2px solid #333",zIndex:20,display:"flex",flexDirection:"column",boxShadow:"-4px 0 20px rgba(0,0,0,0.08)"},children:[t.jsxs("div",{style:{padding:"14px 18px",borderBottom:"1px solid #e0ddd5",display:"flex",justifyContent:"space-between",alignItems:"flex-start"},children:[t.jsx("h2",{style:{margin:0,fontSize:14,fontWeight:700,color:"#222",fontFamily:"'IBM Plex Mono', monospace",lineHeight:1.3,paddingRight:12},children:i.title}),t.jsx("button",{onClick:r,style:{background:"#333",color:"#faf9f6",border:"none",borderRadius:4,width:30,height:30,fontSize:15,cursor:"pointer",flexShrink:0,fontFamily:"'IBM Plex Mono', monospace",display:"flex",alignItems:"center",justifyContent:"center"},children:"✕"})]}),t.jsx("div",{style:{padding:"14px 18px",overflowY:"auto",flex:1},children:i.text.split(`

`).map((k,n)=>t.jsx("p",{style:{margin:"0 0 12px 0",fontSize:12.5,lineHeight:1.65,color:"#444",fontFamily:"'IBM Plex Mono', monospace",whiteSpace:"pre-wrap"},children:k},n))})]}):null}function S(e,r){return Math.sqrt((e.clientX-r.clientX)**2+(e.clientY-r.clientY)**2)}function F(){const[e,r]=v.useState({x:0,y:0}),[i,k]=v.useState(1),[n,o]=v.useState(!1),[s,l]=v.useState("_intro"),[d,p]=v.useState(!1),h=v.useRef({x:0,y:0}),z=v.useRef(e),m=v.useRef(null),j=v.useRef(null);v.useEffect(()=>{z.current=e},[e]),v.useEffect(()=>{const a=j.current;if(!a)return;const y=b=>{(b.ctrlKey||b.metaKey)&&(b.preventDefault(),k(R=>Math.min(Math.max(R*(b.deltaY>0?.92:1.08),.3),3)))};return a.addEventListener("wheel",y,{passive:!1}),()=>a.removeEventListener("wheel",y)},[]),v.useEffect(()=>{const a=j.current;if(!a)return;const y=b=>{b.touches.length>1&&b.preventDefault()};return a.addEventListener("touchmove",y,{passive:!1}),()=>a.removeEventListener("touchmove",y)},[]);const c=a=>{p(!1),a.touches.length===1?(o(!0),h.current={x:a.touches[0].clientX-z.current.x,y:a.touches[0].clientY-z.current.y}):a.touches.length===2&&(o(!1),m.current={dist:S(a.touches[0],a.touches[1]),zoom:i})},u=a=>{p(!0),a.touches.length===1&&n?r({x:a.touches[0].clientX-h.current.x,y:a.touches[0].clientY-h.current.y}):a.touches.length===2&&m.current&&k(Math.min(Math.max(m.current.zoom*(S(a.touches[0],a.touches[1])/m.current.dist),.3),3))},N=()=>{o(!1),m.current=null},M=a=>{a.button===0&&(o(!0),p(!1),h.current={x:a.clientX-e.x,y:a.clientY-e.y})},f=a=>{n&&(p(!0),r({x:a.clientX-h.current.x,y:a.clientY-h.current.y}))},T=()=>o(!1),x=()=>{d||l(null)},K=a=>{d||l(a===s?null:a)},P={width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",background:"#2a2a2a",color:"#faf9f6",border:"none",borderRadius:6,fontSize:18,fontFamily:"'IBM Plex Mono', monospace",cursor:"pointer",WebkitTapHighlightColor:"transparent",userSelect:"none"};return t.jsxs("div",{ref:j,style:{width:"100%",height:"100vh",background:"#faf9f6",fontFamily:"'IBM Plex Mono', monospace",position:"relative",overflow:"hidden",touchAction:"pan-y"},children:[t.jsx("link",{href:"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700;800&display=swap",rel:"stylesheet"}),t.jsxs("div",{style:{position:"absolute",top:0,left:0,right:0,padding:"8px 14px",background:"rgba(250,249,246,0.92)",backdropFilter:"blur(8px)",borderBottom:"1px solid #e0ddd5",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:10},children:[t.jsx("span",{style:{fontSize:12,fontWeight:600,color:"#333",letterSpacing:"0.05em"},children:"SOLO RPG — MYTHIC GME 2E + MAUSRITTER"}),t.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[t.jsx("button",{onClick:()=>l("_intro"),style:{fontSize:9,padding:"4px 10px",background:s==="_intro"?"#555":"#333",color:"#faf9f6",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontWeight:600},children:"ℹ O PROJEKTU"}),t.jsxs("span",{style:{fontSize:10,color:"#888"},children:[Math.round(i*100),"%"]})]})]}),t.jsxs("div",{style:{position:"absolute",bottom:20,right:s?"min(476px, calc(88vw + 16px))":16,display:"flex",flexDirection:"column",gap:6,zIndex:10,transition:"right 0.2s"},children:[t.jsx("button",{onClick:()=>k(a=>Math.min(a*1.2,3)),style:P,children:"+"}),t.jsx("button",{onClick:()=>k(a=>Math.max(a*.8,.3)),style:P,children:"−"}),t.jsx("button",{onClick:()=>{r({x:0,y:0}),k(1)},style:{...P,fontSize:11},children:"↺"})]}),t.jsxs("svg",{width:"100%",height:"100%",style:{cursor:n?"grabbing":"grab",touchAction:"none"},onMouseDown:M,onMouseMove:f,onMouseUp:T,onMouseLeave:T,onClick:x,onTouchStart:c,onTouchMove:u,onTouchEnd:N,children:[t.jsx("defs",{children:t.jsx("pattern",{id:"grid",width:"30",height:"30",patternUnits:"userSpaceOnUse",children:t.jsx("circle",{cx:"15",cy:"15",r:"0.5",fill:"#ddd"})})}),t.jsx("rect",{width:"100%",height:"100%",fill:"url(#grid)"}),t.jsxs("g",{transform:`translate(${e.x}, ${e.y}) scale(${i})`,children:[V.map((a,y)=>t.jsx(I,{edge:a,nodes:O},y)),O.map(a=>t.jsx(L,{node:a,selected:s,onSelect:K},a.id))]})]}),t.jsx("div",{style:{position:"absolute",bottom:6,left:14,fontSize:9,color:"#bbb"},children:"KLIKNI NA BLOK PRO DETAIL · TÁHNI · PINCH ZOOM · CTRL+SCROLL"}),s&&t.jsx(D,{descId:s,onClose:()=>l(null)})]})}export{F as default};
