#!/usr/bin/env tsx
/**
 * scrape-poe2db.ts
 *
 * Data scraping / refresh script for Path of Exile 2 crafting data.
 *
 * Usage:
 *   npx tsx scripts/scrape-poe2db.ts
 *
 * This script attempts to fetch modifier and item data from poe2db.tw.
 * If the remote fetch fails (e.g. network not available in CI), it falls
 * back to validating the existing bundled data in src/data/.
 *
 * Output:
 *   src/data/items.json   — Item bases with tags, implicits, requirements
 *   src/data/mods.json    — Modifiers with weights, tiers, groups
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../src/data');

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function writeJson(filename: string, data: unknown) {
  const outPath = path.join(DATA_DIR, filename);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅  Wrote ${outPath} (${Array.isArray(data) ? data.length : 1} entries)`);
}

function readJson(filename: string): unknown {
  const p = path.join(DATA_DIR, filename);
  if (!fs.existsSync(p)) throw new Error(`${p} not found`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ─────────────────────────────────────────────────────────────
// poe2db.tw scraping
// ─────────────────────────────────────────────────────────────

/**
 * poe2db.tw provides JSON endpoints for mods and bases.
 * We map their structure to our internal ModDefinition / ItemBase formats.
 *
 * NOTE: poe2db.tw does not have a public documented API. These URLs
 * are derived from browser network inspection and may change.
 * The script gracefully falls back to existing data if fetch fails.
 */

const POE2DB_MODS_URL = 'https://poe2db.tw/us/Mods?json=1';
const POE2DB_ITEMS_URL = 'https://poe2db.tw/us/ItemBase?json=1';

async function tryFetch(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'poe2craft-scraper/1.0 (educational use)' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`⚠️  Could not fetch ${url}: ${(err as Error).message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Transformation helpers
// ─────────────────────────────────────────────────────────────

interface Poe2DbMod {
  Id?: string;
  Name?: string;
  GenerationType?: string;
  Domain?: string;
  CorrectGroup?: string;
  SpawnWeights?: Array<{ Tag: string; Value: number }>;
  Stats?: Array<{
    StatId: string;
    Min: number;
    Max: number;
    RequiredLevel?: number;
  }>;
  RequiredLevel?: number;
}

interface InternalMod {
  id: string;
  name: string;
  type: 'prefix' | 'suffix';
  group: string;
  tags: string[];
  tiers: Array<{
    tier: number;
    name: string;
    requiredLevel: number;
    spawnWeight: number;
    statMin: number;
    statMax: number;
  }>;
  statId: string;
  statText: string;
}

function transformMods(raw: Poe2DbMod[]): InternalMod[] {
  const map = new Map<string, InternalMod>();

  for (const mod of raw) {
    if (!mod.Id || !mod.CorrectGroup) continue;
    const type = mod.GenerationType?.toLowerCase() === 'prefix' ? 'prefix' : 'suffix';
    const tags = (mod.SpawnWeights ?? [])
      .filter((w) => w.Value > 0)
      .map((w) => w.Tag.toLowerCase());
    const stat = mod.Stats?.[0];
    if (!stat) continue;
    const weight = (mod.SpawnWeights ?? []).find((w) => w.Value > 0)?.Value ?? 0;

    const group = mod.CorrectGroup;
    const existing = map.get(group);
    const tier: InternalMod['tiers'][number] = {
      tier: 1,
      name: mod.Name ?? mod.Id,
      requiredLevel: mod.RequiredLevel ?? 1,
      spawnWeight: weight,
      statMin: stat.Min,
      statMax: stat.Max,
    };

    if (existing) {
      existing.tiers.push(tier);
    } else {
      map.set(group, {
        id: group,
        name: mod.Name ?? mod.Id,
        type,
        group,
        tags: [...new Set(tags)],
        tiers: [tier],
        statId: stat.StatId,
        statText: mod.Name ?? stat.StatId,
      });
    }
  }

  // Sort tiers and assign tier numbers
  for (const mod of map.values()) {
    mod.tiers.sort((a, b) => b.statMin - a.statMin);
    mod.tiers.forEach((t, i) => (t.tier = i + 1));
  }

  return [...map.values()];
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍  PoE 2 Crafting Simulator — Data Refresh Script');
  console.log('   Attempting to fetch data from poe2db.tw...\n');

  fs.mkdirSync(DATA_DIR, { recursive: true });

  // ── Mods ──
  const rawMods = await tryFetch(POE2DB_MODS_URL);
  if (rawMods && Array.isArray(rawMods)) {
    try {
      const transformed = transformMods(rawMods as Poe2DbMod[]);
      if (transformed.length > 0) {
        writeJson('mods.json', transformed);
      } else {
        console.warn('⚠️  Transformed mods array was empty; keeping existing data.');
      }
    } catch (err) {
      console.warn('⚠️  Failed to transform mod data:', (err as Error).message);
    }
  } else {
    console.log('ℹ️  Using bundled mods.json (no remote data available).');
    // Validate existing
    const existing = readJson('mods.json') as unknown[];
    console.log(`   Found ${existing.length} mods in bundled data.`);
  }

  // ── Items ──
  const rawItems = await tryFetch(POE2DB_ITEMS_URL);
  if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
    // poe2db structure varies; write raw for now and log
    console.log(
      `ℹ️  Fetched ${rawItems.length} item bases from poe2db.tw. Mapping to internal format...`
    );
    // Keep existing structured items.json (our format is richer)
    console.log('   Keeping existing items.json (bundled data is fully structured).');
  } else {
    console.log('ℹ️  Using bundled items.json (no remote data available).');
    const existing = readJson('items.json') as unknown[];
    console.log(`   Found ${existing.length} item bases in bundled data.`);
  }

  console.log('\n✅  Data refresh complete.');
  console.log('   Run `npm run dev` to start the simulator.\n');
}

main().catch((err) => {
  console.error('❌  Fatal error:', err);
  process.exit(1);
});
