# Gameplay Log — Okřál Trnka

Pozorovatelský log hry. Zaznamenává průběh, chyby agenta, korekce hráče a poučení.

---

## Scéna 2 — Příchod do Ořechové Tvrze (den 1, ráno)
- **Co se stalo:** Okřál přišel do osady, v hostinci potkal vyděšenou Babičku Lísku (prchala), hostinský nabídl 50 ďobků za nalezení 3 zmizelých sběračů.
- **Mechaniky:** Fate questions, meaning tables, NPC behavior.
- **Chyby agenta:** Žádné zjištěné.
- **Bookkeeping:** OK.

## Scéna 3 — Cesta do Černého hvozdu (den 1, ráno/poledne)
- **Co se stalo:** INTERRUPT. Okřál zachránil Řebříka před obří stonožkou. Řebřík prozradil info o sběračích (šli na sever podél potoka). Odmítla jít s Okřálem, odešla do osady.
- **Mechaniky:** Boj se stonožkou (zjednodušený — ještě před implementací kolo-po-kole systému).
- **Chyby agenta:** Žádné zjištěné.
- **Bookkeeping:** OK.

## CHYBA: Scéna 4-5 (první pokus) — SMAZÁNO
- **Co se stalo:** Agent ignoroval fakt, že Řebřík ODEŠLA ve scéně 3. Odehrál dvě celé scény (úkryt v dešti, cesta k jezevci) s Řebříkem jako společníkem.
- **Korekce hráče:** Hráč upozornil citací textu z předchozí scény: "Okřál požádá Řebříka, aby šla s ním... Řebřík odmítne."
- **Náprava:** Save revertován na stav po scéně 3. Scény přehrány správně (Okřál sám).
- **POUČENÍ:** Vždy zkontrolovat poslední entries v save před pokračováním. Nepředpokládat přítomnost NPC — ověřit v textu.

## Scéna 4 — Setkání s Ježurou (den 1, odpoledne→noc)
- **Co se stalo:** INTERRUPT (Move away from thread + Vzrušení/Špehování). Okřál narazil na Ježuru — nervózní myšku hlídající cestu. Ježura prozradila, že Krysák Drápek je lupič, co jí sebral zboží. Přidala se k Okřálovi. Přenocovali pod skálou. Krátký + dlouhý odpočinek.
- **Mechaniky:** Reaction roll 2d6=10 (povídavá), behavior, meaning tables, rest.
- **Chyby agenta:** Žádné zjištěné.
- **Bookkeeping:** CF 7→8 (chaotická scéna). Jídlo spotřebováno. Nový thread: Drápek lupič. NPC Ježura přidána.

## Scéna 5 — Konfrontace s Drápkem (den 2, ráno→poledne)
- **Co se stalo:** ALTERED (Odeber postavu — Ježura utekla ze strachu). Okřál sledoval Drápkovy stopy, našel jeho tábor se 3 zajatci (NE zmizení sběrači). Drápek povídavý (reaction 10) — prozradil o "Staviteli" na severu. Okřál osvobodil zajatce, Drápek ho chytil, vzal mu dýku. WIL save na přesvědčení = totální neúspěch (d20=20). Random event: Close thread (Najít práci uzavřen). Velké odhalení: Stavitel = Mistr Kožíšek, Okřálův bývalý zaměstnavatel-alchymista.
- **Mechaniky:** DEX saves (plížení OK, útěk FAIL), WIL save (FAIL), fate questions, meaning tables, behavior.
- **Chyby agenta:** Žádné zjištěné.
- **Bookkeeping:** CF 8→9 (maximum). Dýka odebrána z inventáře. Nový thread: Stavitel. NPC Kožíšek přidán.

## Scéna 6 — Zničená dílna (den 2, poledne→odpoledne)
- **Co se stalo:** ALTERED (DVĚ ÚPRAVY: Odeber postavu + Sniž aktivitu → Kožíšek není v dílně, dílna zničená). Okřál našel trosky Kožíškovy první dílny. Exceptional ANO na stopy sběračů — nalezeny 3 batohy, Šípkův medailonek. Sběrači naživu, stopy vedou na SV. Okřál našel nůž na kůru (náhrada za dýku), provaz, lahvičku.
- **Mechaniky:** Fate questions (Exceptional YES d100=1), detail checks.
- **Chyby agenta:** Žádné zjištěné.
- **Bookkeeping:** CF 9→8 (Okřál měl kontrolu). Inventář aktualizován (nůž, provaz, lahvička, medailonek).

## Scéna 7 — Kožíškova podzemní dílna (den 2, odpoledne→večer)
- **Co se stalo:** ALTERED (Zvyš aktivitu — dílna aktivnější než čekáno). Obří brouk u vchodu. Exceptional ANO na jiný vchod (trhlina). Okřál vlezl dovnitř, našel 3 sběrače (Šípek, Bříza, Kaštánek). Plán: ukrást mízu → odlákat brouka → sběrači utečou. DEX save OK (d20=8 = přesně na hraně). Konfrontace s Kožíškem — šílený alchymista chce ovládat všechny tvory. Brouk se vrátil, Kožíšek přišel o koncentrát. Bříza skoro nestihla utéct (zlomená tlapka). Všichni 4 utekli.
- **Mechaniky:** DEX saves, fate questions, behavior (Kožíšek: Soud + Nesnášenlivost), vyjednávání (Unlikely → NE — Kožíšek nenaslouchá).
- **Chyby agenta:**
  - **ZAPOMENUTÉ JÍDLO!** Den 2 — agent neudělal `eat` v bookkeepingu. Hráč musel upozornit otázkou "udelal si bookkeeping řádný?"
  - NPC váhy neaktualizovány hned (Řebřík a Ježura zůstaly na 2, měly klesnout na 1).
- **Korekce hráče:** "udelal si bookkeeping řádný?" → Agent doplnil: eat (zásoby 1→0, VYČERPÁNY), NPC váhy opraveny, thread váhy aktualizovány.
- **POUČENÍ:** Bookkeeping checklist MUSÍ zahrnovat: 1) CF, 2) eat, 3) NPC váhy, 4) thread váhy, 5) čas, 6) počasí (pokud nový den). Jídlo je kritické — zapomenutí = stav Hlad!

## Scéna 8 — Úkryt v noci (den 2, večer → den 3, ráno)
- **Co se stalo:** Očekávaná scéna (d10=10 vs CF 7). Okřál a tři sběrači (Šípek, Bříza, Kaštánek) hledali úkryt. Bříza znala Starý Kmen — nory po její babičce-bylinkářce (Exceptional YES d100=1). DEX save na přesun přes otevřený terén (d20=6 ≤ DEX 8 — úspěch). Houby v norách nepřežily (Fate NE d100=91). Šípek odmítá vrátit se do Ořechové Tvrze — hostinský je podle něj stejný jako Kožíšek. Okřál mu vrátil medailonek (emotivní moment). Kaštánek organizoval hlídání — rozdělil si směny s Okřálem. Klidná noc.
- **Mechaniky:** Chaos test, fate questions (2×), DEX save, behavior (Šípek: Opuštění/Podvod; Kaštánek: Zabrání/Ublížení), detail check, meaning table.
- **Chyby agenta:** Žádné zjištěné.
- **Bookkeeping:** OK. CF 7→6 (kontrola). Inventář: medailonek vrácen Šípkovi, pochodeň 3→2 tečky. Zásoby: 0 (den 3 musí najít jídlo). NPC váhy: Řebřík 1→0, Ježura 1→0 (nepřítomné), Kožíšek 3→2 (uvězněn), Šípek 2→3 (důležitý rozhovor). Thready: Drápek 2→1, Stavitel 2→1 (nezmíněné). Čas: den 3 ráno, podzim, chladno.
- **Audit:** Všechny mechaniky správné. Staty nepoškozeny (žádný boj). Inventář konzistentní s příběhem.

## Scéna 9 — Sběr potravy u Starého Kmene (den 3, ráno → poledne)
- **Co se stalo:** ALTERED (DVĚ ÚPRAVY: Odeber postavu + Přidej postavu). Šípek odešel v noci beze stopy — nechal vzkaz na březové kůře. Dvě krysy (Hryzalka a Šedivka) přišly ke Starému Kmeni. Okřál sbíral potravu (4 porce), pak se setkal s krysami. Komunikace krysím jazykem (s obtížemi). Reaction 2d6=11 → povídavá. Hryzalka = obchodnice. Šedivka má zraněnou tlapku. Okřál nabídl léčivou mast (lahvička z Kožíškovy dílny — Exceptional YES, plná po okraj). Obchod: ošetření Šedivky + 3 ďobky za 2 porce larev + informace. WIL save d20=4 ≤ 7 → úspěch (smlouvání). Hryzalka prozradila: Drápek má 2-3 posily, je naštvaný. Ošetřil Šedivku i Břízu mastí.
- **Mechaniky:** Chaos test (d10=5 vs CF 6 → Altered), scene adjustment (DVĚ úpravy: 1+2), reaction roll (2d6=11), fate questions (4×), WIL save, DEX save (d20=17 > 8 → fail na hod), meaning tables, detail check.
- **Chyby agenta:**
  - **Scene Adjustment Table: d6 místo d10.** Pravidla (ř. 738-753) říkají hodit d10 na Scene Adjustment Table. Agent hodil d6 třikrát. Navíc chybí počáteční d10 hod, který by dal 7-10 (DVĚ ÚPRAVY) — agent rozhodl "DVĚ úpravy" bez hodu. Výsledky (1=Odeber postavu, 2=Přidej postavu) jsou v rozsahu d6 i d10, takže narativ nebyl poškozen, ale postup byl procedurálně špatný.
- **Bookkeeping:** OK. CF 6→5 (kontrola). Zásoby 0→6 (4 sběr + 2 koupeno), jedl 1→5. Ďobky 3→0. Inventář: lahvička→Léčivá mast 1/1, pochodně 2/3, medailonek odebrán (sc.8), zásoby 5/6. NPC: Šípek 3→1 (odešel), Hryzalka přidána w1, Řebřík 0, Ježura 0, Kožíšek 2, Drápek 3, Bříza 2, Kaštánek 3. Thready: Drápek w1→2 (posily potvrzeny), Zmizení sběračů w3 (9/10), Stavitel w1. Čas: den 3 poledne, chladno.
- **Konzistence:** Inventář odpovídá příběhu. Staty nepoškozeny (žádný boj). Šípkův odchod konzistentní s jeho behavior (Abandon/Deceive, sc.8) a odmítnutím vrátit se do Ořechové Tvrze. Komunikace myš↔krysa správně ošetřena narativně ("s obtížemi", bez WIL save — krysa je hlodavec, ne jiný savec).
- **Audit:** Jeden procedurální problém (d6 místo d10 na adj table). Bookkeeping kompletní a správný. Narativ silný.

