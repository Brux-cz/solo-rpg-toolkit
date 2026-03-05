import { useState, useRef, useEffect } from "react";

var FONT = "monospace";
var W = 220, H = 460, P = 10, IW = 200;

var DESC = {};
DESC._intro = { title: "BOTTOM SHEETS v kontextu F editoru", text: "Jak funguje vkladani mechanik do Notion-style editoru.\n\nFLOW:\n1. Pises pribeh v editoru\n2. Tapnes tlacitko v toolbaru (napr. Fate Q)\n3. Klavesnice ZMIZI, bottom sheet se VYSUNE zespodu\n4. Vyplnis sheet (otazka, odds...)\n5. Tapnes HODIT / POTVRDIT\n6. Vysledek se VLOZI jako inline blok na pozici kurzoru\n7. Sheet se zavre, klavesnice se VRATI\n8. Pokracujes v psani\n\nDulezite: sheet NAHRADI klavesnici (ne otevira se nad ni).\nVyska sheetu = priblizne vyska klavesnice.\nHorni cast obrazovky = stale vidis text editoru.\n\nKlikni na kazdy telefon pro detail." };
DESC.flow1 = { title: "KROK 1: Pises v editoru", text: "Standardni stav — klavesnice otevrena, pises pribeh.\n\nVidis:\n- 3-4 radky textu nad kurzorem\n- Mini toolbar nad klavesnici (vlozit blok)\n- Klavesnici\n\nHeader a bottom nav jsou SCHOVANE (maximalni prostor pro psani).\n\nTeraz chces zjistit jestli je tu straz. Tapnes ikonu Fate Q v toolbaru..." };
DESC.flow2 = { title: "KROK 2: Fate Q sheet (vstup)", text: "Klavesnice ZMIZELA. Na jejim miste se vysunul Fate Q bottom sheet.\n\nSheet obsahuje:\n- OTAZKA: textove pole kde napises 'Je tu straz?'\n- ODDS: horizontalni vyber (Impossible...Certain), vychozi = 50/50\n- Aktualni CF zobrazene (pripominka)\n- Tlacitko HODIT (velke, vyrazne)\n\nHorni cast obrazovky stale ukazuje editor s textem — vidis kontext co pises.\n\nVyska sheetu ~45% = stejna jako klavesnice.\nPrechod je plynuly — sheet se vysune animaci." };
DESC.flow3 = { title: "KROK 3: Fate Q vysledek", text: "Po tapnuti HODIT se sheet ZMENI na vysledkovy stav.\n\nSheet ted ukazuje:\n- Otazka (seda, mala)\n- Odds + hod d100\n- VELKY VYSLEDEK: ANO / NE (barevne)\n- Pripadne: EXCEPTIONAL + Random Event\n- Tlacitko VLOZIT DO TEXTU\n\nAnimace: vysledek se objevi s lehkym efektem.\n\nDulezite: v teto fazi JESTE NENI vlozeno do textu! Hrac si precte vysledek, zpracuje ho v hlave, a az pak tapne VLOZIT.\n\nPokud je Random Event, zobrazi se pod vysledkem s moznosti rovnou hodit Meaning." };
DESC.flow4 = { title: "KROK 4: Zpet v editoru", text: "Po tapnuti VLOZIT:\n- Sheet se zavre (animace dolu)\n- Inline blok se objevi v textu na pozici kurzoru\n- Kurzor se presune ZA blok\n- Klavesnice se VRATI\n- Hrac pokracuje v psani\n\nInline blok vypada:\n[❓ Je tu straz? · Likely → ANO]\n\nMaly, kompaktni, nerussi tok textu.\nHrac za nim napise: 'Straz tu je — tlustej krysak...'" };
DESC.fate = { title: "FATE Q — detail sheetu", text: "Nejpouzivanejsi sheet. Musi byt RYCHLY.\n\nVSTUPNI STAV:\n- Textove pole pro otazku (autofocus, klavesnice sheetu)\n- Odds: horizontalni scroll/vyber (10 urovni)\n  [Impossible][No way][Very unlikely][Unlikely]\n  [50/50][Likely][Very likely][Near sure]\n  [A sure thing][Has to be]\n- CF: zobrazeny jako reminder (CF 5)\n- Tlacitko HODIT\n\nVYSLEDKOVY STAV:\n- Otazka (mala)\n- 'Likely · CF 5 · d100=34'\n- ANO (velke, zelene) nebo NE (velke, cervene)\n- Exceptional? Ano/Ne\n- Random Event? trigger (doubles <= CF) + Event Focus + Meaning\n- [VLOZIT DO TEXTU]\n\nOPTIMIZACE:\n- Odds si pamatuje posledni volbu\n- Otazka muze byt prazdna (rychly hod)\n- Swipe dolu = zrusit bez vlozeni" };
DESC.scene = { title: "NOVA SCENA — detail sheetu", text: "Otevre se kdyz hrac tapne ikonu Scene.\n\nKROK 1 — OCEKAVANI:\n- 'Co ocekava postava?' (textove pole)\n- Napr: 'Ada projde jeskyni bez problemu'\n- Tlacitko TESTOVAT CHAOS\n\nKROK 2 — CHAOS TEST (automaticky):\n- Hodi d10 vs CF\n- 3 mozne vysledky:\n  a) d10 > CF → NORMALNI SCENA\n     Ocekavani se splnilo. Vlozi se blok:\n     [SCENA 5: Ada projde jeskyni]\n  b) d10 <= CF, liche → POZMENENA\n     Hodi se Scene Adjustment Table (d10):\n     1=odeber postavu, 2=pridej, 3=sniz/odeber aktivitu,\n     4=zvys, 5=odeber predmet, 6=pridej, 7-10=DVE upravy\n     Hrac interpretuje jak se scena zmenila\n  c) d10 <= CF, sude → PRERUSENA\n     Hodi se Event Focus (d100) → urcuje typ udalosti\n     Pak Meaning Tables → 2 slova pro interpretaci\n     Uplne jina scena nez ocekavana\n\nKROK 3 — VLOZENI:\n- Blok sceny se vlozi do textu\n- Automaticky prida nadpis sekce\n- Editor scrollne na novou sekci" };
DESC.meaning = { title: "MEANING — detail sheetu", text: "Jednoduchy sheet. Hodi 2 slova z tabulky.\n\nVYBER TYPU:\n- [ACTIONS] — co postava dela (slovesa)\n- [DESCRIPTIONS] — jak to vypada/jaka nalada (pridavna jmena)\n- [ELEMENTS] — 45 tematickych tabulek (les, mesto, dungeon...)\n\nPo tapnuti:\n- Automaticky hodi 2x d100\n- Zobrazi 2 slova z vybrane tabulky\n- Napr: 'Abandon + Danger'\n\nVYSLEDEK:\n- 2 slova velka, vyrazna\n- Pod nimi: 'Interpretuj v kontextu sceny'\n- [VLOZIT DO TEXTU]\n\nInline blok: [🔮 Abandon + Danger]\n\nNejrychlejsi sheet — 1 tap typ, okamzity vysledek, 1 tap vlozit.\n\nMuze se taky vyvolat automaticky z:\n- Fate Q (pri Random Event → Event Focus + Meaning)\n- Scene (pri interrupted → Event Focus + Meaning)\n- Scene (pri altered → jako inspirace k Scene Adjustment)" };
DESC.endscene = { title: "KONEC SCENY — detail sheetu", text: "Komplexnejsi sheet. Vice kroku.\n\nKROK 1 — CF UPRAVA:\n- 'Mela postava kontrolu nad scenou?'\n- [ANO → CF-1] [NE → CF+1]\n- Zobrazeni: CF 5 → CF 4 (nebo 6)\n\nKROK 2 — THREADY:\n- Seznam aktivnich threadu\n- U kazdeho: [+progress] [resolve] [remove]\n- Moznost pridat novy thread\n- Progress bar u kazdeho\n\nKROK 3 — NPC:\n- Seznam NPC z teto sceny\n- Oznacit kdo se objevil\n- Pridat noveho NPC\n\nKROK 4 — DISCOVERY CHECK (pokud aktivni):\n- Automaticky test: 'Odkryjes neco noveho?'\n- Min 50/50 odds\n\nPO POTVRZENI:\n- Vlozi se separator blok:\n  [--- KONEC SCENY 4 · CF 5→4 ---]\n- Pripravi se na novou scenu" };
DESC.combat = { title: "BOJ — detail sheetu", text: "Sheet pro souboj. Nejkomplexnejsi.\n\nKROK 1 — NEPRIJATEL:\n- Vyber z databaze (33 oficalnich tvoru)\n- Nebo rucni zadani: jmeno, STR, BO, zbran\n- Zobrazi staty nepritele\n\nKROK 2 — INICIATIVA:\n- DEX test: hrac vs neprijatel\n- Kdo zacina\n\nKROK 3 — KOLA BOJE:\n- Utok hrace: hod damage → odecti od STR nepritele\n- Utok nepritele: hod damage → odecti od BO/STR hrace\n- Morale check pri kritickem zasahu\n- Opakovani dokud nekdo nema STR 0\n\nKROK 4 — VYSLEDEK:\n- Kdo vyhral\n- Zbyva HP\n- Kořist?\n\nVLOZENI:\n[⚔️ Boj: Pavouk (STR 3) → mrtvy, Ada -2 HP]\n\nPozn: boj muze byt take AUTOMATICKY (jeden hod)\nnebo DETAILNI (kolo po kole). Hrac si vybere." };

