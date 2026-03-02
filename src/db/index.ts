import Dexie, { type EntityTable } from "dexie";

// ============================================================
// TYPY ENTIT
// ============================================================

/** Kampaň — kontejner pro všechno ostatní */
export interface Campaign {
  id?: number;
  name: string;
  description: string;
  chaosFactor: number; // 1-9, výchozí 5
  createdAt: Date;
  updatedAt: Date;
}

/** Hráčova postava */
export interface Character {
  id?: number;
  campaignId: number;
  name: string;
  description: string;
  stats: Record<string, number>; // STR, DEX, WIL...
  hp: number;
  maxHp: number;
  inventory: string[]; // slot-based
  notes: string;
  updatedAt: Date;
}

/** NPC — nehráčská postava */
export interface Npc {
  id?: number;
  campaignId: number;
  name: string;
  description: string;
  locationId?: number; // kde žije (odkaz na Location)
  factionId?: number; // ke které frakci patří
  relationship: string; // vztah k hráči
  notes: string;
  createdAt: Date;
}

/** Osada / místo */
export interface Location {
  id?: number;
  campaignId: number;
  name: string;
  description: string;
  parentId?: number; // nadřazená lokace (hex → osada → budova)
  notes: string;
  createdAt: Date;
}

/** Frakce */
export interface Faction {
  id?: number;
  campaignId: number;
  name: string;
  description: string;
  goals: string;
  notes: string;
  createdAt: Date;
}

/** Úkol / hook */
export interface Quest {
  id?: number;
  campaignId: number;
  title: string;
  description: string;
  sourceNpcId?: number; // kdo úkol dal
  locationId?: number; // kde se odehrává
  threadId?: number; // do které příběhové linky patří
  status: "open" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

/** Příběhová linka (Thread) */
export interface Thread {
  id?: number;
  campaignId: number;
  title: string;
  description: string;
  status: "active" | "resolved" | "dormant";
  createdAt: Date;
  updatedAt: Date;
}

/** Důležitý předmět */
export interface Item {
  id?: number;
  campaignId: number;
  name: string;
  description: string;
  locationId?: number; // kde se nachází
  ownerId?: number; // kdo ho má (character nebo NPC id)
  ownerType?: "character" | "npc";
  notes: string;
  createdAt: Date;
}

/** Záznam v deníku (scéna) */
export interface DiaryEntry {
  id?: number;
  campaignId: number;
  sceneNumber: number;
  title: string;
  summary: string; // heslovitý záznam
  narrative?: string; // volitelné narativní shrnutí
  sceneType: "expected" | "altered" | "interrupted";
  chaosFactorBefore: number;
  chaosFactorAfter: number;
  /** ID entit zmíněných ve scéně */
  mentionedNpcs: number[];
  mentionedLocations: number[];
  mentionedItems: number[];
  createdAt: Date;
}

// ============================================================
// DATABÁZE
// ============================================================

export class SoloRpgDatabase extends Dexie {
  campaigns!: EntityTable<Campaign, "id">;
  characters!: EntityTable<Character, "id">;
  npcs!: EntityTable<Npc, "id">;
  locations!: EntityTable<Location, "id">;
  factions!: EntityTable<Faction, "id">;
  quests!: EntityTable<Quest, "id">;
  threads!: EntityTable<Thread, "id">;
  items!: EntityTable<Item, "id">;
  diaryEntries!: EntityTable<DiaryEntry, "id">;

  constructor() {
    super("SoloRpgToolkit");

    this.version(1).stores({
      campaigns: "++id",
      characters: "++id, campaignId",
      npcs: "++id, campaignId, locationId, factionId",
      locations: "++id, campaignId, parentId",
      factions: "++id, campaignId",
      quests: "++id, campaignId, sourceNpcId, locationId, threadId, status",
      threads: "++id, campaignId, status",
      items: "++id, campaignId, locationId",
      diaryEntries: "++id, campaignId, sceneNumber",
    });
  }
}

export const db = new SoloRpgDatabase();
