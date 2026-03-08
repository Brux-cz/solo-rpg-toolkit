import { C } from "../../constants/theme.js";

export default function BehaviorBlock({ entry }) {
  return (
    <div style={{ borderLeft: `3px solid ${C.orange}`, background: C.orange + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.orange }}>
      <div style={{ display: "flex", gap: 6 }}>
        <span>🎭</span>
        <span style={{ fontWeight: 600 }}>{entry.npc}: {entry.word1} + {entry.word2}</span>
        {entry.context && <span style={{ color: C.muted, fontSize: 9 }}>({entry.context})</span>}
      </div>
      {entry.cz1 && <div style={{ fontSize: 9, color: C.muted, marginTop: 2, marginLeft: 22 }}>{entry.cz1} + {entry.cz2}</div>}
    </div>
  );
}