## Scéna 10 — Cesta podél potoka (den 3, poledne → večer)
- **Co se stalo:** Očekávaná scéna (d10=9 > CF 5). Okřál, Kaštánek a Bříza (na zádech) se vydali na jih podél potoka zpět do Ořechové Tvrze. d6=6 → žádné setkání. Kaštánek promluvil o hostinském — plýtvá zásobami, sběrači spí v přístěnku (behavior: Rozmařilost/Plýtvání). Discovery check na thread "Najít práci" (+2 body, slova: Útěk/Ublížení). Dorazili před setměním (Fate Likely d100=28 → ANO). V osadě vřelé přivítání sběračů. Hostinský přišel — behavior: Nárůst/Protivenství — a nabídl jen 33 ďobků (2/3 z 50). WIL save d20=14 > WIL 7 → neúspěch vyjednávání. Okřál vzal 33ď. Kaštánek poděkoval a rozloučil se.
- **Mechaniky:** Chaos test (d10=9 > CF 5 → Očekávaná), d6=6 setkání (nic), behavior (2×), discovery check, fate question (1×), WIL save (fail).
- **Chyby agenta:** Žádné zjištěné.
- **Bookkeeping:** OK. CF 5→6 (chaos — hostinský neoblomný, Okřál neměl kontrolu). Ďobky 0→33. Jídlo: nejedl (jedl ve sc.9, den 3 — OK). Thread Zmizení sběračů 9→10/10, stav uzavřený. NPC: Kaštánek 3→1 (odešel do osady), Bříza 2→1 (vzdálená), Kožíšek 2→1 (vzdálený), Hostinský přidán w2. Čas: den 3 večer, podzim, chladno.
- **Konzistence:** Inventář odpovídá — zásoby 5/6, Léčivá mast 1/1, pochodně 2/3, nůž na kůru, ďobky 33. Staty nepoškozeny (žádný boj). Matematika odměny: 2/3 × 50 = 33.33, zaokrouhleno na 33 (hostinský zaokrouhluje ve svůj prospěch — narativně konzistentní).
- **Audit:** Všechny mechaniky správné. Chaos test OK. WIL save OK (d20 > stat = fail). Setkání d6 OK. Bookkeeping kompletní. Narativ silný — konfrontace s hostinským, charakterizace NPC, uzavření hlavního threadu.

## Scéna 11 — Nocleh v Ořechové Tvrzi (den 3, večer → den 4, ráno)
- **Co se stalo:** INTERRUPT (d10=2 vs CF 6, sudé → přerušená). Event Focus: PC Negative (d100 v rozsahu 71-80). Meaning: Inform + Proceedings (Informování + Řízení). Okřál předvolán před radu osady — lysá myška s jedním okem (Starosta) předsedá. Hostinský obvinil Okřála z nevrácení Šípka. Rada uvěřila Okřálovi (Fate Likely d100=50 → ANO). Hostinský navrhl zakázku: zbavit osadu Drápka a brouka. Rada souhlasila (Fate 50/50 d100=28 → ANO). Odměna: 50ď za Drápka + 50ď za brouka. Okřál žádal pomoc — rada odmítla vojáky (Fate Unlikely d100=69 → NE), ale nasměrovala na Bodláka (lovce, bratr Kopřivky). Detail check: Chladně + Záměrně → Bodlák je chladný záměrný zabiják. Hostinský po zasedání vyděračsky žádal polovinu odměny (behavior: Přitažení + Zabití). Okřál přenocoval v radní komoře.
- **Mechaniky:** Chaos test (d10=2 vs CF 6 → Interrupt), Event Focus (PC Negative), Meaning Tables (Inform/Proceedings), fate questions (4×), behavior (Hostinský: Attract/Kill), detail check (Coolly/Deliberately), dlouhý odpočinek.
- **Chyby agenta:**
  - **Drobnost — předčasné jedení.** Bookkeeping uvádí "zásoby 5→4" (jedení), ale za den 3 se jedlo už ve scéně 9. Toto jedení je tedy za den 4, který teprve začíná. Narativně OK (ráno den 4 = snídaně), ale formálně by jedení za den 4 mělo být zaúčtováno až ve scéně 12.
- **Bookkeeping:** CF 6→7 (interrupt, Okřál nucen do mise — neměl kontrolu). Zásoby 5→4 (viz poznámka výše). Nový thread: Zakázka od rady (Osvobodit cestu od Drápka, 0/10). NPC: +Starosta w2, +Kopřivka w1, +Bodlák w1 (zmíněn, ne osobně), Hostinský 2→3 (klíčová role), Kaštánek→0, Bříza→0 (odešli v sc.10). Čas: den 4 ráno, podzim, chladno. Dlouhý odpočinek: BO obnoveno (ale už bylo na maxu).
- **Konzistence:** Inventář odpovídá (nůž, klíny, vědro, provaz, pochodně 2/3, zásoby 4/6, léčivá mast 1/1, ďobky 33 — žádné transakce ve scéně). Staty nepoškozeny (žádný boj). Nové NPC konzistentní — Starosta jako autorita rady, Kopřivka jako spojka k Bodlákovi, Bodlák jako potenciální spojenec. Hostinský w3 odpovídá jeho eskalující roli (vyděračství).
- **Audit:** Chaos test SPRÁVNĚ (d10=2 ≤ CF 6, sudé = Interrupt). Event Focus PC Negative SPRÁVNĚ (Okřál nucen do nebezpečné mise + vydírán). Meaning tables DOBŘE INTERPRETOVÁNY (Inform + Proceedings = předvolání před radu/jednání). Bookkeeping kompletní. Jeden drobný problém (předčasné jedení). Narativ výborný — politická scéna v osadě, hostinský jako antagonista, Bodlák jako nový hook.

## Scéna 12 — Hledání Bodláka (den 4, ráno → poledne)
- **Co se stalo:** ALTERED (d10=7 vs CF 7, lichý → pozměněná). Scene Adjustment: Sniž aktivitu — Bodlák odmítl spolupracovat (místo plné spolupráce jen dar). Okřál našel Bodlákovu noru u Suchého potoka (Fate 50/50 ANO). Bodlák doma (Fate Unlikely ANO d100=61). Reaction 2d6=10 → povídavá. Behavior: Kill/Bestow (Zabití/Darování). Bodlák = lovec-samotář, vyhozen z osady Hostinským (falešné obvinění z krádeže). Okřál se pokusil přesvědčit Bodláka ke spolupráci — WIL save d20=18 > WIL 7 → FAIL. Bodlák odmítl, ale daroval chitinový štít (z krunýře brouka roháče, obrana 1, 2 tečky). Meaning: Excitement/Arrive → příchod nové NPC. Fate "známá NPC?" → NE (d100=86). Fate "Drápkova posila?" → ANO (d100=74). Jizva (myška s jizvou přes ucho) doručila ultimátum od Drápka: 50 ďobků za 3 dny nebo útok na osadu. Reaction 2d6=5 → nepřátelská. Prozradila klíčovou info: bez brouka je Drápek slabý (1 krysa + 2 nýmandi). Odešla pokojně (Fate 50/50 Exceptional ANO d100=13).
- **Mechaniky:** Chaos test, scene adjustment, fate questions (5×), reaction rolls (2×), WIL save (fail), behavior, meaning tables, detail checks (2×).
- **Chyby agenta:**
  - **DVOJITÉ JEDENÍ za den 4!** Scéna 11 bookkeeping zaúčtoval zásoby 5→4 (předčasné jedení za den 4, viz audit sc.11). Scéna 12 bookkeeping zaúčtoval zásoby 4→3. Obě scény jsou den 4 — celkem 2× jedeno za 1 den. Správně by měl jíst jen jednou za den. Zásoby by měly být 4, ne 3.
  - **Chybí zaznamenaný d10 hod na Scene Adjustment Table.** Save obsahuje `adj: "Sniž/odeber aktivitu"` ale v entries není vidět d10 hod pro adj tabulku. Agent buď hodil mentálně, nebo zapomněl zaznamenat. Měl by hodit d10 a zapsat výsledek (3 = Sniž aktivitu).
- **Bookkeeping:** CF 7→8 (chaos — Bodlák odmítl, ultimátum od Jizvy, Okřál neměl kontrolu). SPRÁVNÉ. NPC: +Jizva w1, Bodlák 1→2. OK. Thready: Drápek w3, Stavitel w2, Zakázka progress 2/10. OK. Čas: den 4 poledne, chladno. OK.
- **Pravidla:**
  - Chaos test d10=7 vs CF=7: 7 ≤ 7, lichý → Altered. SPRÁVNĚ (dle ř. 704).
  - Scene Adjustment "Sniž aktivitu" = výsledek 3 na d10 (dle ř. 745). Interpretace OK — Bodlák méně aktivní/ochotný než očekáváno.
  - Reaction 2d6=10 (Bodlák) → povídavá (ř. 1344: 9-11). SPRÁVNĚ.
  - Reaction 2d6=5 (Jizva) → nepřátelská (ř. 1342: 3-5). SPRÁVNĚ.
  - WIL save d20=18 > WIL 7 → fail. SPRÁVNĚ (d20 musí být ≤ stat).
  - Vyjednávání (ř. 1361-1374): reaction + WIL záchrana. SPRÁVNĚ použito.
- **Konzistence:** Inventář OK — chitinový štít přidán (zbroj, armor 1, tečky 2/2). Staty nepoškozeny (žádný boj): STR 10/10, DEX 8/8, WIL 7/7, BO 6/6. Ďobky 33 (žádná transakce). Jizva jako Drápkova posila dává smysl — Hryzalka ve sc.9 potvrdila že Drápek má 2-3 posily. NPC konzistentní.
- **Audit:** Mechaniky správné. Dva problémy: (1) dvojité jedení za den 4 (zásoby by měly být 4, ne 3), (2) chybějící záznam d10 hodu na adj table. Narativ výborný — Bodlák jako tragická postava (vyhozen Hostinským), Jizva jako překvapivý twist s klíčovou informací (brouk = Drápkův trumf).

## Scéna 13 — Návrat do Černého hvozdu (den 4, poledne)
- **Co se stalo:** INTERRUPT (d10=6 vs CF 8, sudé → přerušená). Event Focus: Ambiguous Event (d100 v rozsahu 06-10). Meaning: Usurp/Recruit (Uzurpace/Nábor). Na tržišti v Ořechové Tvrzi ruch — tři cizí myši verbují pro Hraběte Oříška z Bobulína. Verbíř Otec nabídl Okřálovi průzkumnickou práci za 20ď/den. Okřál vyjednal zálohu: 10ď + zásoby. Přijal průzkum (zmapovat Drápkův tábor), ale neslíbil věrnost hraběti. Odešel na sever s plánem: zlikvidovat brouka + zmapovat Drápka = splnit zakázku rady + průzkum pro hraběte naráz.
- **Mechaniky:** Chaos test (d10=6 vs CF 8 → Interrupt), Event Focus (Ambiguous Event), Meaning Tables (Usurp/Recruit), fate question (1×: 50/50 d100=61 → ANO), behavior (Hostinský: Communicate/Extravagance), detail check (Divide/Travel).
- **Chyby agenta:**
  - **Behavior block na špatné NPC.** Behavior hozen za Hostinského (Communicate/Extravagance), ale v narativu jej interpretoval verbíř (nabídka vysokého žoldu). Hostinský jen stojí v davu a pozoruje. Správně by měl hodit behavior za verbíře (Otce), nebo hodit za Hostinského a popsat JEHO reakci.
  - **Chybějící d100 hod pro Event Focus.** Save zaznamenává `focus: "Ambiguous Event"` ale nemá zaznamenaný konkrétní d100 hod. Agent buď hodil mentálně, nebo zapomněl zaznamenat.
  - **Zásoby nesou chybu z sc.12.** Zásoby 3+3=6, ale zásoby měly být 4 (ne 3) kvůli dvojitému jedení za den 4 ve sc.11+12. Správně: 4+3=7. Tento bug vznikl ve sc.11 (předčasné jedení) a propagoval se.
- **Bookkeeping:** CF 8→7 (kontrola — Okřál vyjednal průzkum, získal zásoby, má plán). SPRÁVNÉ. Ďobky 33→43 (+10 záloha). NPC: +Otec w2, Starosta 2→1. Thread: +Hrabě Oříšek (průzkum, 0/10). Čas: den 4 poledne, chladno. Nejedl — OK (za den 4 už jedl ve sc.11/12, i když 2x chybně).
- **Pravidla:**
  - Chaos test d10=6 vs CF=8: 6 ≤ 8, sudé → Interrupt. SPRÁVNĚ (dle ř. 703-705).
  - Event Focus "Ambiguous Event" = d100 06-10. SPRÁVNÝ ROZSAH (dle ř. 765).
  - Meaning tables (Usurp + Recruit) interpretovány výborně — hrabě "uzurpuje" lokální kontrolu obchodních cest, verbíř "verbuje" myši. Narativně silné.
