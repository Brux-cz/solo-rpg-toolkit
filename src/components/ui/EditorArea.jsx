import { C, FONT } from "../../constants/theme.js";
import FateBlock from "../blocks/FateBlock.jsx";
import MeaningBlock from "../blocks/MeaningBlock.jsx";
import SceneBlock from "../blocks/SceneBlock.jsx";
import TextBlock from "../blocks/TextBlock.jsx";
import CombatBlock from "../blocks/CombatBlock.jsx";

export default function EditorArea({ entries }) {
  return (
    <div style={{ padding: "14px 16px", fontFamily: FONT, fontSize: 13, lineHeight: 1.7, color: C.text, overflowY: "auto", height: "100%" }}>
      {entries.map((e, i) => {
        if (e.type === "text") return <TextBlock key={i} entry={e} />;
        if (e.type === "fate") return <FateBlock key={i} entry={e} />;
        if (e.type === "meaning") return <MeaningBlock key={i} entry={e} />;
        if (e.type === "scene") return <SceneBlock key={i} entry={e} />;
        if (e.type === "combat") return <CombatBlock key={i} entry={e} />;
        return null;
      })}
      <span style={{ display: "inline-block", width: 2, height: 14, background: C.green, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
    </div>
  );
}
