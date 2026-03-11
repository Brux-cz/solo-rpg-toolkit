---
name: play
description: "Play the Solo RPG game autonomously via Playwright. Use this skill whenever the user says 'hraj', 'play', 'pokracuj ve hre', 'odehraj scenu', 'hraj dokud te nezastavim', or any variation of 'play the game'. This skill ensures Claude plays creatively while correctly applying Mausritter + Mythic GME 2e rules from the reference diagram."
---

# Play — Solo RPG Autonomous Player

You are playing a solo RPG (Mausritter + Mythic GME 2e) through a web app via Playwright. Think like a real player — creative, cautious, strategic. Mausritter is deadly: prefer negotiation and cleverness over combat.

## Core Principle

**Think → Play → Check rules.** You are not a rule executor. You play first, then verify against `src/docs/solo-rpg-diagram.jsx`. Never rely on memory — always read the diagram.

To find rules: open CLAUDE.md → "Mapa diagramu (řádky)" → find matching entry → read ONLY those lines from the diagram.

## Game Loop

Play scene after scene until the user stops you. Every scene follows this exact sequence:

### 1. New Scene
- Look up "test_chaosu" + "typ_sceny_bg" in CLAUDE.md diagram map, read those lines
- Open SceneSheet, set up the scene per rules

### 2. Play the Scene
- Narrate, use app tools (Fate, Meaning, Combat, Detail Check...)
- After any mechanical action (combat, save, rest), look up the matching rules and verify you did it right. Fix mismatches immediately.

### 3. End Scene — Bookkeeping
- Look up "bookkeeping_bg" in CLAUDE.md diagram map, read those lines
- Open EndSceneSheet, follow ALL bookkeeping steps from the diagram (not from memory)
- Adjust CF, update NPC/Thread weights, advance time, deduct supplies

### 4. Wiki Update
Go to SvětTab and update every NPC/Thread that appeared in the scene:
- **NPC cards** (SvětTab → "NPC"): expand card → update popis, lokace, vztah, poznámky. If they fought: update combat stats.
- **Thread details** (SvětTab → "Thready"): expand → update popis, stav, poznámky
- Return to "Deník" tab when done

### 5. Backup
Extract save via `browser_evaluate`:
```javascript
const idx = JSON.parse(localStorage.getItem('solorpg_index'));
const game = JSON.parse(localStorage.getItem('solorpg_' + idx.activeId));
const name = idx.saves.find(s => s.id === idx.activeId)?.name || 'save';
JSON.stringify({ exportVersion: 1, name, game });
```
Save result to `.claude/skills/play-workspace/backups/<game-name>.json` (overwrite previous).

### 6. Quick Check
Before starting next scene, verify:
1. **Pravidla** — Četl jsem diagram, nebo jsem hrál z paměti?
2. **Bookkeeping** — Čas, zásoby, CF, NPC/Thread váhy — vše hotovo?
3. **Wiki + záloha** — NPC karty aktuální? Backup uložen?

If anything is missing → fix it in the app, then continue.

### 7. → Back to step 1

## Using the App

Use Playwright MCP tools: snapshots, clicks, form fills. Key areas: ActionToolbar (actions), BottomNav (Deník/Postava/Svět), Header (scene/CF/stats).

## Output to User

After each scene, briefly summarize (2-3 sentences): what happened, key mechanical results, current state (stats, supplies, time).
