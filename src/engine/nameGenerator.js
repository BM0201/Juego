import { NAME_POOLS } from '../data/names/europeanNames.js';
import { pickRandom } from '../utils/random.js';

const fallbackPool = {
  firstNames: ['Alex', 'Daniel', 'Luis'],
  surnames: ['Martin', 'Lopez', 'Rossi'],
};

export function generateName(country, birthYear) {
  const pool = NAME_POOLS[country] || fallbackPool;
  const firstName = pickRandom(pool.firstNames) || fallbackPool.firstNames[0];
  const surname = pickRandom(pool.surnames) || fallbackPool.surnames[0];

  return {
    firstName,
    surname,
    fullName: `${firstName} ${surname}`,
    style: birthYear <= (pool.legacyCutoff || 1970) ? 'legacy' : 'modern',
  };
}
