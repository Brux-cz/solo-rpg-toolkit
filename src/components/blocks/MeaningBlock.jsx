import { C } from "../../constants/theme.js";

export default function MeaningBlock({ entry }) {
  return (
    <div style={{ borderLeft: `3px solid ${C.purple}`, background: C.purple + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.purple, display: "flex", gap: 6 }}>
      <span>🔮</span>
      <span style={{ fontWeight: 600 }}>{entry.word1} + {entry.word2}</span>
    </div>
  );
}
