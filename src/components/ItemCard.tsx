import type { CraftedItem, RolledMod } from '../types';

interface Props {
  item: CraftedItem;
}

function formatModText(mod: RolledMod): string {
  return mod.statText.replace('#', String(mod.rolledValue));
}

const RARITY_HEADER: Record<string, string> = {
  normal: 'text-gray-300',
  magic: 'text-[#8888ff]',
  rare: 'text-[#ffff77]',
  unique: 'text-[#af6025]',
};

const RARITY_BORDER: Record<string, string> = {
  normal: 'border-gray-500',
  magic: 'border-[#4444aa]',
  rare: 'border-[#786030]',
  unique: 'border-[#7a3a0a]',
};

export default function ItemCard({ item }: Props) {
  const { base, rarity, itemLevel, implicits, explicits } = item;
  const prefixes = explicits.filter((m) => m.type === 'prefix');
  const suffixes = explicits.filter((m) => m.type === 'suffix');

  const headerColor = RARITY_HEADER[rarity] ?? 'text-gray-300';
  const borderColor = RARITY_BORDER[rarity] ?? 'border-gray-500';

  const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);

  return (
    <div
      className={`item-card-bg border-2 ${borderColor} rounded px-4 py-3 min-w-[280px] max-w-xs font-serif text-sm select-none shadow-2xl`}
    >
      {/* Header */}
      <div className="text-center mb-1">
        <div className={`font-bold text-base ${headerColor}`}>{base.name}</div>
        {rarity !== 'normal' && (
          <div className={`text-xs ${headerColor} opacity-80`}>{rarityLabel}</div>
        )}
      </div>

      {/* Base stats */}
      <div className="text-gray-400 text-xs text-center mb-1">
        {base.itemClass} &mdash; Item Level {itemLevel}
      </div>

      {/* Requirements */}
      {Object.keys(base.requirements).length > 0 && (
        <div className="text-gray-500 text-xs text-center mb-1">
          Requires{' '}
          {Object.entries(base.requirements)
            .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v}`)
            .join(', ')}
        </div>
      )}

      {/* Implicit mods */}
      {implicits.length > 0 && (
        <>
          <div className="divider" />
          {implicits.map((mod, i) => (
            <div key={i} className="text-[#8888ff] text-xs text-center py-0.5">
              {formatModText(mod)}
            </div>
          ))}
        </>
      )}

      <div className="divider" />

      {/* Explicit mods — Prefixes */}
      {prefixes.map((mod, i) => (
        <div key={`p${i}`} className="flex items-center gap-1 py-0.5">
          <span className="text-[#aaaaff] text-[10px] leading-none shrink-0 w-3">P</span>
          <span className="text-[#aaaaff] text-xs">
            {formatModText(mod)}{' '}
            <span className="text-gray-600 text-[10px]">
              (T{mod.tier} {mod.name})
            </span>
          </span>
        </div>
      ))}

      {/* Explicit mods — Suffixes */}
      {suffixes.map((mod, i) => (
        <div key={`s${i}`} className="flex items-center gap-1 py-0.5">
          <span className="text-[#aaffaa] text-[10px] leading-none shrink-0 w-3">S</span>
          <span className="text-[#aaffaa] text-xs">
            {formatModText(mod)}{' '}
            <span className="text-gray-600 text-[10px]">
              (T{mod.tier} {mod.name})
            </span>
          </span>
        </div>
      ))}

      {explicits.length === 0 && rarity !== 'normal' && (
        <div className="text-gray-600 text-xs italic text-center py-1">No modifiers</div>
      )}

      {rarity === 'normal' && (
        <div className="text-gray-600 text-xs italic text-center py-1">
          Normal — apply a currency to craft
        </div>
      )}

      {/* Mod counter */}
      <div className="divider" />
      <div className="text-gray-600 text-[10px] text-center">
        {prefixes.length}/3 Prefixes · {suffixes.length}/3 Suffixes
      </div>
    </div>
  );
}
