import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import FateBlock from "../blocks/FateBlock.jsx";
import MeaningBlock from "../blocks/MeaningBlock.jsx";
import SceneBlock from "../blocks/SceneBlock.jsx";
import TextBlock from "../blocks/TextBlock.jsx";
import CombatBlock from "../blocks/CombatBlock.jsx";
import DetailBlock from "../blocks/DetailBlock.jsx";
import DiceBlock from "../blocks/DiceBlock.jsx";
import EndSceneBlock from "../blocks/EndSceneBlock.jsx";
import DiscoveryBlock from "../blocks/DiscoveryBlock.jsx";
import BehaviorBlock from "../blocks/BehaviorBlock.jsx";
import SwipeableBlock from "./SwipeableBlock.jsx";
import { canReroll } from "../../utils/reroll.js";

function renderBlock(entry, i, onUpdateEntry) {
  if (entry.type === "text") return <TextBlock key={i} entry={entry} onUpdate={(updated) => onUpdateEntry?.(i, updated)} />;
  if (entry.type === "fate") return <FateBlock key={i} entry={entry} />;
  if (entry.type === "meaning") return <MeaningBlock key={i} entry={entry} />;
  if (entry.type === "scene") return <SceneBlock key={i} entry={entry} onUpdate={(updated) => onUpdateEntry?.(i, updated)} />;
  if (entry.type === "combat") return <CombatBlock key={i} entry={entry} />;
  if (entry.type === "detail") return <DetailBlock key={i} entry={entry} />;
  if (entry.type === "dice") return <DiceBlock key={i} entry={entry} />;
  if (entry.type === "endscene" || entry.type === "endScene") return <EndSceneBlock key={i} entry={entry} />;
  if (entry.type === "discovery") return <DiscoveryBlock key={i} entry={entry} />;
  if (entry.type === "behavior") return <BehaviorBlock key={i} entry={entry} />;
  return null;
}

export default function EditorArea({ entries, onDeleteEntry, onRerollEntry, onUpdateEntry, swipeSeen, onSwipeSeen }) {
  const isEmpty = entries.length === 0;
  const [openSwipeIdx, setOpenSwipeIdx] = useState(null);
  const showSwipeHint = !swipeSeen && entries.length > 0 && entries.length <= 3;

  return (
    <div style={{ padding: "14px 16px", fontFamily: FONT, fontSize: 13, lineHeight: 1.7, color: C.text, overflowY: "auto", height: "100%" }}>
      {isEmpty && (
        <div style={{ padding: "14px 16px", background: C.blue + "10", borderRadius: 10, fontSize: 11, lineHeight: 1.7, color: C.text, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Tvůj deník je prázdný</div>
          <div style={{ color: C.muted, marginBottom: 8 }}>
            Tady se bude zapisovat celý příběh tvé postavy — scény, otázky osudu, boje, poznámky. Všechno na jednom místě.
          </div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Začni takhle:</div>
          <div style={{ color: C.muted, marginBottom: 4 }}>
            1. Klikni na <span style={{ color: C.blue, fontWeight: 600 }}>🎬 Scéna</span> v liště dole — vytvoříš první scénu svého příběhu.
          </div>
          <div style={{ color: C.muted, marginBottom: 4 }}>
            2. Napiš co tvá postava dělá a ptej se <span style={{ color: C.green, fontWeight: 600 }}>❓ Fate</span> na otázky — osud ti odpoví Ano nebo Ne.
          </div>
          <div style={{ color: C.muted, marginBottom: 4 }}>
            3. Když potřebuješ inspiraci, použij <span style={{ color: C.purple, fontWeight: 600 }}>🔮 Meaning</span> — dostaneš dvě slova, ze kterých si domyslíš co se děje.
          </div>
          <div style={{ color: C.muted }}>
            4. Poznámky si zapisuj přes <span style={{ fontWeight: 600 }}>📝</span>. Každý nástroj má tlačítko <span style={{ color: C.blue, fontWeight: 700, border: `1px solid ${C.border}`, borderRadius: 12, padding: "0 5px", fontSize: 10 }}>?</span> s podrobnou nápovědou.
          </div>
        </div>
      )}
      {entries.map((e, i) => (
        <div key={i}>
          <SwipeableBlock
            isOpen={openSwipeIdx === i}
            onOpen={() => { setOpenSwipeIdx(i); onSwipeSeen?.(); }}
            onClose={() => setOpenSwipeIdx(null)}
            canReroll={canReroll(e)}
            onDelete={() => { setOpenSwipeIdx(null); onDeleteEntry(i); }}
            onReroll={() => { setOpenSwipeIdx(null); onRerollEntry(i); }}
          >
            {renderBlock(e, i, onUpdateEntry)}
          </SwipeableBlock>
          {showSwipeHint && i === 0 && (
            <div style={{ fontSize: 10, color: C.muted, textAlign: "center", padding: "2px 0 6px", fontFamily: FONT }}>
              ← Přejeď blok doleva pro smazání nebo přehození
            </div>
          )}
        </div>
      ))}
      <span style={{ display: "inline-block", width: 2, height: 14, background: C.green, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
    </div>
  );
}
