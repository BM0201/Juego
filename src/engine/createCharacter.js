import { generateFamilyFromProfile } from './familyGenerator.js';
import { resolveHistoricalProfile } from './profileEngine.js';
import { generateName } from './nameGenerator.js';
import { BASE_STATS } from './statExplanationEngine.js';

export function createCharacter({ birthDate, country }) {
  const profile = resolveHistoricalProfile(country, birthDate.year);
  const name = generateName(country, birthDate.year);
  const family = generateFamilyFromProfile(profile, {
    country,
    birthYear: birthDate.year,
    childSurname: name.surname,
  });

  const disciplineDelta = Math.round((family.discipline - 55) / 5);
  const riskDelta = Math.round(family.negativeRisk * 8);

  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: name.fullName,
    firstName: name.firstName,
    surname: name.surname,
    country,
    birthDate,
    profileId: profile.id,
    educationStartAge: profile.educationStartAge,
    family,
    initialStats: {
      ...BASE_STATS,
      health: Math.max(35, BASE_STATS.health + Math.round((family.foodAccess - 50) / 4) - riskDelta),
      sleep: Math.max(30, BASE_STATS.sleep + Math.round((family.familyStability - 50) / 6)),
      bond: Math.max(30, BASE_STATS.bond + Math.round((family.familyStability - 50) / 4)),
      development: Math.max(30, BASE_STATS.development + Math.round((family.opportunityBias || 0) * 20)),
      emotional: Math.max(30, BASE_STATS.emotional + disciplineDelta - riskDelta),
    },
  };
}
