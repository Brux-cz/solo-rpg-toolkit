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

### Jídlo — propagace chyb
- **Jednou za den = JEDNOU za den.** Pokud jedl v bookkeepingu sc.11, NESMÍ jíst znovu v sc.12 (stejný den). Chyba se propaguje do dalších scén (zásoby o 1 méně než měly být). Aktuální stav po přehraném sc.14: zásoby 4/6 (save), měly by být 5/6 (kumulativní −1 od sc.11). Přehraný boj sc.14: zásoby 6→4 (1 Okřál + 1 Pecka) — OK pokud jedení za den 5 (po odpočinku), ale kumulativní chyba z dřívějška zůstává.

### Combat — přehraný boj sc.14
- **Přehraný boj v sc.14 (3 kola) prošel auditem bez chyb.** Damage pipeline, zeslaběný útok, útěk, opotřebení — vše správně. Engine bug z prvního pokusu (armor=2) se v přehraném boji neobjevil (boj odehrán ručně bez engine).

### Narativní styl
- Myší optika funguje dobře (od scény 7)
- Rozhovory s hlasem — NPC mají osobnost, emotivní dialogy
- Meaning tables jako motor příběhu — interpretovat, ne jen reportovat
