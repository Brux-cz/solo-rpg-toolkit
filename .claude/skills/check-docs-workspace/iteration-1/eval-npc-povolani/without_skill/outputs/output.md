# Kroky pred implementaci: pridani pole `povolani` k NPC

## 1. Kontrola checklistu z CLAUDE.md

Zadani meni data (NPC entitu) — je povinne:
- Precist `src/docs/datovy-model.jsx` (sekce NPC, r. 200–233)
- Precist `src/docs/solo-rpg-diagram.jsx` (sekce NPC, r. 177–207)
- Overit, ze pole `povolani` neni v rozporu s existujicim modelem
- Pridat MIGRACI v `src/store/gameStore.js` + zvysit `CURRENT_VERSION`

## 2. Co jsem zjistil z dokumentace

### Datovy model (`src/docs/datovy-model.jsx`, r. 200–233)
NPC ma tyto pole: id, jmeno, prijmeni, druh, spolecenskePostaveni, vzhled, zvlastnost, znameni, motivace, vztah, reakce, osadaId, frakceId, bojove staty (str/dex/wil, bo, zbran, zbroj), predmetyUSebe, poznamky.

**Pole `povolani` v datovem modelu NENI.** Je tam `spolecenskePostaveni` (Chudas, Prosta, Mestan, Cech, Slechtic), ale to je neco jineho nez povolani/zivnost.

### Diagram (`src/docs/solo-rpg-diagram.jsx`, r. 177–207)
Diagram popisuje tvorbu postavy (jmena, prijmeni), ale NPC wiki zaznam nema explicitni pole pro povolani.

### Aktualni implementace
- `src/store/gameStore.js`: NPC v `game.npcs` — pole objektu s name, weight, flag (mechanicky seznam)
- `src/components/tabs/SvetTab.jsx`: NPC wiki karta ma pole popis, lokace, vztah, poznamky + bojove staty

## 3. Rozhodnuti: je zmena v souladu s modelem?

Pole `povolani` v referencnim datovem modelu neni. To znamena:

**Varianta A — Upozornit uzivatele:**
Datovy model toto pole nedefinuje. Mel bych se zastavit a zeptat: "Pole `povolani` neni v datovem modelu (`src/docs/datovy-model.jsx`). Mam ho tam nejdriv pridat, nebo implementovat primo?"

**Varianta B — Pole je logicke rozsireni:**
Model ma `spolecenskePostaveni` (socialni trida) a `poznamky` (volny text). Povolani je samostatna informace, ktera tam logicky patri. Uzivatel ji explicitne chce.

Spravny postup dle checklistu: **zastavit se a upozornit uzivatele**, ze pole v modelu chybi.

## 4. Kroky implementace (po schvaleni)

1. **Aktualizovat datovy model** (`src/docs/datovy-model.jsx`, r. 200–233):
   - Pridat `{ name: "povolani", type: "string?", note: "Cim se NPC zivi" }` do pole `fields` entity NPC

2. **Pridat migraci** (`src/store/gameStore.js`):
   - Zvysit `CURRENT_VERSION` z 6 na 7
   - Pridat `MIGRATIONS[6]` — projit `data.npcs` a kazdemu NPC pridat `povolani: n.povolani || ""`
   - Pozor: NPC v `game.npcs` jsou mechanicky seznam (name/weight/flag), wiki data jsou ulozena primo na objektu (popis, lokace, vztah, poznamky). Migraci udelat na stejnem miste.

3. **Upravit UI** (`src/components/tabs/SvetTab.jsx`):
   - Pridat input pole pro `povolani` do NPC wiki karty (expandovana sekce)
   - Umistit ho logicky — napr. za popis, pred lokaci
   - Inline CSS, barvy z `C`, font z `FONT`

4. **Overit funkcnost**:
   - Existujici NPC bez `povolani` se zobrazi spravne (prazdne pole)
   - Nove NPC maji `povolani` k dispozici
   - localStorage migrace funguje (stara data se korektne aktualizuji)
   - Export/import zachovava pole `povolani`

## 5. Soubory k uprave

- `/home/brux/projekty/solo-rpg-toolkit/src/docs/datovy-model.jsx` (pridat pole do NPC definice)
- `/home/brux/projekty/solo-rpg-toolkit/src/store/gameStore.js` (migrace 6→7, CURRENT_VERSION=7)
- `/home/brux/projekty/solo-rpg-toolkit/src/components/tabs/SvetTab.jsx` (UI input pro povolani)

## 6. Co NEDELAT

- Nepridavat pole bez migrace (stara data by se rozbila)
- Neimplementovat bez aktualizace datoveho modelu (budouci instance by nevedly o poli)
- Nepridavat validaci ani omezeni — je to volny textovy vstup dle zadani
