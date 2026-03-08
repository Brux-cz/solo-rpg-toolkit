import { C } from "../../constants/theme.js";

export default function FateBlock({ entry }) {
  const color = entry.yes ? C.green : C.red;
  const label = entry.exceptional
    ? (entry.yes ? "EXCEPTIONAL ANO" : "EXCEPTIONAL NE")
    : (entry.yes ? "ANO" : "NE");
  return (
    <div style={{ borderLeft: `3px solid ${color}`, background: color + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: "6px 0", fontSize: 11, color: C.muted, display: "flex", gap: 6, flexWrap: "wrap" }}>
      <span>❓</span>
      <span>{entry.question}</span>
      <span>·</span>
      <span>{entry.oddsLabel}</span>
      <span>·</span>
      <span>d100={entry.d100}</span>
      <span style={{ marginLeft: "auto", color, fontWeight: 700 }}>→ {label}</span>
      {entry.randomEvent && <div style={{ width: "100%", color: C.yellow, fontSize: 10 }}>
        ⚡ {entry.eventFocus || "Random Event"}{entry.eventMeaning ? ` · ${entry.eventMeaning.word1} + ${entry.eventMeaning.word2}` : ""}{entry.eventTargetName ? ` → ${entry.eventTargetName}` : ""}{entry.eventTargetReroll ? " → Vyber sám" : ""}{entry.eventTargetEmpty ? " → (prázdný seznam)" : ""}
        {entry.eventMeaning?.cz1 && <div style={{ color: C.muted, fontSize: 9 }}>{entry.eventMeaning.cz1} + {entry.eventMeaning.cz2}</div>}
      </div>}
    </div>
  );
}
