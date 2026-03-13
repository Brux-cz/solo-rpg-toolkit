import { roll, checkFate, checkScene, rollMeaning, getEventFocus, rollDiscoveryCheck, rollWeather, resolveEventTarget, rollFromList } from "../utils/dice.js";
import { resolveDamage, rollInitiative, rollMorale, assessDanger, rollMoraleAdvantage } from "../utils/combat.js";
import { BESTIARY } from "../constants/bestiary.js";
import { ODDS_LABELS } from "../constants/tables.js";

export class GameEngine {
  constructor(game) {
    this.game = game;
  }

  // --- DENÍK ---

  _id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  addEntry(entry) {
    this.game.entries.push({ ...entry, id: this._id(), ts: Date.now() });
  }

  // --- SCÉNA ---

  startScene(title) {
    this.game.sceneNum++;
    const result = checkScene(this.game.cf);
    const entry = {
      type: "scene",
      sceneNum: this.game.sceneNum,
      title: title || "Nová scéna",
      sceneType: result.type,
      cf: this.game.cf,
      d10: result.d10,
    };
    if (result.type === "altered") {
      entry.adj = result.adj;
    }
    if (result.type === "interrupt") {
      entry.focus = result.focus;
      entry.meaning = result.meaning;
      const target = resolveEventTarget(entry.focus, this.game.npcs, this.game.threads);
      if (target) {
        entry.eventTargetName = target.name || null;
        entry.eventTargetReroll = target.reroll || false;
        entry.eventTargetEmpty = target.empty || false;
      }
    }
    this.addEntry(entry);
    return entry;
  }

  endScene(hadControl) {
    const cfOld = this.game.cf;
    if (hadControl) {
      this.game.cf = Math.max(1, this.game.cf - 1);
    } else {
      this.game.cf = Math.min(9, this.game.cf + 1);
    }
    const entry = {
      type: "endscene",
      sceneNum: this.game.sceneNum,
      cfOld,
      cfNew: this.game.cf,
    };
    this.addEntry(entry);
    return entry;
  }

  // --- FATE ---

  fate(question, oddsLabel) {
    const oddsIndex = ODDS_LABELS.indexOf(oddsLabel);
    const idx = oddsIndex >= 0 ? oddsIndex : 4; // default 50/50
    const result = checkFate(idx, this.game.cf);
    const entry = {
      type: "fate",
      question: question || "?",
      oddsLabel: oddsLabel || "50/50",
      d100: result.d100,
      yes: result.yes,
      exceptional: result.exceptional,
      randomEvent: result.randomEvent,
      cf: this.game.cf,
      threshold: result.threshold,
    };
    // Random Event
    if (result.randomEvent) {
      entry.eventFocus = getEventFocus();
      entry.eventMeaning = rollMeaning("actions");
      const target = resolveEventTarget(entry.eventFocus, this.game.npcs, this.game.threads);
      if (target) {
        entry.eventTargetName = target.name || null;
        entry.eventTargetReroll = target.reroll || false;
        entry.eventTargetEmpty = target.empty || false;
      }
    }
    this.addEntry(entry);
    return entry;
  }

  // --- MEANING ---

  meaning(table) {
    const result = rollMeaning(table || "actions");
    const entry = {
      type: "meaning",
      table: table || "actions",
      word1: result.word1,
      word2: result.word2,
      d1: result.d1,
      d2: result.d2,
      cz1: result.cz1,
      cz2: result.cz2,
    };
    this.addEntry(entry);
    return entry;
  }

  // --- DETAIL CHECK ---

  detail(table) {
    const result = rollMeaning(table || "descriptions");
    const entry = {
      type: "detail",
      table: table || "descriptions",
      word1: result.word1,
      word2: result.word2,
      d1: result.d1,
      d2: result.d2,
      cz1: result.cz1,
      cz2: result.cz2,
    };
    this.addEntry(entry);
    return entry;
  }

  // --- POZNÁMKA ---

  note(text) {
    const clean = text.replace(/\\([!?.])/g, "$1");
    const entry = { type: "text", text: clean, editable: true };
    this.addEntry(entry);
    return entry;
  }

  // --- HOD KOSTKOU ---

  dice(sides) {
    const value = roll(sides);
    const entry = { type: "dice", die: `d${sides}`, value };
    this.addEntry(entry);
    return entry;
  }

  // --- DISCOVERY CHECK ---

  discovery(threadIndex, meaningTable) {
    const thread = this.game.threads[threadIndex];
    if (!thread) return { error: "Thread neexistuje" };
    const result = rollDiscoveryCheck(thread.progress || 0, meaningTable || "actions");
    // Aktualizuj progress
    if (result.points) {
      thread.progress = Math.min((thread.progress || 0) + result.points, thread.total || 10);
    }
    const entry = {
      type: "discovery",
      threadName: thread.name,
      fateD100: result.fateD100,
      fateExceptional: result.fateExceptional,
      discoveryD10: result.discoveryD10,
      discoveryTotal: result.discoveryTotal,
      discoveryType: result.discoveryType,
      discoveryPoints: result.points,
      discoveryDesc: result.discoveryDesc,
    };
    if (result.meaning) entry.meaning = result.meaning;
    if (result.randomEvent) {
      entry.randomEvent = true;
      entry.eventFocus = result.eventFocus;
      entry.eventMeaning = result.eventMeaning;
    }
    this.addEntry(entry);
    return entry;
  }

