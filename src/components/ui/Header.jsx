import { C, FONT } from "../../constants/theme.js";

function getZkMax(uroven) {
  if (uroven <= 1) return 0;
  if (uroven === 2) return 1000;
  if (uroven === 3) return 3000;
  if (uroven === 4) return 6000;
  return 6000 + (uroven - 4) * 5000;
}

export default function Header({ onToggle, expanded, cf, sceneNum, character }) {
  const ch = character;
  return (
    <div onClick={onToggle} style={{ padding: "9px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", flexShrink: 0, fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span>
          <span style={{ color: C.blue, fontWeight: 700 }}>Scéna {sceneNum}</span>
          <span style={{ color: C.border }}> · </span>
          <span style={{ color: C.text }}>CF <span style={{ color: C.yellow, fontWeight: 700 }}>{cf}</span></span>
        </span>
        <span style={{ color: C.muted }}>
          Den 2 · ráno{expanded && <span> · <span style={{ color: C.blue }}>Zataženo</span></span>}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: 6, fontSize: 11, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><span style={{ color: C.green }}>STR</span> {ch.str.akt}/{ch.str.max}  <span style={{ color: C.green }}>DEX</span> {ch.dex.akt}/{ch.dex.max}  <span style={{ color: C.green }}>WIL</span> {ch.wil.akt}/{ch.wil.max}</span>
            <span><span style={{ color: C.red }}>BO</span> {ch.bo.akt}/{ch.bo.max}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Ďobky: <span style={{ color: C.yellow }}>{ch.dobky}</span></span>
            <span>Úr. {ch.uroven}  ZK {ch.zk}/{getZkMax(ch.uroven)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
