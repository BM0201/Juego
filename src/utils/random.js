export const randomInt = (max) => Math.floor(Math.random() * max);

export function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  return list[randomInt(list.length)];
}

export function weightedPick(entries, weightKey = 'weight') {
  const total = entries.reduce((sum, item) => sum + item[weightKey], 0);
  let roll = Math.random() * total;

  for (const item of entries) {
    roll -= item[weightKey];
    if (roll <= 0) {
      return item;
    }
  }

  return entries[entries.length - 1];
}

export function chance(probability) {
  return Math.random() <= probability;
}