  // --- NPC BEHAVIOR ---

  behavior(npcName) {
    const result = rollMeaning("actions");
    const entry = {
      type: "behavior",
      npc: npcName || "NPC",
      word1: result.word1,
      word2: result.word2,
      d1: result.d1,
      d2: result.d2,
      cz1: result.cz1,
      cz2: result.cz2,
    };
    this.addEntry(entry);
    return entry;
  }

  // --- BOJ (kolo po kole) ---

  /**
   * Zahájí boj — nastaví game.activeCombat, hodí iniciativu.
   * @param {string[]} enemyNames — jména z bestiáře nebo vlastní
   * @param {string} surprise — "player"|"enemy"|null
   */
  combatSetup(enemyNames, surprise = null) {
    const enemies = enemyNames.map(name => {
      const beast = BESTIARY.find(b => b.name.toLowerCase() === name.toLowerCase());
      if (beast) return { ...beast, boMax: beast.bo, strMax: beast.str };
      return { name, str: 6, strMax: 6, dex: 6, wil: 4, bo: 3, boMax: 3, weapon: "d6", armor: 0, crit: "" };
    });

    let playerFirst;
    let initDetail;
    if (surprise === "player") {
      playerFirst = true;
      initDetail = "Myší strana překvapila → automaticky první";
    } else if (surprise === "enemy") {
      playerFirst = false;
      initDetail = "Nepřítel překvapil → nepřítel první";
    } else {
      const init = rollInitiative(this.game.character.dex.akt);
      playerFirst = init.playerFirst;
      initDetail = `DEX save d20=${init.d20} vs DEX ${this.game.character.dex.akt} → ${playerFirst ? "myší strana" : "nepřítel"} první`;
    }

    const combat = {
      round: 0,
      playerFirst,
      enemies,
      log: [],
      usedWeapons: [],   // pro opotřebení na konci
      usedArmors: [],
      surprise,
      result: "ongoing",
    };
    combat.log.push(`Iniciativa: ${initDetail}`);
    this.game.activeCombat = combat;

    // Danger assessment
    const danger = assessDanger(
      { playerBo: this.game.character.bo.akt, playerStr: this.game.character.str.akt, playerArmor: this._getPlayerArmor(),
        hirelingBo: this._getHirelingBo(), hirelingStr: this._getHirelingStr(), hirelingArmor: this._getHirelingArmor() },
      enemies
    );

    return {
      initiative: initDetail,
      playerFirst,
      surprise,
      enemies: enemies.map(e => ({ name: e.name, str: e.str, bo: e.bo, weapon: e.weapon || e.damage, armor: e.armor, wil: e.wil })),
      danger,
    };
  }

  /**
   * Útok jedné postavy na cíl.
   * @param {string} attackerName — "hráč", jméno pomocníka, nebo jméno nepřítele
   * @param {string} targetName — jméno cíle
   * @param {string} modifier — "enhanced"|"weakened"|"dual"|null
   */
  combatAttack(attackerName, targetName, modifier = null) {
    const c = this.game.activeCombat;
    if (!c) return { error: "Žádný aktivní boj. Nejdřív combatSetup()." };

    const { attacker, isPlayer, isHireling, isEnemy } = this._findCombatant(attackerName);
    if (!attacker) return { error: `Útočník "${attackerName}" nenalezen` };

    const { combatant: target, isEnemy: targetIsEnemy } = this._findTarget(targetName);
    if (!target) return { error: `Cíl "${targetName}" nenalezen` };

    // Zjisti zbraň a zbroj
    let weaponDie;
    let weaponName;
    if (isPlayer) {
      const w = this._getPlayerWeaponInfo();
      weaponDie = w.die; weaponName = w.name;
      if (!c.usedWeapons.includes("hráč")) c.usedWeapons.push("hráč");
    } else if (isHireling) {
      const w = this._getHirelingWeaponInfo();
      weaponDie = w.die; weaponName = w.name;
      if (!c.usedWeapons.includes("pomocník")) c.usedWeapons.push("pomocník");
    } else {
      weaponDie = parseInt((attacker.weapon || attacker.damage || "d6").replace("d", ""));
      weaponName = attacker.weapon || attacker.damage || "d6";
    }

    let targetArmor;
    if (targetIsEnemy) {
      targetArmor = target.armor || 0;
    } else if (targetName.toLowerCase() === "hráč") {
      targetArmor = this._getPlayerArmor();
      if (!c.usedArmors.includes("hráč")) c.usedArmors.push("hráč");
    } else {
      targetArmor = this._getHirelingArmor();
      if (!c.usedArmors.includes("pomocník")) c.usedArmors.push("pomocník");
    }

    // Hod na zranění podle modifikátoru
    let dmgRoll;
    let rollDetail;
    if (modifier === "enhanced") {
      dmgRoll = roll(12);
      rollDetail = `d12=${dmgRoll} (zesílený)`;
    } else if (modifier === "weakened") {
      dmgRoll = roll(4);
      rollDetail = `d4=${dmgRoll} (zeslabený)`;
    } else if (modifier === "dual") {
      const r1 = roll(6), r2 = roll(6);
      dmgRoll = Math.max(r1, r2);
      rollDetail = `2×d6=[${r1},${r2}] → ${dmgRoll} (dvě lehké)`;
    } else {
      dmgRoll = roll(weaponDie);
      rollDetail = `d${weaponDie}=${dmgRoll}`;
    }

    // Damage pipeline
    const targetBo = targetIsEnemy ? target.bo : (targetName.toLowerCase() === "hráč" ? this.game.character.bo.akt : this._getHirelingBo());
    const targetStr = targetIsEnemy ? target.str : (targetName.toLowerCase() === "hráč" ? this.game.character.str.akt : this._getHirelingStr());
    const dmg = resolveDamage(dmgRoll, targetArmor, targetBo, targetStr);

    // Zapiš zpět
    if (targetIsEnemy) {
      target.bo = dmg.boAfter;
      target.str = dmg.strAfter;
    } else if (targetName.toLowerCase() === "hráč") {
      this.game.character.bo.akt = dmg.boAfter;
      this.game.character.str.akt = dmg.strAfter;
    } else {
      this._setHirelingStats(dmg.boAfter, dmg.strAfter);
    }

    // Log
    const attackerLabel = isPlayer ? "Hráč" : (isHireling ? this._getHirelingName() : attacker.name);
    const targetLabel = targetIsEnemy ? target.name : (targetName.toLowerCase() === "hráč" ? "Hráč" : this._getHirelingName());
    let logLine = `${attackerLabel} ${rollDetail} − zbroj ${targetArmor} → ${dmg.totalDmg} dmg → ${targetLabel} BO ${dmg.boBefore}→${dmg.boAfter}`;
    if (dmg.strAfter < dmg.strBefore) logLine += `, STR ${dmg.strBefore}→${dmg.strAfter}`;
    if (dmg.dead) logLine += ` → MRTVÝ!`;
    if (dmg.wounded) logLine += ` → STR save d20=${dmg.strSave} FAIL → VYŘAZENÝ (krit. zranění, 6 směn)`;
    if (dmg.strSave && dmg.strSaveResult) logLine += ` → STR save d20=${dmg.strSave} OK`;
    c.log.push(logLine);

    return {
      attacker: attackerLabel,
      target: targetLabel,
      roll: rollDetail,
      armor: targetArmor,
      damage: dmg.totalDmg,
      boAfter: dmg.boAfter,
      strAfter: dmg.strAfter,
      dead: dmg.dead,
      wounded: dmg.wounded,
      strSave: dmg.strSave,
      strSaveOk: dmg.strSaveResult,
      log: logLine,
    };
  }

