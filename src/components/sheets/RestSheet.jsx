import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";
import { roll } from "../../utils/dice.js";
import Sheet from "../ui/Sheet.jsx";

// Spotřeba jídla z inventáře entity
function consumeFood(inventar) {
  const inv = [...(inventar || [])];
  for (let i = 0; i < inv.length; i++) {
    if (inv[i].typ === "zásoby" && inv[i].tecky?.akt > 0) {
      inv[i] = { ...inv[i], tecky: { ...inv[i].tecky, akt: inv[i].tecky.akt - 1 } };
      return { newInventar: inv, consumed: true, line: `Zásoby: −1 tečka (zbývá ${inv[i].tecky.akt}/${inv[i].tecky.max})` };
    }
  }
  return { newInventar: inv, consumed: false, line: "⚠ Žádné zásoby k spotřebování!" };
}

// Odebrání stavů z inventáře
function removeConditions(inventar) {
  const inv = [...(inventar || [])];
  const removed = [];
  for (let i = 0; i < inv.length; i++) {
    if (inv[i].typ === "stav") {
      removed.push(inv[i].nazev || "Stav");
      inv[i] = { nazev: "", typ: "", tecky: { akt: 0, max: 0 } };
    } else if (inv[i]._occupied && inv[i]._owner != null) {
      // Check if owner is a stav
      const owner = inv[inv[i]._owner];
      if (owner && owner.typ === "stav") {
        inv[i] = { nazev: "", typ: "", tecky: { akt: 0, max: 0 } };
      }
    }
  }
  return { newInventar: inv, removed };
}

