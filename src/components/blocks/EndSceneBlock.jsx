import { C, FONT } from "../../constants/theme.js";

export default function EndSceneBlock({ entry }) {
  return (
    <div style={{
      borderLeft: `3px solid`,
      borderImage: `linear-gradient(${C.red}, ${C.blue}) 1`,
      padding: "6px 10px",
      margin: "6px 0",
      fontSize: 11,
      fontFamily: FONT,
      color: C.muted,
    }}>
      <span style={{ fontWeight: 700, color: C.text }}>KONEC SCÉNY {entry.sceneNum}</span>
      <span style={{ color: C.border }}> · </span>
      <span>CF {entry.cfOld}→{entry.cfNew}</span>
    </div>
  );
}
