import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { CurrencyItem } from '../types';
import { CURRENCY_ITEMS } from '../data/currency';

interface DraggableCurrencyProps {
  currency: CurrencyItem;
}

function DraggableCurrency({ currency }: DraggableCurrencyProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: currency.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      title={`${currency.name}\n${currency.description}`}
      className="flex flex-col items-center gap-1 p-2 rounded border border-[#444] bg-[#1a1a1a] hover:bg-[#242424] hover:border-[#786030] transition-colors select-none group"
    >
      <span className="text-2xl leading-none">{currency.icon}</span>
      <span
        className="text-[10px] text-center leading-tight max-w-[72px] break-words"
        style={{ color: currency.color }}
      >
        {currency.name}
      </span>

      {/* Tooltip */}
      <div className="absolute z-50 hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-[#111] border border-[#786030] rounded p-2 text-xs text-gray-300 pointer-events-none shadow-xl">
        <div className="font-semibold mb-1" style={{ color: currency.color }}>
          {currency.name}
        </div>
        <div className="text-gray-400">{currency.description}</div>
      </div>
    </div>
  );
}

interface Props {
  onApply?: (currencyId: string) => void;
}

export default function CurrencyTray({ onApply }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="gold-text font-bold text-sm uppercase tracking-widest mb-1">Currency</h2>
      <p className="text-gray-600 text-xs mb-2">Drag onto item or click to apply</p>
      <div className="grid grid-cols-2 gap-2 relative">
        {CURRENCY_ITEMS.map((c) => (
          <div key={c.id} className="relative">
            <DraggableCurrency currency={c} />
            {onApply && (
              <button
                onClick={() => onApply(c.id)}
                className="absolute inset-0 opacity-0"
                aria-label={`Apply ${c.name}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