  /**
   * Seslání kouzla.
   * @param {string} casterName — "hráč" nebo jméno pomocníka
   * @param {number} slotIndex — slot inventáře s kouzlem
   * @param {number} power — moc 1-3 (počet d6)
   */
  combatCastSpell(casterName, slotIndex, power = 1) {
    const c = this.game.activeCombat;
    if (!c) return { error: "Žádný aktivní boj" };

    const inv = casterName.toLowerCase() === "hráč"
      ? this.game.character.inventar
      : (this.game.character.pomocnici[0]?.inventar || []);
    const spell = inv[slotIndex];
    if (!spell || spell.typ !== "kouzlo") return { error: "Na tomto slotu není kouzlo" };

    const dice = [];
    let usedCharges = 0;
    let wilDmg = 0;
    for (let i = 0; i < Math.min(power, 3); i++) {
      const d = roll(6);
      dice.push(d);
      if (d >= 4) usedCharges++;
      if (d === 6) wilDmg += roll(6); // vymknutí
    }
    spell.tecky.akt = Math.max(0, spell.tecky.akt - usedCharges);
    if (spell.tecky.akt <= 0) spell.nazev = ""; // kouzlo zničeno

    let wilSaveOk = null;
    if (wilDmg > 0) {
      const caster = casterName.toLowerCase() === "hráč" ? this.game.character : this.game.character.pomocnici[0];
      caster.wil.akt = Math.max(0, caster.wil.akt - wilDmg);
      if (caster.wil.akt > 0) {
        const save = roll(20);
        wilSaveOk = save <= caster.wil.akt;
      }
    }

    const logLine = `${casterName} sesílá ${spell.nazev || "kouzlo"} (moc ${power}): [${dice.join(",")}] → ${usedCharges} teček škrtnuto${wilDmg > 0 ? `, VYMKNUTÍ ${wilDmg} dmg WIL${wilSaveOk === false ? " → POMATENÍ!" : ""}` : ""}`;
    c.log.push(logLine);

    return { dice, total: dice.reduce((a, b) => a + b, 0), usedCharges, wilDmg, wilSaveOk, log: logLine };
  }

  /**
   * Pokus o útěk z boje (DEX save).
   * @param {string} characterName — "hráč" nebo jméno pomocníka
   */
  combatEscape(characterName) {
    const c = this.game.activeCombat;
    if (!c) return { error: "Žádný aktivní boj" };

    const isPlayer = characterName.toLowerCase() === "hráč";
    const dex = isPlayer ? this.game.character.dex.akt : (this.game.character.pomocnici[0]?.dex?.akt || 6);
    const d20 = roll(20);
    const success = d20 <= dex;

    const label = isPlayer ? "Hráč" : this._getHirelingName();
    const logLine = `${label} pokus o útěk: DEX save d20=${d20} vs ${dex} → ${success ? "ÚSPĚCH — unikl!" : "NEÚSPĚCH — následky!"}`;
    c.log.push(logLine);

    return { character: label, d20, dex, success, log: logLine };
  }

