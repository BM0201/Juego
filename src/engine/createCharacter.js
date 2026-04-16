import { generateFamilyFromProfile } from './familyGenerator.js';
import { resolveHistoricalProfile } from './profileEngine.js';
import { generateName } from './nameGenerator.js';
import { BASE_STATS } from './statEngine.js';

export function createCharacter({ birthDate, country }) {
  const profile = resolveHistoricalProfile(country, birthDate.year);
  const family = generateFamilyFromProfile(profile);
  const name = generateName(country, birthDate.year);

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
      health: Math.max(35, BASE_STATS.health + Math.round((family.foodAccess - 50) / 4)),
      bond: Math.max(30, BASE_STATS.bond + Math.round((family.familyStability - 50) / 4)),
    },
  };
}
