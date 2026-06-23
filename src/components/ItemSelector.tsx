import { useState, useMemo } from 'react';
import type { ItemBase } from '../types';
import itemsData from '../data/items.json';

const ALL_ITEMS: ItemBase[] = itemsData as ItemBase[];

const ITEM_CLASSES = [...new Set(ALL_ITEMS.map((i) => i.itemClass))].sort();

interface Props {
  selectedId?: string;
  onSelect: (item: ItemBase) => void;
}

export default function ItemSelector({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filtered = useMemo(() => {
    return ALL_ITEMS.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchClass = classFilter ? item.itemClass === classFilter : true;
      return matchSearch && matchClass;
    });
  }, [search, classFilter]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="gold-text font-bold text-sm uppercase tracking-widest">Item Base</h2>

      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-[#786030] placeholder-gray-700"
      />

      <select
        value={classFilter}
        onChange={(e) => setClassFilter(e.target.value)}
        className="bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-[#786030]"
      >
        <option value="">All Classes</option>
        {ITEM_CLASSES.map((cls) => (
          <option key={cls} value={cls}>
            {cls}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`text-left px-2 py-1.5 rounded text-xs transition-colors ${
              selectedId === item.id
                ? 'bg-[#2a1f00] border border-[#786030] text-[#c8a257]'
                : 'bg-[#111] border border-[#222] text-gray-400 hover:border-[#555] hover:text-gray-200'
            }`}
          >
            <div className="font-semibold">{item.name}</div>
            <div className="text-gray-600 text-[10px]">
              {item.itemClass} · iLvl {item.itemLevel}
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-gray-700 text-xs italic p-2">No items match your search.</div>
        )}
      </div>
    </div>
  );
}
