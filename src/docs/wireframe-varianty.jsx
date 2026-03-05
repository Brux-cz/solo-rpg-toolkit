import { useState, useRef, useEffect } from "react";

var FONT = "monospace";

var DESC = {};
DESC._intro = { title: "Porovnani 7 variant", text: "Radek 1: A-E (kartovy pristup)\nRadek 2: F (Notion-style editor)\n\nA) Journal-first\nB) Action-first\nC) Dashboard\nD) Split\nE) Hybrid A+D\nF) Notion editor (cteni)\nF) Notion editor (s klavesnici)\n\nKlikni na telefon pro detail.\nTahni prstem / mysi.\nCtrl+scroll = zoom." };
DESC.va = { title: "A) JOURNAL-FIRST (14/20)", text: "Log akci zabira ~65% obrazovky.\nAkce v liste dole.\n\nHistorie: 5/5 (dominuje)\nAkce: 3/5 (mala lista)\nKontext: 2/5 (jen header)\nVysledek: 3/5 (karta v logu)" };
DESC.vb = { title: "B) ACTION-FIRST (11/20)", text: "Akcni tlacitka velka uprostred.\nVysledky nad nimi.\n\nHistorie: 2/5 (jen 2-3 karty)\nAkce: 5/5 (dominuji)\nKontext: 2/5 (jen header)\nVysledek: 4/5 (animace)" };
DESC.vc = { title: "C) DASHBOARD (10/20)", text: "CF centralni, widgety kolem.\nVsechno na jedne obrazovce.\n\nHistorie: 1/5 (jen posledni)\nAkce: 4/5 (velka lista)\nKontext: 5/5 (vse viditelne)\nVysledek: 4/5 (widget)" };
DESC.vd = { title: "D) SPLIT (10/20)", text: "Vysledek nahore, akce dole.\nHistorie v separatnim tabu.\n\nHistorie: 1/5 (schovana)\nAkce: 5/5 (velky grid)\nKontext: 3/5 (stredni lista)\nVysledek: 5/5 (dominuje)" };
DESC.ve = { title: "E) HYBRID A+D (16/20)", text: "Kombinace nejlepsiho z A (journal) a D (split).\n\nPRINCIP:\nLog zustava dominantni, ale POSLEDNI vysledek je vizualne zvyrazneny jako Hero Card. Starsi karty se zuzi do kompaktniho 1-radkoveho formatu.\n\nHeader je ROZKLIKNUTELNY.\nFate Q tlacitko zvyraznene.\n\nHistorie: 4/5\nAkce: 3/5\nKontext: 3/5\nVysledek: 5/5\nCELKEM: 16/20\n\nPOZNAMKA: Tato varianta byla nahrazena variantou F (Notion editor) ktera pridava plne narativni psani — coz je hlavni ucel aplikace." };
DESC.vf = { title: "F) NOTION-STYLE EDITOR — FINALNI ROZHODNUTI", text: "Hlavni obrazovka je TEXTOVY EDITOR do ktereho se vkladaji mechanicke bloky.\n\nToto je FINALNI varianta UI. Duvodem je ze hrac chce psat plny pribeh (narativ je priorita #1 vedle historie).\n\nNARATIV JE KRAL:\nPises pribeh jako do deniku. Kdyz potrebujes mechaniku (Fate Q, Meaning...), tapnes tlacitko a vysledek se vlozi jako inline blok primo do textu. Pak pokracujes v psani.\n\nINLINE BLOKY:\nKarty jsou male, kompaktni — jen ikona, otazka a vysledek na 1-2 radky. Nezabiraji moc mista, nerussi tok textu.\n\nSCENY = KAPITOLY:\nKazda scena je sekce s nadpisem. Muzes skakat mezi scenami.\n\nAKCNI LISTA:\nStejne tlacitka jako driv, ale fungujou jako 'vlozit blok' — tapnes Fate Q, vyplnis otazku, vysledek se vlozi na pozici kurzoru.\n\nBOTTOM SHEETS:\nSheet NAHRADI klavesnici (ne otevira se nad ni). Vyska ~45%. Po vlozeni se sheet zavre a klavesnice se vrati.\n\nTECH STACK:\nTipTap editor + shadcn/ui komponenty + Vaul (bottom sheets) + Tailwind\n\nHistorie: 5/5 (plny pribeh!)\nAkce: 3/5 (stejna lista)\nKontext: 3/5 (header)\nVysledek: 4/5 (inline blok)\nNarativ: 5/5 (NOVE!)\nCELKEM: 20/20" };
DESC.vfk = { title: "F) NOTION-STYLE (s klavesnici)", text: "Jak vypada editor kdyz pises na mobilu.\n\nKLAVESNICE zabira ~45% obrazovky. Nad ni vidis:\n- 3-4 radky textu (posledni odstavec)\n- Inline blok pokud je blizko kurzoru\n- Mini toolbar s mechanikami (nahrazuje akcni listu)\n\nMINI TOOLBAR (nad klavesnici):\nJeden radek ikon: [🎬][❓][🔮][📝][⚔️][...]\nTapnes = vlozi mechaniku, vysledek se objevi v textu, pokracujes v psani.\n\nKLICOVE:\n- Header ZMIZI (maximalizuje prostor pro text)\n- Bottom nav ZMIZI (jsi v editoru)\n- Akcni lista se PRESUNE nad klavesnici jako toolbar\n- Po zavreni klavesnice se vse vrati\n\nFLOW:\n1. Pises '...Ada se plizi chodbou...'\n2. Tapnes ❓ v toolbaru\n3. Zadas 'Je tu straz?' + Likely\n4. Vysledek ANO se vlozi do textu\n5. Pokracujes: 'Straz tu je — tlustej krysak...'\n\nToto je kriticky stav — hrac v nem stravi NEJVIC casu." };

