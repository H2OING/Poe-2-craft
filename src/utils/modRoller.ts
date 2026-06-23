import seedrandom from 'seedrandom';
import modsData from '../data/mods.json';
import type { ModDefinition, ModTier, RolledMod, ItemBase } from '../types';

const ALL_MODS: ModDefinition[] = modsData as ModDefinition[];

type Prng = seedrandom.PRNG;

/**
 * Create a seeded PRNG that advances a counter so repeated calls
 * produce independent values while remaining reproducible.
 */
let rng: Prng = seedrandom('default');

export function seedRng(seed: number) {
  rng = seedrandom(String(seed));
}

function rand(): number {
  return rng();
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// ──────────────────────────────────────────────
// Filtering helpers
// ──────────────────────────────────────────────

/**
 * Return every mod definition whose tags intersect the item's tags
 * and that has at least one tier available at the given item level.
 */
export function getEligibleMods(
  base: ItemBase,
  itemLevel: number,
  existingMods: RolledMod[],
  type?: 'prefix' | 'suffix'
): Array<{ mod: ModDefinition; tier: ModTier; weight: number }> {
  const usedGroups = new Set(
    existingMods.map((m) => {
      const def = ALL_MODS.find((d) => d.id === m.defId);
      return def?.group ?? '';
    })
  );

  const results: Array<{ mod: ModDefinition; tier: ModTier; weight: number }> = [];

  for (const mod of ALL_MODS) {
    if (type && mod.type !== type) continue;
    // tag intersection
    const hasTag = mod.tags.some((t) => base.tags.includes(t));
    if (!hasTag) continue;
    // exclusion group
    if (usedGroups.has(mod.group)) continue;

    // best eligible tier
    const eligibleTiers = mod.tiers.filter((t) => t.requiredLevel <= itemLevel);
    if (eligibleTiers.length === 0) continue;

    // Highest tier = lowest tier number (T1 best)
    const bestTier = eligibleTiers.reduce((a, b) => (a.tier < b.tier ? a : b));
    results.push({ mod, tier: bestTier, weight: bestTier.spawnWeight });
  }

  return results;
}

/**
 * Weighted random selection from a pool of candidates.
 */
function weightedPick<T extends { weight: number }>(pool: T[]): T | null {
  if (pool.length === 0) return null;
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let roll = rand() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return pool[pool.length - 1];
}

/**
 * Roll a single modifier using weight-based RNG.
 */
export function rollOneMod(
  base: ItemBase,
  itemLevel: number,
  existingMods: RolledMod[],
  type?: 'prefix' | 'suffix'
): RolledMod | null {
  const pool = getEligibleMods(base, itemLevel, existingMods, type);
  const pick = weightedPick(pool);
  if (!pick) return null;
  return buildRolledMod(pick.mod, pick.tier);
}

/**
 * Build a RolledMod from a definition and tier with a random value in range.
 */
function buildRolledMod(mod: ModDefinition, tier: ModTier): RolledMod {
  const value = randInt(tier.statMin, tier.statMax);
  return {
    defId: mod.id,
    tier: tier.tier,
    name: tier.name,
    type: mod.type,
    statText: mod.statText,
    rolledValue: value,
    statMin: tier.statMin,
    statMax: tier.statMax,
  };
}

/**
 * Roll N distinct mods (respecting prefix/suffix limits).
 * Tries prefixes and suffixes alternately when no type constraint is given.
 */
export function rollNMods(
  base: ItemBase,
  itemLevel: number,
  count: number,
  existingMods: RolledMod[] = []
): RolledMod[] {
  const mods: RolledMod[] = [...existingMods];
  let attempts = 0;
  while (mods.length - existingMods.length < count && attempts < 100) {
    attempts++;
    const prefixes = mods.filter((m) => m.type === 'prefix').length;
    const suffixes = mods.filter((m) => m.type === 'suffix').length;

    let type: 'prefix' | 'suffix' | undefined;
    if (prefixes >= 3) type = 'suffix';
    else if (suffixes >= 3) type = 'prefix';

    const mod = rollOneMod(base, itemLevel, mods, type);
    if (!mod) break;
    mods.push(mod);
  }
  return mods.slice(existingMods.length);
}

/**
 * Re-roll the numeric value of an existing mod (Divine Orb behaviour).
 */
export function rerollModValue(mod: RolledMod): RolledMod {
  return {
    ...mod,
    rolledValue: randInt(mod.statMin, mod.statMax),
  };
}

/**
 * Roll implicits from the base definition.
 */
export function rollImplicits(
  base: ItemBase
): RolledMod[] {
  return base.implicits.map((imp) => ({
    defId: imp.id,
    tier: 1,
    name: imp.id,
    type: 'prefix' as const, // implicits don't count against prefix/suffix
    statText: imp.text,
    rolledValue: randInt(imp.min, imp.max),
    statMin: imp.min,
    statMax: imp.max,
  }));
}

export { ALL_MODS };
