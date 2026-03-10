import { useState, useRef, useEffect } from "react";
import { C, FONT } from "../../constants/theme.js";

export default function TextBlock({ entry, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.text);
  const ref = useRef(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.selectionStart = ref.current.value.length;
    }
  }, [editing]);

  const save = () => {
    setEditing(false);
    const trimmed = text.trim();
    if (trimmed && trimmed !== entry.text && onUpdate) {
      onUpdate({ ...entry, text: trimmed });
    } else {
      setText(entry.text);
    }
  };

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); } }}
        style={{
          margin: "10px 0", width: "100%", border: `1px solid ${C.green}`,
          borderRadius: 4, padding: "6px 8px", fontSize: 13, fontFamily: FONT,
          color: C.text, background: C.bg, resize: "vertical", minHeight: 40,
          outline: "none", lineHeight: 1.7,
        }}
      />
    );
  }

  return (
    <p
      onClick={() => setEditing(true)}
      style={{ margin: "10px 0", cursor: "pointer" }}
    >
      {entry.text}
    </p>
  );
}