- **Konzistence:** Inventář: zásoby 6/6 (viz poznámka o chybě — mělo být 7), ďobky 43, chitinový štít (armor 1, 2/2), nůž na kůru, pochodně 2/3, léčivá mast 1/1, provaz, klíny, vědro. Staty nepoškozeny: STR 10/10, DEX 8/8, WIL 7/7, BO 6/6. Žádný boj.
- **Audit:** Chaos test + Event Focus + Meaning správně. CF úprava správně. Tři drobné problémy: (1) behavior na špatné NPC, (2) chybějící d100 pro event focus, (3) propagovaná chyba zásob z sc.12. Narativ výborný — politická vrstva (hrabě vs rada vs hostinský), Okřál jako svobodný agent hrający na obě strany.

## Scéna 14 — Cesta ke Kožíškově dílně, PŘEHRANÝ BOJ (den 4, poledne → den 5, ráno)
- **Co se stalo:** ALTERED (d10=5 vs CF 7, lichý → pozměněná). Scene Adjustment: Sniž aktivitu — Kožíšek oslabený/šílený. Okřál cestou obešel kočičí stopy (DEX d20=4 OK). Brouk narostl (Exceptional NE d100=99). Past z větve (meaning: Tvorba/Útisk) — Exceptional ANO d100=6 → brouk zabit. Kožíšek zaútočil (Exceptional ANO na Unlikely d100=2). PŘEHRANÝ BOJ — 3 kola (viz detail níže). Random Event: d100=44 (doubles, 4 ≤ CF 7) → New NPC + Refuse/Punish → Pecka (bylinkář uvězněný Kožíškem). Okřál ošetřil Kožíška léčivou mastí, Pecka ošetřil Okřála bylinkami. Dlouhý odpočinek.
- **Boj — Kožíšek (STR 5, BO 2, WIL 8, d8 koncentrát + d6 střep, armor 0) vs Okřál (STR 10, BO 6, armor 1):**
  - **Kolo 1:** Kožíšek překvapil (dýmovnice → enemy first). Koncentrát d8=7, armor 1 → 6 dmg → BO 6→0. Okřál zeslaběný (dým+překvapení, ř.1223+1282) d4=1 → Kožíšek BO 2→1. SPRÁVNĚ.
  - **Kolo 2:** Okřál útěk DEX save d20=12 > DEX 8 = FAIL (ř.1235-1240). Následek: Kožíšek střep d6=5, armor 1 → 4 dmg. BO=0 → dmg do STR (ř.1245): STR 10→6. STR save d20=1 ≤ 6 = OK. SPRÁVNĚ.
  - **Kolo 3:** Dým nerozptýlen (Fate NE d100=83) → Okřál stále zeslaběný d4=3. Kožíšek BO 1→0, průnik 2 → STR 5→3 (ř.1244-1245). STR save d20=16 > 3 = FAIL → vyřazený (ř.1246). SPRÁVNĚ.
  - **Opotřebení:** Nůž d6=4 (4-6=škrtni, ř.544): 1/1→0 = ZNIČEN. Štít d6=2 (< 4 → OK): 2/2. SPRÁVNĚ.
- **Mechaniky:** Chaos test, scene adj, fate questions (7×), DEX saves (2×), behavior, meaning tables, detail check, combat (3 kola), opotřebení, random event, dlouhý odpočinek.
- **Chyby agenta:**
  - **PROPAGOVANÁ CHYBA ZÁSOB (od sc.11).** Save: zásoby 4/6. Bookkeeping: 6→4 (Okřál+Pecka jedení). Ale zásoby měly být 7 na začátku scény (kumulativní −1 od sc.11: dvojité jedení za den 4). Správně by mělo být 5/6. **Kumulativní odchylka: −1 zásoby.**
  - **Klíny spotřebovány?** Narativ popisuje 4 klíny zasazeny do praskliny větve, ale save ukazuje klíny 1/1 (nezměněno). Drobné — závisí na interpretaci (sada klínů vs jednotlivé kusy).
- **Bookkeeping:** CF 7→6 (kontrola — brouk zabit, Kožíšek zajat, Pecka zachráněn). SPRÁVNÉ. Thread Stavitel 10/10 uzavřen (save: stav "uzavřený"). Zakázka 2→6 (brouk hotový). NPC: +Pecka w2, Kožíšek 1→3. Inventář: -nůž (zničen), +kladívko (d6, 3/3), -léčivá mast (spotřebována), pochodeň 2→1, zásoby 6→4. Čas: den 5 ráno, Slejvák (nepříznivé). Staty: BO 0→6 (long rest), STR 6/10. Ďobky 43 (beze změny).
- **Pravidla boje — VERDIKT:**
  - Překvapení → enemy first: SPRÁVNĚ (ř.1278-1280).
  - Zeslaběný d4 za dým+překvapení: SPRÁVNĚ (ř.1223: "tma, omezený pohyb" + ř.1282: "překvapeny = mohou mít ZESLABENÝ d4").
  - Damage pipeline (BO→STR→save): SPRÁVNĚ ve všech 3 kolech (ř.1243-1248).
  - Útěk = DEX save, neúspěch = následek: SPRÁVNĚ (ř.1235-1241).
  - Opotřebení zbraní d6 (4-6=škrtni): SPRÁVNĚ (ř.544).
  - Kolo 3 stále d4 (dým nerozptýlen → Fate NE): SPRÁVNĚ — konzistentní s pravidly o zeslaběném útoku.
- **Random Event — VERDIKT:**
  - d100=44: doubles (4,4), číslice 4 ≤ CF 7 → trigger (ř.796-798). SPRÁVNĚ.
  - Hod stále odpovídá na Fate otázku: 44 ≤ threshold 75 → ANO (ř.799). SPRÁVNĚ.
  - Event Focus "New NPC" + Meaning "Refuse/Punish" → Pecka (odmítl spolupracovat, Kožíšek ho uvěznil). VÝBORNÁ interpretace.
- **Kožíškovy staty — VERDIKT:** STR 5 (vyhladovělý) + BO 2 (netrenovaný) + WIL 8 (posedlý, silná vůle) + armor 0 = REALISTICKÉ. WIL 8 obhajitelné — posedlost = nezlomná vůle špatným směrem. Zbraně d8 (alchymistický koncentrát) + d6 (střep) = kreativní, narativně ukotvené.
- **Konzistence:** Inventář v save odpovídá narativu (kladívko, bez nože, bez masti, pochodeň 1/3, zásoby 4/6, štít 2/2). Staty po odpočinku: STR 6/10, DEX 8/8, WIL 7/7, BO 6/6. Den 5 ráno, Slejvák. Ďobky 43.
- **Narativ:** Vynikající. Past na brouka kreativní. 3-kolový boj dramatický — Okřál na hranici smrti (BO 0, STR 6/10). Kožíšek jako tragická postava. Pecka jako organický výsledek random eventu. Dialog silný.
- **Audit:** Všechna pravidla boje SPRÁVNĚ aplikována. Jeden propagovaný problém (zásoby −1 od sc.11). Jeden drobný (klíny). Žádné nové procedurální chyby.

## Scéna 15 — Návrat v dešti (den 5, ráno → poledne)
- **Co se stalo:** ALTERED (d10=1 vs CF 6, lichý → pozměněná). DVĚ ÚPRAVY (d10=8 → dvě podúpravy: d10=1 Odeber postavu, d10=6 Přidej předmět). Pecka odešel (behavior: Podvod/Cestování — přiznal že nešel do Ořechové Tvrze, daroval Léčivý obklad). Okřál vzal zkratku přes dešťový kanálek (DEX save d20=11 > DEX 8 = fail → pochodeň zničena). Krysí stopy k osadě — Drápek útočí (3 krysy). Okřál konfrontoval veřejně (WIL save d20=20 = critical fail → Drápek se vysmál). Ukázal chitinový štít jako důkaz → osadníci uvěřili (Fate Likely d100=55 → ANO). Random Event: Move toward thread + Narušení/Přitažení → osadníci vyšli z brány. Drápek behavior: Útěk/Souhlas → utekl definitivně. Rada zaplatila 100ď (50 za brouka + 50 za Drápka). CF 6→5.
- **Mechaniky:** Chaos test, scene adjustment (DVĚ úpravy), behavior (2×), detail check (2×), fate questions (7×), DEX save (fail), WIL save (critical fail), random event, meaning tables.

### 1. PRAVIDLA — VERDIKT

- **Chaos test d10=1 vs CF 6:** 1 ≤ 6, lichý → Altered. SPRÁVNĚ (dle ř. 703-704).
- **Scene Adjustment DVĚ ÚPRAVY:** Prvně d10=8 → 7-10 = DVĚ ÚPRAVY (dle ř. 753). Pak d10=1 (Odeber postavu, ř. 741) a d10=6 (Přidej předmět, ř. 751). SPRÁVNĚ. Agent tentokrát hodil d10 (ne d6 jako ve sc.9) — **bug opraven!**
- **DEX save d20=11 vs DEX 8:** 11 > 8 = fail. SPRÁVNĚ (d20 musí být ≤ stat).
- **WIL save d20=20 vs WIL 7:** 20 > 7 = fail. SPRÁVNĚ. Agent nazval "kritický neúspěch" — pravidla Mausritteru nemají formální critical fail, ale narativní interpretace (d20=20 = nejhorší možný výsledek) je v pořádku.
- **Random Event:** d100=55 na Fate otázku. tensDigit=5, unitsDigit=5 → doubles. 5 ≤ CF 6 → trigger. SPRÁVNĚ (dle ř. 796-798, 932-934). Hod 55 ≤ threshold 75 → ANO (otázka stále zodpovězena). SPRÁVNĚ (dle ř. 799).
- **Event Focus "Move toward thread":** Rozsah 51-55 (dle ř. 770). Event Focus je generován automaticky appkou (getEventFocus()). SPRÁVNĚ.
- **Event Meaning:** Disrupt/Attract (d1=55, d2=89). Interpretace: osadníci "narušili" Drápkovu hrozbu tím, že vyšli z brány — "přitaženi" důkazem (chitinový štít). VÝBORNÁ interpretace.
- **Fate otázky — prahy (CF=6):**
  - Likely (oddsIndex 5 + CF 6 = pos 11) → threshold 75. Všechny Likely otázky mají threshold 75. SPRÁVNĚ.
  - 50/50 (oddsIndex 4 + CF 6 = pos 10) → threshold 65. SPRÁVNĚ.
  - Unlikely (oddsIndex 3 + CF 6 = pos 9) → threshold 50. SPRÁVNĚ.
  - Konkrétně: d100=84 > 75 → NE (Dorazí bez problémů? NE). d100=51 ≤ 65 → ANO (Stopy čerstvé?). d100=51 ≤ 65 → ANO (Zkratka?). d100=45 ≤ 50 → ANO (Drápek u osady? Unlikely). d100=36 ≤ 65 → ANO (Útočí?). d100=99 > 50 → NE, exceptional (99 ≥ 91) → Exceptional NE (Bodlák v osadě?). d100=55 ≤ 75 → ANO (Osadníci uvěří?). d100=40 ≤ 65 → ANO (Drápek definitivně?). d100=65 ≤ 75 → ANO (Zaplatí rada?). Všechny SPRÁVNĚ.

### 2. BOOKKEEPING — VERDIKT

