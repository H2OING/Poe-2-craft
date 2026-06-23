// ──────────────────────────────────────────────
// Domain Types
// ──────────────────────────────────────────────

export type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique';

export interface ItemBase {
  id: string;
  name: string;
  itemClass: string;
  tags: string[];
  itemLevel: number;
  requirements: Record<string, number>;
  implicits: ImplicitMod[];
  baseStats: Record<string, number | string>;
}

export interface ImplicitMod {
  id: string;
  text: string;
  min: number;
  max: number;
}

export interface ModTier {
  tier: number;
  name: string;
  requiredLevel: number;
  spawnWeight: number;
  statMin: number;
  statMax: number;
}

export interface ModDefinition {
  id: string;
  name: string;
  type: 'prefix' | 'suffix';
  group: string;
  tags: string[];
  tiers: ModTier[];
  statId: string;
  statText: string;
}

export interface RolledMod {
  defId: string;          // ModDefinition.id
  tier: number;
  name: string;           // tier name
  type: 'prefix' | 'suffix';
  statText: string;       // e.g. "#% increased Physical Damage"
  rolledValue: number;    // rolled numeric value
  statMin: number;
  statMax: number;
}

export interface CraftedItem {
  base: ItemBase;
  rarity: ItemRarity;
  itemLevel: number;
  implicits: RolledMod[];
  explicits: RolledMod[];
  seed: number;
}

// ──────────────────────────────────────────────
// Currency
// ──────────────────────────────────────────────

export type CurrencyId =
  | 'orb_of_transmutation'
  | 'orb_of_alteration'
  | 'orb_of_augmentation'
  | 'orb_of_alchemy'
  | 'chaos_orb'
  | 'exalted_orb'
  | 'orb_of_annulment'
  | 'divine_orb'
  | 'orb_of_scouring'
  | 'blessed_orb';

export interface CurrencyItem {
  id: CurrencyId;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ──────────────────────────────────────────────
// History / Store
// ──────────────────────────────────────────────

export interface HistoryEntry {
  item: CraftedItem;
  action: string;
  timestamp: number;
}

export interface CraftingStore {
  item: CraftedItem | null;
  history: HistoryEntry[];
  actionLog: string[];
  seed: number;
  setItem: (item: CraftedItem) => void;
  applyCurrency: (currencyId: CurrencyId) => void;
  undo: () => void;
  reset: () => void;
  setSeed: (seed: number) => void;
}
