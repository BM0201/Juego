export function pickRandom(list, rng = Math.random) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.floor(rng() * list.length)];
}

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function weightedPick(items, getWeight, rng = Math.random) {
  if (!items?.length) return null;
  const weighted = items.map((item) => ({ item, w: Math.max(0, getWeight(item) ?? 0) }));
  const sum = weighted.reduce((acc, entry) => acc + entry.w, 0);
  if (sum <= 0) return items[0];
  let cursor = rng() * sum;
  for (const entry of weighted) {
    cursor -= entry.w;
    if (cursor <= 0) return entry.item;
  }
  return weighted[weighted.length - 1].item;
}

export function roll(probability, rng = Math.random) {
  return rng() < Math.max(0, Math.min(1, probability));
}