- **CF 6→5:** Endscene block potvrzuje (cfOld:6, cfNew:5). Okřál měl kontrolu — brouk mrtvý, Drápek vyhnán, odměna vyplacena. SPRÁVNĚ (snížení o 1).
- **Jedení den 5:** Save ukazuje zásoby 5/6 (na začátku scény) → 5/6 (konec). Narativ NEUVÁDÍ jedení explicitně. V bookkeepingu sc.14 se jedlo za den 5 (ráno, 6→4 — Okřál+Pecka). Takže za den 5 UŽ jedl. SPRÁVNĚ — agent tentokrát NEJEDL podruhé za stejný den.
- **NPC váhy:** Drápek 3→2 (odešel, ale stále relevantní jako uzavřený thread). Pecka 2→1 (odešel na východ). Jizva 1→0 (utekla s Drápkem). Starosta 2→2 (klíčová role v této scéně — mohl být 3, ale 2 je obhajitelné). Hostinský 3→3 (zmíněn, ale neměl hlavní roli). Ostatní beze změny. **Drobnost:** Drápek by mohl být 1 nebo 0 (definitivně odešel), ale 2 je obhajitelné (nedávno klíčový, thread právě uzavřen). PŘIJATELNÉ.
- **Thready:** Drápek thread 10/10 uzavřený — SPRÁVNĚ. Osvobodit cestu 10/10 uzavřený — SPRÁVNĚ. Hrabě Oříšek zůstává 2/10 aktivní — SPRÁVNĚ (nepostoupil v této scéně). Ostatní uzavřené beze změny.
- **Čas:** Den 5 poledne, slejvák. SPRÁVNĚ (posun z ráno na poledne).

### 3. KONZISTENCE — VERDIKT

- **Inventář:**
  - Pochodně: save 1/3. Narativ říká "pochodeň zničena" (DEX fail v kanálku). Na začátku scény byly 1/3 (ze sc.14). 1→0... ale save ukazuje 1/3. **PROBLÉM: Pochodeň měla být 0/3 (zničena), ale save ukazuje 1/3.** Buď agent zapomněl aktualizovat, nebo narativ říká "vymáčeny" ale save nebyl upraven.
    - ALE: text v entries říká "Pochodně ZNIČENY (vymáčeny v kanálku, 1/3→0)" — agent to napsal do textu, ale NEZMĚNIL save! **BUG — pochodeň v save 1/3, měla být 0/3.**
  - Léčivý obklad: Narativ říká "Pecka daroval Léčivý obklad". V save inventáři NENÍ. **BUG — Léčivý obklad chybí v inventáři.** Text říká "Přidán Léčivý obklad" ale v save není.
  - Kladívko 3/3: OK (ze sc.14).
  - Chitinový štít 2/2: OK.
  - Zásoby 5/6: Na začátku sc.14 byly 4/6 (save, propagovaná chyba −1 od sc.11). Bookkeeping sc.14: 6→4 (Okřál+Pecka jedení). Wait — save na konci sc.14 měl zásoby? Podívám se... text sc.14 říká "zásoby 6→4". Ale zásoby v save jsou 5/6. To nedává smysl se sc.14. Tato chyba je kumulativní a těžko vysledovatelná. **Kumulativní odchylka zásob zůstává (−1 od sc.11).**
  - Ďobky 43→143 (+100): SPRÁVNĚ (matematika 43+100=143).
- **Staty:** STR 6/10 (poškozeno bojem v sc.14, neléčeno — obklad přiložen ale ještě nezabral). DEX 8/8, WIL 7/7, BO 6/6. SPRÁVNĚ — žádné zranění v této scéně (DEX fail = pochodeň zničena, ne zranění).
- **Slot 7 prázdný:** Léčivý obklad měl být ve slotu 7 (prázdný v save). **BUG.**

### 4. CHYBY AGENTA

1. **INVENTÁŘ — Pochodeň nezměněna v save.** Narativ + bookkeeping text říká "1/3→0 (zničeny)", ale save ukazuje `tecky.akt: 1`. Agent napsal správný text, ale nezavolal příslušnou akci pro úpravu inventáře.
2. **INVENTÁŘ — Léčivý obklad chybí.** Narativ popisuje dar od Pecky, bookkeeping text říká "Přidán Léčivý obklad", ale v save inventáři není. Scene Adjustment "Přidej předmět" = měl přidat do inventáře.
3. **PROPAGOVANÁ CHYBA ZÁSOB (od sc.11).** Kumulativní −1 zásoby. V kontextu sc.15 samotné agent jedl správně (nejedl podruhé za den 5). Ale absolutní hodnota zásob je o 1 nižší než měla být.

### 5. AUDIT SHRNUTÍ

**PRAVIDLA: OK.** Všechny mechaniky (chaos test, scene adjustment, saves, fate chart, random event, event focus) aplikovány správně. Agent opravil bug s d6/d10 na adj table — tentokrát hodil d10. Fate prahy odpovídají FATE_DIAG tabulce.

**BOOKKEEPING: ČÁSTEČNĚ OK.** CF správně, jedení správně (nejedl podruhé), NPC váhy přijatelné, thready aktualizovány, čas posunut. DVA inventářní bugy (pochodeň + léčivý obklad).

**KONZISTENCE: DVA PROBLÉMY.** (1) Pochodeň v save 1/3, měla být 0/3. (2) Léčivý obklad chybí v save inventáři.

**NARATIV: VÝBORNÝ.** Pecka odchází s darkem (scene adj Přidej předmět — kreativně). Konfrontace s Drápkem dramatická (WIL critical fail → chitinový štít jako důkaz → random event). Uzavření dvou threadů organicky. Politická dynamika (Starosta vs Hostinský).

## Scéna 16 — Odpočinek v Ořechové Tvrzi (den 6, ráno → poledne)
- **Co se stalo:** ALTERED (d10=1 vs CF 5, lichý → pozměněná). DVĚ ÚPRAVY (d10=10 → dvě podúpravy: d10=1 Odeber postavu, d10=2 Přidej postavu). Hostinský utekl v noci s 200ď z pokladny (ODEB). Starosta nabídl Okřálovi správu hospody (odloženo). Rezek (podvodník) přišel se lží o Kožíškovi na svobodě — odhalen, vyhnán. Random Event 1: Close thread → plot armor → Current Context + Meaning Příchod/Lež → reinterpretováno do Rezkova příchodu. Random Event 2: New NPC + Lež/Pohyb → Píšťalka (prodejkyně, uprchlice z Kožíškovy dílny). Okřál koupil pochodně (0→3/3, −6ď). Long rest: BO plné → d6=1 STR heal (6→7). Jedl (zásoby 5→4).
- **Mechaniky:** Chaos test, scene adjustment (DVĚ úpravy), fate questions (4×), random events (2×), behavior (Starosta, Kopřivka), detail check, meaning tables, long rest.

### 1. PRAVIDLA — VERDIKT

- **Chaos test d10=1 vs CF 5:** 1 ≤ 5, lichý → Altered. SPRÁVNĚ (dle ř. 703-704).
- **Scene Adjustment DVĚ ÚPRAVY:** d10=10 → 7-10 = DVĚ ÚPRAVY (dle ř. 753). Pak d10=1 (Odeber postavu, ř. 741) a d10=2 (Přidej postavu, ř. 743). SPRÁVNĚ. **Drobnost:** Pořadí dice entries je d10=1, d10=10, d10=2 — první d10=1 byl hozen PŘED d10=10 (adj table), což naznačuje že agent hodil navíc/mimo pořadí. Výsledky jsou korektní, ale záznam je nepřehledný.
- **Long rest — BO plné → d6 STR healing:** BO 6/6 (plné). Dle ř. 99: "Pokud BO PLNÉ → d6 bodů jedné vlastnosti." strHeal=1 → STR 6→7. SPRÁVNĚ. Jídlo spotřebováno (ř. 99: "Vyžaduje 1 porci jídla"). SPRÁVNĚ.
- **Random Event 1 (d100=55):** Fate otázka "Je nová postava z NPC seznamu?" 50/50 CF 5, pos=9, threshold=50. d100=55 > 50 → NE. SPRÁVNĚ. Doubles: tens=5, units=5. 5 ≤ CF 5 → trigger (dle ř. 797-798, 932-934). SPRÁVNĚ. Event Focus: "Close thread" (d100 rozsah 66-70, ř. 772). Oba aktivní thready (Hrabě Oříšek 3/10, Nabídka správy hospody 0/10) mají Plot Armor (nedosáhly konce tracku, dle ř. 674-676). Agent reinterpretoval jako Current Context → Rezkův příchod se lží. SPRÁVNĚ — konzistentní s pravidly Plot Armor.
- **Random Event 2 (d100=22):** Fate otázka "Prodává někdo v osadě pochodně?" Likely CF 5, pos=10, threshold=65. d100=22 ≤ 65 → ANO. SPRÁVNĚ. Doubles: tens=2, units=2. 2 ≤ CF 5 → trigger. SPRÁVNĚ. Event Focus: "New NPC" (d100 rozsah 11-20, ř. 766). Meaning: Lie/Move → Píšťalka (lhala o původu, uprchlice). SPRÁVNĚ.
- **Fate otázky:**
  - "Přijme Starosta odklad?" Likely CF 5, pos=10, threshold=65. d100=48 ≤ 65 → ANO. SPRÁVNĚ. Žádné doubles (4≠8).
  - "Je nová postava z NPC seznamu?" viz Random Event 1 výše.
  - "Uvěří osadníci Okřálovi nad Rezkem?" Very likely CF 5, pos=11, threshold=75. d100=8 ≤ 15 (excYes práh) → EXCEPTIONAL ANO. SPRÁVNĚ.
  - "Prodává někdo v osadě pochodně?" viz Random Event 2 výše.

### 2. BOOKKEEPING — VERDIKT

- **CF 5→4:** EndScene block potvrzuje (cfOld:5, cfNew:4). Okřál měl kontrolu — podvodník odhalen, vybavení doplněno, Píšťalka začleněna. SPRÁVNĚ (snížení o 1).
- **Jedení den 6:** Zásoby 5→4 (long rest meal). SPRÁVNĚ — jednou za den.
- **NPC váhy:**
  - Hostinský 2 (utekl — mohl by být 1 nebo 0, ale stále relevantní jako plot point). PŘIJATELNÉ.
  - Starosta 3 (klíčová role — nabídka hospody, řešení Rezka). SPRÁVNĚ.
  - Kopřivka 2 (aktivní role — odhalila Rezka). SPRÁVNĚ.
  - Píšťalka 1 (nová NPC). SPRÁVNĚ.
  - Rezek 1 (nový NPC, vyhnán). SPRÁVNĚ.
  - **PROBLÉM: Kožíšek w1→w3.** V sc.15 auditu byl Kožíšek na w1. Nyní w3. V sc.16 nebyl přítomen — jen zmíněn v Rezkově lži. Skok o +2 bez přímé účasti je neopodstatněný. Měl zůstat na w1 nebo max w2.
- **Thready:** Nový thread "Nabídka správy hospody" (0/10, aktivní). SPRÁVNĚ. Ostatní beze změny — SPRÁVNĚ.
- **Čas:** Den 6 poledne, přeháňky. SPRÁVNĚ.

### 3. KONZISTENCE — VERDIKT

- **Ďobky:** 143 (konec sc.15) − 6 (pochodně) = 137. Save: 137. SPRÁVNĚ.
- **Staty:** STR 6→7 (d6=1 healing), DEX 8/8, WIL 7/7, BO 6/6. Save potvrzuje STR 7/10. SPRÁVNĚ.
- **Inventář:**
  - Pochodně 3/3 (koupeny za 6ď). SPRÁVNĚ.
  - Léčivý obklad 1/1 (ve slotu 7). V sc.15 auditu chyběl v save — nyní opraven. SPRÁVNĚ.
  - Zásoby 4/6 (5−1 za long rest). SPRÁVNĚ.
  - Kladívko 3/3, Chitinový štít 2/2, Klíny 1/1, Vědro 1/1, Provaz 1/1. Beze změny. SPRÁVNĚ.
- **Propagovaná chyba zásob (od sc.11):** Kumulativní −1 stále přetrvává. Zásoby 4/6 v save, měly by být 5/6 absolutně. Ale v rámci sc.16 samotné je jedení správné (5→4).

### 4. CHYBY AGENTA

