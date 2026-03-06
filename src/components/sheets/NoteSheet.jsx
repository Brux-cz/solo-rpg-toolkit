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
  return (
    <Sheet title="📝 POZNÁMKA" onClose={onClose}>
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
