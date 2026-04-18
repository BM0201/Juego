import { DEFAULT_PROFILE, HISTORICAL_PROFILES } from '../data/historical/historicalProfiles.js';

export function resolveHistoricalProfile(country, year) {
  const exact = HISTORICAL_PROFILES.find(
    (profile) => profile.country === country && year >= profile.startYear && year <= profile.endYear
  );
  if (exact) return exact;

  const sameCountry = HISTORICAL_PROFILES
    .filter((profile) => profile.country === country)
    .sort((a, b) => Math.abs(((a.startYear + a.endYear) / 2) - year) - Math.abs(((b.startYear + b.endYear) / 2) - year));

  if (sameCountry.length) return sameCountry[0];
  return DEFAULT_PROFILE;
}