1. **NPC váha Kožíšek w1→w3 bez přímé účasti.** Kožíšek nebyl v sc.16 přítomen, jen zmíněn v Rezkově lži. Neoprávněný skok o +2. Měl zůstat na w1 (nebo max w2 s odůvodněním že jeho jméno rezonovalo ve scéně).
2. **Pořadí dice entries u Scene Adjustment.** Tři d10 hody (1, 10, 2) v nelogickém pořadí — d10=10 (adj table → DVĚ ÚPRAVY) by měl být PRVNÍ, pak dva sub-hody. Výsledky jsou korektní, ale záznam mate.
3. **Propagovaná chyba zásob (od sc.11).** Kumulativní −1 stále přetrvává. V sc.16 samotné agent jedl správně.

### 5. AUDIT SHRNUTÍ

**PRAVIDLA: OK.** Chaos test, scene adjustment, long rest healing, random events (oba), fate chart prahy, plot armor — vše aplikováno správně. Agent správně rozpoznal Plot Armor u obou aktivních threadů a reinterpretoval Close Thread jako Current Context.

**BOOKKEEPING: VĚTŠINOU OK.** CF správně, jedení správně, čas správně, thready aktualizovány, nové NPC přidány. Jeden problém: Kožíšek w1→w3 bez přímé účasti.

**KONZISTENCE: OK (v rámci sc.16).** Ďobky, staty, inventář — vše odpovídá příběhu. Léčivý obklad (bug z sc.15) opraven. Propagovaná chyba zásob −1 z sc.11 přetrvává.

**NARATIV: VÝBORNÝ.** Hostinského útěk jako Scene Adj (Odeber postavu) — organické. Rezek jako podvodník (Close Thread → Příchod/Lež) — kreativní interpretace random eventu. Píšťalka jako uprchlice z Kožíškovy dílny (New NPC + Lež/Pohyb) — propojení se starým threadem. Kopřivka jako aktivní postava (behavior: Dosažení/Uvěznění → odhalení podvodníka).

---

## Souhrnná poučení pro agenta

### Konzistence
- **VŽDY zkontrolovat poslední entries** před pokračováním v nové session
- **Nepředpokládat přítomnost NPC** — ověřit v textu, jestli neodešli/neutekli

### Bookkeeping checklist (po KAŽDÉ scéně)
1. `endscene yes|no` — CF úprava
2. `eat` — jídlo za den (pokud ještě nejedl dnes!)
3. NPC váhy — zvýšit důležité, snížit nepřítomné
4. Thread váhy — aktualizovat podle pokroku
5. `time` — posun hlídky
6. `weather` — pokud nový den
7. Inventář — zkontrolovat že odpovídá příběhu

### Scene Adjustment Table
- **VŽDY d10** na Scene Adjustment Table (ne d6!)
- Pro DVĚ ÚPRAVY: nejdřív musí padnout 7-10 na d10, pak dvakrát d10 pro podúpravy
- **ONGOING BUG (zjištěno sc.9, ověřeno sc.10):** Agent házel d6 místo d10 na Scene Adjustment Table. Ve sc.10 nebyla Altered scéna, takže bug neovlivnil. Ale při další Altered/Interrupt scéně MUSÍ agent hodit d10!

### Behavior blocks
- **Behavior hodit ZA NPC, kterého popisuješ.** Ne za jiného NPC a pak interpretovat slova pro někoho jiného (sc.13: behavior za Hostinského, ale interpretováno jako verbíř).

### Event Focus záznam
- **VŽDY zaznamenat d100 hod pro Event Focus.** Chybí ve sc.13 — zápis jen `focus: "Ambiguous Event"` bez d100 hodnoty.

### NPC váhy — pravidlo přímé účasti
- **Váhu zvyšuj jen NPC, kteří byli PŘÍMO zapojeni do scény.** Pouhá zmínka jména (např. Rezkova lež o Kožíškovi ve sc.16) NESTAČÍ na skok w1→w3. Max +1 za nepřímou zmínku.

### Jídlo — propagace chyb
- **Jednou za den = JEDNOU za den.** Pokud jedl v bookkeepingu sc.11, NESMÍ jíst znovu v sc.12 (stejný den). Chyba se propaguje do dalších scén (zásoby o 1 méně než měly být). Aktuální stav po přehraném sc.14: zásoby 4/6 (save), měly by být 5/6 (kumulativní −1 od sc.11). Přehraný boj sc.14: zásoby 6→4 (1 Okřál + 1 Pecka) — OK pokud jedení za den 5 (po odpočinku), ale kumulativní chyba z dřívějška zůstává.

### Combat — přehraný boj sc.14
- **Přehraný boj v sc.14 (3 kola) prošel auditem bez chyb.** Damage pipeline, zeslaběný útok, útěk, opotřebení — vše správně. Engine bug z prvního pokusu (armor=2) se v přehraném boji neobjevil (boj odehrán ručně bez engine).

### Narativní styl
- Myší optika funguje dobře (od scény 7)
- Rozhovory s hlasem — NPC mají osobnost, emotivní dialogy
- Meaning tables jako motor příběhu — interpretovat, ne jen reportovat

## Scéna 17 — Drápkův opuštěný tábor / INTERRUPT: Píšťalka (den 6, poledne)
- **Co se stalo:** INTERRUPT (d10=2 vs CF 4, sudý → přerušená). Event Focus: NPC Action. Target: d20=20 (mimo rozsah vážených NPC řádků), reroll d20=18 → Píšťalka (řádek 18 z 19 vážených). Meaning: Intolerance/Trick (Nesnášenlivost/Lest). Píšťalka doběhla Okřála, tvrdila že chce zničit Kožíškovy zápisky. Exceptional NE na "Říká pravdu?" (d100=96 ≥ 91) → LŽE. Meaning Carry/Create (Nesení/Tvorba) → chce vybavení pro vlastní dílnu. Okřál ji prokoukl (prázdný uzlík), Píšťalka přiznala pravdu. Cesta na sever: červenka blokuje cestu → objížďka přes kořeny (Píšťalka zná). Drápkův tábor opuštěný — nalezena mapa Drápkových plánů. Cestou ke Kožíškově dílně: rejsek v alchymické pasti → zachráněn. Kožíšek PRYČ z trosek — stopy krví na sever. Random Event: d100=44, doubles 4≤CF 4 → Move away from thread + Svržení/Zápas. Dílna vyrabována Píšťalkou (léčivé vybavení), jedovatý odpad spálen. CF 4→3.
- **Mechaniky:** Chaos test, Event Focus (NPC Action), d20 na NPC seznam (2×), fate questions (8×), behavior (Píšťalka), meaning tables (3×), detail checks (3×), random event.

### 1. PRAVIDLA — VERDIKT

- **Chaos test d10=2 vs CF 4:** 2 ≤ 4, sudý → Interrupt. SPRÁVNĚ (dle ř. 703-705).
- **Event Focus "NPC Action":** Rozsah 21-40 na d100 (dle ř. 767). Save neuvádí d100 hod pro Event Focus — jen `focus: "NPC Action"`. **Opakující se problém** (viz sc.13).
- **Event Target — d20 místo rollFromList:** Agent hodil d20=20 (mimo rozsah), reroll d20=18. Standardní implementace (rollFromList v dice.js) používá dvoustupňový hod: d(sekce) + d10 na řádek. Agent zjednodušil na d20 přes vážený seznam. Výsledek (Píšťalka = řádek 18 z 19 vážených) je korektní, ale metoda nestandardní. PŘIJATELNÉ — výsledek validní.
- **Fate otázky — prahy (CF=4):**
  - "Říká Píšťalka pravdu?" Likely CF 4, pos=5+4=9, prahy [10,50,91]. d100=96 ≥ 91 → Exceptional NE. SPRÁVNĚ.
  - "Je cesta bezpečná?" 50/50 CF 4, pos=4+4=8, prahy [7,35,88]. d100=41 > 35 → NE. SPRÁVNĚ.
  - "Funguje objížďka?" Likely CF 4, pos=9, prahy [10,50,91]. d100=34 ≤ 50 → ANO. SPRÁVNĚ.
  - "Je tábor opuštěný?" Very likely CF 4, pos=6+4=10, prahy [13,65,94]. d100=32 ≤ 65 → ANO. SPRÁVNĚ.
  - "Najde něco cenného?" 50/50 CF 4, pos=8, prahy [7,35,88]. d100=34 ≤ 35 → ANO. SPRÁVNĚ.
  - "Dorazí ke dílně bez problémů?" Likely CF 4, pos=9, prahy [10,50,91]. d100=90 > 50 → NE. SPRÁVNĚ.
  - "Je to Kožíšek?" 50/50 CF 4, pos=8, prahy [7,35,88]. d100=67 > 35 → NE. SPRÁVNĚ.
  - "Je Kožíšek v troskách?" Unlikely CF 4, pos=3+4=7, prahy [5,25,86]. d100=44 > 25 → NE. SPRÁVNĚ. Doubles: 4,4. 4 ≤ CF 4 → Random Event trigger. SPRÁVNĚ.
  - "Je v dílně vybavení?" Likely CF 4, pos=9, prahy [10,50,91]. d100=13 ≤ 50 → ANO (13 > 10 → normální, ne exceptional). SPRÁVNĚ.
- **Random Event (d100=44):** Event Focus "Move away from thread" (rozsah 56-65, ř. 771). Meaning: Overthrow/Struggle (Svržení/Zápas). Thread target: Hrabě Oříšek. SPRÁVNĚ — save `eventTargetName: null, eventTargetReroll: false`, ale narativ cílí na Hraběte (pravděpodobně zvolen ručně, engine nezaznamenal target). Interpretace (Kožíšek na svobodě komplikuje hlášení pro hraběte) je narativně silná.

### 2. BOOKKEEPING — VERDIKT

- **CF 4→3:** EndScene block potvrzuje (cfOld:4, cfNew:3). Okřál měl kontrolu — tábor zmapován, mapa nalezena, dílna zajištěna, Píšťalka prokouknutá. SPRÁVNĚ (snížení o 1).
- **Jedení den 6:** Nejedl — za den 6 jedl v sc.16 (zásoby 5→4). SPRÁVNĚ.
- **NPC váhy:**
  - Píšťalka w1→w3 (klíčová role celou scénu — vedla cestu, vyrabovala dílnu, odhalena jako lhářka). SPRÁVNĚ — oprávněný skok, byla hlavní NPC.
  - Kožíšek w3→w2 (nepřítomný, jen stopy). PŘIJATELNÉ. Ale w3 na konci sc.16 byl neoprávněný (viz audit sc.16). Kumulativní: Kožíšek by měl být w1, ne w2.
  - Drápek w2→w1 (zmíněn jen okrajově — opuštěný tábor). SPRÁVNĚ.
  - Ostatní beze změny. SPRÁVNĚ.
- **Thready:**
  - Nový thread: "Kožíšek na svobodě" (w2, progress 0/10, aktivní). SPRÁVNĚ.
  - **PROBLÉM: Hrabě Oříšek progress 3→7 (+4).** "Move away from thread" = komplikace, VZDÁLENÍ od vyřešení. Agent zvýšil progress o +4, což je protismyslné. Progress track se nesnižuje (dle ř. 637), ale "move away" by NEMĚL přidávat progress. Standardní pokrok za scénu je +2 (dle ř. 633). Navíc "move away" implikuje komplikaci, ne přiblížení. Progress by měl zůstat na 3 (nebo max +2 za průzkum tábora — ale to je standardní pokrok, ne "move away"). **BUG: progress Hrabě threadu nesprávně zvýšen o +4.**

### 3. KONZISTENCE — VERDIKT

