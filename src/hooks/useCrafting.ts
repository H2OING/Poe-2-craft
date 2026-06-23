import { useCraftingStore } from '../store/craftingStore';
import type { CraftedItem, ItemBase, CurrencyId } from '../types';
import { rollImplicits } from '../utils/modRoller';

export function useCrafting() {
  const store = useCraftingStore();

  function selectBase(base: ItemBase, itemLevel?: number) {
    const level = itemLevel ?? base.itemLevel;
    const implicits = rollImplicits(base);
    const newItem: CraftedItem = {
      base,
      rarity: 'normal',
      itemLevel: level,
      implicits,
      explicits: [],
      seed: Date.now(),
    };
    store.setItem(newItem);
  }

  function applyCurrency(currencyId: CurrencyId) {
    store.applyCurrency(currencyId);
  }

  return {
    item: store.item,
    history: store.history,
    actionLog: store.actionLog,
    seed: store.seed,
    selectBase,
    applyCurrency,
    undo: store.undo,
    reset: store.reset,
    setSeed: store.setSeed,
  };
}
