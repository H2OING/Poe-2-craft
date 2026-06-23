import { useState, useCallback } from 'react';
import { useDroppable, DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { CraftedItem, CurrencyId } from '../types';
import ItemCard from './ItemCard';
import CurrencyTray from './CurrencyTray';

interface DroppableAreaProps {
  item: CraftedItem | null;
  isFlashing: boolean;
}

function DroppableArea({ item, isFlashing }: DroppableAreaProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'crafting-drop-zone' });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex flex-col items-center justify-center
        min-h-[320px] rounded-lg border-2 transition-all duration-150 p-4
        ${isOver
          ? 'border-[#c8a257] bg-[#1a1500] shadow-[0_0_24px_rgba(200,162,87,0.3)]'
          : 'border-[#333] bg-[#111]'
        }
        ${isFlashing ? 'animate-pulse border-yellow-400' : ''}
      `}
    >
      {item ? (
        <ItemCard item={item} />
      ) : (
        <div className="text-gray-700 text-center">
          <div className="text-4xl mb-3">⚒️</div>
          <div className="text-sm">Select an item base to begin crafting</div>
          <div className="text-xs mt-1 text-gray-600">
            Then drag a currency orb here
          </div>
        </div>
      )}

      {isOver && item && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg pointer-events-none">
          <span className="text-yellow-300 font-bold text-lg drop-shadow-lg">Drop to apply</span>
        </div>
      )}
    </div>
  );
}

interface Props {
  item: CraftedItem | null;
  onApplyCurrency: (id: CurrencyId) => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  actionLog: string[];
}

export default function CraftingBench({
  item,
  onApplyCurrency,
  onUndo,
  onReset,
  canUndo,
  actionLog,
}: Props) {
  const [isFlashing, setIsFlashing] = useState(false);

  const flash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 400);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event;
    if (over?.id === 'crafting-drop-zone' && item) {
      onApplyCurrency(active.id as CurrencyId);
      flash();
    }
  }

  function handleTrayApply(currencyId: string) {
    if (!item) return;
    onApplyCurrency(currencyId as CurrencyId);
    flash();
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full">
        {/* Sidebar: Currency Tray */}
        <div className="w-44 shrink-0 gold-border rounded-lg p-3 bg-[#0d0d0d]">
          <CurrencyTray onApply={handleTrayApply} />
        </div>

        {/* Main crafting area */}
        <div className="flex flex-col gap-4 flex-1">
          <DroppableArea item={item} isFlashing={isFlashing} />

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="px-3 py-1.5 text-sm rounded border border-[#444] text-gray-300 hover:border-[#786030] hover:text-[#c8a257] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ↩ Undo
            </button>
            <button
              onClick={onReset}
              disabled={!item}
              className="px-3 py-1.5 text-sm rounded border border-[#444] text-gray-300 hover:border-red-700 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ✕ Reset Item
            </button>
          </div>

          {/* Action Log */}
          {actionLog.length > 0 && (
            <div className="rounded border border-[#333] bg-[#0a0a0a] p-3">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                Crafting Log
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                {actionLog.map((entry, i) => (
                  <div
                    key={i}
                    className={`text-xs ${
                      i === 0 ? 'text-[#c8a257]' : 'text-gray-600'
                    }`}
                  >
                    {i === 0 ? '▶ ' : '  '}
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
}
