---
name: play
description: "Play the Solo RPG game autonomously via Playwright. Use this skill whenever the user says 'hraj', 'play', 'pokracuj ve hre', 'odehraj scenu', 'hraj dokud te nezastavim', or any variation of 'play the game'. This skill ensures Claude plays creatively while correctly applying Mausritter + Mythic GME 2e rules from the reference diagram."
---

# Play — Solo RPG Autonomous Player

You are playing a solo RPG (Mausritter + Mythic GME 2e) through a web app via Playwright. You play creatively and strategically like a real player — then retroactively verify and apply the correct rules.

## Core Philosophy

**Think first, play second, check rules third.**

1. **THINK** — What would my character do? What makes sense narratively? Is this dangerous?
2. **PLAY** — Act in the app via Playwright. Be creative, make interesting narrative choices.
3. **CHECK** — After acting, look up the relevant rules in `src/docs/solo-rpg-diagram.jsx` and verify you applied them correctly. Fix if needed.

You are not a mechanical rule executor. You are a player who happens to verify rules after each decision.

## Survival Mindset

Mausritter is a deadly game. Your mouse is fragile — one bad fight can kill you. Before any risky action, think: "If I were really this mouse, would I risk my life here?" Prefer negotiation, stealth, and cleverness over direct combat. Running away is always an option.

## Game Loop

Play in a continuous loop, scene after scene, until the user stops you:

```
LOOP:
  1. NEW SCENE → read rules, then open SceneSheet
  2. PLAY THE SCENE → narrate, use app tools (Fate, Meaning, Combat...)
  3. END SCENE → read bookkeeping rules, then do all steps via EndSceneSheet
  4. → back to 1
```

## Rule Lookup — The Only Source of Truth

All rules are in `src/docs/solo-rpg-diagram.jsx`. The file is ~1790 lines. NEVER read the whole file. NEVER rely on your own knowledge of the rules — always read the diagram.

**How to find the right section:**

1. Determine what you're about to do (combat, new scene, rest, travel, fate question...)
2. Open `CLAUDE.md` and find section **"Mapa diagramu (řádky)"**
3. Find the matching entry — each line has format: `ř. X–Y: key — popis`
4. Read ONLY those lines from `src/docs/solo-rpg-diagram.jsx`

Do NOT hardcode or memorize line numbers. Always look them up in CLAUDE.md — the map may change as the diagram evolves.

## Retroactive Rule Check

After each mechanical action (combat, save, rest, travel), do this:

1. Identify what type of action you just performed
2. Look up the matching section in CLAUDE.md "Mapa diagramu"
3. Read those lines from the diagram
4. Compare what you did vs what the diagram says
5. If there's a mismatch — fix it immediately (edit diary, adjust stats, redo the roll)

Do NOT skip this step. The most common mistakes happen when you assume you know the rules without checking.

## Bookkeeping

At the END of every scene, look up "bookkeeping" in CLAUDE.md "Mapa diagramu", read the corresponding lines from the diagram, and follow ALL steps listed there. Do not skip any. Do not do them from memory — read them fresh each time.

## Using the App via Playwright

The app runs at localhost. Use Playwright MCP tools to interact:
- Take snapshots to see current state
- Click buttons, fill forms, navigate tabs
- Key areas: ActionToolbar (game actions), BottomNav (Denik/Postava/Svet tabs), Header (scene/CF/stats)

## Output to User

After each scene, briefly summarize (2-3 sentences):
- What happened narratively
- Key mechanical results
- Current state (stats, supplies, time)

Keep it concise — the app diary has the full record.

## Safety Check — End of Every Scene

Before starting the next scene, stop and answer these questions honestly:

1. **Přečetl jsem pravidla?** — Otevřel jsem CLAUDE.md mapu a přečetl relevantní sekce diagramu, nebo jsem hrál z paměti?
2. **Mechanika sedí?** — Každý hod, save, damage — udělal jsem to podle toho co jsem přečetl v diagramu?
3. **Čas a zásoby?** — Posunul jsem čas? Odečetl jsem zásoby?
4. **Bookkeeping kompletní?** — Udělal jsem VŠECHNY kroky z diagramu, ne jen některé?
5. **Přežití dává smysl?** — Neudělal jsem něco co by reálný hráč neudělal? Nebyl boj příliš snadný?

Pokud na cokoliv odpovím "ne" nebo "nejsem si jistý":
1. ZASTAVÍM SE
2. Dohledám pravidla v diagramu (přes CLAUDE.md mapu)
3. OPRAVÍM problém v appce (posunu čas, odečtu zásoby, upravím staty, přepíšu deník)
4. Teprve pak pokračuji další scénou

Nestačí problém jen zapsat — musím ho OPRAVIT v appce než jdu dál.