  /**
   * Vytáhne předmět z batohu do pacek (celá akce!).
   * @param {string} characterName — "hráč" nebo jméno pomocníka
   * @param {number} fromSlot — slot batohu
   * @param {number} toSlot — slot packy
   */
  combatFromBackpack(characterName, fromSlot, toSlot) {
    const inv = characterName.toLowerCase() === "hráč"
      ? this.game.character.inventar
      : (this.game.character.pomocnici[0]?.inventar || []);
    if (!inv[fromSlot]?.nazev) return { error: "Prázdný slot" };
    const item = { ...inv[fromSlot] };
    inv[fromSlot] = { ...inv[toSlot] }; // swap
    inv[toSlot] = item;

    const c = this.game.activeCombat;
    if (c) c.log.push(`${characterName} vytahuje ${item.nazev} z batohu → CELÁ AKCE`);
    return { item: item.nazev, action: "full", log: `${item.nazev} přesunuto do packy (celá akce)` };
  }

  /**
   * Prohodí předmět tělo ↔ packy (volná akce).
   */
  combatSwapPaws(characterName, slotA, slotB) {
    const inv = characterName.toLowerCase() === "hráč"
      ? this.game.character.inventar
      : (this.game.character.pomocnici[0]?.inventar || []);
    const tmp = { ...inv[slotA] };
    inv[slotA] = { ...inv[slotB] };
    inv[slotB] = tmp;

    const c = this.game.activeCombat;
    if (c) c.log.push(`${characterName} prohodil ${tmp.nazev || "prázdno"} ↔ ${inv[slotA].nazev || "prázdno"} (volná akce)`);
    return { ok: true, action: "free" };
  }

  /**
   * Použije předmět (spotřebuje tečku).
   * @param {string} characterName
   * @param {number} slotIndex
   */
  combatUseItem(characterName, slotIndex) {
    const inv = characterName.toLowerCase() === "hráč"
      ? this.game.character.inventar
      : (this.game.character.pomocnici[0]?.inventar || []);
    const item = inv[slotIndex];
    if (!item?.nazev) return { error: "Prázdný slot" };
    const before = item.tecky.akt;
    item.tecky.akt = Math.max(0, item.tecky.akt - 1);

    const c = this.game.activeCombat;
    const logLine = `${characterName} použil ${item.nazev} (tečky ${before}→${item.tecky.akt})`;
    if (c) c.log.push(logLine);
    return { item: item.nazev, teckyBefore: before, teckyAfter: item.tecky.akt, log: logLine };
  }

  /**
   * Hod morálky (WIL save). Agent rozhodne kdy zavolat.
   * @param {string} name — jméno nepřítele nebo "pomocník"
   * @param {boolean} advantage — věrný pomocník má výhodu (2d20 nižší)
   */
  combatMorale(name, advantage = false) {
    const c = this.game.activeCombat;
    if (!c) return { error: "Žádný aktivní boj" };

    let wil;
    const enemy = c.enemies.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (enemy) {
      wil = enemy.wil || 4;
    } else {
      // pomocník
      wil = this.game.character.pomocnici[0]?.wil?.akt || 6;
    }

    let d20, stays;
    if (advantage) {
      const r = rollMoraleAdvantage(wil);
      d20 = `${r.d20a},${r.d20b}→${r.best}`;
      stays = r.stays;
    } else {
      const r = rollMorale(wil);
      d20 = r.d20;
      stays = r.stays;
    }

    const logLine = `Morálka ${name}: d20=${d20} vs WIL ${wil} → ${stays ? "ZŮSTÁVÁ" : "UTÍKÁ!"}`;
    c.log.push(logLine);
    return { name, d20, wil, stays, log: logLine };
  }

  /**
   * Obecný záchranný hod (d20 ≤ atribut).
   * @param {string} name — "hráč", jméno pomocníka, nebo jméno nepřítele
   * @param {string} attr — "str"|"dex"|"wil"
   * @param {string} mode — "normal"|"advantage"|"disadvantage"
   */
  combatSavingThrow(name, attr, mode = "normal") {
    const val = this._getAttrValue(name, attr);
    if (val === null) return { error: `Atribut "${attr}" nenalezen pro "${name}"` };

    let d20, success;
    if (mode === "advantage") {
      const r1 = roll(20), r2 = roll(20);
      d20 = Math.min(r1, r2);
      success = d20 <= val;
      const logLine = `${name} ${attr.toUpperCase()} save (výhoda): 2d20=[${r1},${r2}]→${d20} vs ${val} → ${success ? "ÚSPĚCH" : "NEÚSPĚCH"}`;
      if (this.game.activeCombat) this.game.activeCombat.log.push(logLine);
      return { name, attr, d20, rolls: [r1, r2], value: val, success, mode, log: logLine };
    } else if (mode === "disadvantage") {
      const r1 = roll(20), r2 = roll(20);
      d20 = Math.max(r1, r2);
      success = d20 <= val;
      const logLine = `${name} ${attr.toUpperCase()} save (nevýhoda): 2d20=[${r1},${r2}]→${d20} vs ${val} → ${success ? "ÚSPĚCH" : "NEÚSPĚCH"}`;
      if (this.game.activeCombat) this.game.activeCombat.log.push(logLine);
      return { name, attr, d20, rolls: [r1, r2], value: val, success, mode, log: logLine };
    } else {
      d20 = roll(20);
      success = d20 <= val;
      const logLine = `${name} ${attr.toUpperCase()} save: d20=${d20} vs ${val} → ${success ? "ÚSPĚCH" : "NEÚSPĚCH"}`;
      if (this.game.activeCombat) this.game.activeCombat.log.push(logLine);
      return { name, attr, d20, value: val, success, mode, log: logLine };
    }
  }

