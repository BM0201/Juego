import { COUNTRY_WINDOWS, CENTURY_OPTIONS, HISTORICAL_CRISIS_WINDOWS } from '../data/configs/setupConfig.js';
import { WORLD_HISTORICAL_EVENTS } from '../data/historical/worldEvents.js';
import { LOCATION_AREAS } from '../data/configs/locationConfig.js';
import { pickRandom, randomInt } from '../utils/random.js';
import { DIFFICULTY_PRESETS, DYNASTY_NAME_POOL, PLAYER_ROLES } from '../data/configs/playerConfig.js';

function expandWindow(window, minYear, maxYear) {
  const safeStart = Math.max(minYear, window.startYear);
  const safeEnd = Math.min(maxYear, window.endYear);
  const years = [];

  for (let year = safeStart; year <= safeEnd; year += 1) {
    years.push(year);
  }

  return years;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

export function getCenturyByLabel(centuryLabel) {
  return CENTURY_OPTIONS.find((item) => item.label === centuryLabel) || CENTURY_OPTIONS[0];
}

export function buildCountryOptions(year) {
  const window = COUNTRY_WINDOWS.find((item) => year >= item.start && year <= item.end);
  return window ? window.options : ['Francia', 'España', 'Italia'];
}

export function buildCountryOptionsByCentury(centuryLabel) {
  const century = getCenturyByLabel(centuryLabel);
  const options = COUNTRY_WINDOWS
    .filter((window) => window.end >= century.start && window.start <= century.end)
    .flatMap((window) => window.options);

  return uniqueSorted(options);
}

export function getUnsafeYearsForCentury(centuryLabel) {
  const century = getCenturyByLabel(centuryLabel);

  const crisisYears = HISTORICAL_CRISIS_WINDOWS.flatMap((window) => expandWindow(window, century.start, century.end));
  const historicalEventYears = WORLD_HISTORICAL_EVENTS.flatMap((event) =>
    expandWindow({ startYear: event.startYear, endYear: event.endYear }, century.start, century.end)
  );

  return uniqueSorted([...crisisYears, ...historicalEventYears]);
}

export function getSafeYearsForCentury(centuryLabel) {
  const century = getCenturyByLabel(centuryLabel);
  const unsafe = new Set(getUnsafeYearsForCentury(centuryLabel));
  const safeYears = [];

  for (let year = century.start; year <= century.end; year += 1) {
    if (!unsafe.has(year)) {
      safeYears.push(year);
    }
  }

  return safeYears.length ? safeYears : Array.from({ length: century.end - century.start + 1 }, (_, idx) => century.start + idx);
}

export function generateRandomBirthContext(centuryLabel, preferences = {}) {
  const safeYears = getSafeYearsForCentury(centuryLabel);
  const year = pickRandom(safeYears);
  const month = randomInt(12) + 1;
  const day = randomInt(28) + 1;
  const area = pickRandom(LOCATION_AREAS) || LOCATION_AREAS[0];
  const countryOptions = buildCountryOptionsByCentury(centuryLabel);
  const country = pickRandom(countryOptions) || 'Francia';
  const sex = Math.random() < 0.5 ? 'male' : 'female';
  const role = PLAYER_ROLES.find((item) => item.id === preferences.roleId) || pickRandom(PLAYER_ROLES);
  const difficulty = DIFFICULTY_PRESETS.find((item) => item.id === preferences.difficultyId) || DIFFICULTY_PRESETS[1];

  return {
    century: getCenturyByLabel(centuryLabel).label,
    year,
    month,
    day,
    country,
    sex,
    areaKey: area.key,
    areaLabel: area.label,
    roleId: role.id,
    roleLabel: role.label,
    difficultyId: difficulty.id,
    difficultyLabel: difficulty.label,
    dynastyName: preferences.dynastyName?.trim() || pickRandom(DYNASTY_NAME_POOL),
    safeYearPoolSize: safeYears.length,
  };
}
