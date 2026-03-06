import { C } from "../../constants/theme.js";

export default function DetailBlock({ entry }) {
  return (
    <div style={{ borderLeft: `3px solid ${C.yellow}`, background: C.yellow + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.yellow, display: "flex", gap: 6 }}>
      <span>🔍</span>
      <span style={{ fontWeight: 600 }}>{entry.word1} + {entry.word2}</span>
    </div>
  );
}
