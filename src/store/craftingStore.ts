import { create } from 'zustand';
import type { CraftedItem, CurrencyId, HistoryEntry } from '../types';
import { seedRng } from '../utils/modRoller';
import {
  applyTransmutation,
  applyAlteration,
  applyAugmentation,
  applyAlchemy,
  applyChaos,
  applyExalted,
  applyAnnulment,
  applyDivine,
  applyScouring,
  applyBlessed,
} from '../utils/currencyActions';

const MAX_HISTORY = 20;

interface CraftingState {
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

export const useCraftingStore = create<CraftingState>((set, get) => ({
  item: null,
  history: [],
  actionLog: [],
  seed: Date.now(),

  setItem: (item) => {
    set({ item, history: [], actionLog: [] });
  },

  setSeed: (seed) => {
    seedRng(seed);
    set({ seed });
  },

  applyCurrency: (currencyId) => {
    const { item, history, actionLog, seed } = get();
    if (!item) return;

    // Advance seed so each action is reproducible but unique
    const nextSeed = seed + 1;
    seedRng(nextSeed);

    let result: [CraftedItem, string];
    switch (currencyId) {
      case 'orb_of_transmutation': result = applyTransmutation(item); break;
      case 'orb_of_alteration':    result = applyAlteration(item);    break;
      case 'orb_of_augmentation':  result = applyAugmentation(item);  break;
      case 'orb_of_alchemy':       result = applyAlchemy(item);       break;
      case 'chaos_orb':            result = applyChaos(item);         break;
      case 'exalted_orb':          result = applyExalted(item);       break;
      case 'orb_of_annulment':     result = applyAnnulment(item);     break;
      case 'divine_orb':           result = applyDivine(item);        break;
      case 'orb_of_scouring':      result = applyScouring(item);      break;
      case 'blessed_orb':          result = applyBlessed(item);       break;
      default: return;
    }

    const [newItem, message] = result;
    const newHistory: HistoryEntry[] = [
      { item, action: message, timestamp: Date.now() },
      ...history,
    ].slice(0, MAX_HISTORY);

    set({
      item: newItem,
      history: newHistory,
      actionLog: [message, ...actionLog].slice(0, MAX_HISTORY),
      seed: nextSeed,
    });
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;
    const [last, ...rest] = history;
    set({ item: last.item, history: rest, actionLog: [] });
  },

  reset: () => {
    const { item } = get();
    if (!item) return;
    set({
      item: { ...item, rarity: 'normal', explicits: [] },
      history: [],
      actionLog: [],
    });
  },
}));
