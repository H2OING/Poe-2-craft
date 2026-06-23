import type { CurrencyItem } from '../types';

export const CURRENCY_ITEMS: CurrencyItem[] = [
  {
    id: 'orb_of_transmutation',
    name: 'Orb of Transmutation',
    description: 'Upgrades a Normal item to a Magic item with 1–2 random modifiers.',
    icon: '🔵',
    color: '#6666ff',
  },
  {
    id: 'orb_of_alteration',
    name: 'Orb of Alteration',
    description: 'Re-rolls the modifiers on a Magic item.',
    icon: '🔄',
    color: '#4488ff',
  },
  {
    id: 'orb_of_augmentation',
    name: 'Orb of Augmentation',
    description: 'Adds a modifier to a Magic item with fewer than 2 modifiers.',
    icon: '➕',
    color: '#44aaff',
  },
  {
    id: 'orb_of_alchemy',
    name: 'Orb of Alchemy',
    description: 'Upgrades a Normal item to a Rare item with 4–6 random modifiers.',
    icon: '⚗️',
    color: '#ffaa00',
  },
  {
    id: 'chaos_orb',
    name: 'Chaos Orb',
    description: 'Re-rolls the modifiers on a Rare item (4–6 mods).',
    icon: '🌀',
    color: '#ff6600',
  },
  {
    id: 'exalted_orb',
    name: 'Exalted Orb',
    description: 'Adds a modifier to a Rare item with fewer than 6 modifiers.',
    icon: '✨',
    color: '#ffe066',
  },
  {
    id: 'orb_of_annulment',
    name: 'Orb of Annulment',
    description: 'Removes a random modifier from an item.',
    icon: '❌',
    color: '#cccccc',
  },
  {
    id: 'divine_orb',
    name: 'Divine Orb',
    description: 'Re-rolls the numeric values of the modifiers on an item.',
    icon: '✦',
    color: '#ffdd88',
  },
  {
    id: 'orb_of_scouring',
    name: 'Orb of Scouring',
    description: 'Removes all modifiers from a Magic or Rare item.',
    icon: '🧹',
    color: '#888888',
  },
  {
    id: 'blessed_orb',
    name: 'Blessed Orb',
    description: 'Re-rolls the values of implicit modifiers on an item.',
    icon: '🙏',
    color: '#aaffaa',
  },
];