  /**
   * Stav boje — HP všech, kdo je vyřazený, inventář v packách.
   */
  combatStatus() {
    const c = this.game.activeCombat;
    if (!c) return { error: "Žádný aktivní boj" };

    const char = this.game.character;
    const hireling = char.pomocnici[0];

    const status = {
      round: c.round,
      playerFirst: c.playerFirst,
      result: c.result,
      player: {
        name: char.jmeno || "Hráč",
        bo: char.bo.akt, boMax: char.bo.max,
        str: char.str.akt, strMax: char.str.max,
        dex: char.dex.akt, wil: char.wil.akt,
        paws: [char.inventar[0], char.inventar[1]].map(s => s?.nazev || "(prázdno)"),
        armor: this._getPlayerArmor(),
      },
      enemies: c.enemies.map(e => ({
        name: e.name, bo: e.bo, boMax: e.boMax, str: e.str, strMax: e.strMax,
        weapon: e.weapon || e.damage, armor: e.armor, wil: e.wil,
      })),
    };
    if (hireling && hireling.jmeno) {
      status.hireling = {
        name: hireling.jmeno,
        bo: hireling.bo?.akt || 0, boMax: hireling.bo?.max || 0,
        str: hireling.str?.akt || 0, strMax: hireling.str?.max || 0,
        dex: hireling.dex?.akt || 0, wil: hireling.wil?.akt || 0,
        paws: [hireling.inventar?.[0], hireling.inventar?.[1]].map(s => s?.nazev || "(prázdno)"),
        armor: this._getHirelingArmor(),
      };
    }
    return status;
  }

  /**
   * Inventář postavy rozčleněný na packy/tělo/batoh.
   * @param {string} name — "hráč" nebo jméno pomocníka
   */
  combatInventory(name) {
    let inv;
    if (name.toLowerCase() === "hráč") {
      inv = this.game.character.inventar;
    } else {
      inv = this.game.character.pomocnici[0]?.inventar || [];
    }
    return {
      packy: inv.slice(0, 2).map((s, i) => ({ slot: i, ...s })),
      telo: inv.slice(2, 4).map((s, i) => ({ slot: i + 2, ...s })),
      batoh: inv.slice(4).map((s, i) => ({ slot: i + 4, ...s })),
    };
  }

  /**
   * Opotřebení po boji — d6 za každou použitou zbraň/zbroj (4-6 = škrtni tečku).
   */
  combatWearCheck() {
    const c = this.game.activeCombat;
    if (!c) return { error: "Žádný aktivní boj" };

    const results = [];

    for (const who of c.usedWeapons) {
      const inv = who === "hráč" ? this.game.character.inventar : (this.game.character.pomocnici[0]?.inventar || []);
      const weapon = inv.find(s => s.typ === "zbraň" || s.typ === "zbraň_střelná");
      if (weapon && weapon.tecky) {
        const isImprovised = weapon.nazev?.toLowerCase().includes("improvi");
        if (isImprovised) {
          // improvizovaná vždy ztrácí tečku
          weapon.tecky.akt = Math.max(0, weapon.tecky.akt - 1);
          results.push({ who, item: weapon.nazev, d6: "auto", lost: true, tecky: weapon.tecky.akt });
          c.log.push(`Opotřebení: ${who} ${weapon.nazev} → automaticky škrtá tečku (${weapon.tecky.akt} zbývá)`);
        } else {
          const d6 = roll(6);
          const lost = d6 >= 4;
          if (lost) weapon.tecky.akt = Math.max(0, weapon.tecky.akt - 1);
          results.push({ who, item: weapon.nazev, d6, lost, tecky: weapon.tecky.akt });
          c.log.push(`Opotřebení: ${who} ${weapon.nazev} d6=${d6} → ${lost ? `škrtá tečku (${weapon.tecky.akt} zbývá)` : "OK"}`);
        }
      }
    }

    for (const who of c.usedArmors) {
      const inv = who === "hráč" ? this.game.character.inventar : (this.game.character.pomocnici[0]?.inventar || []);
      const armor = inv.find(s => s.typ === "zbroj");
      if (armor && armor.tecky) {
        const d6 = roll(6);
        const lost = d6 >= 4;
        if (lost) armor.tecky.akt = Math.max(0, armor.tecky.akt - 1);
        results.push({ who, item: armor.nazev, d6, lost, tecky: armor.tecky.akt });
        c.log.push(`Opotřebení: ${who} ${armor.nazev} d6=${d6} → ${lost ? `škrtá tečku (${armor.tecky.akt} zbývá)` : "OK"}`);
      }
    }

    return results;
  }

  /**
   * Ukončí boj, zapíše CombatBlock do deníku.
   * @param {string} result — "victory"|"death"|"escape"|"surrender"
   */
  combatEnd(result) {
    const c = this.game.activeCombat;
    if (!c) return { error: "Žádný aktivní boj" };

    c.result = result;
    const entry = {
      type: "combat",
      enemies: c.enemies.map(e => ({ name: e.name, str: e.str, bo: e.bo, weapon: e.weapon || e.damage, armor: e.armor })),
      initiativeText: c.log[0] || "",
      log: c.log,
      result,
    };
    this.addEntry(entry);
    delete this.game.activeCombat;
    return entry;
  }

