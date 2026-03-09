import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import Sheet from "../ui/Sheet.jsx";

export default function NoteSheet({ onClose, onInsert }) {
  const [text, setText] = useState("");
  const doInsert = () => {
    if (!text.trim()) return;
    onInsert({ type: "text", text: text.trim() });
    onClose();
  };
  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Poznámka — tvůj příběh</div>
      <div style={{ marginBottom: 12 }}>
        Sem piš co se děje. Tady jsi vypravěč — popisuj akce, dialogy, prostředí, cokoliv. Není žádný špatný vstup.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.text + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: myš opatrně vstoupí do mlýna. „Haló? Je tu někdo?" zavolá do tmy.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>1. Napiš text</div>
      <div style={{ marginBottom: 10 }}>
        Popiš co tvá postava dělá, říká, vidí. Můžeš psát v jakémkoliv stylu — krátce i dlouze.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>2. Vlož do deníku</div>
      <div style={{ marginBottom: 10 }}>
        Text se přidá do chronologického záznamu tvého příběhu.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        Střídej poznámky s otázkami osudu (Fate) a Meaning Tables. Poznámka → otázka → odpověď → poznámka — tak vzniká příběh.
      </div>
    </>
  );

  return (
    <Sheet title="📝 POZNÁMKA" onClose={onClose} help={helpContent}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Co se děje ve scéně..."
        rows={4}
        style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: FONT, background: "white", color: C.text, outline: "none", resize: "vertical", marginBottom: 12 }}
      />
      <button onClick={doInsert} style={{ width: "100%", height: 46, background: C.text, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>VLOŽIT DO TEXTU</button>
    </Sheet>
  );
}
