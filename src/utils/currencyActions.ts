import type { CraftedItem, ItemRarity, RolledMod } from '../types';
import {
  rollNMods,
  rollOneMod,
  rerollModValue,
  rollImplicits,
} from './modRoller';

// ──────────────────────────────────────────────
// Helper utilities
// ──────────────────────────────────────────────

function modCount(item: CraftedItem): number {
  return item.explicits.length;
}

// ──────────────────────────────────────────────
// Currency implementations
// ──────────────────────────────────────────────

/**
 * Orb of Transmutation: Normal → Magic (1–2 mods)
 */
export function applyTransmutation(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity !== 'normal') return [item, 'Can only use on Normal items.'];
  const count = Math.random() < 0.5 ? 1 : 2;
  const newMods = rollNMods(item.base, item.itemLevel, count);
  return [
    { ...item, rarity: 'magic', explicits: newMods },
    `Orb of Transmutation: Normal → Magic (added ${count} mod${count > 1 ? 's' : ''})`,
  ];
}

/**
 * Orb of Alteration: Re-rolls all mods on a Magic item (1–2 mods)
 */
export function applyAlteration(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity !== 'magic') return [item, 'Can only use on Magic items.'];
  const count = Math.random() < 0.5 ? 1 : 2;
  const newMods = rollNMods(item.base, item.itemLevel, count);
  return [
    { ...item, explicits: newMods },
    `Orb of Alteration: Re-rolled ${count} mod${count > 1 ? 's' : ''}`,
  ];
}

/**
 * Orb of Augmentation: Adds 1 mod to a Magic item that has < 2 mods
 */
export function applyAugmentation(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity !== 'magic') return [item, 'Can only use on Magic items.'];
  if (modCount(item) >= 2) return [item, 'Orb of Augmentation: Item already has 2 mods.'];
  const newMod = rollOneMod(item.base, item.itemLevel, item.explicits);
  if (!newMod) return [item, 'Orb of Augmentation: No valid mod available.'];
  return [
    { ...item, explicits: [...item.explicits, newMod] },
    `Orb of Augmentation: Added "${formatMod(newMod)}"`,
  ];
}

/**
 * Orb of Alchemy: Normal → Rare (4–6 mods)
 */
export function applyAlchemy(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity !== 'normal') return [item, 'Can only use on Normal items.'];
  const count = 4 + Math.floor(Math.random() * 3); // 4, 5, or 6
  const newMods = rollNMods(item.base, item.itemLevel, count);
  return [
    { ...item, rarity: 'rare', explicits: newMods },
    `Orb of Alchemy: Normal → Rare (added ${newMods.length} mods)`,
  ];
}

/**
 * Chaos Orb: Re-rolls all mods on a Rare item (4–6 mods)
 */
export function applyChaos(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity !== 'rare') return [item, 'Can only use on Rare items.'];
  const count = 4 + Math.floor(Math.random() * 3);
  const newMods = rollNMods(item.base, item.itemLevel, count);
  return [
    { ...item, explicits: newMods },
    `Chaos Orb: Re-rolled ${newMods.length} mods`,
  ];
}

/**
 * Exalted Orb: Adds 1 mod to a Rare item with < 6 mods
 */
export function applyExalted(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity !== 'rare') return [item, 'Can only use on Rare items.'];
  if (modCount(item) >= 6) return [item, 'Exalted Orb: Item is full (6 mods).'];
  const newMod = rollOneMod(item.base, item.itemLevel, item.explicits);
  if (!newMod) return [item, 'Exalted Orb: No valid mod available.'];
  return [
    { ...item, explicits: [...item.explicits, newMod] },
    `Exalted Orb: Added "${formatMod(newMod)}"`,
  ];
}

/**
 * Orb of Annulment: Removes 1 random explicit mod
 */
export function applyAnnulment(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity === 'normal' || item.explicits.length === 0) {
    return [item, 'Orb of Annulment: No mods to remove.'];
  }
  const idx = Math.floor(Math.random() * item.explicits.length);
  const removed = item.explicits[idx];
  const newMods = item.explicits.filter((_, i) => i !== idx);
  let newRarity: ItemRarity = item.rarity;
  if (newRarity === 'magic' && newMods.length === 0) newRarity = 'normal';
  return [
    { ...item, rarity: newRarity, explicits: newMods },
    `Orb of Annulment: Removed "${formatMod(removed)}"`,
  ];
}

/**
 * Divine Orb: Re-rolls numeric values of all explicit mods
 */
export function applyDivine(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity === 'normal' || item.explicits.length === 0) {
    return [item, 'Divine Orb: No mods to re-roll.'];
  }
  const newMods = item.explicits.map(rerollModValue);
  return [
    { ...item, explicits: newMods },
    `Divine Orb: Re-rolled values of ${newMods.length} mod${newMods.length > 1 ? 's' : ''}`,
  ];
}

/**
 * Orb of Scouring: Rare/Magic → Normal
 */
export function applyScouring(item: CraftedItem): [CraftedItem, string] {
  if (item.rarity === 'normal') return [item, 'Orb of Scouring: Item is already Normal.'];
  if (item.rarity === 'unique') return [item, 'Orb of Scouring: Cannot use on Unique items.'];
  return [
    { ...item, rarity: 'normal', explicits: [] },
    `Orb of Scouring: ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} → Normal (all mods removed)`,
  ];
}

/**
 * Blessed Orb: Re-rolls implicit mod values
 */
export function applyBlessed(item: CraftedItem): [CraftedItem, string] {
  if (item.implicits.length === 0) return [item, 'Blessed Orb: No implicits to re-roll.'];
  const newImplicits = rollImplicits(item.base);
  return [
    { ...item, implicits: newImplicits },
    `Blessed Orb: Re-rolled ${newImplicits.length} implicit${newImplicits.length > 1 ? 's' : ''}`,
  ];
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatMod(mod: RolledMod): string {
  return mod.statText.replace('#', String(mod.rolledValue));
}