function drawText(x, y, txt, size, color, weight) {
  return <text key={"t"+x+y+txt.substring(0,5)} x={x} y={y} style={{ fontSize: size || 6, fontFamily: FONT, fill: color || "#444", fontWeight: weight || 400 }}>{txt}</text>;
}

function drawBtn(x, y, w, h, icon, label, fillColor) {
  return (
    <g key={"btn"+x+y}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fillColor || "none"} stroke={fillColor || "#ccc"} strokeWidth={0.8} />
      <text x={x + w/2} y={y + h/2 + (label ? -2 : 3)} textAnchor="middle" style={{ fontSize: label ? 9 : 10 }}>{icon}</text>
      {label ? <text x={x + w/2} y={y + h/2 + 7} textAnchor="middle" style={{ fontSize: 5, fontFamily: FONT, fill: fillColor ? "#fff" : "#999" }}>{label}</text> : null}
    </g>
  );
}

function drawInlineBlock(x, y, w, color, txt) {
  return (
    <g key={"ib"+y}>
      <rect x={x} y={y} width={w} height={14} rx={3} fill={color + "15"} stroke={color} strokeWidth={0.7} />
      <rect x={x} y={y} width={2} height={14} rx={1} fill={color} />
      <text x={x+6} y={y+10} style={{ fontSize: 5.5, fontFamily: FONT, fill: color }}>{txt}</text>
    </g>
  );
}