  // --- POSTAVA ---

  /**
   * Nastaví/aktualizuje staty postavy.
   * @param {object} patch — {jmeno, prijmeni, puvod, str, dex, wil, bo, dobky, barvaSrsti, vzorSrsti, znameni, vyraznyRys}
   * Staty mohou být číslo (nastaví akt i max) nebo {akt, max}.
   */
  setCharacter(patch) {
    const char = this.game.character;
    for (const [key, val] of Object.entries(patch)) {
      if (["str", "dex", "wil", "bo"].includes(key)) {
        if (typeof val === "number") {
          char[key] = { akt: val, max: val };
        } else {
          char[key] = { ...char[key], ...val };
        }
      } else if (key === "inventar") {
        // Inventář: pole objektů, merge po indexu
        val.forEach((item, i) => {
          if (item && i < char.inventar.length) {
            char.inventar[i] = { ...char.inventar[i], ...item };
          }
        });
      } else {
        char[key] = val;
      }
    }
    return { ok: true, character: char };
  }

  // --- INVENTÁŘ ---

  _getInv(who) {
    if (who === "pomocník") return { inv: this.game.character.pomocnici[0]?.inventar || [], cols: 3 };
    return { inv: this.game.character.inventar, cols: 5 };
  }

  _recalcOccupied(inv, cols) {
    const rows = Math.ceil(inv.length / cols);
    const next = inv.map(s => s?._occupied ? { nazev: "", typ: "", tecky: { akt: 0, max: 0 } } : { ...s });
    for (let i = 0; i < next.length; i++) {
      const s = next[i];
      if (!s?.nazev || !s.span || (s.span.rows <= 1 && s.span.cols <= 1)) continue;
      const r = Math.floor(i / cols), c = i % cols;
      if (c + (s.span.cols || 1) > cols || r + (s.span.rows || 1) > rows) continue;
      const indices = [];
      for (let sr = 0; sr < (s.span.rows || 1); sr++)
        for (let sc = 0; sc < (s.span.cols || 1); sc++)
          indices.push((r + sr) * cols + c + sc);
      let canFit = true;
      for (const idx of indices) {
        if (idx === i || idx >= next.length) continue;
        if (next[idx].nazev || next[idx]._occupied) { canFit = false; break; }
      }
      if (!canFit) continue;
      for (const idx of indices) {
        if (idx !== i && idx < next.length) next[idx] = { _occupied: true, _owner: i };
      }
    }
    return next;
  }

  _writeInv(who, inv, cols) {
    const result = this._recalcOccupied(inv, cols);
    if (who === "pomocník") this.game.character.pomocnici[0].inventar = result;
    else this.game.character.inventar = result;
    return result;
  }

  /**
   * Nastaví slot inventáře. Řeší multi-slot (span, _occupied).
   * @param {string} who — "hráč" nebo "pomocník"
   * @param {number} slotIndex — 0-9 (hráč) nebo 0-5 (pomocník)
   * @param {object} patch — {nazev, typ, dmg, obrana, tecky: {akt, max}, span: {rows, cols}, ...}
   */
  setSlot(who, slotIndex, patch) {
    const { inv, cols } = this._getInv(who);
    const totalRows = Math.ceil(inv.length / cols);
    if (slotIndex < 0 || slotIndex >= inv.length) return { error: `Neplatný slot ${slotIndex}` };
    // Cílový slot nesmí být _occupied jiným předmětem
    if (inv[slotIndex]?._occupied) return { error: `Slot ${slotIndex} je obsazený předmětem ze slotu ${inv[slotIndex]._owner}. Nejdřív clearslot ${inv[slotIndex]._owner}.` };
    // Vyčisti starý multi-slot pokud tam byl
    const clean = inv.map(s => s?._occupied && s._owner === slotIndex
      ? { nazev: "", typ: "", tecky: { akt: 0, max: 0 } } : { ...s });
    clean[slotIndex] = { ...clean[slotIndex], ...patch };
    // Pokud patch má span, parsuj z rows/cols
    if (patch.rows || patch.cols) {
      clean[slotIndex].span = { rows: parseInt(patch.rows) || 1, cols: parseInt(patch.cols) || 1 };
    }
    // Validace: multi-slot musí fyzicky projít gridem
    const span = clean[slotIndex].span;
    if (span && (span.rows > 1 || span.cols > 1)) {
      const r = Math.floor(slotIndex / cols), c = slotIndex % cols;
      if (r + (span.rows || 1) > totalRows) return { error: `Nevejde se: slot ${slotIndex} řádek ${r}, span ${span.rows} řádky, grid má jen ${totalRows} řádky` };
      if (c + (span.cols || 1) > cols) return { error: `Nevejde se: slot ${slotIndex} sloupec ${c}, span ${span.cols} sloupce, grid má jen ${cols} sloupců` };
      // Sekundární sloty musí být volné
      for (let sr = 0; sr < span.rows; sr++) {
        for (let sc = 0; sc < span.cols; sc++) {
          if (sr === 0 && sc === 0) continue;
          const idx = (r + sr) * cols + c + sc;
          if (clean[idx].nazev || clean[idx]._occupied) return { error: `Nevejde se: slot ${idx} je obsazený (${clean[idx].nazev || 'occupied'})` };
        }
      }
    }
    const result = this._writeInv(who, clean, cols);
    return { ok: true, slot: slotIndex, item: result[slotIndex] };
  }

