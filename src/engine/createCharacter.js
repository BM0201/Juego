import { generateFamilyFromProfile } from './familyGenerator.js';
import { resolveHistoricalProfile } from './profileEngine.js';
import { generateName } from './nameGenerator.js';
import { BASE_STATS } from './statExplanationEngine.js';
import { LOCATION_AREAS, resolveHometown } from '../data/configs/locationConfig.js';
import { generateInitialNpcs } from './npcEngine.js';
import { randomInt } from '../utils/random.js';
import { resolveEducationContext } from './educationEraEngine.js';

export function createCharacter({
  birthDate,
  country,
  areaKey = 'ciudad_pequena',
  sex = 'male',
  roleId = 'plebeyo',
  difficultyId = 'estadista',
  dynastyName = 'Casa Fundadora',
}) {
  const profile = resolveHistoricalProfile(country, birthDate.year);
  const name = generateName(country, birthDate.year, { sex });
  const family = generateFamilyFromProfile(profile, {
    country,
    birthYear: birthDate.year,
    childSurname: name.surname,
  });
  const educationContext = resolveEducationContext({ year: birthDate.year, age: 0 });

  const disciplineDelta = Math.round((family.discipline - 55) / 5);
  const riskDelta = Math.round(family.negativeRisk * 8);

  const area = LOCATION_AREAS.find((item) => item.key === areaKey) || LOCATION_AREAS[0];
  const hometown = resolveHometown({
    areaKey: area.key,
    country,
    year: birthDate.year,
    randomSeed: randomInt(10_000),
  });

  const avatarOptions = ['🧑', '👨', '👩', '🧒'];
  const avatar = avatarOptions[Math.abs((birthDate.year + country.length + name.firstName.length) % avatarOptions.length)];

  const baseCharacter = {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: name.fullName,
    firstName: name.firstName,
    surname: name.surname,
    sex,
    country,
    avatar,
    birthDate,
    profileId: profile.id,
    educationStartAge: Math.max(profile.educationStartAge, educationContext.formalEducationStartAge),
    educationModel: educationContext.key,
    roleId,
    difficultyId,
    dynasty: {
      name: dynastyName,
      prestige: 10,
      generations: 1,
      legacyMoments: ['Nacimiento de la dinastía'],
    },
    family,
    area: {
      key: area.key,
      label: area.label,
      hometown,
      moveCost: area.moveCost,
    },
    initialStats: {
      ...BASE_STATS,
      health: Math.max(35, BASE_STATS.health + Math.round((family.foodAccess - 50) / 4) - riskDelta),
      sleep: Math.max(30, BASE_STATS.sleep + Math.round((family.familyStability - 50) / 6)),
      bond: Math.max(30, BASE_STATS.bond + Math.round((family.familyStability - 50) / 4)),
      development: Math.max(30, BASE_STATS.development + Math.round((family.opportunityBias || 0) * 20)),
      emotional: Math.max(30, BASE_STATS.emotional + disciplineDelta - riskDelta),
    },
  };

  return {
    ...baseCharacter,
    keyNpcs: generateInitialNpcs({ character: baseCharacter }),
  };
}