function drawLogCard(x, y, w, h, color, icon, t1, t2, t3) {
  var els = [];
  els.push(<rect key="bg" x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={color} strokeWidth={0.8} />);
  els.push(<rect key="bar" x={x} y={y} width={2.5} height={h} rx={1} fill={color} />);
  els.push(<text key="l1" x={x + 8} y={y + 9} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#999" }}>{icon} {t1}</text>);
  if (t2) els.push(<text key="l2" x={x + 8} y={y + 18} style={{ fontSize: 6, fontFamily: FONT, fill: "#555" }}>{t2}</text>);
  if (t3) els.push(<text key="l3" x={x + 8} y={y + 27} style={{ fontSize: 8, fontFamily: FONT, fill: color, fontWeight: 700 }}>{t3}</text>);
  return <g key={"lc" + x + y}>{els}</g>;
}

function drawCompactCard(x, y, w, color, icon, txt) {
  return (
    <g key={"cc" + y}>
      <rect x={x} y={y} width={w} height={12} rx={2} fill="none" stroke={color} strokeWidth={0.5} />
      <rect x={x} y={y} width={2} height={12} rx={1} fill={color} />
      <text x={x + 6} y={y + 8.5} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#888" }}>{icon} {txt}</text>
    </g>
  );
}

function drawBtn(x, y, w, h, icon, label, filled) {
  return (
    <g key={"b" + x + y}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={filled || "none"} stroke={filled || "#ccc"} strokeWidth={0.8} />
      <text x={x + w / 2} y={y + h / 2 - 1} textAnchor="middle" style={{ fontSize: 10 }}>{icon}</text>
      {label ? <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" style={{ fontSize: 5, fontFamily: FONT, fill: filled ? "#fff" : "#999" }}>{label}</text> : null}
    </g>
  );
}

function drawHeader(x, y, w) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={24} fill="none" stroke="#ccc" strokeWidth={0.8} />
      <text x={x + 6} y={y + 10} style={{ fontSize: 7, fontFamily: FONT, fill: "#222", fontWeight: 700 }}>Scena 4</text>
      <text x={x + 52} y={y + 10} style={{ fontSize: 6.5, fontFamily: FONT, fill: "#999" }}>CF 5</text>
      <text x={x + w - 6} y={y + 10} textAnchor="end" style={{ fontSize: 6, fontFamily: FONT, fill: "#bbb" }}>Den 2 rano</text>
    </g>
  );
}

function drawNav(x, y, w) {
  var tw = w / 3;
  return (
    <g>
      <rect x={x} y={y} width={w} height={34} fill="none" stroke="#bbb" strokeWidth={0.8} />
      <line x1={x + 3} y1={y} x2={x + tw - 3} y2={y} stroke="#555" strokeWidth={2} />
      <text x={x + tw * 0.5} y={y + 14} textAnchor="middle" style={{ fontSize: 9 }}>{"📖"}</text>
      <text x={x + tw * 0.5} y={y + 25} textAnchor="middle" style={{ fontSize: 5.5, fontFamily: FONT, fill: "#222", fontWeight: 700 }}>Denik</text>
      <text x={x + tw * 1.5} y={y + 14} textAnchor="middle" style={{ fontSize: 9 }}>{"🐭"}</text>
      <text x={x + tw * 1.5} y={y + 25} textAnchor="middle" style={{ fontSize: 5.5, fontFamily: FONT, fill: "#ccc" }}>Postava</text>
      <text x={x + tw * 2.5} y={y + 14} textAnchor="middle" style={{ fontSize: 9 }}>{"🗺️"}</text>
      <text x={x + tw * 2.5} y={y + 25} textAnchor="middle" style={{ fontSize: 5.5, fontFamily: FONT, fill: "#ccc" }}>Svet</text>
    </g>
  );
}

