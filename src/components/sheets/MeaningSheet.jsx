import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { rollMeaning } from "../../utils/dice.js";
import { ELEMENT_NAMES } from "../../constants/elements.js";
import Sheet from "../ui/Sheet.jsx";

export default function MeaningSheet({ onClose, onInsert }) {
  const [rolls, setRolls] = useState([]);
  const [selected, setSelected] = useState(new Set()); // indexy vybraných hodů
  const [selectedType, setSelectedType] = useState(null);
  const [selectedElement, setSelectedElement] = useState(ELEMENT_NAMES[0]);
  const [kontextText, setKontextText] = useState("");

  const currentTable = () => selectedType === "Elements" ? selectedElement : selectedType;

  const doRoll = (table) => {
    const key = table === "Descriptions" ? "descriptions" : table === "Actions" ? "actions" : table;
    const r = rollMeaning(key);
    return { ...r, table };
  };

  const doSelect = (t) => {
    setSelectedType(t);
    if (t === "Elements") return;
    const r = doRoll(t);
    setRolls([r]);
    setSelected(new Set([0]));
  };

  const doRollElement = () => {
    const r = doRoll(selectedElement);
    setRolls([r]);
    setSelected(new Set([0]));
  };

  const doRerollLast = () => {
    if (rolls.length === 0) return;
    const lastIdx = rolls.length - 1;
    const lastTable = rolls[lastIdx].table;
    const r = doRoll(lastTable);
    setRolls([...rolls.slice(0, -1), r]);
    // Zachovat selected — pokud byl poslední vybraný, zůstane
  };

  const doRollMore = () => {
    const table = currentTable();
    if (!table) return;
    const r = doRoll(table);
    const newIdx = rolls.length;
    setRolls([...rolls, r]);
    setSelected(new Set([...selected, newIdx]));
  };

  const toggleSelect = (idx) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  const removeRoll = (idx) => {
    const newRolls = rolls.filter((_, i) => i !== idx);
    // Přepočítat selected indexy
    const newSelected = new Set();
    for (const s of selected) {
      if (s < idx) newSelected.add(s);
      else if (s > idx) newSelected.add(s - 1);
      // s === idx → smazaný, přeskočit
    }
    setRolls(newRolls);
    setSelected(newSelected);
  };

  const insertResult = () => {
    if (rolls.length === 0) return;
    // Při 1 hodu vložit vždy, při 2+ jen vybrané
    const toInsert = rolls.length === 1
      ? rolls
      : rolls.filter((_, i) => selected.has(i));
    if (toInsert.length === 0) return;
    const entry = {
      type: "meaning",
      rolls: toInsert.map(({ word1, word2, cz1, cz2, d1, d2, table }) => ({ word1, word2, cz1, cz2, d1, d2, table })),
    };
    if (kontextText.trim()) {
      entry.context = kontextText.trim();
    }
    onInsert(entry);
  };

  const handleClose = () => {
    insertResult();
    onClose();
  };

  const tabs = ["Actions", "Descriptions", "Elements"];

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Meaning Tables — inspirační generátor</div>
      <div style={{ marginBottom: 12 }}>
        Vyber tabulku, appka ti hodí dvě náhodná slova. Z nich si domyslíš co se děje ve hře. Neber je doslova — jsou to vodítka pro tvou fantazii.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.purple + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: tvá myš vstoupí do opuštěného mlýna. Chceš vědět víc o tom co tam najde. Všechny příklady níže se odehrávají na tomto jednom místě.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.purple }}>Actions</div>
      <div style={{ marginBottom: 4 }}>
        Použij, když potřebuješ vědět <b>co se děje</b> nebo <b>co někdo dělá</b>.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Co se tu stalo?" → padne Abandon + Fight (Opuštění + Boj) → Vypadá to, že tu proběhl boj a pak to všichni narychlo opustili. Na zemi jsou převržené stoly a krev.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.purple }}>Descriptions</div>
      <div style={{ marginBottom: 4 }}>
        Použij, když potřebuješ vědět <b>jak něco vypadá</b>, <b>jaká je atmosféra</b> nebo <b>jakým způsobem</b> se něco děje.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Jaká je atmosféra v mlýně?" → padne Nervously + Dimly (Nervózně + Matně) → Uvnitř je šero, světlo proniká jen skrz praskliny v dřevě. Máš pocit, že tě něco sleduje.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.purple }}>Elements</div>
      <div style={{ marginBottom: 4 }}>
        Použij, když chceš <b>konkrétnější inspiraci</b> — co je v místnosti, co slyšíš, co najdeš.
      </div>
      <div style={{ marginBottom: 12, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        „Co slyším?" → vyber tabulku Sounds → dostaneš konkrétní zvuky místo abstraktních pojmů, třeba skřípání a kapání vody.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Jak interpretovat výsledek?</div>
      <div style={{ marginBottom: 10 }}>
        Dostaneš dvě slova — neber je doslova, jsou to vodítka. Polož si otázky: Co by to mohlo znamenat tady a teď? Která interpretace je nejzajímavější? Neexistuje špatná odpověď — vyber co dává smysl v aktuální scéně.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Tipy</div>
      <div>
        Když první hod nedává smysl, klidně hoď znovu — je to součást hry. Můžeš taky kombinovat s Fate Question: nejdřív se zeptej Ano/Ne (třeba „Je tu někdo?"), a pak si přes Meaning Tables nech vygenerovat detaily (kdo a co dělá).
      </div>
    </>
  );

  return (
    <Sheet title="🔮 MEANING TABLES" onClose={handleClose} help={helpContent}>
      <input
        type="text"
        value={kontextText}
        onChange={(e) => setKontextText(e.target.value)}
        placeholder="Na co hážeš? (nepovinné)"
        style={{ width: "100%", padding: "6px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 10, fontFamily: FONT, background: C.bg, color: C.text, marginBottom: 10, boxSizing: "border-box" }}
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => doSelect(t)} style={{ flex: 1, padding: "6px 0", border: `1px solid ${selectedType === t ? C.purple : C.border}`, background: selectedType === t ? C.purple : "transparent", color: selectedType === t ? "white" : C.muted, borderRadius: 6, fontSize: 10, fontFamily: FONT, cursor: "pointer" }}>{t}</button>
        ))}
      </div>
      {selectedType === "Elements" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <select
            value={selectedElement}
            onChange={(e) => setSelectedElement(e.target.value)}
            style={{ flex: 1, padding: "6px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 10, fontFamily: FONT, background: C.bg, color: C.text }}
          >
            {ELEMENT_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button onClick={doRollElement} style={{ padding: "6px 14px", background: C.purple, color: "white", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>HODIT</button>
        </div>
      )}
      {rolls.length > 0 ? (
        <>
          {rolls.map((r, i) => {
            const isSelected = selected.has(i);
            const canToggle = rolls.length > 1;
            return (
              <div key={i} onClick={canToggle ? () => toggleSelect(i) : undefined} style={{ marginBottom: 8, cursor: canToggle ? "pointer" : "default", opacity: canToggle && !isSelected ? 0.35 : 1, transition: "opacity 0.15s", position: "relative" }}>
                <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 4, fontFamily: FONT }}>
                  {r.table} · d100={r.d1}, d100={r.d2}
                </div>
                <div style={{ background: C.purple + "20", border: `2px solid ${isSelected || !canToggle ? C.purple : C.border}`, borderRadius: 8, padding: "10px 0", textAlign: "center" }}>
                  <div style={{ fontSize: i === rolls.length - 1 ? 22 : 16, fontWeight: 700, color: C.purple, fontFamily: FONT }}>{r.word1} + {r.word2}</div>
                  {r.cz1 && <div style={{ fontSize: i === rolls.length - 1 ? 11 : 10, color: C.muted, marginTop: 3, fontFamily: FONT }}>{r.cz1} + {r.cz2}</div>}
                </div>
                {canToggle && (
                  <button onClick={(e) => { e.stopPropagation(); removeRoll(i); }} style={{ position: "absolute", top: 0, right: 0, width: 22, height: 22, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.bg, color: C.muted, fontSize: 12, fontFamily: FONT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}>×</button>
                )}
              </div>
            );
          })}
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>Interpretuj v kontextu scény</div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={doRerollLast} style={{ flex: 1, height: 40, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>PŘEHODIT</button>
            <button onClick={doRollMore} style={{ flex: 1, height: 40, background: "transparent", color: C.purple, border: `1px solid ${C.purple}`, borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>HODIT DALŠÍ</button>
          </div>
          <button onClick={() => { insertResult(); onClose(); }} style={{ width: "100%", height: 46, background: C.purple, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO DENÍKU</button>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>
          {selectedType === "Elements" ? "Vyber tabulku a klikni HODIT ↑" : "Vyber typ tabulky ↑"}
        </div>
      )}
    </Sheet>
  );
}
