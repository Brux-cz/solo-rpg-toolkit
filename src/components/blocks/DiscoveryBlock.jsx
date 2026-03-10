import { C } from "../../constants/theme.js";

const TYPE_COLORS = {
  Progress: C.green,
  Flashpoint: C.red,
  Track: C.yellow,
  Strengthen: C.purple,
};

export default function DiscoveryBlock({ entry }) {
  const color = TYPE_COLORS[entry.discoveryType] || C.green;
  return (
    <div style={{ borderLeft: `3px solid ${color}`, background: color + "18", borderRadius: "0 4px 4px 0", padding: "4px 10px", margin: 0, fontSize: 11, color: C.muted }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span>🔍</span>
        <span>{entry.threadName}</span>
        <span>·</span>
        <span>d100={entry.fateD100} → {entry.fateExceptional ? "EXC. ANO" : "ANO"}</span>
        <span>·</span>
        <span>d10+{entry.discoveryTotal - entry.discoveryD10}={entry.discoveryTotal}</span>
        <span style={{ color, fontWeight: 700 }}>→ {entry.discoveryType} +{entry.discoveryPoints}</span>
      </div>
      <div style={{ fontSize: 10, marginTop: 2 }}>
        <span>{entry.discoveryDesc}</span>
        {entry.meaning && <>
          <span> · </span>
          <span style={{ color: C.purple }}>{entry.meaning.word1} + {entry.meaning.word2}</span>
          {entry.meaning.cz1 && <span style={{ color: C.muted, fontSize: 9 }}> ({entry.meaning.cz1} + {entry.meaning.cz2})</span>}
        </>}
      </div>
      {entry.randomEvent && <div style={{ fontSize: 10, marginTop: 2, color: C.yellow }}>⚡ {entry.eventFocus}{entry.eventMeaning ? ` · ${entry.eventMeaning.word1} + ${entry.eventMeaning.word2}` : ""}{entry.eventMeaning?.cz1 ? ` (${entry.eventMeaning.cz1} + ${entry.eventMeaning.cz2})` : ""}</div>}
    </div>
  );
}
