import { useMemo } from 'react';
import type { CraftedItem } from '../types';
import { getEligibleMods } from '../utils/modRoller';

interface Props {
  item: CraftedItem | null;
}

/**
 * Calculate approximate probability of rolling the current explicit mod set
 * using Chaos Orb (re-roll Rare, 4-6 mods).
 *
 * This is a simplified estimate:  P = product of individual mod selection probabilities.
 */
function estimateProbability(item: CraftedItem): number {
  if (!item || item.explicits.length === 0) return 1;

  let prob = 1;
  const pool = getEligibleMods(item.base, item.itemLevel, []);
  const totalWeight = pool.reduce((s, p) => s + p.weight, 0);

  for (const mod of item.explicits) {
    const entry = pool.find((p) => p.mod.id === mod.defId);
    if (!entry || totalWeight === 0) {
      prob *= 0;
      break;
    }
    prob *= entry.weight / totalWeight;
  }
  return prob;
}

/**
 * Rough Chaos Orb cost estimate to hit all current mods.
 */
function estimateChaosOrbs(probability: number): number {
  if (probability <= 0) return Infinity;
  return Math.round(1 / probability);
}

export default function StatsPanel({ item }: Props) {
  const prob = useMemo(() => (item ? estimateProbability(item) : null), [item]);
  const chaosEst = useMemo(() => (prob != null ? estimateChaosOrbs(prob) : null), [prob]);

  const prefixes = item?.explicits.filter((m) => m.type === 'prefix') ?? [];
  const suffixes = item?.explicits.filter((m) => m.type === 'suffix') ?? [];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="gold-text font-bold text-sm uppercase tracking-widest">Statistics</h2>

      {!item && (
        <div className="text-gray-700 text-xs italic">Select an item to see statistics.</div>
      )}

      {item && (
        <>
          {/* Mod counts */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <StatRow label="Prefixes" value={`${prefixes.length} / 3`} />
            <StatRow label="Suffixes" value={`${suffixes.length} / 3`} />
            <StatRow label="Total Mods" value={`${item.explicits.length} / 6`} />
            <StatRow label="Rarity" value={item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} />
            <StatRow label="Item Level" value={String(item.itemLevel)} />
          </div>

          {/* Probability */}
          {prob != null && item.explicits.length > 0 && (
            <div className="border-t border-[#222] pt-3">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">
                Crafting Odds (estimate)
              </div>
              <StatRow
                label="Mod combo probability"
                value={
                  prob < 0.0001
                    ? `1 in ${chaosEst?.toLocaleString() ?? '?'}`
                    : `${(prob * 100).toFixed(4)}%`
                }
              />
              {chaosEst != null && isFinite(chaosEst) && (
                <StatRow
                  label="Avg Chaos Orbs needed"
                  value={
                    chaosEst > 1_000_000
                      ? `${(chaosEst / 1_000_000).toFixed(1)}M`
                      : chaosEst.toLocaleString()
                  }
                />
              )}
              <div className="text-gray-700 text-[9px] mt-2 leading-tight">
                * Simplified estimate. Actual odds depend on mod pool size and tier weights.
              </div>
            </div>
          )}

          {/* Mod list */}
          {item.explicits.length > 0 && (
            <div className="border-t border-[#222] pt-3">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">
                Current Modifiers
              </div>
              {item.explicits.map((mod, i) => (
                <div key={i} className="text-xs text-gray-400 py-0.5 flex justify-between">
                  <span>{mod.statText.replace('#', String(mod.rolledValue))}</span>
                  <span className="text-gray-700 ml-2">T{mod.tier}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-mono">{value}</span>
    </div>
  );
}
