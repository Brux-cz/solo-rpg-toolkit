import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { checkFate, getEventFocus, rollMeaning, rollDiscoveryCheck, resolveEventTarget } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

const ODDS_LABELS = ["Impossible","Nearly imp.","V.unlikely","Unlikely","50/50","Likely","V.likely","Nearly cert.","Certain"];

const TYPE_COLORS = {
  Progress: C.green,
  Flashpoint: C.red,
  Track: C.yellow,
  Strengthen: C.purple,
};

const MEANING_TABLES = ["actions", "descriptions"];

export default function DiscoveryCheckSheet({ cf, threads, npcs, onThreadsChange, onInsert, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [odds, setOdds] = useState(4);
  const [meaningTable, setMeaningTable] = useState("actions");
  const [fateResult, setFateResult] = useState(null);
  const [discoveryResult, setDiscoveryResult] = useState(null);
  const [eventData, setEventData] = useState(null);

  const doRoll = () => {
    const r = checkFate(odds, cf);
    setFateResult(r);

    // Random Event check (doubles ≤ CF)
    if (r.randomEvent) {
      const focus = getEventFocus();
      const meaning = rollMeaning("actions");
      const target = resolveEventTarget(focus, npcs, threads);
      setEventData({ focus, meaning, target });
    }

    if (r.yes) {
      const thread = threads[selectedIdx];
      const dr = rollDiscoveryCheck(thread.progress || 0, meaningTable);
      setDiscoveryResult(dr);
      setStep(3);
    }
  };

  const doInsertAndClose = () => {
    const thread = threads[selectedIdx];
    const newThreads = threads.map((t, i) =>
      i === selectedIdx ? { ...t, progress: (t.progress || 0) + discoveryResult.points } : t
    );
    onThreadsChange(newThreads);

    const entry = {
      type: "discovery",
      threadName: thread.name,
      fateD100: fateResult.d100,
      fateYes: true,
      fateExceptional: fateResult.exceptional,
      discoveryD10: discoveryResult.d10,
      discoveryTotal: discoveryResult.total,
      discoveryType: discoveryResult.type,
      discoveryPoints: discoveryResult.points,
      discoveryDesc: discoveryResult.description,
      meaning: discoveryResult.meaning,
      meaningTable,
    };
    if (fateResult.randomEvent && eventData) {
      entry.randomEvent = true;
      entry.eventFocus = eventData.focus;
      entry.eventMeaning = eventData.meaning;
      if (eventData.target) {
        entry.eventTargetType = eventData.target.type;
        entry.eventTargetName = eventData.target.item?.name || null;
        entry.eventTargetReroll = eventData.target.reroll || false;
        entry.eventTargetEmpty = eventData.target.empty || false;
      }
    }
    onInsert(entry);
    onClose();
  };

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Discovery Check — jak daleko jsi v příběhu?</div>
      <div style={{ marginBottom: 12 }}>
        Pokročilá mechanika pro sledování příběhových linek. Nejdřív se zeptáš osudu jestli najdeš vodítko, a pak zjistíš jakého typu je.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.green + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: myš hledá v mlýně stopy po zmizelém mlynáři (příběhová linka „Kam zmizel mlynář?").
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>1. Vyber příběhovou linku</div>
      <div style={{ marginBottom: 10 }}>
        Každá linka má progress (0–10). Čím víc bodů, tím blíž k rozuzlení.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>2. Fate otázka</div>
      <div style={{ marginBottom: 4 }}>
        „Je něco objeveno?" — hoď jako normální Fate otázku (odds min. 50/50). Pokud NE, nic nenajdeš.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Odds: Likely, d100=35 → ANO, něco je tu!
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>3. Discovery roll</div>
      <div style={{ marginBottom: 4 }}>
        d10 + aktuální progress = celkový výsledek. Typ nálezu závisí na součtu:
      </div>
      <div style={{ marginBottom: 4, fontSize: 10 }}>
        <span style={{ color: C.purple, fontWeight: 600 }}>Strengthen (0–3)</span> — posílí linku, zatím nejasné
      </div>
      <div style={{ marginBottom: 4, fontSize: 10 }}>
        <span style={{ color: C.yellow, fontWeight: 600 }}>Track (4–7)</span> — jsi na stopě, vodítko
      </div>
      <div style={{ marginBottom: 4, fontSize: 10 }}>
        <span style={{ color: C.green, fontWeight: 600 }}>Progress (8–12)</span> — velký posun vpřed
      </div>
      <div style={{ marginBottom: 10, fontSize: 10 }}>
        <span style={{ color: C.red, fontWeight: 600 }}>Flashpoint (13+)</span> — klíčový moment, průlom!
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        Body se přičtou k lince. Když linka dosáhne 10 bodů, je vyřešená. Meaning tabulka ti dá inspiraci k interpretaci nálezu.
      </div>
    </>
  );

  return (
    <Sheet title="🔍 DISCOVERY CHECK" onClose={onClose} help={helpContent}>
      {step === 1 && (
        <>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>VYBER THREAD:</div>
          {threads.length === 0 ? (
            <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: 20 }}>Žádné thready</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {threads.map((t, i) => (
                <button key={i} onClick={() => setSelectedIdx(i)} style={{
                  padding: "8px 10px", borderRadius: 6, border: `1px solid ${selectedIdx === i ? C.green : C.border}`,
                  background: selectedIdx === i ? C.green + "15" : "transparent", cursor: "pointer",
                  fontFamily: FONT, fontSize: 11, color: C.text, textAlign: "left",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>{t.name}</span>
                  <span style={{ fontSize: 10, color: C.muted }}>{t.progress || 0}/{t.total || 10}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setStep(2)} disabled={selectedIdx === null} style={{
            width: "100%", height: 42, background: selectedIdx !== null ? C.green : C.border,
            color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700,
            fontFamily: FONT, cursor: selectedIdx !== null ? "pointer" : "default", letterSpacing: 1,
          }}>DALŠÍ →</button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: 11, color: C.text, textAlign: "center", marginBottom: 4, fontWeight: 600 }}>
            Thread: {threads[selectedIdx]?.name}
          </div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 10 }}>
            "Je něco objeveno?"
          </div>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>ODDS (min 50/50):</div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
            {ODDS_LABELS.slice(4).map((o, i) => {
              const idx = i + 4;
              return (
                <button key={idx} onClick={() => setOdds(idx)} style={{
                  flexShrink: 0, padding: "5px 10px", borderRadius: 20,
                  border: `1px solid ${idx === odds ? C.green : C.border}`,
                  background: idx === odds ? C.green : "transparent",
                  color: idx === odds ? "white" : C.muted, fontSize: 10, fontFamily: FONT,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>{o}</button>
              );
            })}
          </div>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>MEANING TABLE:</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {MEANING_TABLES.map((t) => (
              <button key={t} onClick={() => setMeaningTable(t)} style={{
                flex: 1, padding: "5px 10px", borderRadius: 20,
                border: `1px solid ${meaningTable === t ? C.purple : C.border}`,
                background: meaningTable === t ? C.purple : "transparent",
                color: meaningTable === t ? "white" : C.muted, fontSize: 10, fontFamily: FONT,
                cursor: "pointer", textTransform: "capitalize",
              }}>{t}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 12 }}>
            CF: <span style={{ color: C.yellow, fontWeight: 700 }}>{cf}</span>
          </div>
          <button onClick={doRoll} disabled={!!fateResult} style={{
            width: "100%", height: 46, background: fateResult ? C.border : C.green, color: "white", border: "none",
            borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: FONT, cursor: fateResult ? "default" : "pointer", letterSpacing: 1,
          }}>🎲  HODIT</button>

          {fateResult && !fateResult.yes && (
            <div style={{ marginTop: 12 }}>
              <div style={{ background: C.red + "20", border: `2px solid ${C.red}`, borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.red, fontFamily: FONT }}>
                  d100={fateResult.d100} → NIC NEOBJEVENO
                </div>
                {fateResult.exceptional && (
                  <div style={{ fontSize: 10, color: C.red, marginTop: 4, fontFamily: FONT }}>
                    ⚠ EXCEPTIONAL NO — žádný další Discovery Check v této scéně!
                  </div>
                )}
              </div>
              {eventData && (
                <div style={{ background: C.yellow + "18", border: `1px solid ${C.yellow}`, borderRadius: 8, padding: "8px 10px", marginBottom: 12, fontFamily: FONT }}>
                  <div style={{ fontSize: 9, color: C.yellow, fontWeight: 700, marginBottom: 4 }}>⚡ RANDOM EVENT</div>
                  <div style={{ fontSize: 11, color: C.text, marginBottom: 2 }}>Focus: <span style={{ fontWeight: 600 }}>{eventData.focus}</span></div>
                  <div style={{ fontSize: 11, color: C.purple }}>Meaning: <span style={{ fontWeight: 600 }}>{eventData.meaning.word1} + {eventData.meaning.word2}</span></div>
                  {eventData.meaning.cz1 && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{eventData.meaning.cz1} + {eventData.meaning.cz2}</div>}
                  {eventData.target && (
                    <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>
                      {eventData.target.type === "npc" ? "NPC" : "Thread"}:{" "}
                      <span style={{ fontWeight: 600 }}>
                        {eventData.target.empty ? "(prázdný seznam → Current Context)"
                          : eventData.target.reroll ? "Vyber sám"
                          : eventData.target.item?.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <button onClick={onClose} style={{
                width: "100%", height: 42, background: C.border, color: C.text, border: "none",
                borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
              }}>ZAVŘÍT</button>
            </div>
          )}
        </>
      )}

      {step === 3 && discoveryResult && (
        <>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8 }}>
            Thread: <span style={{ fontWeight: 600, color: C.text }}>{threads[selectedIdx]?.name}</span>
            {" · "}d100={fateResult.d100} → {fateResult.exceptional ? "EXC. ANO" : "ANO"}
          </div>
          {eventData && (
            <div style={{ background: C.yellow + "18", border: `1px solid ${C.yellow}`, borderRadius: 8, padding: "8px 10px", marginBottom: 10, fontFamily: FONT }}>
              <div style={{ fontSize: 9, color: C.yellow, fontWeight: 700, marginBottom: 4 }}>⚡ RANDOM EVENT</div>
              <div style={{ fontSize: 11, color: C.text, marginBottom: 2 }}>Focus: <span style={{ fontWeight: 600 }}>{eventData.focus}</span></div>
              <div style={{ fontSize: 11, color: C.purple }}>Meaning: <span style={{ fontWeight: 600 }}>{eventData.meaning.word1} + {eventData.meaning.word2}</span></div>
            </div>
          )}
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 8 }}>
            d10=<span style={{ fontWeight: 700, color: C.text }}>{discoveryResult.d10}</span>
            {" + progress "}
            <span style={{ fontWeight: 700, color: C.text }}>{threads[selectedIdx]?.progress || 0}</span>
            {" = "}
            <span style={{ fontWeight: 700, color: C.text }}>{discoveryResult.total}</span>
          </div>
          <div style={{
            background: (TYPE_COLORS[discoveryResult.type] || C.green) + "20",
            border: `2px solid ${TYPE_COLORS[discoveryResult.type] || C.green}`,
            borderRadius: 8, padding: "12px 0", textAlign: "center", marginBottom: 10,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: TYPE_COLORS[discoveryResult.type] || C.green, letterSpacing: 3, fontFamily: FONT, textTransform: "uppercase" }}>
              {discoveryResult.type}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 4 }}>
              +{discoveryResult.points} {discoveryResult.points === 1 ? "bod" : discoveryResult.points < 5 ? "body" : "bodů"}
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 4 }}>
            {discoveryResult.description}
          </div>
          <div style={{ fontSize: 11, color: C.purple, textAlign: "center", marginBottom: 4 }}>
            {discoveryResult.meaning.word1} + {discoveryResult.meaning.word2}
          </div>
          {discoveryResult.meaning.cz1 && <div style={{ fontSize: 9, color: C.muted, textAlign: "center", marginBottom: 12 }}>{discoveryResult.meaning.cz1} + {discoveryResult.meaning.cz2}</div>}
          <button onClick={doInsertAndClose} style={{
            width: "100%", height: 46, background: C.green, color: "white", border: "none",
            borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
          }}>VLOŽIT + PŘIDAT BODY</button>
        </>
      )}
    </Sheet>
  );
}
