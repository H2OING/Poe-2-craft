import './index.css';
import { useCrafting } from './hooks/useCrafting';
import ItemSelector from './components/ItemSelector';
import CraftingBench from './components/CraftingBench';
import StatsPanel from './components/StatsPanel';
import type { ItemBase } from './types';

export default function App() {
  const { item, history, actionLog, selectBase, applyCurrency, undo, reset } = useCrafting();

  function handleSelectBase(base: ItemBase) {
    selectBase(base);
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-300">
      {/* Top bar */}
      <header className="border-b border-[#2a1f00] bg-[#0a0a00] px-6 py-3 flex items-center gap-4">
        <span className="text-2xl">⚒️</span>
        <div>
          <h1 className="gold-text font-bold text-lg leading-tight">PoE 2 Crafting Simulator</h1>
          <p className="text-gray-600 text-xs">Path of Exile 2 · Interactive Crafting Bench</p>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-600">
          <a
            href="https://poe2db.tw"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#c8a257] transition-colors"
          >
            Data: poe2db.tw ↗
          </a>
          <span className="text-[#333]">|</span>
          <span>Session seed: {Date.now().toString(36)}</span>
        </div>
      </header>

      {/* Main layout: 3-column */}
      <div className="flex gap-0 h-[calc(100vh-56px)]">
        {/* Left: Item Selector */}
        <aside className="w-56 border-r border-[#1a1a1a] bg-[#0d0d0d] p-4 overflow-y-auto shrink-0">
          <ItemSelector
            selectedId={item?.base.id}
            onSelect={handleSelectBase}
          />
        </aside>

        {/* Centre: Crafting Bench */}
        <main className="flex-1 p-6 overflow-y-auto">
          <CraftingBench
            item={item ?? null}
            onApplyCurrency={applyCurrency}
            onUndo={undo}
            onReset={reset}
            canUndo={history.length > 0}
            actionLog={actionLog}
          />
        </main>

        {/* Right: Stats Panel */}
        <aside className="w-60 border-l border-[#1a1a1a] bg-[#0d0d0d] p-4 overflow-y-auto shrink-0">
          <StatsPanel item={item ?? null} />
        </aside>
      </div>
    </div>
  );
}
