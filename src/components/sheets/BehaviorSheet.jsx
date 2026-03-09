import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { rollMeaning } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

const CONTEXT_OPTIONS = [
  { key: "actions", label: "Obecné akce" },
  { key: "Character Actions General", label: "Akce NPC" },
  { key: "Character Actions Combat", label: "Akce v boji" },
  { key: "Character Conversations", label: "Rozhovor" },
  { key: "Animal Actions", label: "Zvíře / tvor" },
  { key: "Character Motivations", label: "Motivace" },
];

export default function BehaviorSheet({ onClose, onInsert, npcList }) {
  const [npcName, setNpcName] = useState("");
  const [context, setContext] = useState("actions");
  const [result, setResult] = useState(null);

  const doRoll = () => {
    const m = rollMeaning(context);
    setResult({ ...m, context });
  };

  const insertResult = () => {
    if (!result) return;
    const ctxLabel = CONTEXT_OPTIONS.find(c => c.key === result.context)?.label || "";
    onInsert({
      type: "behavior",
      npc: npcName || "NPC",
      word1: result.word1,
      word2: result.word2,
      cz1: result.cz1,
      cz2: result.cz2,
      d1: result.d1,
      d2: result.d2,
      context: ctxLabel,
    });
  };

  const handleClose = () => {
    insertResult();
    onClose();
  };

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>NPC Chování — co ta postava dělá?</div>
      <div style={{ marginBottom: 12 }}>
        Generátor akcí a chování pro neherní postavy. Místo otázky ano/ne se zeptáš „co NPC dělá?" a appka ti dá inspiraci.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.orange + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: myš potkala v mlýně starou myšku. Co dělá? Jak reaguje?
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.orange }}>1. Zadej jméno NPC</div>
      <div style={{ marginBottom: 10 }}>
        Napiš jméno nebo vyber z nabídky (NPC ze seznamu). Jméno se zapíše do deníku.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.orange }}>2. Vyber kontext</div>
      <div style={{ marginBottom: 4 }}>
        Různé tabulky pro různé situace — obecné akce, boj, rozhovor, zvířecí chování, motivace.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Stará myška v mlýně → „Rozhovor". Divoká kočka → „Zvíře / tvor".
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.orange }}>3. Hoď a interpretuj</div>
      <div style={{ marginBottom: 10 }}>
        Dostaneš dva pojmy — spoj je s kontextem situace. Výsledek nemusí být doslova přesný, hledáš inspiraci.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        Kombinuj s Fate Question — nejdřív „Je přátelská?" (Fate), pak „Co dělá?" (Behavior). Vlož do deníku a pokračuj.
      </div>
    </>
  );

  return (
    <Sheet title="🎭 NPC AKCE" onClose={handleClose} help={helpContent}>
      <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 10, fontFamily: FONT }}>Co NPC dělá? Vyber kontext a hoď na tabulku.</div>
      <input
        type="text"
        value={npcName}
        onChange={(e) => setNpcName(e.target.value)}
        placeholder="Jméno NPC..."
        style={{ width: "100%", padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontFamily: FONT, background: C.bg, color: C.text, marginBottom: 8, boxSizing: "border-box" }}
      />
      {npcList && npcList.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {npcList.map((npc, i) => (
            <button key={i} onClick={() => setNpcName(npc.name || npc)} style={{ padding: "3px 8px", border: `1px solid ${npcName === (npc.name || npc) ? C.orange : C.border}`, background: npcName === (npc.name || npc) ? C.orange + "20" : "transparent", color: npcName === (npc.name || npc) ? C.orange : C.muted, borderRadius: 4, fontSize: 9, fontFamily: FONT, cursor: "pointer" }}>{npc.name || npc}</button>
          ))}
        </div>
      )}
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, fontFamily: FONT }}>KONTEXT:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
        {CONTEXT_OPTIONS.map(opt => (
          <button key={opt.key} onClick={() => setContext(opt.key)} style={{
            padding: "4px 10px", borderRadius: 20, fontSize: 10, fontFamily: FONT, cursor: "pointer",
            border: `1px solid ${context === opt.key ? C.orange : C.border}`,
            background: context === opt.key ? C.orange : "transparent",
            color: context === opt.key ? "white" : C.muted,
          }}>{opt.label}</button>
        ))}
      </div>
      <button onClick={doRoll} style={{ width: "100%", height: 42, background: C.orange, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer", marginBottom: 14 }}>HODIT</button>
      {result ? (
        <>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 8, fontFamily: FONT }}>d100 = {result.d1}, d100 = {result.d2}</div>
          <div style={{ background: C.orange + "20", border: `2px solid ${C.orange}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.orange, fontFamily: FONT }}>{result.word1} + {result.word2}</div>
            {result.cz1 && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontFamily: FONT }}>{result.cz1} + {result.cz2}</div>}
          </div>
          <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>Interpretuj chování NPC v kontextu scény</div>
        </>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontFamily: FONT, marginTop: 20 }}>Zadej jméno NPC a klikni HODIT ↑</div>
      )}
    </Sheet>
  );
}