  /**
   * Vyprázdní slot (i multi-slot — vyčistí _occupied).
   */
  clearSlot(who, slotIndex) {
    const { inv, cols } = this._getInv(who);
    if (slotIndex < 0 || slotIndex >= inv.length) return { error: `Neplatný slot ${slotIndex}` };
    const clean = inv.map((s, i) => {
      if (i === slotIndex) return { nazev: "", typ: "", tecky: { akt: 0, max: 0 } };
      if (s?._occupied && s._owner === slotIndex) return { nazev: "", typ: "", tecky: { akt: 0, max: 0 } };
      return { ...s };
    });
    const result = this._writeInv(who, clean, cols);
    return { ok: true, slot: slotIndex };
  }

  // --- ZÁSOBY ---

  /**
   * Spotřebuje 1 porci jídla (škrtne tečku na prvním jídle v inventáři).
   * Pokud žádné jídlo → vrátí varování (Hlad!).
   */
  eatSupply() {
    const inv = this.game.character.inventar;
    const food = inv.find(s => s.typ === "jídlo" && s.tecky?.akt > 0);
    if (!food) {
      return { ok: false, warning: "HLAD! Žádné jídlo v inventáři. Pokud myš celý den nejí → stav Hlad (zabírá slot!)." };
    }
    const before = food.tecky.akt;
    food.tecky.akt--;
    const result = { ok: true, item: food.nazev, teckyBefore: before, teckyAfter: food.tecky.akt };
    if (food.tecky.akt <= 0) {
      food.nazev = "";
      food.typ = "";
      food.tecky = { akt: 0, max: 0 };
      result.depleted = true;
    }
    return result;
  }

  // --- ODPOČINEK ---

  rest(type) {
    const char = this.game.character;
    let healed = {};

    if (type === "short") {
      const heal = roll(6) + 1;
      const before = char.bo.akt;
      char.bo.akt = Math.min(char.bo.max, char.bo.akt + heal);
      healed = { type: "short", boHealed: char.bo.akt - before, roll: heal };
    } else if (type === "long") {
      const boBefore = char.bo.akt;
      char.bo.akt = char.bo.max;
      if (boBefore >= char.bo.max) {
        const strHeal = char.str.akt < char.str.max ? roll(6) : 0;
        const dexHeal = char.dex.akt < char.dex.max ? roll(6) : 0;
        const wilHeal = char.wil.akt < char.wil.max ? roll(6) : 0;
        char.str.akt = Math.min(char.str.max, char.str.akt + strHeal);
        char.dex.akt = Math.min(char.dex.max, char.dex.akt + dexHeal);
        char.wil.akt = Math.min(char.wil.max, char.wil.akt + wilHeal);
        healed = { type: "long", boRestored: true, strHeal, dexHeal, wilHeal };
      } else {
        healed = { type: "long", boHealed: char.bo.max - boBefore };
      }
    } else if (type === "full") {
      char.bo.akt = char.bo.max;
      char.str.akt = char.str.max;
      char.dex.akt = char.dex.max;
      char.wil.akt = char.wil.max;
      healed = { type: "full" };
    }

    const entry = { type: "rest", ...healed };
    this.addEntry(entry);
    return entry;
  }

  // --- NPC / THREAD CRUD ---

  addNpc(name, weight = 1) {
    if (this.game.npcs.length >= 25) return { error: "Max 25 NPC" };
    this.game.npcs.push({ name, weight: Math.min(3, weight), flag: false });
    return { ok: true, count: this.game.npcs.length };
  }

  addThread(name, weight = 1) {
    if (this.game.threads.length >= 25) return { error: "Max 25 Threads" };
    this.game.threads.push({ name, weight: Math.min(3, weight), progress: 0, total: 10, popis: "", stav: "aktivní", typ: "hlavní", poznamky: "" });
    return { ok: true, count: this.game.threads.length };
  }

  removeNpc(index) {
    if (index >= 0 && index < this.game.npcs.length) {
      const removed = this.game.npcs.splice(index, 1);
      return { ok: true, removed: removed[0].name };
    }
    return { error: "Neplatný index" };
  }

  removeThread(index) {
    if (index >= 0 && index < this.game.threads.length) {
      const removed = this.game.threads.splice(index, 1);
      return { ok: true, removed: removed[0].name };
    }
    return { error: "Neplatný index" };
  }

  updateNpc(index, patch) {
    const npc = this.game.npcs[index];
    if (!npc) return { error: "NPC neexistuje" };
    Object.assign(npc, patch);
    return { ok: true, npc };
  }

  updateThread(index, patch) {
    const thread = this.game.threads[index];
    if (!thread) return { error: "Thread neexistuje" };
    Object.assign(thread, patch);
    return { ok: true, thread };
  }

  // --- ČAS ---

  advanceTime() {
    const c = this.game.cas;
    const order = ["ráno", "poledne", "odpoledne", "večer", "noc"];
    const idx = order.indexOf(c.hlidka);
    if (idx < order.length - 1) {
      c.hlidka = order[idx + 1];
      c.smena++;
    } else {
      c.hlidka = "ráno";
      c.smena = 1;
      c.den++;
      c.odpocinutoDnes = false;
    }
    return { den: c.den, hlidka: c.hlidka };
  }

  weather() {
    const result = rollWeather(this.game.cas.rocniObdobi);
    this.game.cas.pocasi = result.text;
    this.game.cas.jeNepriznive = result.adverse;
    return result;
  }

