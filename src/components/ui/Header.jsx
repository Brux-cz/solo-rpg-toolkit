import { useState } from "react";
import { C, FONT } from "../../constants/theme.js";

function getZkMax(uroven) {
  if (uroven <= 1) return 0;
  if (uroven === 2) return 1000;
  if (uroven === 3) return 3000;
  if (uroven === 4) return 6000;
  return 6000 + (uroven - 4) * 5000;
}

const HELP = {
  diary: (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Deník — srdce tvého příběhu</div>
      <div style={{ marginBottom: 10 }}>
        Tady se zapisuje všechno co se ve hře stane. Každý záznam je blok — scéna, otázka, hod, poznámka. Čteš to jako příběh odshora dolů.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Toolbar dole — tvé nástroje</div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.blue, fontWeight: 600 }}>🎬 Scéna</span> — začni novou část příběhu. Co tvá postava dělá? Kam jde?
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.green, fontWeight: 600 }}>❓ Fate</span> — polož otázku osudu (Ano/Ne). Nejdůležitější nástroj — používej ho často.
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.purple, fontWeight: 600 }}>🔮</span> — Meaning Tables. Inspirační slova, když nevíš co se děje.
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.yellow, fontWeight: 600 }}>🔍</span> — Detail Check. Jak něco vypadá? Co je v místnosti?
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.red, fontWeight: 600 }}>⚔️</span> — Boj. Vyber nepřítele a nech appku simulovat souboj.
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>📝</span> — Poznámka. Zapiš volný text do deníku.
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>🎲</span> — Hod kostkou. Prostý hod d4 až d100.
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>💤</span> — Odpočinek. Léčení a obnova zdrojů.
      </div>
      <div style={{ marginBottom: 4 }}>
        V menu <span style={{ fontWeight: 600 }}>⋯</span> najdeš ještě: Konec scény (uzavření a vyhodnocení), Discovery Check (posun příběhové linky) a NPC Akce (co dělá nehráčská postava).
      </div>
      <div style={{ marginTop: 8, fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Typický postup</div>
      <div>
        Scéna → piš co se děje → ptej se Fate na otázky → používej Meaning pro inspiraci → když je scéna u konce, klikni ⋯ → Konec scény → nová Scéna. Opakuj!
      </div>
    </>
  ),
  char: (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Postava — tvá myš</div>
      <div style={{ marginBottom: 10 }}>
        Tady vidíš a upravuješ svou postavu. Klikni na hodnoty a edituj je přímo.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Staty</div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.green, fontWeight: 600 }}>STR</span> (Síla) — fyzická odolnost. Když klesne na 0, postava je kriticky zraněná.
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.green, fontWeight: 600 }}>DEX</span> (Obratnost) — rychlost a reflexy. Rozhoduje o iniciativě v boji.
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: C.green, fontWeight: 600 }}>WIL</span> (Vůle) — odvaha a odhodlání. Používá se pro morálku a sociální situace.
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: C.red, fontWeight: 600 }}>BO</span> (Body ochrany) — dočasný štít. V boji se ztrácí první. Obnovuje se odpočinkem.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Inventář</div>
      <div style={{ marginBottom: 8 }}>
        Tvá myš má omezený prostor: Packy (2 sloty, pro boj), Tělo (4 sloty, zbroj a oblečení) a Batoh (6 slotů, zásoby). Klikni na slot pro přidání nebo úpravu předmětu. Některé předměty zabírají víc slotů.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Pomocník</div>
      <div>
        Najatá postava (hireling), která cestuje s tebou. Má vlastní staty, inventář a věrnost. Platíš jí mzdu — když nezaplatíš, může odejít.
      </div>
    </>
  ),
  world: (
    <>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: C.text }}>Svět — sledování kampaně</div>
      <div style={{ marginBottom: 10 }}>
        Tady spravuješ herní svět — postavy, příběhové linky a chaos. Tyto seznamy ovlivňují hru — když se při hodu stane náhodná událost, osud vybírá z tvých NPC a příběhových linek.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.yellow }}>Chaos Faktor (CF)</div>
      <div style={{ marginBottom: 8 }}>
        Číslo 1–9 ukazující nepředvídatelnost příběhu. Vyšší = divočejší. Mění se na konci scény: měla postava kontrolu? → CF klesá. Ztratila kontrolu? → CF stoupá.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>NPC Seznam</div>
      <div style={{ marginBottom: 8 }}>
        Postavy, které jsou aktivní v příběhu. Přidávej je jak se objevují. Váha (1–3×) určuje jak moc je postava „přítomná" — při náhodných událostech se častěji vyskytnou NPC s vyšší váhou. Kliknutím na jméno otevřeš wiki kartu pro detailní poznámky.
      </div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: C.text }}>Příběhové linky (Thready)</div>
      <div>
        Otevřené otázky, úkoly, hrozby v příběhu. Třeba „Najít ztracený meč", „Uniknout z lesa", „Zastavit epidemii". Ukazatel postupu ukazuje jak blízko je linka k vyřešení.
      </div>
    </>
  ),
};

export default function Header({ onToggle, expanded, cf, sceneNum, character, tab }) {
  const [showHelp, setShowHelp] = useState(false);
  const ch = character;
  return (
    <>
      <div style={{ padding: "9px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, fontFamily: FONT }}>
        <div onClick={onToggle} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, cursor: "pointer" }}>
          <span>
            <span style={{ color: C.blue, fontWeight: 700 }}>Scéna {sceneNum}</span>
            <span style={{ color: C.border }}> · </span>
            <span style={{ color: C.text }}>CF <span style={{ color: C.yellow, fontWeight: 700 }}>{cf}</span></span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.muted }}>
              Den 2 · ráno{expanded && <span> · <span style={{ color: C.blue }}>Zataženo</span></span>}
            </span>
            <button onClick={(e) => { e.stopPropagation(); setShowHelp(v => !v); }} style={{ position: "relative", zIndex: showHelp ? 21 : "auto", background: showHelp ? C.blue + "18" : "none", border: `1px solid ${showHelp ? C.blue : C.border}`, borderRadius: 12, fontSize: 10, color: showHelp ? C.blue : C.muted, cursor: "pointer", padding: "1px 8px", fontFamily: FONT, fontWeight: 700, lineHeight: "16px" }}>?</button>
          </span>
        </div>
        {expanded && (
          <div onClick={onToggle} style={{ marginTop: 6, fontSize: 11, color: C.muted, display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}>
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
      {showHelp && (
        <div onClick={() => setShowHelp(false)} style={{ position: "fixed", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", justifyContent: "center", padding: 12 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxHeight: "70%", overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "14px 16px", background: C.bg, borderRadius: 10, fontFamily: FONT, fontSize: 11, lineHeight: 1.7, color: C.text, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
            {HELP[tab] || HELP.diary}
          </div>
        </div>
      )}
    </>
  );
}