function drawEditorTop(px, py, cY, IW, lines, inlineBlock) {
  var lx = px + 16;
  var lh = 8.5;
  var els = [];
  els.push(<rect key="bg" x={px+10} y={cY} width={IW} height={160} rx={4} fill="#fff" stroke="#ddd" strokeWidth={0.8} />);
  var curY = cY + 10;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].type === "text") {
      els.push(drawText(lx, curY, lines[i].t, 6, "#444"));
      curY += lh;
    } else if (lines[i].type === "inline") {
      els.push(drawInlineBlock(lx - 2, curY - 4, IW - 16, lines[i].color, lines[i].t));
      curY += 14;
    } else if (lines[i].type === "cursor") {
      els.push(<rect key="cur" x={lx + (lines[i].offset || 0)} y={curY - 6} width={1} height={7} fill="#333" />);
    }
  }
  return <g>{els}</g>;
}

function drawPhone(px, py, id, title, subtitle, sel, onSel, content) {
  var active = sel === id;
  return (
    <g key={id} onClick={function(e) { e.stopPropagation(); onSel(id); }} style={{ cursor: "pointer" }}>
      <text x={px + W/2} y={py - 20} textAnchor="middle" style={{ fontSize: 9, fontFamily: FONT, fill: active ? "#222" : "#888", fontWeight: 700 }}>{title}</text>
      {subtitle ? <text x={px + W/2} y={py - 8} textAnchor="middle" style={{ fontSize: 6, fontFamily: FONT, fill: "#b05020" }}>{subtitle}</text> : null}
      <rect x={px} y={py} width={W} height={H} rx={20} fill="#fff" stroke={active ? "#b05020" : "#bbb"} strokeWidth={active ? 2.5 : 1.5} />
      <rect x={px + W/2 - 30} y={py + 2} width={60} height={12} rx={6} fill="#e8e5dd" />
      <g transform={"translate(" + px + "," + py + ")"}>{content}</g>
      <rect x={px + W/2 - 25} y={py + H - 8} width={50} height={3} rx={2} fill="#ddd" />
    </g>
  );
}

function drawBottomSheet(px, py, sheetH, title, sheetContent) {
  var sheetY = py + H - sheetH - 8;
  return (
    <g>
      {/* Dimmed overlay */}
      <rect x={px + 3} y={py + 16} width={W - 6} height={sheetY - py - 18} rx={0} fill="rgba(0,0,0,0.08)" />
      {/* Sheet */}
      <rect x={px + 3} y={sheetY} width={W - 6} height={sheetH} rx={12} fill="#fff" stroke="#ddd" strokeWidth={1} />
      {/* Handle */}
      <rect x={px + W/2 - 15} y={sheetY + 6} width={30} height={3} rx={2} fill="#ccc" />
      {/* Title */}
      <text x={px + W/2} y={sheetY + 22} textAnchor="middle" style={{ fontSize: 8, fontFamily: FONT, fill: "#333", fontWeight: 700 }}>{title}</text>
      {/* Content */}
      <g transform={"translate(" + (px + P) + "," + (sheetY + 30) + ")"}>{sheetContent}</g>
    </g>
  );
}