function drawPhone(px, py, id, title, score, scoreClr, sel, onSel) {
  var W = 220, H = 460, P = 10, IW = 200;
  var hY = py + 28, cY = hY + 28, nY = py + H - 40, cH = nY - cY - 4;
  var active = sel === id;
  var content = null;

  if (id === "va") {
    var aY = cY + cH - 40;
    content = (
      <g>
        <rect x={px + P} y={cY} width={IW} height={cH - 44} rx={4} fill="#faf9f6" stroke="#ddd" strokeWidth={0.8} strokeDasharray="3 2" />
        <text x={px + P + 4} y={cY + 9} style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>SCROLLUJICI LOG (~65%)</text>
        {drawLogCard(px+P+4, cY+14, IW-8, 22, "#8888cc", "🎬", "Scena 4", "Ada zkouma jeskyn")}
        {drawLogCard(px+P+4, cY+40, IW-8, 22, "#c89030", "🎲", "Test chaosu", "POZMENENA")}
        {drawLogCard(px+P+4, cY+66, IW-8, 30, "#4a7a4a", "❓", "Likely d100=34", "Je tu straz?", "ANO")}
        {drawLogCard(px+P+4, cY+100, IW-8, 30, "#aa4444", "❓", "50/50 d100=78", "Da se obejit?", "NE")}
        {drawLogCard(px+P+4, cY+134, IW-8, 24, "#7a5aaa", "🔮", "Meaning", null, "Abandon+Danger")}
        {drawLogCard(px+P+4, cY+162, IW-8, 20, "#bbb", "📝", "Straz me zahledla")}
        {drawLogCard(px+P+4, cY+186, IW-8, 22, "#aa4444", "⚔️", "Boj: Pavouk", "d6=4 mrtvy")}
        {drawLogCard(px+P+4, cY+212, IW-8, 30, "#4a7a4a", "❓", "Very likely", "Najdu poklad?", "VYJ. ANO")}
        <rect x={px+P} y={aY} width={IW} height={36} fill="none" stroke="#c89030" strokeWidth={1} />
        {drawBtn(px+P+2, aY+3, 36, 30, "🎬")}
        {drawBtn(px+P+40, aY+3, 36, 30, "❓")}
        {drawBtn(px+P+78, aY+3, 36, 30, "🔮")}
        {drawBtn(px+P+116, aY+3, 36, 30, "📝")}
        {drawBtn(px+P+154, aY+3, 36, 30, "⋯")}
      </g>
    );
  } else if (id === "vb") {
    var mH = Math.round(cH * 0.38);
    var actY = cY + mH + 6;
    var actH = cH - mH - 10;
    var bw2 = Math.round((IW - 12) / 2);
    var bh2 = Math.round((actH - 50) / 3);
    content = (
      <g>
        <rect x={px+P} y={cY} width={IW} height={mH} rx={4} fill="#faf9f6" stroke="#ddd" strokeWidth={0.8} strokeDasharray="3 2" />
        <text x={px+P+4} y={cY+9} style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>MINI LOG (2-3)</text>
        {drawLogCard(px+P+4, cY+14, IW-8, 30, "#4a7a4a", "❓", "Likely d100=34", "Je tu straz?", "ANO")}
        {drawLogCard(px+P+4, cY+48, IW-8, 22, "#7a5aaa", "🔮", "Meaning", null, "Abandon+Danger")}
        {drawLogCard(px+P+4, cY+74, IW-8, 18, "#bbb", "📝", "Straz me zahledla")}
        <rect x={px+P} y={actY} width={IW} height={actH} rx={6} fill="none" stroke="#c89030" strokeWidth={1.2} />
        <text x={px+P+IW/2} y={actY+12} textAnchor="middle" style={{ fontSize: 6, fontFamily: FONT, fill: "#c89030", fontWeight: 600 }}>AKCE</text>
        {drawBtn(px+P+3, actY+18, bw2, bh2, "🎬", "Scena")}
        {drawBtn(px+P+bw2+9, actY+18, bw2, bh2, "❓", "Fate Q")}
        {drawBtn(px+P+3, actY+18+bh2+3, bw2, bh2, "🔮", "Meaning")}
        {drawBtn(px+P+bw2+9, actY+18+bh2+3, bw2, bh2, "⚔️", "Boj")}
        {drawBtn(px+P+3, actY+18+(bh2+3)*2, bw2, bh2, "📝", "Pozn.")}
        {drawBtn(px+P+bw2+9, actY+18+(bh2+3)*2, bw2, bh2, "📕", "Konec")}
      </g>
    );
  } else if (id === "vc") {
    content = (
      <g>
        <rect x={px+P} y={cY} width={IW*0.35} height={60} rx={3} fill="none" stroke="#ccc" strokeWidth={0.8} />
        <text x={px+P+4} y={cY+10} style={{ fontSize: 5, fontFamily: FONT, fill: "#999", fontWeight: 600 }}>STATY</text>
        <text x={px+P+4} y={cY+22} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>STR 8</text>
        <text x={px+P+4} y={cY+31} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>DEX 10</text>
        <text x={px+P+4} y={cY+40} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>WIL 7</text>
        <text x={px+P+4} y={cY+51} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#aa4444" }}>BO 0/4</text>
        <rect x={px+P+IW*0.38} y={cY} width={IW*0.3} height={60} rx={6} fill="none" stroke="#c89030" strokeWidth={1.5} />
        <text x={px+P+IW*0.53} y={cY+14} textAnchor="middle" style={{ fontSize: 6, fontFamily: FONT, fill: "#c89030", fontWeight: 600 }}>CHAOS</text>
        <text x={px+P+IW*0.53} y={cY+44} textAnchor="middle" style={{ fontSize: 24, fontFamily: FONT, fill: "#c89030", fontWeight: 800 }}>5</text>
        <rect x={px+P+IW*0.71} y={cY} width={IW*0.29} height={60} rx={3} fill="none" stroke="#ccc" strokeWidth={0.8} />
        <text x={px+P+IW*0.73} y={cY+12} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>Peril 2/2</text>
        <text x={px+P+IW*0.73} y={cY+24} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>Kuraz 0</text>
        <rect x={px+P} y={cY+66} width={IW} height={50} rx={4} fill="none" stroke="#4a7a4a" strokeWidth={1} />
        <text x={px+P+4} y={cY+77} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>POSLEDNI VYSLEDEK</text>
        <text x={px+P+4} y={cY+89} style={{ fontSize: 6, fontFamily: FONT, fill: "#555" }}>Je tu straz? ANO</text>
        <rect x={px+P} y={cY+122} width={IW} height={30} fill="none" stroke="#c89030" strokeWidth={1} />
        {drawBtn(px+P+2, cY+124, 26, 26, "🎬")}
        {drawBtn(px+P+30, cY+124, 26, 26, "❓")}
        {drawBtn(px+P+58, cY+124, 26, 26, "🔮")}
        {drawBtn(px+P+86, cY+124, 26, 26, "⚔️")}
        {drawBtn(px+P+114, cY+124, 26, 26, "📝")}
        {drawBtn(px+P+142, cY+124, 26, 26, "📕")}
        {drawBtn(px+P+170, cY+124, 26, 26, "⋯")}
        <rect x={px+P} y={cY+158} width={IW} height={40} rx={3} fill="none" stroke="#4a6a8a" strokeWidth={0.8} />
        <text x={px+P+4} y={cY+169} style={{ fontSize: 5, fontFamily: FONT, fill: "#4a6a8a", fontWeight: 600 }}>THREADY</text>
        <text x={px+P+4} y={cY+181} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>Kocici dan 3/10</text>
        <rect x={px+P} y={cY+202} width={IW} height={28} rx={3} fill="none" stroke="#888" strokeWidth={0.8} />
        <text x={px+P+4} y={cY+213} style={{ fontSize: 5, fontFamily: FONT, fill: "#888", fontWeight: 600 }}>NPC</text>
        <text x={px+P+4} y={cY+224} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#555" }}>Sedivec Liska Hrach</text>
      </g>
    );
  } else if (id === "vd") {
    var rh = Math.round(cH * 0.4);
    var ctxY = cY + rh + 2;
    var agY = ctxY + 22;
    var agH = cH - rh - 26;
    var bwd = Math.round((IW - 12) / 2);
    var bhd = Math.round((agH - 46) / 4);
    content = (
      <g>
        <rect x={px+P} y={cY} width={IW} height={rh} rx={6} fill="none" stroke="#4a7a4a" strokeWidth={1.5} />
        <text x={px+P+IW/2} y={cY+14} textAnchor="middle" style={{ fontSize: 6, fontFamily: FONT, fill: "#999" }}>POSLEDNI VYSLEDEK</text>
        <text x={px+P+IW/2} y={cY+32} textAnchor="middle" style={{ fontSize: 8, fontFamily: FONT, fill: "#888" }}>FATE QUESTION</text>
        <text x={px+P+IW/2} y={cY+48} textAnchor="middle" style={{ fontSize: 9, fontFamily: FONT, fill: "#555" }}>Je tu straz?</text>
        <text x={px+P+IW/2} y={cY+rh-14} textAnchor="middle" style={{ fontSize: 18, fontFamily: FONT, fill: "#4a7a4a", fontWeight: 800 }}>ANO</text>
        <rect x={px+P} y={ctxY} width={IW} height={18} rx={2} fill="#f5f3ee" stroke="#ccc" strokeWidth={0.6} />
        <text x={px+P+IW/2} y={ctxY+12} textAnchor="middle" style={{ fontSize: 5.5, fontFamily: FONT, fill: "#888" }}>CF 5 STR 8 DEX 10 WIL 7 BO 0/4</text>
        <rect x={px+P} y={agY} width={IW} height={agH} rx={4} fill="none" stroke="#bbb" strokeWidth={0.8} />
        <text x={px+P+4} y={agY+10} style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>AKCE</text>
        {drawBtn(px+P+3, agY+14, bwd, bhd, "🎬", "Scena")}
        {drawBtn(px+P+bwd+9, agY+14, bwd, bhd, "❓", "Fate Q")}
        {drawBtn(px+P+3, agY+14+bhd+3, bwd, bhd, "🔮", "Meaning")}
        {drawBtn(px+P+bwd+9, agY+14+bhd+3, bwd, bhd, "⚔️", "Boj")}
        {drawBtn(px+P+3, agY+14+(bhd+3)*2, bwd, bhd, "📝", "Pozn.")}
        {drawBtn(px+P+bwd+9, agY+14+(bhd+3)*2, bwd, bhd, "📕", "Konec")}
        {drawBtn(px+P+3, agY+14+(bhd+3)*3, bwd, bhd, "💤", "Odpoc.")}
        {drawBtn(px+P+bwd+9, agY+14+(bhd+3)*3, bwd, bhd, "⋯", "Vice")}
      </g>
    );
  } else if (id === "ve") {
    var logH = cH - 44;
    var barYe = cY + logH + 4;
    content = (
      <g>
        <rect x={px+P} y={cY} width={IW} height={logH} rx={4} fill="#faf9f6" stroke="#ddd" strokeWidth={0.8} strokeDasharray="3 2" />
        <text x={px+P+4} y={cY+9} style={{ fontSize: 5, fontFamily: FONT, fill: "#bbb" }}>KOMPAKTNI HISTORIE</text>
        <text x={px+P+IW-4} y={cY+9} textAnchor="end" style={{ fontSize: 4.5, fontFamily: FONT, fill: "#c89030" }}>tap = rozbali kontext</text>
        {drawCompactCard(px+P+4, cY+14, IW-8, "#8888cc", "🎬", "Scena 4 - Ada zkouma")}
        {drawCompactCard(px+P+4, cY+28, IW-8, "#c89030", "🎲", "Test chaosu POZMENENA")}
        {drawCompactCard(px+P+4, cY+42, IW-8, "#4a7a4a", "❓", "Je tu straz? ANO")}
        {drawCompactCard(px+P+4, cY+56, IW-8, "#aa4444", "❓", "Da se obejit? NE")}
        {drawCompactCard(px+P+4, cY+70, IW-8, "#7a5aaa", "🔮", "Abandon + Danger")}
        {drawCompactCard(px+P+4, cY+84, IW-8, "#bbb", "📝", "Straz me zahledla")}
        {drawCompactCard(px+P+4, cY+98, IW-8, "#aa4444", "⚔️", "Boj Pavouk mrtvy")}
        <rect x={px+P+3} y={cY+114} width={IW-6} height={logH-118} rx={6} fill="none" stroke="#4a7a4a" strokeWidth={2} />
        <rect x={px+P+3} y={cY+114} width={IW-6} height={16} rx={6} fill="#4a7a4a" />
        <rect x={px+P+3} y={cY+124} width={IW-6} height={6} fill="#4a7a4a" />
        <text x={px+P+IW/2} y={cY+125} textAnchor="middle" style={{ fontSize: 6, fontFamily: FONT, fill: "#fff", fontWeight: 700 }}>HERO CARD</text>
        <text x={px+P+IW/2} y={cY+142} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#999" }}>FATE Q Very likely d100=12</text>
        <text x={px+P+IW/2} y={cY+158} textAnchor="middle" style={{ fontSize: 9, fontFamily: FONT, fill: "#555" }}>Najdu poklad?</text>
        <text x={px+P+IW/2} y={cY+182} textAnchor="middle" style={{ fontSize: 16, fontFamily: FONT, fill: "#4a7a4a", fontWeight: 800 }}>VYJ. ANO</text>
        <text x={px+P+IW/2} y={cY+198} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#c89030", fontWeight: 600 }}>Random Event!</text>
        <text x={px+P+IW/2} y={cY+212} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#7a5aaa" }}>Assist + Peace</text>
        <rect x={px+P} y={barYe} width={IW} height={36} fill="none" stroke="#c89030" strokeWidth={1} />
        {drawBtn(px+P+2, barYe+3, 36, 30, "🎬")}
        <g>
          <rect x={px+P+40} y={barYe+3} width={36} height={30} rx={4} fill="#4a7a4a" stroke="#4a7a4a" strokeWidth={1} />
          <text x={px+P+58} y={barYe+14} textAnchor="middle" style={{ fontSize: 10 }}>{"❓"}</text>
          <text x={px+P+58} y={barYe+25} textAnchor="middle" style={{ fontSize: 5, fontFamily: FONT, fill: "#fff" }}>FATE</text>
        </g>
        {drawBtn(px+P+78, barYe+3, 36, 30, "🔮")}
        {drawBtn(px+P+116, barYe+3, 36, 30, "📝")}
        {drawBtn(px+P+154, barYe+3, 36, 30, "⋯")}
      </g>
    );
  } else if (id === "vf") {
    var edH = cH - 44;
    var barYf = cY + edH + 4;
    var lx = px + P + 6;
    var lw = IW - 12;
    var fs = 6;
    var lh = 8.5;
    content = (
      <g>
        {/* Editor area */}
        <rect x={px+P} y={cY} width={IW} height={edH} rx={4} fill="#fff" stroke="#ddd" strokeWidth={0.8} />

        {/* Scene heading */}
        <text x={lx} y={cY+12} style={{ fontSize: 8, fontFamily: FONT, fill: "#333", fontWeight: 700 }}>SCENA 4: Pavouci doupe</text>
        <line x1={lx} y1={cY+15} x2={lx+lw} y2={cY+15} stroke="#eee" strokeWidth={0.5} />

        {/* Narrative text block 1 */}
        <text x={lx} y={cY+24} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>Ada se plizi chodbou. Vzduch pachne</text>
        <text x={lx} y={cY+24+lh} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>plisni a ze stropu kape voda. U vchodu</text>
        <text x={lx} y={cY+24+lh*2} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>do jeskyne vidi slabe svetlo.</text>

        {/* Inline Fate card */}
        <rect x={lx-2} y={cY+52} width={lw} height={16} rx={3} fill="#f0f7f0" stroke="#4a7a4a" strokeWidth={0.8} />
        <rect x={lx-2} y={cY+52} width={2.5} height={16} rx={1} fill="#4a7a4a" />
        <text x={lx+6} y={cY+62} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#4a7a4a" }}>{"❓ Je tu straz? · Likely · d100=34 →"}</text>
        <text x={lx+lw-8} y={cY+62} textAnchor="end" style={{ fontSize: 6, fontFamily: FONT, fill: "#4a7a4a", fontWeight: 700 }}>ANO</text>

        {/* Narrative text block 2 */}
        <text x={lx} y={cY+78} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>Straz tu je — tlustej krysak se</text>
        <text x={lx} y={cY+78+lh} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>svickou. Nevidi ji, je otoceny zady.</text>
        <text x={lx} y={cY+78+lh*2} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>Ada sahne po meci, ale...</text>

        {/* Inline Meaning card */}
        <rect x={lx-2} y={cY+106} width={lw} height={16} rx={3} fill="#f5f0fa" stroke="#7a5aaa" strokeWidth={0.8} />
        <rect x={lx-2} y={cY+106} width={2.5} height={16} rx={1} fill="#7a5aaa" />
        <text x={lx+6} y={cY+116} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#7a5aaa" }}>{"🔮 Meaning → Abandon + Danger"}</text>

        {/* Narrative text block 3 */}
        <text x={lx} y={cY+132} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>...uvedomi si, ze mec nechala u tabora.</text>
        <text x={lx} y={cY+132+lh} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>Musi to zkusit jinak. Rozhlizi se</text>
        <text x={lx} y={cY+132+lh*2} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>po cem by se dalo hodit.</text>

        {/* Inline Fate card - NO */}
        <rect x={lx-2} y={cY+160} width={lw} height={16} rx={3} fill="#faf0f0" stroke="#aa4444" strokeWidth={0.8} />
        <rect x={lx-2} y={cY+160} width={2.5} height={16} rx={1} fill="#aa4444" />
        <text x={lx+6} y={cY+170} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#aa4444" }}>{"❓ Da se obejit? · 50/50 · d100=78 →"}</text>
        <text x={lx+lw-6} y={cY+170} textAnchor="end" style={{ fontSize: 6, fontFamily: FONT, fill: "#aa4444", fontWeight: 700 }}>NE</text>

        {/* More narrative */}
        <text x={lx} y={cY+186} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>Kruci. Jedina cesta vede primo pres</text>
        <text x={lx} y={cY+186+lh} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>straz. Ada sebere kamen ze zeme</text>
        <text x={lx} y={cY+186+lh*2} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>a pomalu se priblizi...</text>

        {/* Inline Combat card */}
        <rect x={lx-2} y={cY+214} width={lw} height={20} rx={3} fill="#faf0f0" stroke="#aa4444" strokeWidth={0.8} />
        <rect x={lx-2} y={cY+214} width={2.5} height={20} rx={1} fill="#aa4444" />
        <text x={lx+6} y={cY+224} style={{ fontSize: 5.5, fontFamily: FONT, fill: "#aa4444" }}>{"⚔️ Boj: Krysak (STR 3, BO 1, d6)"}</text>
        <text x={lx+6} y={cY+231} style={{ fontSize: 5, fontFamily: FONT, fill: "#aa4444" }}>Ada d6=4 dmg, krysak STR 0 = mrtvy</text>

        {/* Final narrative + cursor */}
        <text x={lx} y={cY+246} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>Krysak padne k zemi. Ada si oddychne</text>
        <text x={lx} y={cY+246+lh} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>a sebere svicku. Za zatackou vidi</text>
        <text x={lx} y={cY+246+lh*2} style={{ fontSize: fs, fontFamily: FONT, fill: "#444" }}>neco blyskaveho...|</text>

        {/* Cursor blink indicator */}
        <rect x={lx+108} y={cY+255} width={1} height={7} fill="#333" />

        {/* Scroll indicator */}
        <rect x={px+P+IW-4} y={cY+40} width={2} height={30} rx={1} fill="#ddd" />

        {/* Action bar - "insert block" style */}
        <rect x={px+P} y={barYf} width={IW} height={36} fill="none" stroke="#c89030" strokeWidth={1} />
        <text x={px+P+4} y={barYf+8} style={{ fontSize: 4.5, fontFamily: FONT, fill: "#bbb" }}>VLOZIT BLOK:</text>
        {drawBtn(px+P+2, barYf+10, 36, 24, "🎬")}
        <g>
          <rect x={px+P+40} y={barYf+10} width={36} height={24} rx={4} fill="#4a7a4a" stroke="#4a7a4a" strokeWidth={1} />
          <text x={px+P+58} y={barYf+24} textAnchor="middle" style={{ fontSize: 9 }}>{"❓"}</text>
        </g>
        {drawBtn(px+P+78, barYf+10, 36, 24, "🔮")}
        {drawBtn(px+P+116, barYf+10, 36, 24, "⚔️")}
        {drawBtn(px+P+154, barYf+10, 36, 24, "⋯")}
      </g>
    );
  } else if (id === "vfk") {
    /* Keyboard mode - keyboard takes ~45% */
    var kbH = Math.round(H * 0.42);
    var kbY = py + H - kbH - 8;
    var toolY = kbY - 28;
    var visH = toolY - cY - 4;
    var lxk = px + P + 6;
    var lwk = IW - 12;
    var fsk = 6;
    var lhk = 8.5;
    content = (
      <g>
        {/* Visible text area - small! */}
        <rect x={px+P} y={cY} width={IW} height={visH} rx={4} fill="#fff" stroke="#ddd" strokeWidth={0.8} />

        {/* Only last few lines visible */}
        <text x={lxk} y={cY+10} style={{ fontSize: 4.5, fontFamily: FONT, fill: "#ccc" }}>... a sebere svicku. Za zatackou</text>

        {/* Inline combat result visible */}
        <rect x={lxk-2} y={cY+16} width={lwk} height={14} rx={3} fill="#faf0f0" stroke="#aa4444" strokeWidth={0.6} />
        <rect x={lxk-2} y={cY+16} width={2} height={14} rx={1} fill="#aa4444" />
        <text x={lxk+5} y={cY+25} style={{ fontSize: 5, fontFamily: FONT, fill: "#aa4444" }}>{"⚔️ Boj: Krysak → mrtvy"}</text>

        {/* Active text being written */}
        <text x={lxk} y={cY+40} style={{ fontSize: fsk, fontFamily: FONT, fill: "#444" }}>Krysak padne k zemi. Ada si oddychne</text>
        <text x={lxk} y={cY+40+lhk} style={{ fontSize: fsk, fontFamily: FONT, fill: "#444" }}>a sebere svicku. Za zatackou vidi</text>
        <text x={lxk} y={cY+40+lhk*2} style={{ fontSize: fsk, fontFamily: FONT, fill: "#444" }}>neco blyskaveho. Poklad? Nebo</text>
        <text x={lxk} y={cY+40+lhk*3} style={{ fontSize: fsk, fontFamily: FONT, fill: "#444" }}>past?|</text>

        {/* Cursor */}
        <rect x={lxk+17} y={cY+68} width={1} height={7} fill="#333" />

        {/* Info: small space label */}
        <text x={px+P+IW/2} y={cY+visH-4} textAnchor="middle" style={{ fontSize: 4, fontFamily: FONT, fill: "#ddd" }}>~55% obrazovky (viditelne pri psani)</text>

        {/* Mini toolbar above keyboard */}
        <rect x={px+P} y={toolY} width={IW} height={24} rx={4} fill="#f5f3ee" stroke="#c89030" strokeWidth={1} />
        <text x={px+P+3} y={toolY+7} style={{ fontSize: 4, fontFamily: FONT, fill: "#c89030", fontWeight: 600 }}>VLOZIT:</text>
        {[
          { i: "🎬", xx: 2 }, { i: "❓", xx: 24 }, { i: "🔮", xx: 46 },
          { i: "⚔️", xx: 68 }, { i: "📝", xx: 90 }, { i: "📕", xx: 112 },
          { i: "🎲", xx: 134 }, { i: "⋯", xx: 156 }
        ].map(function(b) {
          return (
            <g key={"tb" + b.xx}>
              <rect x={px+P+b.xx} y={toolY+9} width={20} height={13} rx={3} fill="none" stroke="#ccc" strokeWidth={0.5} />
              <text x={px+P+b.xx+10} y={toolY+18} textAnchor="middle" style={{ fontSize: 7 }}>{b.i}</text>
            </g>
          );
        })}

        {/* Keyboard */}
        <rect x={px+P-4} y={kbY} width={IW+8} height={kbH} rx={0} fill="#d1d3d8" />
        <text x={px+P+IW/2} y={kbY+12} textAnchor="middle" style={{ fontSize: 5, fontFamily: FONT, fill: "#666", fontWeight: 600 }}>KLAVESNICE (~42% obrazovky)</text>

        {/* Keyboard rows */}
        {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map(function(row, ri) {
          var keyW = ri === 2 ? 18 : 16;
          var startX = px + P + (IW - row.length * (keyW + 2)) / 2;
          var rowY = kbY + 18 + ri * 28;
          return (
            <g key={"kr" + ri}>
              {row.split("").map(function(key, ki) {
                var kx = startX + ki * (keyW + 2);
                return (
                  <g key={"k" + ki}>
                    <rect x={kx} y={rowY} width={keyW} height={22} rx={3} fill="#fff" stroke="#bbb" strokeWidth={0.5} />
                    <text x={kx + keyW / 2} y={rowY + 14} textAnchor="middle" style={{ fontSize: 8, fontFamily: FONT, fill: "#333" }}>{key}</text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Space bar */}
        <rect x={px+P+30} y={kbY+18+3*28} width={IW-60} height={22} rx={5} fill="#fff" stroke="#bbb" strokeWidth={0.5} />
        <text x={px+P+IW/2} y={kbY+18+3*28+14} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: "#bbb" }}>space</text>

        {/* Annotation arrows */}
        <line x1={px+P+IW+8} y1={cY+visH/2} x2={px+P+IW+18} y2={cY+visH/2} stroke="#999" strokeWidth={0.5} />
        <text x={px+P+IW+20} y={cY+visH/2+3} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>viditelny text</text>

        <line x1={px+P+IW+8} y1={toolY+12} x2={px+P+IW+18} y2={toolY+12} stroke="#c89030" strokeWidth={0.5} />
        <text x={px+P+IW+20} y={toolY+15} style={{ fontSize: 5, fontFamily: FONT, fill: "#c89030" }}>mini toolbar</text>

        <line x1={px+P+IW+8} y1={kbY+kbH/2} x2={px+P+IW+18} y2={kbY+kbH/2} stroke="#999" strokeWidth={0.5} />
        <text x={px+P+IW+20} y={kbY+kbH/2+3} style={{ fontSize: 5, fontFamily: FONT, fill: "#999" }}>klavesnice 42%</text>
      </g>
    );
  }

  return (
    <g key={id} onClick={function(e) { e.stopPropagation(); onSel(id); }} style={{ cursor: "pointer" }}>
      <text x={px + W/2} y={py - 18} textAnchor="middle" style={{ fontSize: 10, fontFamily: FONT, fill: active ? "#222" : "#888", fontWeight: 700 }}>{title}</text>
      <text x={px + W/2} y={py - 6} textAnchor="middle" style={{ fontSize: 7, fontFamily: FONT, fill: scoreClr }}>{score}</text>
      <rect x={px} y={py} width={W} height={H} rx={20} fill="#fff" stroke={active ? "#333" : "#bbb"} strokeWidth={active ? 2.5 : 1.5} />
      <rect x={px + W/2 - 30} y={py + 2} width={60} height={12} rx={6} fill="#e8e5dd" />
      {id !== "vfk" ? drawHeader(px + P, hY, IW) : null}
      {content}
      {id !== "vfk" ? drawNav(px + P, nY, IW) : null}
      <rect x={px + W/2 - 25} y={py + H - 8} width={50} height={3} rx={2} fill="#ddd" />
    </g>
  );
}

export default function App() {
  var panState = useState({ x: 20, y: 40 });
  var pan = panState[0];
  var setPan = panState[1];
  var zoomState = useState(0.72);
  var zoom = zoomState[0];
  var setZoom = zoomState[1];
  var dragState = useState(false);
  var dragging = dragState[0];
  var setDragging = dragState[1];
  var selState = useState("_intro");
  var selected = selState[0];
  var setSelected = selState[1];
  var moveState = useState(false);
  var didMove = moveState[0];
  var setDidMove = moveState[1];
  var dragStart = useRef({ x: 0, y: 0 });
  var panRef = useRef(pan);
  var pinchRef = useRef(null);
  var cRef = useRef(null);

  useEffect(function() { panRef.current = pan; }, [pan]);
  useEffect(function() {
    var el = cRef.current;
    if (!el) return;
    var h = function(e) { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(function(z) { return Math.min(Math.max(z * (e.deltaY > 0 ? 0.92 : 1.08), 0.25), 3); }); } };
    el.addEventListener("wheel", h, { passive: false });
    return function() { el.removeEventListener("wheel", h); };
  }, []);
  useEffect(function() {
    var el = cRef.current;
    if (!el) return;
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
  function onNodeSel(id) { if (!didMove) setSelected(id === selected ? null : id); }

  var desc = selected ? DESC[selected] : null;
  var GAP = 250;
  var phones = [
    { id: "va", t: "A) JOURNAL", s: "14/20", c: "#4a7a4a", row: 0, col: 0 },
    { id: "vb", t: "B) ACTION", s: "11/20", c: "#c89030", row: 0, col: 1 },
    { id: "vc", t: "C) DASHBOARD", s: "10/20", c: "#4a6a8a", row: 0, col: 2 },
    { id: "vd", t: "D) SPLIT", s: "10/20", c: "#7a5aaa", row: 0, col: 3 },
    { id: "ve", t: "E) HYBRID A+D", s: "16/20", c: "#888", row: 0, col: 4 },
    { id: "vf", t: "F) NOTION EDITOR", s: "FINALNI ★", c: "#b05020", row: 1, col: 0 },
    { id: "vfk", t: "F) S KLAVESNICI", s: "FINALNI ★", c: "#b05020", row: 1, col: 1 },
  ];

  return (
    <div ref={cRef} style={{ width: "100%", height: "100vh", background: "#faf9f6", fontFamily: FONT, position: "relative", overflow: "hidden", touchAction: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "8px 14px", background: "rgba(250,249,246,0.92)", borderBottom: "1px solid #e0ddd5", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>POROVNANI VARIANT</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={function() { setSelected("_intro"); }} style={{ fontSize: 9, padding: "4px 10px", background: "#333", color: "#faf9f6", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: FONT }}>INFO</button>
          <span style={{ fontSize: 10, color: "#888" }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 20, right: desc ? 480 : 16, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
        <button onClick={function() { setZoom(Math.min(zoom * 1.2, 3)); }} style={{ width: 38, height: 38, background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 18, cursor: "pointer" }}>+</button>
        <button onClick={function() { setZoom(Math.max(zoom * 0.8, 0.25)); }} style={{ width: 38, height: 38, background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 18, cursor: "pointer" }}>-</button>
        <button onClick={function() { setPan({ x: 20, y: 40 }); setZoom(0.72); }} style={{ width: 38, height: 38, background: "#2a2a2a", color: "#faf9f6", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>R</button>
      </div>
      <svg width="100%" height="100%" style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU} onClick={onSvgClick} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="0.5" fill="#ddd" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g transform={"translate(" + pan.x + "," + pan.y + ") scale(" + zoom + ")"}>
          {phones.map(function(p, i) {
            var phoneX = p.col * GAP;
            var phoneY = 40 + p.row * 520;
            return drawPhone(phoneX, phoneY, p.id, p.t, p.s, p.c, selected, onNodeSel);
          })}

          {/* Row separator */}
          <text x={0} y={530} style={{ fontSize: 11, fontFamily: FONT, fill: "#b05020", fontWeight: 700, letterSpacing: "0.1em" }}>VARIANTA F — NOTION-STYLE EDITOR (narativ primo v editoru)</text>
          <line x1={0} y1={536} x2={500} y2={536} stroke="#b05020" strokeWidth={1} strokeDasharray="4 3" />

          {/* Matrix at bottom */}
          <rect x={0} y={1080} width={560} height={18} rx={2} fill="#2a2a2a" />
          <text x={8} y={1092} style={{ fontSize: 7, fontFamily: FONT, fill: "#faf9f6", fontWeight: 600 }}>Priorita</text>
          <text x={120} y={1092} style={{ fontSize: 7, fontFamily: FONT, fill: "#faf9f6", fontWeight: 600 }}>A</text>
          <text x={208} y={1092} style={{ fontSize: 7, fontFamily: FONT, fill: "#faf9f6", fontWeight: 600 }}>B</text>
          <text x={296} y={1092} style={{ fontSize: 7, fontFamily: FONT, fill: "#faf9f6", fontWeight: 600 }}>C</text>
          <text x={384} y={1092} style={{ fontSize: 7, fontFamily: FONT, fill: "#faf9f6", fontWeight: 600 }}>D</text>
          <text x={472} y={1092} style={{ fontSize: 7, fontFamily: FONT, fill: "#faf9f6", fontWeight: 600 }}>E</text>
          <text x={530} y={1092} style={{ fontSize: 7, fontFamily: FONT, fill: "#fa8", fontWeight: 600 }}>F</text>
          {[
            ["1. Historie", "5", "2", "1", "1", "4", "5"],
            ["2. Akce", "3", "5", "4", "5", "3", "3"],
            ["3. Kontext", "2", "2", "5", "3", "3", "3"],
            ["4. Vysledek", "3", "4", "4", "5", "5", "4"],
            ["5. Narativ", "1", "1", "1", "1", "1", "5"],
            ["CELKEM", "14", "14", "15", "15", "16", "20"],
          ].map(function(row, ri) {
            var ry = 1102 + ri * 18;
            var isLast = ri === 5;
            var isNarativ = ri === 4;
            return (
              <g key={ri}>
                <rect x={0} y={ry} width={560} height={16} fill={isLast ? "#e8e5dd" : isNarativ ? "#fdf5ee" : ri % 2 === 0 ? "#faf9f6" : "#f5f3ee"} />
                <text x={8} y={ry + 11} style={{ fontSize: 6.5, fontFamily: FONT, fill: isNarativ ? "#b05020" : "#222", fontWeight: isLast || isNarativ ? 700 : 400 }}>{row[0]}</text>
                <text x={120} y={ry + 11} style={{ fontSize: 6.5, fontFamily: FONT, fill: "#666" }}>{row[1]}</text>
                <text x={208} y={ry + 11} style={{ fontSize: 6.5, fontFamily: FONT, fill: "#666" }}>{row[2]}</text>
                <text x={296} y={ry + 11} style={{ fontSize: 6.5, fontFamily: FONT, fill: "#666" }}>{row[3]}</text>
                <text x={384} y={ry + 11} style={{ fontSize: 6.5, fontFamily: FONT, fill: "#666" }}>{row[4]}</text>
                <text x={472} y={ry + 11} style={{ fontSize: 6.5, fontFamily: FONT, fill: "#666" }}>{row[5]}</text>
                <text x={530} y={ry + 11} style={{ fontSize: isLast ? 8 : 6.5, fontFamily: FONT, fill: isLast ? "#b05020" : isNarativ ? "#b05020" : "#666", fontWeight: isLast || isNarativ ? 700 : 400 }}>{row[6]}</text>
              </g>
            );
          })}
          <rect x={524} y={1080} width={40} height={18 + 6 * 18} fill="none" stroke="#b05020" strokeWidth={2.5} strokeDasharray="4 2" />

          {/* Recommendation box */}
          <rect x={580} y={1080} width={300} height={130} rx={6} fill="#fdf5ee" stroke="#b05020" strokeWidth={2} />
          <text x={590} y={1098} style={{ fontSize: 10, fontFamily: FONT, fill: "#7a3010", fontWeight: 700 }}>NOVY VITEZ: F) NOTION EDITOR</text>
          <text x={590} y={1114} style={{ fontSize: 7, fontFamily: FONT, fill: "#7a3010" }}>20/20 (s narativem jako novou prioritou)</text>
          <text x={590} y={1134} style={{ fontSize: 7, fontFamily: FONT, fill: "#b05020" }}>Pribeh = hlavni obsah (ne karty)</text>
          <text x={590} y={1146} style={{ fontSize: 7, fontFamily: FONT, fill: "#b05020" }}>Mechaniky = inline bloky v textu</text>
          <text x={590} y={1158} style={{ fontSize: 7, fontFamily: FONT, fill: "#b05020" }}>Klavesnice = mini toolbar nad ni</text>
          <text x={590} y={1170} style={{ fontSize: 7, fontFamily: FONT, fill: "#b05020" }}>Sceny = kapitoly v deniku</text>
          <text x={590} y={1186} style={{ fontSize: 7, fontFamily: FONT, fill: "#b05020" }}>Pozor: vyzaduje dobrou mobilni UX</text>
          <text x={590} y={1198} style={{ fontSize: 7, fontFamily: FONT, fill: "#b05020" }}>pro psani (klavesnice = klicovy stav)</text>
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
