# Kroky pred implementaci Discovery Check mechaniky

## 1. Cteni referencnich dokumentu (POVINNY CHECKLIST)

### 1a. Datovy model (`src/docs/datovy-model.jsx`)
- **Precist radky 203-260** — sekce Mythic GME, kde je definovan `threadSeznam` a pole `progressTrack` (radek 245).
- Klicovy poznatek z modelu: `progressTrack` je `number (0-10)`, Discovery Check popis: "akce -> Fate Q 'Je neco objeveno?'(min 50/50) -> Yes = d10+progress na Thread Discovery Table -> Meaning Tables."
- Thread entry ma jiz pole `progress` a `total` v INITIAL_GAME (viz gameStore.js radek 46).

### 1b. Diagram (`src/docs/solo-rpg-diagram.jsx`)
- **Precist radky 614-645** — sekce "Thread Progress Track", kde je popsana cela mechanika.
- Klicove poznatky:
  - Track ma 3 varianty delky: 10, 15, 20 bodu.
  - Progress Points: standardni +2, Flashpoint +2, Discovery Check +1/+2/+3 (variabilni).
  - Flashpoints: dramticke momenty vynucene na konci faze (po 5 bodech).
  - Discovery Check flow: hrac vyvine usili -> Fate Question "Je neco objeveno?" (min 50/50) -> uspech -> Thread Discovery Check Table -> typ objevu + bonusove body.
  - Plot Armor: thread nemuze byt nahodne uzavren dokud nedosahne konce tracku.

## 2. Analyza stavajiciho stavu

### 2a. Data (gameStore.js)
- Threads uz maji pole `progress` (number) a `total` (number, default 10) — zavedeno v migraci 2.
- **Kontrola**: Datovy model rika `progressTrack: number (0-10)`, ale implementace uz ma `total` s moznosti nastavit delku. To je rozsireni oproti modelu (10/15/20), coz je v souladu s diagramem.
- **Neni potreba nova migrace** pro zakladni strukturu threadu — pole `progress` a `total` uz existuji.

### 2b. UI (SvetTab.jsx)
- Thready sub-tab uz zobrazuje progress bar a tlacitko "+2" pro standardni pokrok.
- Mythic sub-tab tez zobrazuje progress/total u kazdeho threadu.
- **Chybi**: Discovery Check tlacitko/flow, nastaveni delky tracku (10/15/20), flashpoint mechanika, plot armor indikator.

### 2c. Sheety a bloky
- FateSheet.jsx uz existuje — Discovery Check ho bude pouzivat internally (Fate Question "Je neco objeveno?").
- Meaning tables (rollMeaning) uz existuji v utils/dice.js.
- **Bude potreba**: novy sheet nebo rozsireni existujiciho pro Discovery Check flow.

## 3. Plan implementace

### Krok 1: Rozhodnout o architekture
- **Varianta A**: Novy `DiscoveryCheckSheet.jsx` — samostatny bottom sheet pro Discovery Check.
- **Varianta B**: Integrace do existujiciho Thready sub-tabu jako inline akce.
- Doporuceni: Varianta A (novy sheet), protoze flow je vicekrokovy (vyber thread -> Fate Q -> tabulka -> vysledek).

### Krok 2: Thread Discovery Check Table
- Diagram zminuje "Thread Discovery Check Table" ale nespecifikuje presne hodnoty.
- **ZASTAV SE a zeptej se uzivatele**: Kde je definovana Thread Discovery Check Table? Je to z Mythic GME 2e knihy? Potrebuji presne hodnoty pro tabulku (d10 + progress -> typ objevu + body).

### Krok 3: Datove zmeny
- Overit zda staci stavajici `progress` a `total` pole, nebo je potreba pridat dalsi pole (napr. `flashpoints`, `fazeDosazena`, `plotArmor`).
- Pokud pridavam pole -> MIGRACE (zvysit CURRENT_VERSION na 7, pridat MIGRATIONS[6]).

### Krok 4: UI komponenty
- Pridat Discovery Check tlacitko do Thready sub-tabu (vedle stavajiciho "+2").
- Vytvorit novy sheet nebo block pro zobrazeni vysledku.
- Pridat moznost menit `total` (10/15/20) pri vytvareni/editaci threadu.

### Krok 5: Denikovy blok
- Zvazit novy typ bloku (napr. `DiscoveryBlock`) pro zaznam vysledku do deniku.
- Alternativa: pouzit existujici FateBlock + MeaningBlock sekvencne.

## 4. Kontroly pred kodovanim

- [ ] Overit ze Thread Discovery Check Table ma jasne definovane hodnoty (zeptat se uzivatele).
- [ ] Overit ze neni konflikt s existujicimi poli `progress`/`total` v gameStore.js.
- [ ] Overit ze FateSheet.jsx API umoznuje volani s preddefinovanou otazkou a odds.
- [ ] Rozhodnout zda flashpoint mechanika je soucast tohoto tasku nebo samostatny task.
- [ ] Overit ze ActionToolbar.jsx ma prostor pro dalsi ikonu (nebo Discovery Check bude pristupny jen z Thready tabu).

## 5. Potencialni problemy

1. **Chybejici tabulka**: Diagram zminuje "Thread Discovery Check Table" ale neni v `constants/tables.js`. Bude treba pridat.
2. **Vicekrokovy flow**: Discovery Check je sekvence (vyber thread -> Fate Q -> pokud Yes -> tabulka -> Meaning -> zapis do deniku). Musim navrhnout UX ktery to zvladne v ramci jednoho sheetu.
3. **Plot Armor logika**: Pri "Close A Thread" eventu musim zkontrolovat zda thread ma aktivni plot armor (progress < total). To vyzaduje upravu FateSheet.jsx nebo event processing.
4. **Flashpoint vynuceni**: Na konci faze (kazdy 5. bod) kontrola zda flashpoint probehl. Toto je komplexnejsi mechanika — mozna odlozit do separatniho tasku.