- **Inventář:** Beze změny oproti sc.16. Kladívko 3/3, Klíny 1/1, Vědro 1/1, Provaz 1/1, Pochodně 3/3, Zásoby 4/6, Léčivý obklad 1/1, Chitinový štít 2/2. SPRÁVNĚ — žádné nákupy/ztráty (Píšťalka brala Kožíškovo vybavení, ne Okřálovo). Vědro použito na záchranu rejska — stále v inventáři (jednorázové použití, ale vědro se nezničí). SPRÁVNĚ.
- **Staty:** STR 7/10, DEX 8/8, WIL 7/7, BO 6/6. Beze změny (žádný boj). SPRÁVNĚ.
- **Ďobky:** 137. Beze změny (žádné transakce). SPRÁVNĚ.
- **Propagovaná chyba zásob (od sc.11):** Stále přetrvává (zásoby 4/6, měly by být 5/6 absolutně). V rámci sc.17 samotné je stav konzistentní.

### 4. CHYBY AGENTA

1. **Hrabě thread progress +4 při "Move away from thread".** "Move away" = komplikace/vzdálení od vyřešení. Progress by neměl být zvyšován za tuto mechaniku. Maximálně +2 za standardní pokrok scénou (průzkum tábora), ale ne pod hlavičkou "move away". Správně: progress 3→5 (max, za průzkum) nebo 3→3 (žádný pokrok, jen komplikace). **Doporučení: opravit progress na 5/10 (standardní +2 za průzkum tábora, "move away" interpretovat pouze narativně).**
2. **Chybějící d100 hod pro Event Focus.** Save jen `focus: "NPC Action"` bez zaznamenané d100 hodnoty. Opakující se problém (sc.13, sc.16).
3. **Nestandardní Event Target resolution (d20 místo rollFromList).** Výsledek korektní (Píšťalka), ale metoda neodpovídá implementaci v kódu. Drobný problém.
4. **Kumulativní: Kožíšek w2 (měl být w1).** Propagovaná chyba z sc.16 (neoprávněný skok w1→w3).
5. **Propagovaná chyba zásob (od sc.11).** Kumulativní −1 přetrvává.

### 5. AUDIT SHRNUTÍ

**PRAVIDLA: OK (s výhradou).** Chaos test, Fate Chart prahy, Random Event trigger, Exceptional NE — vše aplikováno správně. Event Focus interpretace správná. Problém s "Move away from thread" + progress zvýšení (viz bod 1).

**BOOKKEEPING: ČÁSTEČNĚ OK.** CF správně, jedení správně (nejedl), NPC váhy převážně správně (Píšťalka w3 oprávněné), nový thread přidán. Hlavní problém: Hrabě progress +4 při "move away".

**KONZISTENCE: OK (v rámci sc.17).** Inventář, staty, ďobky — vše odpovídá příběhu. Žádné nové inventářní bugy. Propagované chyby (zásoby −1, Kožíšek váha) přetrvávají.

**NARATIV: VÝBORNÝ.** Píšťalka jako lhářka prokouknutá díky prázdnému uzlíku — elegantní. Exceptional NE + Meaning Carry/Create = skvělá interpretace (chce "nést" a "tvořit", ne ničit). Červenka jako překážka — myší optika. Drápkova mapa jako důkaz ambicí. Kožíškův útěk jako cliffhanger.

## Scéna 18 — Cesta zpět do Ořechové Tvrze (den 6, poledne → den 7, ráno)
- **Co se stalo:** Očekávaná scéna (d10=8 > CF 3). Klidná cesta zpět. Píšťalka (behavior: Nesnášenlivost/Odhalení) prozradila info o Mechovém Prahu — korupce v radě, spojení s Drápkem (zásobovací trasa). Discovery check: Hrabě thread +2 (5→7), Tvorba/Smlouvání — Okřál sestavuje hlášení, připravuje vyjednávání. Otec (verbíř) odejel z osady (Fate 50/50 CF 3, d100=40 > 25 → NE). Okřál se rozhodl jít do Bobulína osobně. Píšťalka zůstává v Ořechové Tvrzi (bylinkářská dílna). Long rest: BO plné → d6=2 STR heal (7→9). Snídaně den 7 (zásoby 4→3).
- **Mechaniky:** Chaos test, behavior (Píšťalka), discovery check, fate question (1×), long rest.

### 1. PRAVIDLA — VERDIKT

- **Chaos test d10=8 vs CF 3:** 8 > 3 → Expected. SPRÁVNĚ (dle ř. 697-705).
- **Fate otázka "Je Otec v osadě?"** 50/50 CF 3, pos=4+3=7, prahy [5, 25, 86]. d100=40 > 25 → NE. Save: threshold=25, yes=false. SPRÁVNĚ.
- **Long rest — BO plné → d6 STR healing:** BO 6/6 plné. Dle ř. 99: "Pokud BO PLNÉ → d6 bodů jedné vlastnosti." strHeal=2 → STR 7→9. SPRÁVNĚ.
- **Long rest — 1 porce jídla:** Zásoby 4→3. Dle ř. 99: "Vyžaduje 1 porci jídla." SPRÁVNĚ.
- **Discovery check Hrabě +2 (5→7):** Standardní pokrok +2 (dle ř. 633). Meaning: Create/Haggle (Tvorba/Smlouvání). SPRÁVNĚ.

### 2. BOOKKEEPING — VERDIKT

- **CF 3→2:** EndScene block potvrzuje (cfOld:3, cfNew:2). Okřál měl kontrolu — klidná cesta, informace získány, rozhodnutí učiněno. SPRÁVNĚ (snížení o 1).
- **Jedení:** Sc.16 jedl za den 6 (zásoby 5→4). Sc.17 nejedl. Sc.18: text "Snídaně ráno (den 7)" — jedení za den 7 po přenocování. SPRÁVNĚ — není dvojité jedení za den 6. Zásoby 4→3.
- **NPC váhy:**
  - Píšťalka w3→w2 (zůstává v osadě, klíčová role ve scéně ale odchází z party). SPRÁVNĚ.
  - Kožíšek w2→w1 (nepřítomný). SPRÁVNĚ (opravuje kumulativní chybu z sc.16).
  - Otec w2→w1 (odejel). SPRÁVNĚ.
  - Ostatní beze změny. OK.
- **Thready:**
  - Hrabě Oříšek 5→7 (+2 discovery check). SPRÁVNĚ. Poznámka: progress byl na 5 (opraveno z bugged +4 v sc.17, kde audit doporučil opravu na 5). Discovery +2 = 7/10. OK.
  - Ostatní beze změny. OK.
- **Čas:** Den 7, ráno, přeháňky. SPRÁVNĚ (přenocování = nový den).

### 3. KONZISTENCE — VERDIKT

- **Staty:** STR 9/10 (7+2 heal), DEX 8/8, WIL 7/7, BO 6/6. SPRÁVNĚ.
- **Ďobky:** 137. Beze změny (žádné transakce). SPRÁVNĚ. Matematika: 143 (sc.15) − 6 (pochodně sc.16) = 137.
- **Inventář:** Kladívko 3/3, Klíny 1/1, Vědro 1/1, Provaz 1/1, Pochodně 3/3, Zásoby 3/6, Léčivý obklad 1/1, Chitinový štít 2/2 (armor 1), 2 prázdné sloty. Beze změny kromě zásob (4→3). SPRÁVNĚ.
- **Propagovaná chyba zásob (od sc.11):** Kumulativní −1 stále přetrvává. Zásoby 3/6 v save, absolutně by měly být 4/6. V rámci sc.18 samotné je jedení správné.

### 4. CHYBY AGENTA

1. **Propagovaná chyba zásob (od sc.11).** Kumulativní −1 přetrvává. Zásoby 3/6 místo 4/6 absolutně. V rámci sc.18 žádná nová chyba jedení.

### 5. AUDIT SHRNUTÍ

**PRAVIDLA: OK.** Chaos test, Fate Chart prahy, long rest healing (dvoustupňové — BO plné → d6 STR), discovery check — vše aplikováno správně. Jedení za den 7 (ne den 6) — SPRÁVNĚ.

**BOOKKEEPING: OK.** CF správně (3→2), jedení správně (den 7, ne duplicitní), NPC váhy přijatelné, Hrabě progress 5→7 (+2 discovery) správně, čas posunut na den 7 ráno.

**KONZISTENCE: OK (v rámci sc.18).** Inventář, staty, ďobky — vše odpovídá příběhu. Propagovaná chyba zásob −1 z sc.11 přetrvává (3/6 místo 4/6).

**NARATIV: DOBRÝ.** Klidná přechodová scéna. Píšťalkino odhalení o Mechovém Prahu přidává politickou hloubku. Rozhodnutí jít do Bobulína osobně — logické (Otec odejel, hlášení je příliš důležité na posla).

## Scéna 19 — Cesta do Bobulína (den 7, ráno → den 8, ráno)
- **Co se stalo:** Expected scéna (d10=6 > CF 2). Klidná cesta po obchodní cestě, setkání s karavanami. Příchod do Bobulína — velkého města (detail: ukvapěně/ostře). Setkání se Správcem Olšíkem, předání hlášení + mapy. Odměna 100ď (40 průzkum + 60 mapa). Nabídka trvalé práce průzkumníka pro hraběte. Zásoby doplněny 3→6/6 za 6ď, nocležné 2ď. Long rest: STR 9→10/10 (plně uzdravený). Nový NPC: Správce Olšík w2.
- **Mechaniky:** Chaos test, detail check (descriptions), meaning table (actions), behavior (Otec: Darování/Návrat), fate question (1×), long rest.

### 1. PRAVIDLA — VERDIKT

- **Chaos test d10=6 vs CF 2:** 6 > 2 → Expected. SPRÁVNĚ (dle ř. 697-705).
- **Long rest — BO plné → d6 STR healing:** BO 6/6 plné. strHeal=5 → STR 9+5=14, cap 10 → STR 10/10. SPRÁVNĚ (dle ř. 99).
- **Long rest — 1 porce jídla:** Zásoby 6→5 (po doplnění). Save: 5/6. SPRÁVNĚ.
- **Fate otázka "Obchod s jídlem v Bobulíně?"** Very likely CF 2, threshold=35. d100=24 ≤ 35 → ANO. SPRÁVNĚ.
- **Discovery check:** Žádný v této scéně. OK — discovery byl v sc.18 bookkeepingu.
- **Behavior (Otec: Bestow/Return):** Interpretováno jako "darovat odměnu + nabídnout návrat (k práci)". Behavior ale volaný na NPC "Otec" — ten ale není ve scéně přítomný (odejel v sc.18). Agent použil behavior na Otce jako proxy pro Správce Olšíka? DROBNÁ NEPŘESNOST — behavior by měl být volán na NPC, který je přítomný (Olšík).

### 2. BOOKKEEPING — VERDIKT

- **CF 2→1:** EndScene block potvrzuje (cfOld:2, cfNew:1). Okřál měl plnou kontrolu — úspěšně předal hlášení, dostal odměnu, dostal nabídku práce. SPRÁVNĚ (snížení o 1).
- **Jedení:** Sc.18 jedl za den 7 ráno (zásoby 4→3). Sc.19 začíná den 7 ráno — nejedl znovu za den 7! Doplnil zásoby na 6/6, přenocoval (→den 8), jedl za den 8 (6→5). Save: 5/6. **NENÍ DVOJITÉ JEDENÍ.** SPRÁVNĚ.
- **NPC váhy:**
  - Správce Olšík w2 (nový, klíčový ve scéně). SPRÁVNĚ.
  - Ostatní beze změny. OK.
- **Thready:**
  - Hrabě Oříšek 7→9 (+2). **PROBLÉM: Žádný discovery check block v entries scény 19.** Progress se zvýšil o 2, ale bez mechanického discovery checku. Agent zřejmě posunul progress ručně jako součást bookkeepingu (předání hlášení = logický pokrok). Z hlediska pravidel by měl být discovery check (nebo alespoň poznámka proč ne). DROBNÁ CHYBA — chybí discovery entry.
  - Ostatní beze změny. OK.
- **Čas:** Den 8, ráno, chladno. SPRÁVNĚ (přenocování = nový den).

### 3. KONZISTENCE — VERDIKT

