import { DEFAULT_PROFILE, HISTORICAL_PROFILES } from '../data/historical/historicalProfiles.js';

export function resolveHistoricalProfile(country, year) {
  return (
    HISTORICAL_PROFILES.find(
      (profile) => profile.country === country && year >= profile.startYear && year <= profile.endYear
    ) || DEFAULT_PROFILE
  );
}
