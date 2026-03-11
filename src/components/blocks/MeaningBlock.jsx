import { useState } from "react";
import { C } from "../../constants/theme.js";

export default function MeaningBlock({ entry }) {
  const [expanded, setExpanded] = useState(false);

  // Nový formát (rolls pole) vs starý formát (word1/word2 přímo na entry)
  const rolls = entry?.rolls;
  const isNewFormat = Array.isArray(rolls) && rolls.length > 0;

  if (!isNewFormat && !entry?.word1) return null;

  return (
    <div onClick={() => setExpanded(!expanded)} style={{ borderLeft: `3px solid ${C.purple}`, background: C.purple + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: 0, fontSize: 11, color: C.purple, cursor: "pointer" }}>
      {entry.context && (
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 2, fontStyle: "italic" }}>„{entry.context}"</div>
      )}
      {isNewFormat ? (
        rolls.map((r, i) => (
          <div key={i} style={{ marginBottom: i < rolls.length - 1 ? 4 : 0 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {i === 0 && <span>🔮</span>}
              {i > 0 && <span style={{ width: 16 }} />}
              <span style={{ fontWeight: 600 }}>{r.word1} + {r.word2}</span>
            </div>
            {r.cz1 && <div style={{ fontSize: 9, color: C.muted, marginTop: 1, marginLeft: 22 }}>{r.cz1} + {r.cz2}</div>}
            {expanded && (
              <div style={{ fontSize: 9, color: C.muted, marginTop: 2, marginLeft: 22 }}>
                {r.table && <span>{r.table}</span>}
                {r.d1 != null && <span> · d100={r.d1}, d100={r.d2}</span>}
              </div>
            )}
          </div>
        ))
      ) : (
        <>
          <div style={{ display: "flex", gap: 6 }}>
            <span>🔮</span>
            <span style={{ fontWeight: 600 }}>{entry.word1} + {entry.word2}</span>
          </div>
          {entry.cz1 && <div style={{ fontSize: 9, color: C.muted, marginTop: 2, marginLeft: 22 }}>{entry.cz1} + {entry.cz2}</div>}
          {entry.inspirace && (
            <div style={{ fontSize: 9, color: C.muted, marginTop: 3, marginLeft: 22, fontStyle: "italic" }}>
              💭 {entry.inspirace}
            </div>
          )}
          {expanded && (
            <div style={{ fontSize: 9, color: C.muted, marginTop: 4, marginLeft: 22 }}>
              {entry.table && <span>{entry.table}</span>}
              {entry.d1 != null && <span> · d100={entry.d1}, d100={entry.d2}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