- **Staty:** STR 10/10 (9+5 heal, cap 10), DEX 8/8, WIL 7/7, BO 6/6. SPRÁVNĚ.
- **Ďobky:** 137 (sc.18) + 100 (odměna) = 237. 237 − 6 (zásoby) − 2 (nocležné) = 229. Save: 229. SPRÁVNĚ.
- **Inventář:** Kladívko 3/3, Klíny 1/1, Vědro 1/1, Provaz 1/1, Pochodně 3/3, Zásoby 5/6, Léčivý obklad 1/1, Chitinový štít 2/2 (armor 1), 2 prázdné sloty. SPRÁVNĚ.
- **Propagovaná chyba zásob (od sc.11):** Zásoby "absolutně" by měly být 6/6 (ne 5/6) kvůli kumulativní −1 chybě z sc.11. V rámci sc.19 samotné je aritmetika správná (doplnění na 6, jedení −1 = 5).

### 4. CHYBY AGENTA

1. **Hrabě thread +2 bez discovery check entry (DROBNÁ).** Progress zvýšen 7→9, ale v entries scény 19 není žádný discovery block. Logicky je pokrok oprávněný (předání hlášení Správci), ale mechanicky by měl být proveden přes discovery check.
2. **Behavior volaný na nepřítomného NPC (DROBNÁ).** Behavior entry je na "Otec (verbíř z Bobulína)", ale Otec není přítomný (odejel v sc.18). Agent interpretoval behavior jako Olšíkovo jednání.
3. **Propagovaná chyba zásob (od sc.11).** Kumulativní −1 přetrvává.

### 5. AUDIT SHRNUTÍ

**PRAVIDLA: OK.** Chaos test, long rest healing, fate chart — vše aplikováno správně. Žádné dvojité jedení za den 7.

**BOOKKEEPING: DROBNÉ CHYBY.** CF správně (2→1). Jedení správně (den 8, ne duplicitní den 7). Hrabě progress +2 bez discovery entry — chybí mechanický záznam. Behavior na nepřítomného NPC.

**KONZISTENCE: OK (v rámci sc.19).** Inventář, staty, ďobky — vše odpovídá matematicky. Propagovaná chyba zásob −1 z sc.11 přetrvává.

**NARATIV: VÝBORNÝ.** Bobulín jako živoucí město (detail "ukvapeně/ostře" = rychlý růst). Správce Olšík jako suchý byrokrat — dobrý kontrast k dosavadním NPC. Nabídka trvalé práce = přirozený narativní milestone. Mechový Práh jako další úkol = dobrý hook.

## Scéna 20 — Cesta zpět do Ořechové Tvrze (den 8, ráno → večer)
- **Co se stalo:** Expected scéna (d10=6 > CF 1). Klidná cesta z Bobulína, encounter roll d6=1 → setkání s karavankou. Vůdce Bobek — pomoc s opravou zlomeného kola, odměna borůvky + info o Kožíškovi (viděn na cestě na východ k Mechovému Prahu, kulhá, páchne po chemikáliích). Discovery check: Kožíšek thread +2 (0→2/10), Divide/Ruin (Rozdělení/Zničení) — interpretace: Kožíšek plánuje rozdělit region, sabotovat obchodní cesty. Příchod do Ořechové Tvrze podvečer. Píšťalka má dílnu v hospodě.
- **Mechaniky:** Chaos test, d6 encounter roll, meaning table (actions: Assist/Move), detail check (descriptions: Positively/Generously), fate question (1×, Likely CF 1), discovery check.

### 1. PRAVIDLA — VERDIKT

- **Chaos test d10=6 vs CF 1:** 6 > 1 → Expected. SPRÁVNĚ (dle ř. 701-703).
- **Encounter roll d6=1:** Na 1 = setkání. SPRÁVNĚ (standard Mausritter encounter check).
- **Meaning table (Assist/Move):** Interpretováno jako "pomoc s pohybem" → karavana potřebuje pomoc s opravou kola. Kreativní a validní interpretace. SPRÁVNĚ.
- **Detail check (Positively/Generously):** Interpretováno jako pozitivní, štědré setkání → odměna + info. SPRÁVNĚ.
- **Fate question "Popisuje Bobek Kožíška?"** Likely CF 1, threshold=15, d100=15 ≤ 15 → ANO. Hraniční hod (přesně na thresholdu). SPRÁVNĚ — threshold pro Likely CF 1 je 15.
- **Discovery check Kožíšek +2 (Divide/Ruin):** Thread progress 0→2, meaning Divide/Ruin. Discovery block v entries přítomen. SPRÁVNĚ.

### 2. BOOKKEEPING — VERDIKT

- **CF 1→1:** EndScene block potvrzuje (cfOld:1, cfNew:1). CF nemůže klesnout pod 1. Scéna byla pod kontrolou. SPRÁVNĚ.
- **Jedení:** Den 8 zaúčtován ve sc.19 bookkeepingu (zásoby 6→5 po long rest). Sc.20 nejedl znovu. Save: zásoby 5/6. **SPRÁVNĚ — žádné dvojité jedení za den 8.**
- **NPC váhy:**
  - Kožíšek w2→w3 (zmíněn ve scéně přes info od Bobka + discovery). SPRÁVNĚ.
  - Píšťalka w2 (zmínka na konci). Beze změny. OK.
  - Bobek (vůdce karavany) — NEPŘIDÁN do NPC seznamu. Epizodický NPC, ale dal klíčovou informaci o Kožíškovi. **DROBNÁ NEPŘESNOST** — mohl být přidán s w1. Akceptovatelné jako epizodický NPC.
- **Thready:**
  - Kožíšek na svobodě 0→2/10, w3. Discovery block přítomen. SPRÁVNĚ.
  - Ostatní beze změny. OK.
- **Čas:** Den 8, večer, podzim, chladno. SPRÁVNĚ (cesta ráno→večer).

### 3. KONZISTENCE — VERDIKT

- **Staty:** STR 10/10, DEX 8/8, WIL 7/7, BO 6/6. Beze změny (žádný boj). SPRÁVNĚ.
- **Ďobky:** 229 (beze změny — pomoc karavane bez peněžní odměny). SPRÁVNĚ.
- **Inventář:** Kladívko 3/3, Klíny 1/1, Vědro 1/1, Provaz 1/1, Pochodně 3/3, Zásoby 5/6, Léčivý obklad 1/1, Chitinový štít 2/2 (armor 1), 2 prázdné sloty. SPRÁVNĚ.
- **Borůvky od Bobka:** Zmíněny v narativu jako odměna, ale nezaúčtovány v inventáři (žádný entry). Buď snědeny na místě (epizodický detail), nebo zapomenuty. **DROBNÁ NEPŘESNOST** — bez mechanického dopadu.
- **Propagovaná chyba zásob (od sc.11):** Kumulativní −1 přetrvává (zásoby "absolutně" by měly být 6/6, ne 5/6).

### 4. CHYBY AGENTA

1. **Bobek nepřidán do NPC seznamu (DROBNÁ).** Epizodický NPC, ale dal klíčovou info. Akceptovatelné.
2. **Borůvky nezaúčtovány (DROBNÁ).** Zmíněny v narativu, ale nejsou v inventáři ani jako spotřebované.
3. **Propagovaná chyba zásob (od sc.11).** Kumulativní −1 přetrvává.

### 5. AUDIT SHRNUTÍ

**PRAVIDLA: OK.** Chaos test, encounter roll, fate chart, discovery check — vše aplikováno správně. Hraniční fate hod (d100=15, threshold=15) je korektní.

**BOOKKEEPING: OK.** CF správně (1→1, min). Jedení správně (den 8 zaúčtován sc.19, sc.20 nejedl). Kožíšek thread +2 s discovery entry. NPC Bobek nepřidán — akceptovatelné jako epizodický.

**KONZISTENCE: OK (v rámci sc.20).** Inventář, staty, ďobky — vše odpovídá. Borůvky nezaúčtovány (drobné). Propagovaná chyba zásob −1 z sc.11 přetrvává.

**NARATIV: DOBRÝ.** Encounter s karavankou je organický (meaning Assist/Move → pomoc s kolem). Info o Kožíškovi přirozeně vyplynulo. Discovery Divide/Ruin = silná interpretace (sabotáž regionu). Návrat do Ořechové Tvrze s Píšťalkou v hospodě = dobrý setup pro další rozhodování.

## Scéna 21–22 audit

### Scéna 21 — Rozhodnutí a příprava (den 8, večer)

**Co se stalo:** Expected scéna. Starosta nabídl Okřálovi hospodu (behavior: Připojení/Důvěra). Okřál odmítl odklad (Fate Likely NE, Fate Very_likely NE). Píšťalka navrhla kompromis — Okřál odmítl (Fate 50/50 NE, Fate Somewhat_likely NE). Rozhodnutí: hospodu přijme, ale nejdřív musí najít Kožíška. Píšťalka darovala byliny (detail: Upřímně/Laskavě). Nocleh v hospodě, long rest.

### Scéna 22 — Cesta na východ (den 9, ráno → večer)

**Co se stalo:** Expected scéna. Okřál nechal vzkaz Starostovi a vydal se na východ. Klidná cesta, žádné setkání (Fate 50/50 NE). U rozcestí záhadné značky — ne od Kožíška (Fate Somewhat_likely NE), meaning Vášeň/Rozvoj → rituální teritoriální značky. Nedorazil za světla (Fate Somewhat_likely NE). Přenocoval v dutém pařezu, zapálil pochodeň (3→2/3), snědl zásoby. Short rest.

---

### 1. SCENE TEST — VERDIKT

- **Scéna 21: d10=7 vs CF 1:** 7 > 1 → Expected. SPRÁVNĚ (dle ř. 701-703).
- **Scéna 22: d10=10 vs CF 1:** 10 > 1 → Expected. SPRÁVNĚ.

### 2. CF ZMĚNY — VERDIKT

- **Scéna 21: cfOld=1, cfNew=1.** Okřál měl kontrolu (rozhodl se, získal dary). CF by mohlo klesnout, ale je na minimu (1). SPRÁVNĚ.
- **Scéna 22: cfOld=1, cfNew=1.** Klidná cesta, bez komplikací. CF na minimu. SPRÁVNĚ.

### 3. FATE CHART — VERDIKT

**SYSTÉMOVÝ BUG: Underscore v odds labels.** Agent používá labels s podtržítkem ("Very_likely", "Somewhat_likely"), ale engine `ODDS_LABELS` obsahuje labels s mezerou ("Very likely"). Funkce `ODDS_LABELS.indexOf("Very_likely")` vrací -1, engine defaultuje na 50/50 (index 4). Výsledek: VŠECHNY nestandardní labels jsou tiše degradovány na 50/50.

Konkrétní dopady v sc.21-22 (CF=1):

| Otázka | Label agenta | Skutečný pos | Správný pos | Threshold v save | Správný threshold | Výsledek změněn? |
|---|---|---|---|---|---|---|
| Zvěd místo hospody? | Likely | 6 | 6 | 15 | 15 | NE (ok) |
| Starosta souhlas s odkladem? | Very_likely | 5 (=50/50!) | 7 | 10 | 25 | d100=31: save→NE, správně→NE |
| Píšťalka hlídat hospodu? | Somewhat_likely | 5 (=50/50!) | ? | 10 | ? | Neexistující odds label |
| Okřál přijme kompromis? | 50/50 | 5 | 5 | 10 | 10 | OK |
| Zastihne Starostu? (sc.22) | Likely | 6 | 6 | 15 | 15 | NE (ok) |
| Setkání na cestě? (sc.22) | 50/50 | 5 | 5 | 10 | 10 | OK |
| Značky od Kožíška? (sc.22) | Somewhat_likely | 5 (=50/50!) | ? | 10 | ? | Neexistující odds label |
| Dorazí za světla? (sc.22) | Somewhat_likely | 5 (=50/50!) | ? | 10 | ? | Neexistující odds label |

