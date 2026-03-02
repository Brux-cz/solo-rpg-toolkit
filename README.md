# Solo RPG Toolkit

Aplikace pro sólové hraní stolních RPG her — konkrétně **Mausritter** s **Mythic GME** (Game Master Emulator).

## O co jde

Při sólovém RPG jsi hráč i Game Master zároveň. Nemáš nikoho, kdo by ti říkal co se děje — místo toho používáš sadu nástrojů (orákulum, generátory, tabulky), které ti pomáhají vymýšlet příběh.

**Hlavní problém:** Po pár sezeních se hromadí informace — NPC, osady, frakce, úkoly, příběhové linky. Na papíře se v tom ztratíš. Tady pomáhá tato aplikace.

## Struktura

### Kampáňová Wiki (jádro)
Propojená databáze všech entit kampaně:
- **Postava** — inventář, vlastnosti, stav
- **NPC** — kdo, kde žije, ke které frakci patří
- **Osady / Místa** — obyvatelé, události, úkoly
- **Frakce** — členové, cíle, sídla
- **Úkoly / Hooky** — zdroj, lokace, stav
- **Příběhové linky (Threads)** — otevřené zápletky
- **Předměty** — příběhově důležité věci
- **Chaos Faktor** — persistentní hodnota (1–9)
- **Deník** — timeline scén s propojením na entity

Klíčová hodnota: **propojení**. NPC není jen řádek — patří do osady, je členem frakce, dal ti úkol, byl potkán ve scéně 5.

### Cyklus scény (Mythic GME)
1. **Očekávání** — Co by se mělo stát? (čteš z wiki, používáš nástroje)
2. **Test chaosu** — d10 vs Chaos Faktor
3. **Typ scény** — Očekávaná / Pozměněná / Přerušená
4. **Hraní scény** — Vyprávíš, rozhoduješ, používáš nástroje
5. **Scéna vyčerpána** — Rozhodneš kdy končí
6. **Bookkeeping** — Aktualizace NPC, threads, chaos ±1, zápis do wiki

→ Zpět na krok 1.

### Panel nástrojů
- **Meaning Tables** — dvojice abstraktních slov k interpretaci
- **Orákulum (Fate Questions)** — otázky ano/ne
- **Generátory** — NPC, osady, úkoly, poklady z knih
- **Hod kostkou** — d4 až d20

Všechno jsou zdroje inspirace — použiješ kdy chceš.

## Tech stack

- **React + TypeScript** — UI
- **Vite** — build tool
- **Tailwind CSS v4** — styling
- **Dexie.js** — IndexedDB wrapper (lokální databáze)
- **PWA** — offline přístup, instalovatelné na mobil i PC

## Spuštění

```bash
npm install
npm run dev
```

## Roadmap

- [x] Základní struktura projektu
- [x] Databázové schéma (Dexie)
- [ ] CRUD pro všechny entity
- [ ] Propojení entit (NPC → osada → frakce)
- [ ] Deník scén s auto-propojením
- [ ] Hod kostkou
- [ ] Orákulum (Fate Questions)
- [ ] Meaning Tables
- [ ] Test chaosu + typ scény
- [ ] Generátory (NPC, osady, poklady)
- [ ] Export / import dat
- [ ] Sync mezi zařízeními

## Licence

MIT
