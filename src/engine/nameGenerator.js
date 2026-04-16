import { NAME_POOLS } from '../data/names/europeanNames.js';
import { pickRandom } from '../utils/random.js';

const fallbackPool = {
  legacyCutoff: 1970,
  firstNames: {
    legacy: ['Alex', 'Daniel', 'Luis', 'Miguel'],
    modern: ['Leo', 'Hugo', 'Noah'],
  },
  surnames: ['Martín', 'López', 'Rossi'],
};

function getCountryPool(country) {
  return NAME_POOLS[country] || fallbackPool;
}

function getFirstNameCandidates(pool, birthYear, preferLegacy) {
  if (preferLegacy || birthYear <= (pool.legacyCutoff || fallbackPool.legacyCutoff)) {
    return pool.firstNames.legacy;
  }

  return [...pool.firstNames.legacy, ...pool.firstNames.modern];
}

export function generateName(country, birthYear, options = {}) {
  const { forcedSurname, preferLegacy = false } = options;
  const pool = getCountryPool(country);

  const firstName = pickRandom(getFirstNameCandidates(pool, birthYear, preferLegacy)) || fallbackPool.firstNames.legacy[0];
  const surname = forcedSurname || pickRandom(pool.surnames) || fallbackPool.surnames[0];

  return {
    firstName,
    surname,
    fullName: `${firstName} ${surname}`,
    style: birthYear <= (pool.legacyCutoff || fallbackPool.legacyCutoff) ? 'legacy' : 'modern',
    country,
  };
}

export function generateRelativeName(country, birthYear, options = {}) {
  return generateName(country, birthYear, { ...options, preferLegacy: true });
}
