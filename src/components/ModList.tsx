import type { RolledMod } from '../types';

interface Props {
  mods: RolledMod[];
  label?: string;
}

function formatModText(mod: RolledMod): string {
  return mod.statText.replace('#', String(mod.rolledValue));
}

export default function ModList({ mods, label }: Props) {
  if (mods.length === 0) return null;

  return (
    <div>
      {label && (
        <div className="text-gray-600 text-[10px] uppercase tracking-widest mb-1">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {mods.map((mod, i) => (
          <div
            key={i}
            className={`text-xs px-2 py-0.5 rounded flex items-center gap-2 ${
              mod.type === 'prefix'
                ? 'text-[#aaaaff] bg-[#0a0a1a]'
                : 'text-[#aaffaa] bg-[#0a1a0a]'
            }`}
          >
            <span
              className={`text-[9px] font-bold uppercase ${
                mod.type === 'prefix' ? 'text-[#5555aa]' : 'text-[#55aa55]'
              }`}
            >
              {mod.type === 'prefix' ? 'P' : 'S'}
            </span>
            <span className="flex-1">{formatModText(mod)}</span>
            <span className="text-gray-700 text-[9px] ml-auto">
              T{mod.tier}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
