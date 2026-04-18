import { NAME_POOLS } from '../data/names/europeanNames.js';
import { pickRandom } from '../utils/random.js';

const fallbackPool = {
  legacyCutoff: 1970,
  firstNames: {
    male: { legacy: ['Alex', 'Daniel', 'Luis', 'Miguel'], modern: ['Leo', 'Hugo', 'Noah'] },
    female: { legacy: ['Ana', 'Elisa', 'Laura', 'Julia'], modern: ['Luna', 'Mía', 'Emma'] },
  },
  surnames: ['Martín', 'López', 'Rossi'],
};

function getCountryPool(country) {
  return NAME_POOLS[country] || fallbackPool;
}

function resolveGenderPool(pool, sex = 'male') {
  if (sex === 'female') {
    const femaleLegacy = pool.femaleNames?.legacy || pool.firstNames?.female?.legacy || fallbackPool.firstNames.female.legacy;
    const femaleModern = pool.femaleNames?.modern || pool.firstNames?.female?.modern || fallbackPool.firstNames.female.modern;
    return { legacy: femaleLegacy, modern: femaleModern };
  }
  const maleLegacy = pool.firstNames?.legacy || pool.firstNames?.male?.legacy || fallbackPool.firstNames.male.legacy;
  const maleModern = pool.firstNames?.modern || pool.firstNames?.male?.modern || fallbackPool.firstNames.male.modern;
  return { legacy: maleLegacy, modern: maleModern };
}

function getFirstNameCandidates(pool, birthYear, preferLegacy, sex = 'male') {
  const genderPool = resolveGenderPool(pool, sex);
  if (preferLegacy || birthYear <= (pool.legacyCutoff || fallbackPool.legacyCutoff)) {
    return genderPool.legacy;
  }

  return [...genderPool.legacy, ...genderPool.modern];
}

export function generateName(country, birthYear, options = {}) {
  const { forcedSurname, preferLegacy = false, sex = 'male' } = options;
  const pool = getCountryPool(country);

  const firstName = pickRandom(getFirstNameCandidates(pool, birthYear, preferLegacy, sex))
    || (sex === 'female' ? fallbackPool.firstNames.female.legacy[0] : fallbackPool.firstNames.male.legacy[0]);
  const surname = forcedSurname || pickRandom(pool.surnames) || fallbackPool.surnames[0];

  return {
    firstName,
    surname,
    fullName: `${firstName} ${surname}`,
    style: birthYear <= (pool.legacyCutoff || fallbackPool.legacyCutoff) ? 'legacy' : 'modern',
    country,
    sex,
  };
}

export function generateRelativeName(country, birthYear, options = {}) {
  return generateName(country, birthYear, { ...options, preferLegacy: true });
}