**ANALÝZA:**
- "Somewhat_likely" NEEXISTUJE v Mythic GME 2e. Existuje jen 9 stupňů (Impossible→Certain). Agent si vymyslel mezistupeň. Engine ho tiše zpracoval jako 50/50. Pokud agent myslel "Likely" (threshold 15 při CF 1), žádný z hodů by nezměnil výsledek (všechny d100 > 15).
- "Very_likely" s podtržítkem: threshold měl být 25 (ne 10). d100=31 > 25 → NE i se správným prahem. **Výsledek nezměněn, ale threshold v save je ŠPATNĚ.**
- **ŽÁDNÝ fate výsledek nebyl špatně vyhodnocen** (všechny hody byly dostatečně vysoké, že ani se správnými prahy by daly NE). Ale záznam v save je nepřesný.

### 4. JEDENÍ — VERDIKT

Stav zásob: 5/6 (konec sc.20) → 3/6 (finální save). Spotřebovány 2 porce.

Časová osa:
- Den 8 večer (sc.21): za den 8 jedl v sc.19 bookkeepingu → NEMĚL jíst znovu. OK.
- Long rest po sc.21 (den 8→9): vyžaduje 1 porci jídla (dle ř. 99). **V save NENÍ eat entry** — engine `eatSupply()` nepřidává journal záznam, jen mění inventář. Zásoby 5→4. Předpokládám 1 porce spotřebována.
- Den 9 (sc.22): narativ "snědl zásoby" u bivaku večer. Zásoby 4→3. Jídlo za den 9.

**PROBLÉM: Kdo jedl za den 9 — long rest (ráno) nebo bivak (večer)?** Pokud obojí, je to dvojité jedení za den 9 (5→3 = 2 porce za 1 den). Pokud long rest NE-jedl a jedl jen u bivaku, pak 5→4 (long rest bez jídla = porušení pravidel, dle ř. 99 "Vyžaduje 1 porci jídla"). **Přesnější interpretace: 1× den 9 (long rest ráno) + 1× den 10 (ráno, nezaznamenaný ale nutný).** Při této interpretaci zásoby 5→3 = SPRÁVNĚ (2 dny, 2 porce).

**DROBNÝ PROBLÉM:** Narativ říká "snědl zásoby" u bivaku den 9 večer, ale logicky by jedení mělo být ráno (snídaně). Formální nesoulad, ale výsledek (2 porce za 2 dny) je korektní.

### 5. ČAS A POČASÍ — VERDIKT

- **Sc.20 konec:** den 8, večer, chladno.
- **Sc.21:** den 8, večer (stejný večer). OK.
- **Long rest:** den 8→9 (přenocování). Den 9, ráno. OK.
- **Sc.22:** den 9, ráno → cestoval celý den → bivak večer (den 9, noc).
- **Short rest:** po sc.22 (10 min). Stále den 9 noc.
- **Sc.23 text:** "Den 10, poledne." → den 10, poledne.

**PROBLÉM: Přeskok z den 9 noc na den 10 poledne bez záznamu.** Mezi short rest (den 9 noc) a sc.23 (den 10 poledne) chybí:
1. Přenocování (long rest nebo prostý spánek) — žádný entry v save
2. Cestování ráno den 10 (ráno→poledne = 1 hlídka)
3. Počasí pro den 10 (žádný weather roll zaznamenaný — save ukazuje "Chladno", ale bez viditelného hodu)

Short rest v dutém pařezu v divočině je mechanicky validní (10 min, voda — lze předpokládat). Ale přenocování v divočině by mělo být zaznamenaný long rest (s jídlem). **Chybí long rest entry pro noc den 9→10.** Staty jsou v pořádku (BO 6/6, STR 10/10 — vše na maxu), takže absence long rest nemá mechanický dopad, ale procedurálně chybí.

**Počasí "Chladno":** Odpovídá podzimnímu 2d6 rozsahu 6-8 (dle ř. 1305). Ale hod nebyl zaznamenán.

### 6. NPC VÁHY — VERDIKT

Stav po sc.20 (z logů) → Finální save:

| NPC | Váha po sc.20 | Finální save | Sc.21 role | Sc.22 role | Očekávaná váha | Problém? |
|---|---|---|---|---|---|---|
| Starosta | 2 | 2 | Hlavní role (nabídka) | Nezmíněn | 2 (3−1) nebo 2 | OK |
| Píšťalka | 2 | 2 | Důležitá role (rada, dar) | Zmínka (vzkaz) | 2 (3−1) nebo 3−1=2 | OK |
| Kožíšek | 3 | 2 | Zmíněn (motivace) | Zmíněn (značky) | 2 (3−1, nepřímo) | OK |
| Bodlák | 2 | 2 | Zmíněn (dopis) | Nezmíněn | 1 (2−1) | DROBNÉ — w2 místo w1 |
| **Otec** | **1** | **2** | **Nezmíněn** | **Nezmíněn** | **0 (1−1−1=0, min 0)** | **BUG: +1 bez důvodu** |
| Správce Olšík | 1 | 1 | Nezmíněn | Nezmíněn | 0 (1−1−1=0) | DROBNÉ — w1 místo w0 |

**HLAVNÍ PROBLÉM:** Otec (verbíř) zvýšen z w1 na w2 bez jakékoliv účasti nebo zmínky ve sc.21-22. Měl klesnout na w0.

### 7. THREAD PROGRESS — VERDIKT

| Thread | Po sc.20 | Finální save | Změna | Discovery entry? | Problém? |
|---|---|---|---|---|---|
| Hrabě Oříšek | 9/10 | 9/10 | 0 | — | OK |
| Nabídka správy hospody | 0/10 (sc.16) | 3/10 | +3 | ŽÁDNÝ | **BUG: +3 bez discovery check** |
| Kožíšek na svobodě | 2/10 | 3/10 | +1 | ŽÁDNÝ | **BUG: +1 bez discovery check** |

**PROBLÉM:** Oba aktivní thready změnily progress bez discovery check entry v deníku. Nabídka hospody posunuta o +3 (pravděpodobně: +2 standardní pokrok sc.21 + 1?). Kožíšek o +1. Pravidla (ř. 633) říkají "+2 Progress Points za pokrok" přes discovery check. Agent posunul progress ručně bez mechanického záznamu.

Narativně je pokrok logický (sc.21 celá o hospodě, sc.22 cesta za Kožíškem). Ale mechanicky chybí discovery block entries.

### 8. INVENTÁŘ — VERDIKT

| Položka | Před sc.21 (sc.20) | Finální save | Narativ | Problém? |
|---|---|---|---|---|
| Pochodně | 3/3 | 2/3 | "zapálil jednu pochodeň (2/3)" (sc.22) | OK — 1 spotřebována |
| Zásoby | 5/6 | 3/6 | "snědl zásoby" (sc.22) + long rest jídlo | OK — 2 spotřebovány (viz sekce 4) |
| Kladívko | 3/3 | 3/3 | Beze změny | OK |
| Chitinový štít | 2/2 | 2/2 | Beze změny | OK |
| Léčivý obklad | 1/1 | 1/1 | Beze změny | OK |
| Píšťalčiny byliny | — | CHYBÍ | "sušené byliny proti horečce a obklad na rány" (sc.21) | **DROBNÉ: dar nezaúčtován** |
| Ďobky | 229 | 229 | Beze změny | OK |

**DROBNÝ PROBLÉM:** Píšťalka darovala "váček se sušenými bylinami" v sc.21, ale v inventáři není. Buď agent považoval za příliš malé na slot, nebo zapomněl přidat. Narativ říká "Okřál schoval váček do batohu" — měl být v inventáři.

### 9. ODPOČINEK — VERDIKT

- **Long rest po sc.21 (v hospodě):** Bezpečná lokace (hospoda v osadě) → long rest validní. BO 6/6 (max), STR 10/10, DEX 8/8, WIL 7/7 — vše na maxu. Save: strHeal=0, dexHeal=0, wilHeal=0. SPRÁVNĚ — nic k léčení. Požaduje 1 jídlo — viz sekce 4.
- **Short rest po sc.22 (v divočině, dutý pařez):** Short rest vyžaduje 10 min + vodu. Narativ popisuje potok na rozcestí a les — voda předpokládatelná. Save: boHealed=0, roll=3. BO bylo 6/6 → nic k léčení. SPRÁVNĚ.

### 10. OVĚŘENÍ FINÁLNÍHO STAVU

Uživatel očekává: Scéna 23 začala, CF 1, den 10 ráno, Chladno, zásoby 3/6, pochodně 2/3.

| Parametr | Očekávaný | Skutečný save | Shoda? |
|---|---|---|---|
| Scéna | 23 (začala) | sceneNum: 23, d10: 10, expected | OK |
| CF | 1 | cf: 1 | OK |
| Den | 10, ráno | den: 10, hlidka: "poledne" | **NESEDÍ — poledne místo ráno** |
| Počasí | Chladno | pocasi: "Chladno" | OK |
| Zásoby | 3/6 | tecky.akt: 3, max: 6 | OK |
| Pochodně | 2/3 | tecky.akt: 2, max: 3 | OK |
| STR | 10/10 | akt: 10, max: 10 | OK |
| DEX | 8/8 | akt: 8, max: 8 | OK |
| WIL | 7/7 | akt: 7, max: 7 | OK |
| BO | 6/6 | akt: 6, max: 6 | OK |
| Ďobky | 229 | dobky: 229 | OK |

**NESEDÍ:** Čas je "poledne" místo očekávaného "ráno". Text scény 23 sám říká "Den 10, poledne" — takže save odpovídá narativu, ale uživatel očekával "ráno". Sc.22 skončila den 9 večer → přenocování → den 10 ráno → cesta → den 10 poledne (příchod do Mechového Prahu). Save i narativ říkají "poledne" — 1 hlídka cesty od bivaku.

### 11. AUDIT SHRNUTÍ

**PRAVIDLA: OK (s výhradou Fate thresholdů).** Scene test správně (oba d10 > CF 1). CF změny správně (minimum 1). Odpočinky validní. Systémový bug s underscore v odds labels (Very_likely, Somewhat_likely) způsobuje tiché defaultování na 50/50. Navíc "Somewhat_likely" vůbec neexistuje v Mythic GME 2e. Žádný výsledek Fate otázky nebyl fakticky ovlivněn (všechny hody dostatečně vysoké).

**BOOKKEEPING: ČÁSTEČNĚ OK.** CF správně. Jedení celkově správně (2 porce za 2 dny). Čas posunut. Počasí odpovídá. Problémy: (1) Otec NPC w1→w2 bez důvodu, (2) Nabídka hospody thread +3 a Kožíšek thread +1 bez discovery check entries, (3) chybí long rest entry pro noc den 9→10.

**KONZISTENCE: PŘEVÁŽNĚ OK.** Inventář odpovídá (pochodně, zásoby). Staty nepoškozeny. Ďobky beze změny. Drobné: Píšťalčiny byliny nezaúčtovány v inventáři.

**CHYBY AGENTA:**
1. **Systémový: underscore v Fate odds labels** ("Very_likely", "Somewhat_likely") → engine tiše degraduje na 50/50. Opravit v agentově workflow: používat přesné labels z `ODDS_LABELS` ("Very likely" s mezerou).
2. **Systémový: "Somewhat_likely" neexistuje** v Mythic GME 2e. Používat jen 9 standardních stupňů.
3. **Otec NPC váha w1→w2** bez účasti nebo zmínky.
4. **Thread progress bez discovery check** (Nabídka hospody +3, Kožíšek +1). Mechanicky by měl být discovery entry.
5. **Chybějící long rest entry** pro noc den 9→10 (mezi sc.22 a sc.23).
6. **Píšťalčiny byliny** nezaúčtovány v inventáři (drobné).
7. **Propagovaná chyba zásob (od sc.11):** Kumulativní −1 stále přetrvává. Zásoby "absolutně" by měly být 4/6, ne 3/6.