export default function App() {
  var panState = useState({ x: 20, y: 40 });
  var pan = panState[0]; var setPan = panState[1];
  var zoomState = useState(0.65);
  var zoom = zoomState[0]; var setZoom = zoomState[1];
  var dragState = useState(false);
  var dragging = dragState[0]; var setDragging = dragState[1];
  var selState = useState("_intro");
  var selected = selState[0]; var setSelected = selState[1];
  var moveState = useState(false);
  var didMove = moveState[0]; var setDidMove = moveState[1];
  var dragStart = useRef({ x: 0, y: 0 });
  var panRef = useRef(pan);
  var pinchRef = useRef(null);
  var cRef = useRef(null);

  useEffect(function() { panRef.current = pan; }, [pan]);
  useEffect(function() {
    var el = cRef.current; if (!el) return;
    var h = function(e) { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(function(z) { return Math.min(Math.max(z * (e.deltaY > 0 ? 0.92 : 1.08), 0.25), 3); }); } };
    el.addEventListener("wheel", h, { passive: false });
    return function() { el.removeEventListener("wheel", h); };
  }, []);
  useEffect(function() {
    var el = cRef.current; if (!el) return;
    var p = function(e) { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    el.addEventListener("touchmove", p, { passive: false });
    return function() { el.removeEventListener("touchmove", p); };
  }, []);

  function getTD(a, b) { return Math.sqrt(Math.pow(a.clientX - b.clientX, 2) + Math.pow(a.clientY - b.clientY, 2)); }
  function onMD(e) { if (e.button === 0) { setDragging(true); setDidMove(false); dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; } }
  function onMM(e) { if (dragging) { setDidMove(true); setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }); } }
  function onMU() { setDragging(false); }
  function onTS(e) {
    setDidMove(false);
    if (e.touches.length === 1) { setDragging(true); dragStart.current = { x: e.touches[0].clientX - panRef.current.x, y: e.touches[0].clientY - panRef.current.y }; }
    else if (e.touches.length === 2) { setDragging(false); pinchRef.current = { dist: getTD(e.touches[0], e.touches[1]), zoom: zoom }; }
  }
  function onTM(e) {
    setDidMove(true);
    if (e.touches.length === 1 && dragging) { setPan({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y }); }
    else if (e.touches.length === 2 && pinchRef.current) { setZoom(Math.min(Math.max(pinchRef.current.zoom * (getTD(e.touches[0], e.touches[1]) / pinchRef.current.dist), 0.25), 3)); }
  }
  function onTE() { setDragging(false); pinchRef.current = null; }
  function onSvgClick() { if (!didMove) setSelected(null); }
  function onSel(id) { if (!didMove) setSelected(id === selected ? null : id); }

  var desc = selected ? DESC[selected] : null;
  var GAP = 250;

  /* ===== EDITOR LINES (shared context) ===== */
  var edLines = [
    { type: "text", t: "Ada se plizi chodbou. Vzduch pachne" },
    { type: "text", t: "plisni a ze stropu kape voda." },
    { type: "text", t: "" },
    { type: "inline", t: "❓ Je tu straz? Likely → ANO", color: "#4a7a4a" },
    { type: "text", t: "" },
    { type: "text", t: "Straz tu je — tlustej krysak se" },
    { type: "text", t: "svickou. Nevidi ji. Ada chce zjistit" },
    { type: "text", t: "jestli se da obejit..." },
    { type: "cursor", offset: 118 },
  ];

  var edLinesShort = [
    { type: "text", t: "...svickou. Nevidi ji. Ada chce" },
    { type: "text", t: "zjistit jestli se da obejit..." },
    { type: "cursor", offset: 118 },
  ];

  /* ===== ROW 1: FLOW (4 steps) ===== */
  var flow1content = (function() {
    var cY = 28 + 28;
    var kbY = H - 200;
    var toolY = kbY - 28;
    return (
      <g>
        {drawEditorTop(0, 0, 18, IW, edLinesShort)}
        {/* Mini toolbar */}
        <rect x={P} y={toolY - 40} width={IW} height={24} rx={4} fill="#f5f3ee" stroke="#c89030" strokeWidth={1} />
        <text x={P+3} y={toolY-33} style={{ fontSize: 4, fontFamily: FONT, fill: "#c89030", fontWeight: 600 }}>VLOZIT:</text>
        {["🎬","❓","🔮","⚔️","📝","📕","⋯"].map(function(ic, i) {
          return (
            <g key={"t1"+i}>
              <rect x={P + 2 + i*27} y={toolY - 30} width={22} height={14} rx={3} fill={i===1?"#4a7a4a22":"none"} stroke={i===1?"#4a7a4a":"#ccc"} strokeWidth={0.5} />
              <text x={P + 13 + i*27} y={toolY - 21} textAnchor="middle" style={{ fontSize: 8 }}>{ic}</text>
            </g>
          );
        })}
        {/* Keyboard */}
        <rect x={P-4} y={kbY - 40} width={IW+8} height={180} rx={0} fill="#d1d3d8" />
        <text x={P+IW/2} y={kbY - 26} textAnchor="middle" style={{ fontSize: 5, fontFamily: FONT, fill: "#666", fontWeight: 600 }}>KLAVESNICE</text>
        {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map(function(row, ri) {
          var kw = ri === 2 ? 18 : 16;
          var sx = P + (IW - row.length * (kw + 2)) / 2;
          return (
            <g key={"kr1"+ri}>
              {row.split("").map(function(k, ki) {
                return (
                  <g key={"k1"+ki}>
                    <rect x={sx + ki*(kw+2)} y={kbY - 16 + ri*28} width={kw} height={22} rx={3} fill="#fff" stroke="#bbb" strokeWidth={0.5} />
                    <text x={sx + ki*(kw+2) + kw/2} y={kbY - 4 + ri*28} textAnchor="middle" style={{ fontSize: 8, fontFamily: FONT, fill: "#333" }}>{k}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
        <rect x={P+30} y={kbY - 16 + 3*28} width={IW-60} height={22} rx={5} fill="#fff" stroke="#bbb" strokeWidth={0.5} />
        {/* Arrow pointing to Fate Q button */}
        <line x1={P + 16 + 27} y1={toolY - 44} x2={P + 16 + 27} y2={toolY - 36} stroke="#b05020" strokeWidth={1.5} />
        <text x={P + 16 + 27} y={toolY - 47} textAnchor="middle" style={{ fontSize: 5, fontFamily: FONT, fill: "#b05020", fontWeight: 700 }}>TAP!</text>
      </g>
    );
  })();

  var flow2content = (function() {
    var sheetContent = (
      <g>
        {/* Question input */}
        <text x={0} y={6} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>OTAZKA:</text>
        <rect x={0} y={10} width={IW - 20} height={20} rx={4} fill="none" stroke="#4a7a4a" strokeWidth={1} />
        <text x={6} y={23} style={{ fontSize: 7, fontFamily: FONT, fill: "#333" }}>Je tu straz?|</text>
        <rect x={IW - 50} y={10} width={1} height={14} fill="#4a7a4a" />

        {/* Odds selector */}
        <text x={0} y={42} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>ODDS (swipe):</text>
        {["Unlikely", "50/50", "Likely", "V.likely"].map(function(o, i) {
          var isActive = i === 2;
          return (
            <g key={"o"+i}>
              <rect x={i * 45} y={48} width={42} height={16} rx={4} fill={isActive ? "#4a7a4a" : "none"} stroke={isActive ? "#4a7a4a" : "#ccc"} strokeWidth={0.8} />
              <text x={i * 45 + 21} y={58} textAnchor="middle" style={{ fontSize: 5.5, fontFamily: FONT, fill: isActive ? "#fff" : "#666" }}>{o}</text>
            </g>
          );
        })}

        {/* CF reminder */}
        <text x={0} y={78} style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>Chaos Factor: 5</text>

        {/* Roll button */}
        <rect x={20} y={86} width={IW - 60} height={30} rx={8} fill="#4a7a4a" stroke="#4a7a4a" strokeWidth={1} />
        <text x={IW/2 - 10} y={105} textAnchor="middle" style={{ fontSize: 10, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>🎲 HODIT</text>
      </g>
    );
    return (
      <g>
        {drawEditorTop(0, 0, 18, IW, edLines)}
        {drawBottomSheet(0, 0, 200, "❓ FATE QUESTION", sheetContent)}
      </g>
    );
  })();

  var flow3content = (function() {
    var sheetContent = (
      <g>
        {/* Question echo */}
        <text x={0} y={6} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>Je tu straz? · Likely · CF 5</text>

        {/* Roll result */}
        <text x={IW/2 - 10} y={22} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#888" }}>d100 = 34</text>

        {/* BIG RESULT */}
        <rect x={20} y={28} width={IW - 60} height={40} rx={8} fill="#e8f5e8" stroke="#4a7a4a" strokeWidth={2} />
        <text x={IW/2 - 10} y={55} textAnchor="middle" style={{ fontSize: 20, fontFamily: FONT, fill: "#4a7a4a", fontWeight: 800 }}>ANO</text>

        {/* Exceptional? */}
        <text x={0} y={82} style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>Exceptional: ne · Random event: ne</text>

        {/* Insert button */}
        <rect x={20} y={92} width={IW - 60} height={26} rx={6} fill="#4a7a4a" stroke="#4a7a4a" strokeWidth={1} />
        <text x={IW/2 - 10} y={109} textAnchor="middle" style={{ fontSize: 8, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>VLOZIT DO TEXTU</text>
      </g>
    );
    return (
      <g>
        {drawEditorTop(0, 0, 18, IW, edLines)}
        {drawBottomSheet(0, 0, 200, "❓ VYSLEDEK", sheetContent)}
      </g>
    );
  })();

  var flow4content = (function() {
    var resultLines = [
      { type: "text", t: "Ada se plizi chodbou. Vzduch pachne" },
      { type: "text", t: "plisni a ze stropu kape voda." },
      { type: "text", t: "" },
      { type: "inline", t: "❓ Je tu straz? Likely → ANO", color: "#4a7a4a" },
      { type: "text", t: "" },
      { type: "text", t: "Straz tu je — tlustej krysak se" },
      { type: "text", t: "svickou. Nevidi ji. Ada chce zjistit" },
      { type: "text", t: "jestli se da obejit..." },
      { type: "text", t: "" },
      { type: "inline", t: "❓ Da se obejit? 50/50 → NE", color: "#aa4444" },
      { type: "text", t: "" },
      { type: "text", t: "Kruci. Ada sebere kamen a|" },
      { type: "cursor", offset: 108 },
    ];
    var kbY = H - 200;
    var toolY = kbY - 28;
    return (
      <g>
        {drawEditorTop(0, 0, 18, IW, resultLines)}
        <rect x={P} y={toolY - 40} width={IW} height={24} rx={4} fill="#f5f3ee" stroke="#c89030" strokeWidth={1} />
        <text x={P+3} y={toolY-33} style={{ fontSize: 4, fontFamily: FONT, fill: "#c89030", fontWeight: 600 }}>VLOZIT:</text>
        {["🎬","❓","🔮","⚔️","📝","📕","⋯"].map(function(ic, i) {
          return (
            <g key={"t4"+i}>
              <rect x={P + 2 + i*27} y={toolY - 30} width={22} height={14} rx={3} fill="none" stroke="#ccc" strokeWidth={0.5} />
              <text x={P + 13 + i*27} y={toolY - 21} textAnchor="middle" style={{ fontSize: 8 }}>{ic}</text>
            </g>
          );
        })}
        <rect x={P-4} y={kbY - 40} width={IW+8} height={180} rx={0} fill="#d1d3d8" />
        <text x={P+IW/2} y={kbY - 26} textAnchor="middle" style={{ fontSize: 5, fontFamily: FONT, fill: "#666", fontWeight: 600 }}>KLAVESNICE</text>
        {/* Highlight the new inline block */}
        <text x={P+IW+8} y={28 + 28 + 10*8.5 - 10} style={{ fontSize: 5, fontFamily: FONT, fill: "#aa4444" }}>NOVY blok!</text>
      </g>
    );
  })();

  /* ===== ROW 2: INDIVIDUAL SHEETS ===== */
  var sceneSheetContent = (
    <g>
      <text x={0} y={6} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>CO POSTAVA OCEKAVA?</text>
      <rect x={0} y={10} width={IW - 20} height={20} rx={4} fill="none" stroke="#8888cc" strokeWidth={1} />
      <text x={6} y={23} style={{ fontSize: 6, fontFamily: FONT, fill: "#333" }}>Ada projde jeskyni bez boje|</text>
      <text x={0} y={42} style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>Chaos Factor: 5 · d10 vs CF</text>
      <rect x={20} y={50} width={IW - 60} height={26} rx={6} fill="#8888cc" />
      <text x={IW/2 - 10} y={67} textAnchor="middle" style={{ fontSize: 8, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>TESTOVAT CHAOS</text>
      <line x1={0} y1={82} x2={IW-20} y2={82} stroke="#eee" strokeWidth={0.5} />
      <text x={IW/2 - 10} y={96} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#888" }}>d10 = 3 (3 &lt; 5 = CF)</text>
      <rect x={10} y={102} width={IW - 40} height={28} rx={6} fill="#fff3e0" stroke="#c89030" strokeWidth={1.5} />
      <text x={IW/2 - 10} y={120} textAnchor="middle" style={{ fontSize: 10, fontFamily: FONT, fill: "#c89030", fontWeight: 800 }}>POZMENENA!</text>
      <text x={0} y={142} style={{ fontSize: 5, fontFamily: FONT, fill: "#c89030" }}>Scene Adjustment (d10=3): Sniz/odeber aktivitu</text>
      <rect x={20} y={150} width={IW - 60} height={22} rx={6} fill="#8888cc" />
      <text x={IW/2 - 10} y={165} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>VLOZIT SCENU</text>
    </g>
  );

  var meaningSheetContent = (
    <g>
      <text x={0} y={6} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>TYP:</text>
      <rect x={0} y={12} width={80} height={22} rx={6} fill="none" stroke="#7a5aaa" strokeWidth={1} />
      <text x={40} y={26} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#7a5aaa" }}>ACTION</text>
      <rect x={88} y={12} width={86} height={22} rx={6} fill="#7a5aaa" stroke="#7a5aaa" strokeWidth={1} />
      <text x={131} y={26} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>DISCOVERY</text>
      <line x1={0} y1={42} x2={IW-20} y2={42} stroke="#eee" strokeWidth={0.5} />
      <text x={IW/2 - 10} y={56} textAnchor="middle" style={{ fontSize: 6, fontFamily: FONT, fill: "#bbb" }}>d100 = 67, d100 = 23</text>
      <rect x={10} y={62} width={IW-40} height={46} rx={8} fill="#f5f0fa" stroke="#7a5aaa" strokeWidth={1.5} />
      <text x={IW/2 - 10} y={82} textAnchor="middle" style={{ fontSize: 12, fontFamily: FONT, fill: "#7a5aaa", fontWeight: 800 }}>Abandon</text>
      <text x={IW/2 - 10} y={98} textAnchor="middle" style={{ fontSize: 12, fontFamily: FONT, fill: "#7a5aaa", fontWeight: 800 }}>Danger</text>
      <text x={IW/2 - 10} y={120} textAnchor="middle" style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>Interpretuj v kontextu sceny</text>
      <rect x={20} y={128} width={IW - 60} height={22} rx={6} fill="#7a5aaa" />
      <text x={IW/2 - 10} y={143} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>VLOZIT DO TEXTU</text>
    </g>
  );

  var endSceneSheetContent = (
    <g>
      <text x={0} y={6} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>MELA POSTAVA KONTROLU NAD SCENOU?</text>
      <rect x={0} y={12} width={80} height={20} rx={4} fill="#4a7a4a" />
      <text x={40} y={25} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>ANO (CF-1)</text>
      <rect x={88} y={12} width={80} height={20} rx={4} fill="none" stroke="#aa4444" strokeWidth={1} />
      <text x={128} y={25} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#aa4444" }}>NE (CF+1)</text>
      <text x={0} y={44} style={{ fontSize: 6, fontFamily: FONT, fill: "#4a7a4a", fontWeight: 600 }}>CF: 5 → 4</text>
      <line x1={0} y1={50} x2={IW-20} y2={50} stroke="#eee" strokeWidth={0.5} />
      <text x={0} y={60} style={{ fontSize: 5, fontFamily: FONT, fill: "#999", fontWeight: 600 }}>THREADY:</text>
      <rect x={0} y={64} width={IW-20} height={14} rx={2} fill="none" stroke="#4a6a8a" strokeWidth={0.5} />
      <text x={4} y={73} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>Kocici dan 3/10</text>
      <rect x={IW-52} y={66} width={14} height={10} rx={2} fill="#4a6a8a" />
      <text x={IW-45} y={74} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#fff" }}>+</text>
      <rect x={0} y={80} width={IW-20} height={14} rx={2} fill="none" stroke="#4a6a8a" strokeWidth={0.5} />
      <text x={4} y={89} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>Adino zajeti 1/10</text>
      <text x={0} y={104} style={{ fontSize: 4.5, fontFamily: FONT, fill: "#4a6a8a" }}>+ Pridat thread</text>
      <line x1={0} y1={110} x2={IW-20} y2={110} stroke="#eee" strokeWidth={0.5} />
      <text x={0} y={120} style={{ fontSize: 5, fontFamily: FONT, fill: "#999", fontWeight: 600 }}>NPC V TETO SCENE:</text>
      <text x={0} y={131} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>Sedivec (3x) · Liska (2x)</text>
      <text x={0} y={142} style={{ fontSize: 4.5, fontFamily: FONT, fill: "#888" }}>+ Pridat NPC</text>
      <rect x={20} y={150} width={IW - 60} height={22} rx={6} fill="#333" />
      <text x={IW/2 - 10} y={165} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>UKONCIT SCENU</text>
    </g>
  );

  var combatSheetContent = (
    <g>
      <text x={0} y={6} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>NEPRIJATEL:</text>
      <rect x={0} y={10} width={IW - 20} height={18} rx={4} fill="none" stroke="#aa4444" strokeWidth={1} />
      <text x={6} y={22} style={{ fontSize: 6.5, fontFamily: FONT, fill: "#333" }}>Pavouk (STR 3, BO 1, d6)</text>
      <text x={IW-26} y={22} style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>DB ↓</text>
      <line x1={0} y1={34} x2={IW-20} y2={34} stroke="#eee" strokeWidth={0.5} />
      <text x={0} y={44} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>INICIATIVA: DEX test</text>
      <text x={0} y={54} style={{ fontSize: 6, fontFamily: FONT, fill: "#4a7a4a" }}>Ada zacina (DEX 10 vs 6)</text>
      <line x1={0} y1={60} x2={IW-20} y2={60} stroke="#eee" strokeWidth={0.5} />
      <text x={0} y={70} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>KOLO 1:</text>
      <text x={0} y={80} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>Ada utoci: d6 = 4 dmg</text>
      <text x={0} y={90} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#aa4444" }}>Pavouk STR: 3 → 0 = MRTVY</text>
      <rect x={10} y={100} width={IW - 40} height={28} rx={6} fill="#f5e8e8" stroke="#aa4444" strokeWidth={1.5} />
      <text x={IW/2 - 10} y={118} textAnchor="middle" style={{ fontSize: 9, fontFamily: FONT, fill: "#aa4444", fontWeight: 800 }}>VITEZSTVI!</text>
      <text x={0} y={142} style={{ fontSize: 5, fontFamily: FONT, fill: "#888" }}>Ada: STR 8/8, BO 0/4 (bez zraneni)</text>
      <rect x={20} y={150} width={IW - 60} height={22} rx={6} fill="#aa4444" />
      <text x={IW/2 - 10} y={165} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>VLOZIT DO TEXTU</text>
    </g>
  );

  return (
    <div ref={cRef} style={{ width: "100%", height: "100vh", background: "#faf9f6", fontFamily: FONT, position: "relative", overflow: "hidden", touchAction: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "8px 14px", background: "rgba(250,249,246,0.92)", borderBottom: "1px solid #e0ddd5", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>BOTTOM SHEETS — F EDITOR</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={function() { setSelected("_intro"); }} style={{ fontSize: 9, padding: "4px 10px", background: "#333", color: "#faf9f6", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: FONT }}>INFO</button>
          <span style={{ fontSize: 10, color: "#888" }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 20, right: desc ? 480 : 16, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
        <button onClick={function() { setZoom(Math.min(zoom * 1.2, 3)); }} style={{ width: 38, height: 38, background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 18, cursor: "pointer" }}>+</button>
        <button onClick={function() { setZoom(Math.max(zoom * 0.8, 0.25)); }} style={{ width: 38, height: 38, background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 18, cursor: "pointer" }}>-</button>
        <button onClick={function() { setPan({ x: 20, y: 40 }); setZoom(0.65); }} style={{ width: 38, height: 38, background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>R</button>
      </div>
      <svg width="100%" height="100%" style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU} onClick={onSvgClick} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="0.5" fill="#ddd" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g transform={"translate(" + pan.x + "," + pan.y + ") scale(" + zoom + ")"}>

          {/* ROW 1 LABEL */}
          <text x={0} y={12} style={{ fontSize: 11, fontFamily: FONT, fill: "#b05020", fontWeight: 700, letterSpacing: "0.1em" }}>FLOW: VLOZENI FATE Q (krok za krokem)</text>
          <line x1={0} y1={17} x2={950} y2={17} stroke="#b05020" strokeWidth={1} strokeDasharray="4 3" />

          {/* Flow arrows between phones */}
          {[0,1,2].map(function(i) {
            var ax = (i+1) * GAP - 25;
            return <text key={"ar"+i} x={ax} y={300} style={{ fontSize: 16, fill: "#b05020" }}>{"→"}</text>;
          })}

          {drawPhone(0*GAP, 40, "flow1", "1. PISES", "klavesnice otevrena", selected, onSel, flow1content)}
          {drawPhone(1*GAP, 40, "flow2", "2. FATE Q SHEET", "vyplnis otazku + odds", selected, onSel, flow2content)}
          {drawPhone(2*GAP, 40, "flow3", "3. VYSLEDEK", "vidis odpoved", selected, onSel, flow3content)}
          {drawPhone(3*GAP, 40, "flow4", "4. ZPET V EDITORU", "blok vlozen, pises dal", selected, onSel, flow4content)}

          {/* ROW 2 LABEL */}
          <text x={0} y={552} style={{ fontSize: 11, fontFamily: FONT, fill: "#b05020", fontWeight: 700, letterSpacing: "0.1em" }}>JEDNOTLIVE SHEETY (detaily)</text>
          <line x1={0} y1={557} x2={950} y2={557} stroke="#b05020" strokeWidth={1} strokeDasharray="4 3" />

          {drawPhone(0*GAP, 580, "scene", "NOVA SCENA", "chaos test + ocekavani", selected, onSel, (
            <g>
              {drawEditorTop(0, 0, 18, IW, [
                { type: "text", t: "...krysak padl. Ada si oddychne." },
                { type: "text", t: "Cas jit dal." },
              ])}
              {drawBottomSheet(0, 0, 240, "🎬 NOVA SCENA", sceneSheetContent)}
            </g>
          ))}

          {drawPhone(1*GAP, 580, "meaning", "MEANING", "action / discovery slova", selected, onSel, (
            <g>
              {drawEditorTop(0, 0, 18, IW, [
                { type: "text", t: "...scena je pozmenena. Co to" },
                { type: "text", t: "znamena?" },
              ])}
              {drawBottomSheet(0, 0, 230, "🔮 MEANING", meaningSheetContent)}
            </g>
          ))}

          {drawPhone(2*GAP, 580, "endscene", "KONEC SCENY", "CF + thready + NPC", selected, onSel, (
            <g>
              {drawEditorTop(0, 0, 18, IW, [
                { type: "text", t: "...a tak scena konci. Ada" },
                { type: "text", t: "prezila a nasla stopu." },
              ])}
              {drawBottomSheet(0, 0, 250, "📕 KONEC SCENY 4", endSceneSheetContent)}
            </g>
          ))}

          {drawPhone(3*GAP, 580, "combat", "BOJ", "neprijatel + kola + vysledek", selected, onSel, (
            <g>
              {drawEditorTop(0, 0, 18, IW, [
                { type: "text", t: "...Ada sebere kamen a pomalu" },
                { type: "text", t: "se priblizi ke strazi." },
              ])}
              {drawBottomSheet(0, 0, 250, "⚔️ BOJ", combatSheetContent)}
            </g>
          ))}

        </g>
      </svg>
      <div style={{ position: "absolute", bottom: 6, left: 14, fontSize: 9, color: "#bbb" }}>KLIKNI NA TELEFON / TAHNI / CTRL+SCROLL</div>
      {desc ? (
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 460, background: "#faf9f6", borderLeft: "2px solid #333", zIndex: 20, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #e0ddd5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#222", fontFamily: FONT }}>{desc.title}</h2>
            <button onClick={function() { setSelected(null); }} style={{ background: "#333", color: "#faf9f6", border: "none", borderRadius: 4, width: 30, height: 30, fontSize: 15, cursor: "pointer" }}>X</button>
          </div>
          <div style={{ padding: "14px 18px", overflowY: "auto", flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.65, color: "#444", fontFamily: FONT, whiteSpace: "pre-wrap" }}>{desc.text}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