export default function RestSheet({ onClose, character, onCharUpdate, onInsert }) {
  const [phase, setPhase] = useState("choose"); // choose | healPick-N | result
  const [resultText, setResultText] = useState(null);
  const [healQueue, setHealQueue] = useState([]);
  const [healQueueIdx, setHealQueueIdx] = useState(0);
  const [pendingLog, setPendingLog] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState({});

  const ch = character;
  const pomocnici = ch.pomocnici || [];

  const doShortRest = () => {
    const lines = [];
    const updated = { ...ch };

    // Postava
    const healed = roll(6) + 1;
    const noveBo = Math.min(ch.bo.max, ch.bo.akt + healed);
    const actual = noveBo - ch.bo.akt;
    updated.bo = { ...ch.bo, akt: noveBo };
    lines.push(`${ch.jmeno || "Postava"}: d6+1=${healed} → BO ${ch.bo.akt}→${noveBo} (+${actual})`);

    // Pomocníci
    const updatedPom = pomocnici.map(p => {
      const h = roll(6) + 1;
      const nBo = Math.min(p.bo.max, p.bo.akt + h);
      const a = nBo - p.bo.akt;
      lines.push(`${p.jmeno || "Pomocník"}: d6+1=${h} → BO ${p.bo.akt}→${nBo} (+${a})`);
      return { ...p, bo: { ...p.bo, akt: nBo } };
    });
    if (updatedPom.length > 0) updated.pomocnici = updatedPom;

    onCharUpdate(updated);
    const text = "Krátký odpočinek:\n" + lines.join("\n");
    setResultText(text);
    setPhase("result");
    onInsert({ type: "text", text: `💤 ${text}` });
  };

  const buildHealQueue = (updatedChar, updatedPom) => {
    const queue = [];
    // Postava
    if (updatedChar.bo.akt >= updatedChar.bo.max && ["str", "dex", "wil"].some(k => updatedChar[k].akt < updatedChar[k].max)) {
      queue.push({ type: "char", jmeno: updatedChar.jmeno || "Postava" });
    }
    // Pomocníci
    updatedPom.forEach((p, idx) => {
      if (p.bo.akt >= p.bo.max && ["str", "dex", "wil"].some(k => p[k].akt < p[k].max)) {
        queue.push({ type: "pom", idx, jmeno: p.jmeno || "Pomocník" });
      }
    });
    return queue;
  };

  const handleLongRest = () => {
    const lines = ["Dlouhý odpočinek (6 hod, 1 zásoby):"];
    const updated = { ...ch };
    const updatedPom = pomocnici.map(p => ({ ...p }));

    // BO na max — postava
    updated.bo = { ...updated.bo, akt: updated.bo.max };
    lines.push(`${ch.jmeno || "Postava"}: BO → ${updated.bo.max}`);

    // BO na max — pomocníci
    updatedPom.forEach((p, i) => {
      updatedPom[i] = { ...p, bo: { ...p.bo, akt: p.bo.max } };
      lines.push(`${p.jmeno || "Pomocník"}: BO → ${p.bo.max}`);
    });

    // Jídlo — postava
    const charFood = consumeFood(updated.inventar);
    updated.inventar = charFood.newInventar;
    lines.push(`${ch.jmeno || "Postava"}: ${charFood.line}`);

    // Jídlo — pomocníci
    updatedPom.forEach((p, i) => {
      const pFood = consumeFood(p.inventar);
      updatedPom[i] = { ...p, inventar: pFood.newInventar };
      lines.push(`${p.jmeno || "Pomocník"}: ${pFood.line}`);
    });

    // Heal queue
    const queue = buildHealQueue(updated, updatedPom);
    if (queue.length > 0) {
      setPendingLog(lines);
      setPendingUpdates({ char: updated, pom: updatedPom });
      setHealQueue(queue);
      setHealQueueIdx(0);
      setPhase("healPick-0");
    } else {
      if (updatedPom.length > 0) updated.pomocnici = updatedPom;
      onCharUpdate(updated);
      const text = lines.join("\n");
      setResultText(text);
      setPhase("result");
      onInsert({ type: "text", text: `💤 ${text}` });
    }
  };

  const handleHealPick = (stat) => {
    const entry = healQueue[healQueueIdx];
    const lines = [...pendingLog];
    const upd = { ...pendingUpdates };

    if (stat) {
      const healed = roll(6);
      if (entry.type === "char") {
        const s = upd.char[stat];
        const noveAkt = Math.min(s.max, s.akt + healed);
        const actual = noveAkt - s.akt;
        upd.char = { ...upd.char, [stat]: { ...s, akt: noveAkt } };
        lines.push(`${entry.jmeno}: ${stat.toUpperCase()} d6=${healed} → ${s.akt}→${noveAkt} (+${actual})`);
      } else {
        const p = upd.pom[entry.idx];
        const s = p[stat];
        const noveAkt = Math.min(s.max, s.akt + healed);
        const actual = noveAkt - s.akt;
        upd.pom = upd.pom.map((pp, i) => i === entry.idx ? { ...pp, [stat]: { ...s, akt: noveAkt } } : pp);
        lines.push(`${entry.jmeno}: ${stat.toUpperCase()} d6=${healed} → ${s.akt}→${noveAkt} (+${actual})`);
      }
    } else {
      lines.push(`${entry.jmeno}: přeskočeno`);
    }

    const nextIdx = healQueueIdx + 1;
    if (nextIdx < healQueue.length) {
      setPendingLog(lines);
      setPendingUpdates(upd);
      setHealQueueIdx(nextIdx);
      setPhase(`healPick-${nextIdx}`);
    } else {
      // Finalize
      const final = { ...upd.char };
      if (upd.pom.length > 0) final.pomocnici = upd.pom;
      onCharUpdate(final);
      const text = lines.join("\n");
      setResultText(text);
      setPhase("result");
      onInsert({ type: "text", text: `💤 ${text}` });
    }
  };

  const doFullRest = () => {
    const updated = { ...ch };
    const lines = ["Úplný odpočinek (týden v bezpečí):"];

    // Staty na max — postava
    updated.bo = { ...updated.bo, akt: updated.bo.max };
    updated.str = { ...updated.str, akt: updated.str.max };
    updated.dex = { ...updated.dex, akt: updated.dex.max };
    updated.wil = { ...updated.wil, akt: updated.wil.max };
    lines.push(`${ch.jmeno || "Postava"}: vše obnoveno na maximum`);

    // Odebrat stavy — postava
    const charCond = removeConditions(updated.inventar);
    updated.inventar = charCond.newInventar;
    if (charCond.removed.length > 0) {
      lines.push(`${ch.jmeno || "Postava"}: odstraněny stavy: ${charCond.removed.join(", ")}`);
    }

    // Pomocníci
    const updatedPom = pomocnici.map(p => {
      const np = { ...p };
      np.bo = { ...p.bo, akt: p.bo.max };
      np.str = { ...p.str, akt: p.str.max };
      np.dex = { ...p.dex, akt: p.dex.max };
      np.wil = { ...p.wil, akt: p.wil.max };
      lines.push(`${p.jmeno || "Pomocník"}: vše obnoveno na maximum`);

      const pomCond = removeConditions(np.inventar);
      np.inventar = pomCond.newInventar;
      if (pomCond.removed.length > 0) {
        lines.push(`${p.jmeno || "Pomocník"}: odstraněny stavy: ${pomCond.removed.join(", ")}`);
      }
      return np;
    });
    if (updatedPom.length > 0) updated.pomocnici = updatedPom;

    onCharUpdate(updated);
    const text = lines.join("\n");
    setResultText(text);
    setPhase("result");
    onInsert({ type: "text", text: `💤 ${text}` });
  };

  const btnStyle = (color) => ({
    width: "100%", padding: "10px 0", background: color, color: "white",
    border: "none", borderRadius: 6, fontSize: 12, fontFamily: FONT,
    fontWeight: 700, cursor: "pointer", marginBottom: 8,
  });

  const descStyle = { fontSize: 10, color: C.muted, marginBottom: 8, lineHeight: 1.4 };

  const isHealPick = phase.startsWith("healPick-");

  // Get current entity for heal pick
  const currentHealEntry = isHealPick ? healQueue[healQueueIdx] : null;
  const currentEntity = currentHealEntry
    ? (currentHealEntry.type === "char" ? pendingUpdates.char : pendingUpdates.pom[currentHealEntry.idx])
    : null;

  const helpContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Odpočinek — léčení a obnova</div>
      <div style={{ marginBottom: 12 }}>
        Tři druhy odpočinku s různou délkou a účinkem. Automaticky se spotřebuje jídlo a vyléčí zranění.
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, padding: "6px 8px", background: C.green + "12", borderRadius: 6, fontStyle: "italic" }}>
        Představ si: po boji s krysou v mlýně si myš potřebuje odpočinout a ošetřit rány.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.green }}>1. Krátký odpočinek</div>
      <div style={{ marginBottom: 4 }}>
        Pár minut a voda. Obnoví d6+1 Body odolnosti (BO). Nic jiného neléčí.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Myš si sedne, napije se → BO 0→4. Vlastnosti zůstávají poraněné.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.blue }}>2. Dlouhý odpočinek</div>
      <div style={{ marginBottom: 4 }}>
        6 hodin spánku + jídlo. BO se obnoví na maximum. Pokud je BO plné, vyber jednu vlastnost (STR/DEX/WIL) k léčení d6.
      </div>
      <div style={{ marginBottom: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
        Myš přenocuje v mlýně → BO na max, STR 5→8 (d6=3). Spotřebuje 1 zásoby z inventáře.
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.purple }}>3. Úplný odpočinek</div>
      <div style={{ marginBottom: 10 }}>
        Týden v bezpečí (osada, úkryt). Vše se obnoví na maximum, odstraní se stavy (poranění, otrávení...).
      </div>

      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Co dál?</div>
      <div>
        Jídlo se spotřebovává automaticky z inventáře. Bez jídla nemůžeš dlouze odpočívat. Pomocníci odpočívají společně s tebou.
      </div>
    </>
  );

  return (
    <Sheet title="Odpočinek" onClose={onClose} help={helpContent}>
      <div style={{ padding: "0 16px 16px" }}>
        {phase === "choose" && (
          <>
            <div style={descStyle}>
              Krátký (10 min, voda): obnoví d6+1 BO{pomocnici.length > 0 ? " pro všechny" : ""}
            </div>
            <button onClick={doShortRest} style={btnStyle(C.green)}>💤 Krátký odpočinek</button>

            <div style={descStyle}>
              Dlouhý (6 hod, jídlo + spánek): obnoví BO{pomocnici.length > 0 ? " všem" : ""}. Pokud BO plné → léčí d6 vlastnosti.
            </div>
            <button onClick={handleLongRest} style={btnStyle(C.blue)}>🛏️ Dlouhý odpočinek</button>

            <div style={descStyle}>
              Úplný (týden v bezpečí): obnoví vše na maximum{pomocnici.length > 0 ? " všem" : ""}, odstraní stavy.
            </div>
            <button onClick={doFullRest} style={btnStyle(C.purple)}>🏠 Úplný odpočinek</button>
          </>
        )}

        {isHealPick && currentEntity && (
          <>
            <div style={{ fontSize: 11, color: C.text, marginBottom: 10, fontWeight: 700 }}>
              {currentHealEntry.jmeno}: BO plné — vyber vlastnost k léčení (d6):
            </div>
            {["str", "dex", "wil"].map(key => {
              const s = currentEntity[key];
              const damaged = s.akt < s.max;
              return (
                <button key={key} onClick={() => handleHealPick(key)} disabled={!damaged} style={{
                  ...btnStyle(damaged ? C.green : C.border),
                  color: damaged ? "white" : C.muted,
                  cursor: damaged ? "pointer" : "default",
                }}>
                  {key.toUpperCase()} ({s.akt}/{s.max})
                </button>
              );
            })}
            <button onClick={() => handleHealPick(null)} style={btnStyle(C.muted)}>Přeskočit</button>
          </>
        )}

        {phase === "result" && (
          <>
            <div style={{ padding: "10px", background: "#f0f0ee", borderRadius: 6, fontSize: 11, fontFamily: FONT, color: C.text, whiteSpace: "pre-line", lineHeight: 1.5, marginBottom: 10 }}>
              {resultText}
            </div>
            <button onClick={onClose} style={btnStyle(C.muted)}>ZAVŘÍT</button>
          </>
        )}
      </div>
    </Sheet>
  );
}
