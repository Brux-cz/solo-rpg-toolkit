import { C } from "../../constants/theme.js";

export default function DiceBlock({ entry }) {
  return (
    <div style={{ borderLeft: `3px solid ${C.muted}`, background: C.text + "08", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.text, display: "flex", gap: 6 }}>
      <span>🎲</span>
      <span>{entry.die} =</span>
      <span style={{ fontWeight: 700 }}>{entry.value}</span>
    </div>
  );
}
