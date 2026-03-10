import{r as c,j as o}from"./index-DTSop0CP.js";const M={_intro:{title:"AI Našeptávač — Koncept",text:`Našeptávač je AI asistent, který po hodu na Meaning Tables jemně nahodí 2–3 poetické střípky, co by výsledek mohl evokovat.

Jako nápověda v divadle — neříká co to JE, jen šeptá možnosti. Hráč si vybere jestli ho to inspiruje nebo ne.

KLÍČOVÉ PRINCIPY:
• Appka funguje úplně stejně i bez něj
• Výsledek hodu se zobrazí okamžitě (žádné čekání na AI)
• AI jede async na pozadí
• Bez API klíče se nic nestane, žádný error
• Hráč rozhoduje co to znamená, ne AI

STAV: Brainstorming. Nic není implementováno. Tento diagram slouží k diskuzi a plánování.`},meaning_sheet:{title:"Meaning Sheet",text:`Stávající bottom sheet pro Meaning Tables. Hráč vybere tabulku (Actions / Descriptions / obě) a hodí 2× d100.

NOVÉ: Přibude volitelný selektor kontextu — pomůže AI lépe zaměřit návrhy.

Kontext NENÍ povinný. Bez něj AI dostane jen holá slova. S kontextem ví jestli hráč hledá inspiraci pro terén, postavu, událost nebo předmět.

Sheet zůstává jednoduchý. Kontext je jen řada chipů, ne nový formulář.`},kontext:{title:"Kontext (volitelný)",text:`Řada chipů/tlačítek v Meaning Sheet:
• terén — krajina, místo, počasí
• postava — NPC, chování, vzhled
• událost — co se stane, zápletka
• předmět — věc, nález, poklad
• (volný text) — hráč napíše vlastní kontext

Výchozí stav: nic není vybráno. AI pak dostane jen slova bez kontextu — pořád funguje, jen méně zaměřeně.

Kontext se NEUKLÁDÁ do deníku. Je to jen vstup pro AI.`},hod:{title:"Hod 2× d100",text:`Standardní mechanika Meaning Tables — dvě d100 kostky, každá vybere jedno slovo z tabulky.

Tady se nic nemění. Hod funguje přesně jako teď.

Výsledek (dvě slova) se zobrazí OKAMŽITĚ. Hráč nemusí čekat na AI.`},vysledek:{title:"Výsledek — zobrazí se hned",text:`Klíčový designový princip: výsledek hodu (dvě slova) se zobrazí OKAMŽITĚ.

Hráč nečeká na AI. Vidí "Remarkable + Small" a může rovnou přemýšlet. AI střípky se objeví async pod výsledkem, až budou ready.

Pokud AI klíč neexistuje → výsledek je finální, žádný loading, žádný placeholder. Appka se chová přesně jako teď.

Pokud AI klíč existuje → pod výsledkem se objeví jemný loading indikátor (tři tečky? fade?) a po 1–2 sekundách se zobrazí střípky.`},async_label:{title:"Async volání",text:`Pokud hráč má nastavený API klíč, po zobrazení výsledku se na pozadí spustí volání Claude API.

Klíčové: NIKDY neblokuje UI. Hráč může rovnou kliknout "Vložit do deníku" a střípky ignorovat. Nebo počkat 1–2 sekundy.

Pokud API selže (timeout, chyba, limit) → tiše se skryje. Žádný error dialog. Našeptávač prostě nepřijde.`},api_call:{title:"Claude API — volání",text:`Přímý fetch na Anthropic Messages API.

VSTUP (co se posílá):
• Systémový prompt (pravidla pro AI — viz uzel "Systémový prompt")
• Hodená slova (např. "Remarkable + Small")
• Kontext kategorie (terén/postava/událost/předmět)
• Název aktuální scény
• Posledních N zápisů z deníku (kontext příběhu)
• Svět = Mausritter (myší fantasy)

VÝSTUP:
• 2–3 krátké poetické střípky (5–10 slov každý)
• Formát: prostý text, jeden střípek na řádek

PARAMETRY:
• max_tokens: ~100
• temperature: ~0.9 (kreativní)
• Jeden dotaz ≈ 200 input + 50 output tokenů

CORS OTÁZKA:
Anthropic API možná nepovoluje volání přímo z browseru. Pokud ne → potřebujeme jednoduchý proxy. Tohle musíme ověřit.`},sys_prompt:{title:"Systémový prompt",text:`Draft systémového promptu pro AI:

"Jsi tichý našeptávač pro sólové RPG zasazené do světa Mausritter — fantasy světa inteligentních myší.

Hráč hodil na tabulku významu a padla mu dvě slova. Tvůj úkol: nahoď 2–3 krátké poetické střípky (5–10 slov), co by ta slova MOHLA evokovat v daném kontextu.

Pravidla:
- Neříkej co to JE. Jen šeptej co by to mohlo být.
- Buď konkrétní a smyslový (zvuky, barvy, textury).
- Respektuj myší měřítko (žalud = balvan, kočka = drak).
- Piš česky.
- Žádné úvody, žádné vysvětlování. Jen střípky.
- Každý střípek na vlastní řádek."

OTEVŘENÉ: Prompt bude potřeba iterovat a testovat. Tohle je první draft.`},kontext_deniku:{title:"Kontext z deníku",text:`Aby AI věděl co se ve hře děje, posíláme mu kontext z deníku.

CO POSÍLAT:
• Název aktuální scény
• Posledních N zápisů (texty, fate výsledky, combat logy...)
• Jméno postavy, aktuální lokace?

OTEVŘENÉ OTÁZKY:
• Kolik zápisů? 5? 10? Celou aktuální scénu?
• Víc kontextu = lepší návrhy, ale víc tokenů = dražší
• Posílat i NPC seznam? Thread seznam?
• Jak formátovat zápisy pro AI? (raw text, strukturovaný?)

CENOVÝ DOPAD:
• Každých 100 tokenů kontextu ≈ +$0.000025 (Haiku)
• 10 zápisů ≈ 500 tokenů ≈ zanedbatelné
• Celá scéna (50 zápisů) ≈ 2500 tokenů ≈ pořád levné`},naseptavac:{title:"💭 Našeptávač — výstup",text:`Jádro celé featury. Pod výsledkem hodu se objeví 2–3 krátké poetické střípky.

PŘÍKLAD:
🔮 Remarkable + Small
💭 křišťálová dutina v kořenu
💭 svítící kapka na pavučině
💭 kamenný kruh menší než dlaň

VIZUÁLNÍ STYL (k diskuzi):
• Kurzíva, tlumená barva (C.muted nebo C.purple?)
• Čárkovaný border? Nebo jen odsazení?
• Fade-in animace? (subtle, ne flashy)
• Ikonka 💭 před každým střípkem

INTERAKCE:
• Klik na střípek → označí ho pro uložení do deníku
• Klik na "Vložit" → MeaningBlock + vybraný střípek
• Nebo prostě "Vložit" bez výběru → jen slova jako teď`},ulozit:{title:"Uložit s inspirací",text:`Hráč klikne na střípek, který ho zaujal. Ten se přidá do MeaningBlock v deníku.

VÝSLEDEK V DENÍKU:
🔮 Remarkable + Small
💭 křišťálová dutina v kořenu

Střípek je vizuálně odlišený (kurzíva, menší, tlumená barva) — jasně viditelné že to je inspirace, ne výsledek hodu.

Hráč může vybrat max 1 střípek? Nebo víc? K diskuzi.`},ignorovat:{title:"Ignorovat — jen slova",text:`Hráč klikne "Vložit do deníku" bez výběru střípku. Do deníku se uloží jen hodená slova, přesně jako teď.

🔮 Remarkable + Small

Našeptávač splnil svou roli — pomohl hráči přemýšlet. Ale hráč se rozhodl jinak a to je v pořádku.

Tohle je výchozí chování. Našeptávač nikdy nic nenutí.`},denik_s:{title:"MeaningBlock s inspirací",text:`Rozšířený MeaningBlock v deníku. Obsahuje hodená slova + vybraný střípek.

Příklad:
🔮 Remarkable + Small
💭 křišťálová dutina v kořenu

Střípek se uloží do game.entries[] jako součást meaning bloku — nové pole "inspirace" nebo podobně.

DATOVÝ MODEL (draft):
{
  type: "meaning",
  text: "Remarkable + Small",
  inspirace: "křišťálová dutina v kořenu"  // nové, volitelné
}`},denik_bez:{title:"MeaningBlock bez inspirace",text:`Standardní MeaningBlock — přesně jako teď.

🔮 Remarkable + Small

Žádná změna v datovém modelu. Pole "inspirace" je undefined/null.`},nastaveni:{title:"⚙️ Nastavení — API klíč",text:`Nová sekce v UI kde hráč vloží svůj Anthropic API klíč.

KDE V UI:
• Svět tab → Nastavení? Nebo vlastní tab?
• Nebo ikonka ⚙️ v headeru?
• K diskuzi — nechceme to schovat příliš hluboko

ULOŽENÍ:
• localStorage (jako zbytek appky)
• Plain text (šifrování bez serveru = security theater)
• Klíč: "solorpg_api_key" nebo uvnitř game objektu?

VALIDACE:
• Po vložení klíče → zkušební API call?
• Nebo prostě uložit a zjistit při prvním hodu?

BEZ KLÍČE:
• Žádný našeptávač, žádný loading, žádný error
• Appka se chová přesně jako teď
• Ani zmínka o AI v UI (nebo jemný hint v nastavení?)`},model:{title:"Volba modelu",text:`Který Claude model použít:

HAIKU (claude-haiku-4-5-20251001):
• Nejrychlejší (~0.5s odpověď)
• Nejlevnější ($0.25/M input, $1.25/M output)
• Pro krátké poetické střípky asi stačí
• 100 hodů ≈ 1 cent

SONNET (claude-sonnet-4-6-20250514):
• Lepší kvalita, kreativnější
• Pomalejší (~1-2s)
• Dražší ($3/M input, $15/M output)
• 100 hodů ≈ 10 centů

OTÁZKA: Dát hráči na výběr? Nebo hardcoded Haiku?
Pro začátek asi Haiku — rychlost je důležitá pro plynulost hry.`},bez_klice:{title:"Bez API klíče",text:`Když hráč nemá nastavený API klíč, appka se chová PŘESNĚ jako teď.

• Meaning Sheet funguje normálně
• Žádný loading indikátor
• Žádná zmínka o AI
• Žádný error, žádný warning

Našeptávač je čistě opt-in. Hráč se o něm dozví z nastavení, nebo z nápovědy.

Tohle je důležité — appka nesmí vypadat "rozbitě" bez API klíče. AI vrstva je bonus, ne základ.`}},z={flow_start:{fill:"#faf9f6",stroke:"#555",textFill:"#333",fontWeight:700,rx:8,fontSize:11},flow:{fill:"#faf9f6",stroke:"#888",textFill:"#444",fontWeight:500,rx:6,fontSize:10},flow_action:{fill:"#e8e5dd",stroke:"#555",textFill:"#222",fontWeight:700,rx:6,fontSize:11},flow_result:{fill:"#2a2a2a",stroke:"#2a2a2a",textFill:"#faf9f6",fontWeight:700,rx:6,fontSize:11},ai_core:{fill:"#3a2a4a",stroke:"#7a5aaa",textFill:"#faf9f6",fontWeight:700,rx:6,fontSize:11},ai_input:{fill:"#f5f3fa",stroke:"#9a8aba",textFill:"#4a3a6a",fontWeight:500,rx:4,fontSize:9.5},ai_output:{fill:"#f0ecf8",stroke:"#7a5aaa",textFill:"#3a2a5a",fontWeight:700,rx:8,fontSize:11},output_yes:{fill:"#dde8dd",stroke:"#4a7a4a",textFill:"#2a4a2a",fontWeight:600,rx:6,fontSize:10},output_no:{fill:"#faf9f6",stroke:"#bbb",textFill:"#888",fontWeight:500,rx:6,fontSize:10},denik:{fill:"#faf9f6",stroke:"#999",textFill:"#555",fontWeight:500,rx:4,fontSize:9},config:{fill:"#faf9f6",stroke:"#c89030",textFill:"#6a4a10",fontWeight:600,rx:4,fontSize:9.5},config_note:{fill:"#faf9f6",stroke:"#ddd",textFill:"#aaa",fontWeight:500,rx:4,fontSize:9},sublabel:{fill:"transparent",stroke:"none",textFill:"#999",fontWeight:400,rx:0,fontSize:8.5}},S=[{id:"grp_player",type:"group",label:"HRACOVA AKCE",x:235,y:42,w:270,h:290},{id:"grp_ai",type:"group",label:"AI VRSTVA (async, volitena)",x:15,y:400,w:505,h:220},{id:"grp_output",type:"group",label:"VYSTUP DO DENIKU",x:195,y:655,w:380,h:155},{id:"meaning_sheet",type:"flow_start",label:`MEANING SHEET
Hrac otevre tabulky`,x:270,y:65,w:200,h:48},{id:"kontext",type:"flow",label:`Kontext (volitelny)
teren · postava · udalost · predmet`,x:252,y:148,w:236,h:42},{id:"hod",type:"flow_action",label:`HOD 2× d100
→ dve slova`,x:305,y:228,w:130,h:42},{id:"vysledek",type:"flow_result",label:`VYSLEDEK
zobrazi se OKAMZITE`,x:265,y:310,w:210,h:48},{id:"async_label",type:"sublabel",label:"async · pokud existuje API klic",x:270,y:375,w:200,h:18},{id:"api_call",type:"ai_core",label:`CLAUDE API
async na pozadi`,x:265,y:475,w:210,h:48},{id:"naseptavac",type:"ai_output",label:`💭 NASEPTAVAC
2–3 poeticke stripky`,x:255,y:570,w:230,h:52},{id:"sys_prompt",type:"ai_input",label:`Systemovy prompt
pravidla pro AI`,x:30,y:450,w:180,h:42},{id:"kontext_deniku",type:"ai_input",label:`Kontext z deniku
poslednich N zapisu`,x:30,y:530,w:180,h:42},{id:"nastaveni",type:"config",label:`⚙️ NASTAVENI
API klic hrace`,x:565,y:65,w:155,h:40},{id:"model",type:"config",label:`Model
Haiku · Sonnet`,x:565,y:475,w:140,h:38},{id:"bez_klice",type:"config_note",label:`Bez klice =
funguje jako ted
zadny error`,x:555,y:560,w:155,h:50},{id:"ulozit",type:"output_yes",label:`Klik na stripek
→ ulozi inspiraci`,x:215,y:680,w:165,h:42},{id:"ignorovat",type:"output_no",label:`Ignorovat
→ jen slova`,x:415,y:680,w:140,h:42},{id:"denik_s",type:"denik",label:"🔮 Slova + 💭",x:222,y:755,w:150,h:34},{id:"denik_bez",type:"denik",label:"🔮 Jen slova",x:425,y:755,w:120,h:34}],T=[{from:"meaning_sheet",fromSide:"bottom",to:"kontext",toSide:"top",style:"solid"},{from:"kontext",fromSide:"bottom",to:"hod",toSide:"top",style:"solid"},{from:"hod",fromSide:"bottom",to:"vysledek",toSide:"top",style:"solid"},{from:"vysledek",fromSide:"bottom",to:"api_call",toSide:"top",style:"dashed"},{from:"api_call",fromSide:"bottom",to:"naseptavac",toSide:"top",style:"dashed"},{from:"naseptavac",fromSide:"bottom",to:"ulozit",toSide:"top",style:"solid"},{from:"naseptavac",fromSide:"bottom",to:"ignorovat",toSide:"top",style:"solid"},{from:"ulozit",fromSide:"bottom",to:"denik_s",toSide:"top",style:"solid"},{from:"ignorovat",fromSide:"bottom",to:"denik_bez",toSide:"top",style:"solid"},{from:"sys_prompt",fromSide:"right",to:"api_call",toSide:"left",style:"dashed"},{from:"kontext_deniku",fromSide:"right",to:"api_call",toSide:"left",style:"dashed"},{from:"model",fromSide:"left",to:"api_call",toSide:"right",style:"dashed"}];function A(e,l){const r=e.x+e.w/2,d=e.y+e.h/2;switch(l){case"top":return{x:r,y:e.y};case"bottom":return{x:r,y:e.y+e.h};case"left":return{x:e.x,y:d};case"right":return{x:e.x+e.w,y:d};default:return{x:r,y:d}}}function K({edge:e,nodes:l}){const r=l.find(s=>s.id===e.from),d=l.find(s=>s.id===e.to);if(!r||!d)return null;const a=A(r,e.fromSide),n=A(d,e.toSide),i=e.fromSide,p=e.toSide;let u;if(i==="bottom"&&p==="top"){const s=(a.y+n.y)/2;u=`M${a.x},${a.y} L${a.x},${s} L${n.x},${s} L${n.x},${n.y}`}else if(i==="right"&&p==="left"){const s=(a.x+n.x)/2;u=`M${a.x},${a.y} L${s},${a.y} L${s},${n.y} L${n.x},${n.y}`}else if(i==="left"&&p==="right"){const s=(a.x+n.x)/2;u=`M${a.x},${a.y} L${s},${a.y} L${s},${n.y} L${n.x},${n.y}`}else u=`M${a.x},${a.y} L${n.x},${a.y} L${n.x},${n.y}`;const k=e.style==="solid"?"#555":"#aaa";return o.jsxs("g",{children:[o.jsx("path",{d:u,fill:"none",stroke:k,strokeWidth:1.4,strokeDasharray:e.style==="dashed"?"6 4":"none"}),o.jsx(C,{x:n.x,y:n.y,side:e.toSide,color:k})]})}function C({x:e,y:l,side:r,color:d}){const n={left:`${e},${l} ${e+6},${l-3} ${e+6},${l+3}`,right:`${e},${l} ${e-6},${l-3} ${e-6},${l+3}`,top:`${e},${l} ${e-3},${l+6} ${e+3},${l+6}`,bottom:`${e},${l} ${e-3},${l-6} ${e+3},${l-6}`};return n[r]?o.jsx("polygon",{points:n[r],fill:d}):null}function L({node:e,selected:l,onSelect:r}){const d=M[e.id],a=l===e.id,n=!!d;if(e.type==="group")return o.jsxs("g",{onClick:n?f=>{f.stopPropagation(),r(e.id)}:void 0,style:{cursor:n?"pointer":"default"},children:[o.jsx("rect",{x:e.x,y:e.y,width:e.w,height:e.h,fill:a?"rgba(100,100,200,0.06)":"none",stroke:a?"#666":"#ccc",strokeWidth:a?1.5:1,strokeDasharray:"6 3",rx:6}),o.jsx("text",{x:e.x+e.w/2,y:e.y-6,textAnchor:"middle",style:{fontSize:9.5,fontFamily:"'IBM Plex Mono', monospace",fill:a?"#555":"#999",fontWeight:600,letterSpacing:"0.08em"},children:e.label})]});const i=z[e.type]||z.flow,p=e.label.split(`
`),u=i.fontSize||10,k=u+3.5,s=p.length*k,m=e.y+e.h/2-s/2+k*.72,h=a?i.fill.startsWith("#2")||i.fill.startsWith("#3")||i.fill.startsWith("#4")?"#8888cc":"#555":i.stroke,x=a?2.5:1.2;return o.jsxs("g",{onClick:n?f=>{f.stopPropagation(),r(e.id)}:void 0,style:{cursor:n?"pointer":"default"},children:[i.stroke!=="none"&&o.jsx("rect",{x:e.x,y:e.y,width:e.w,height:e.h,fill:i.fill,stroke:h,strokeWidth:x,rx:i.rx}),p.map((f,b)=>o.jsx("text",{x:e.x+e.w/2,y:m+b*k,textAnchor:"middle",style:{fontSize:u,fontFamily:"'IBM Plex Mono', monospace",fill:i.textFill,fontWeight:b===0?i.fontWeight:Math.min(i.fontWeight,500),letterSpacing:"0.02em"},children:f},b))]})}function D({descId:e,onClose:l}){const r=M[e];return r?o.jsxs("div",{style:{position:"absolute",top:0,right:0,bottom:0,width:"min(460px, 88vw)",background:"#faf9f6",borderLeft:"2px solid #7a5aaa",zIndex:20,display:"flex",flexDirection:"column",boxShadow:"-4px 0 20px rgba(0,0,0,0.08)"},children:[o.jsxs("div",{style:{padding:"14px 18px",borderBottom:"1px solid #e0ddd5",display:"flex",justifyContent:"space-between",alignItems:"flex-start"},children:[o.jsx("h2",{style:{margin:0,fontSize:14,fontWeight:700,color:"#222",fontFamily:"'IBM Plex Mono', monospace",lineHeight:1.3,paddingRight:12},children:r.title}),o.jsx("button",{onClick:l,style:{background:"#3a2a4a",color:"#faf9f6",border:"none",borderRadius:4,width:30,height:30,fontSize:15,cursor:"pointer",flexShrink:0,fontFamily:"'IBM Plex Mono', monospace",display:"flex",alignItems:"center",justifyContent:"center"},children:"✕"})]}),o.jsx("div",{style:{padding:"14px 18px",overflowY:"auto",flex:1},children:r.text.split(`

`).map((d,a)=>o.jsx("p",{style:{margin:"0 0 12px 0",fontSize:12.5,lineHeight:1.65,color:"#444",fontFamily:"'IBM Plex Mono', monospace",whiteSpace:"pre-wrap"},children:d},a))})]}):null}function I(e,l){return Math.sqrt((e.clientX-l.clientX)**2+(e.clientY-l.clientY)**2)}function O(){const[e,l]=c.useState({x:0,y:0}),[r,d]=c.useState(1),[a,n]=c.useState(!1),[i,p]=c.useState("_intro"),[u,k]=c.useState(!1),s=c.useRef({x:0,y:0}),m=c.useRef(e),h=c.useRef(null),x=c.useRef(null);c.useEffect(()=>{m.current=e},[e]),c.useEffect(()=>{const t=x.current;if(!t)return;const v=y=>{(y.ctrlKey||y.metaKey)&&(y.preventDefault(),d(_=>Math.min(Math.max(_*(y.deltaY>0?.92:1.08),.3),3)))};return t.addEventListener("wheel",v,{passive:!1}),()=>t.removeEventListener("wheel",v)},[]),c.useEffect(()=>{const t=x.current;if(!t)return;const v=y=>{y.touches.length>1&&y.preventDefault()};return t.addEventListener("touchmove",v,{passive:!1}),()=>t.removeEventListener("touchmove",v)},[]);const f=t=>{k(!1),t.touches.length===1?(n(!0),s.current={x:t.touches[0].clientX-m.current.x,y:t.touches[0].clientY-m.current.y}):t.touches.length===2&&(n(!1),h.current={dist:I(t.touches[0],t.touches[1]),zoom:r})},b=t=>{k(!0),t.touches.length===1&&a?l({x:t.touches[0].clientX-s.current.x,y:t.touches[0].clientY-s.current.y}):t.touches.length===2&&h.current&&d(Math.min(Math.max(h.current.zoom*(I(t.touches[0],t.touches[1])/h.current.dist),.3),3))},P=()=>{n(!1),h.current=null},N=t=>{t.button===0&&(n(!0),k(!1),s.current={x:t.clientX-e.x,y:t.clientY-e.y})},w=t=>{a&&(k(!0),l({x:t.clientX-s.current.x,y:t.clientY-s.current.y}))},j=()=>n(!1),$=()=>{u||p(null)},E=t=>{u||p(t===i?null:t)},g={width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",background:"#3a2a4a",color:"#faf9f6",border:"none",borderRadius:6,fontSize:18,fontFamily:"'IBM Plex Mono', monospace",cursor:"pointer",WebkitTapHighlightColor:"transparent",userSelect:"none"};return o.jsxs("div",{ref:x,style:{width:"100%",height:"100vh",background:"#faf9f6",fontFamily:"'IBM Plex Mono', monospace",position:"relative",overflow:"hidden",touchAction:"pan-y"},children:[o.jsx("link",{href:"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700;800&display=swap",rel:"stylesheet"}),o.jsxs("div",{style:{position:"absolute",top:0,left:0,right:0,padding:"8px 14px",background:"rgba(250,249,246,0.92)",backdropFilter:"blur(8px)",borderBottom:"1px solid #e0ddd5",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:10},children:[o.jsx("span",{style:{fontSize:12,fontWeight:600,color:"#3a2a4a",letterSpacing:"0.05em"},children:"AI NASEPTAVAC — KONCEPT"}),o.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[o.jsx("button",{onClick:()=>p("_intro"),style:{fontSize:9,padding:"4px 10px",background:i==="_intro"?"#5a4a6a":"#3a2a4a",color:"#faf9f6",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontWeight:600},children:"i O PROJEKTU"}),o.jsxs("span",{style:{fontSize:10,color:"#888"},children:[Math.round(r*100),"%"]})]})]}),o.jsxs("div",{style:{position:"absolute",bottom:20,right:i?"min(476px, calc(88vw + 16px))":16,display:"flex",flexDirection:"column",gap:6,zIndex:10,transition:"right 0.2s"},children:[o.jsx("button",{onClick:()=>d(t=>Math.min(t*1.2,3)),style:g,children:"+"}),o.jsx("button",{onClick:()=>d(t=>Math.max(t*.8,.3)),style:g,children:"-"}),o.jsx("button",{onClick:()=>{l({x:0,y:0}),d(1)},style:{...g,fontSize:11},children:"↺"})]}),o.jsxs("svg",{width:"100%",height:"100%",style:{cursor:a?"grabbing":"grab",touchAction:"none"},onMouseDown:N,onMouseMove:w,onMouseUp:j,onMouseLeave:j,onClick:$,onTouchStart:f,onTouchMove:b,onTouchEnd:P,children:[o.jsx("defs",{children:o.jsx("pattern",{id:"grid",width:"30",height:"30",patternUnits:"userSpaceOnUse",children:o.jsx("circle",{cx:"15",cy:"15",r:"0.5",fill:"#ddd"})})}),o.jsx("rect",{width:"100%",height:"100%",fill:"url(#grid)"}),o.jsxs("g",{transform:`translate(${e.x}, ${e.y}) scale(${r})`,children:[T.map((t,v)=>o.jsx(K,{edge:t,nodes:S},v)),S.map(t=>o.jsx(L,{node:t,selected:i,onSelect:E},t.id))]})]}),o.jsx("div",{style:{position:"absolute",bottom:6,left:14,fontSize:9,color:"#bbb"},children:"KLIKNI NA BLOK PRO DETAIL · TAHNI · PINCH ZOOM · CTRL+SCROLL"}),i&&o.jsx(D,{descId:i,onClose:()=>p(null)})]})}export{O as default};