  // --- HELPERS ---

  _getPlayerWeapon() {
    const inv = this.game.character.inventar || [];
    const weapon = inv.find(s => s.typ === "zbraň" || s.typ === "zbraň_střelná");
    if (weapon && weapon.tecky) return weapon.damage || "d6";
    return "d6";
  }

  _getPlayerWeaponInfo() {
    const inv = this.game.character.inventar || [];
    const weapon = inv.slice(0, 2).find(s => s.typ === "zbraň" || s.typ === "zbraň_střelná");
    if (weapon) return { die: parseInt((weapon.damage || "d6").replace("d", "")), name: weapon.nazev || "zbraň" };
    return { die: 6, name: "pěsti (d6)" };
  }

  _getPlayerArmor() {
    const inv = this.game.character.inventar || [];
    const armors = inv.filter(s => s.typ === "zbroj" && s.tecky?.akt > 0);
    return armors.reduce((sum, a) => sum + (a.armor || 1), 0);
  }

  _getHirelingName() {
    return this.game.character.pomocnici[0]?.jmeno || "Pomocník";
  }

  _getHirelingBo() {
    return this.game.character.pomocnici[0]?.bo?.akt || 0;
  }

  _getHirelingStr() {
    return this.game.character.pomocnici[0]?.str?.akt || 0;
  }

  _getHirelingArmor() {
    const inv = this.game.character.pomocnici[0]?.inventar || [];
    const armor = inv.find(s => s.typ === "zbroj");
    return armor ? (armor.tecky?.akt || 0) : 0;
  }

  _getHirelingWeaponInfo() {
    const inv = this.game.character.pomocnici[0]?.inventar || [];
    const weapon = inv.slice(0, 2).find(s => s.typ === "zbraň" || s.typ === "zbraň_střelná");
    if (weapon) return { die: parseInt((weapon.damage || "d6").replace("d", "")), name: weapon.nazev || "zbraň" };
    return { die: 6, name: "pěsti (d6)" };
  }

  _setHirelingStats(bo, str) {
    const h = this.game.character.pomocnici[0];
    if (h) { h.bo.akt = bo; h.str.akt = str; }
  }

  _findCombatant(name) {
    const lower = name.toLowerCase();
    if (lower === "hráč") return { attacker: this.game.character, isPlayer: true, isHireling: false, isEnemy: false };
    const hireling = this.game.character.pomocnici[0];
    if (hireling && hireling.jmeno?.toLowerCase() === lower) return { attacker: hireling, isPlayer: false, isHireling: true, isEnemy: false };
    const c = this.game.activeCombat;
    if (c) {
      const enemy = c.enemies.find(e => e.name.toLowerCase() === lower);
      if (enemy) return { attacker: enemy, isPlayer: false, isHireling: false, isEnemy: true };
    }
    return { attacker: null };
  }

  _findTarget(name) {
    const lower = name.toLowerCase();
    if (lower === "hráč") return { combatant: this.game.character, isEnemy: false };
    const hireling = this.game.character.pomocnici[0];
    if (hireling && hireling.jmeno?.toLowerCase() === lower) return { combatant: hireling, isEnemy: false };
    const c = this.game.activeCombat;
    if (c) {
      const enemy = c.enemies.find(e => e.name.toLowerCase() === lower);
      if (enemy) return { combatant: enemy, isEnemy: true };
    }
    return { combatant: null };
  }

  _getAttrValue(name, attr) {
    const lower = name.toLowerCase();
    if (lower === "hráč") return this.game.character[attr]?.akt ?? null;
    const hireling = this.game.character.pomocnici[0];
    if (hireling && hireling.jmeno?.toLowerCase() === lower) return hireling[attr]?.akt ?? null;
    const c = this.game.activeCombat;
    if (c) {
      const enemy = c.enemies.find(e => e.name.toLowerCase() === lower);
      if (enemy) return enemy[attr] ?? null;
    }
    return null;
  }

  // --- WIKI ---

  /**
   * Vrátí wiki karty všech NPC (jméno, popis, lokace, vztah, poznámky, bojové staty).
   * Filtruje prázdná pole — vrátí jen vyplněné informace.
   */
  wiki() {
    return this.game.npcs.map((npc, i) => {
      const card = { index: i, name: npc.name, weight: npc.weight };
      if (npc.popis) card.popis = npc.popis;
      if (npc.lokace) card.lokace = npc.lokace;
      if (npc.vztah) card.vztah = npc.vztah;
      if (npc.poznamky) card.poznamky = npc.poznamky;
      if (npc.druh) card.druh = npc.druh;
      if (npc.vzhled) card.vzhled = npc.vzhled;
      if (npc.zvlastnost) card.zvlastnost = npc.zvlastnost;
      if (npc.motivace) card.motivace = npc.motivace;
      if (npc.str) card.str = npc.str;
      if (npc.dex) card.dex = npc.dex;
      if (npc.wil) card.wil = npc.wil;
      if (npc.bo) card.bo = npc.bo;
      if (npc.zbran) card.zbran = npc.zbran;
      if (npc.zbroj) card.zbroj = npc.zbroj;
      return card;
    });
  }

  // --- STAV ---

  getState() {
    return {
      sceneNum: this.game.sceneNum,
      cf: this.game.cf,
      character: this.game.character,
      npcs: this.game.npcs,
      threads: this.game.threads,
      cas: this.game.cas,
      entriesCount: this.game.entries.length,
    };
  }
}
