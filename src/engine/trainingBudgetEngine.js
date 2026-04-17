function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function baseCapacityByAge(age) {
  if (age <= 3) return 12;
  if (age <= 6) return 28;
  if (age <= 10) return 45;
  return 62;
}

function computeRecentHardLoad(recentEvents = []) {
  const negatives = recentEvents.filter((item) => item.tone === 'negative').length;
  const medium = recentEvents.filter((item) => item.tone === 'neutral').length;
  return clamp((negatives * 9) + (medium * 2), 0, 25);
}

export function computeTrainingBudget({ age, stats, family, recentEvents = [] }) {
  const base = baseCapacityByAge(age);

  const sleepQuality = clamp(stats.sleep, 0, 100);
  const health = clamp(stats.health, 0, 100);
  const nutrition = clamp(Math.round((stats.health * 0.55) + ((family.foodAccess || 50) * 0.45)), 0, 100);
  const stress = clamp(100 - stats.emotional, 0, 100);
  const discipline = clamp(family.discipline || 50, 0, 100);
  const mentalDevelopment = clamp(stats.development, 0, 100);
  const familySupport = clamp(Math.round(((family.familyStability || 50) + (family.careAccess || 50)) / 2), 0, 100);
  const hardLoad = computeRecentHardLoad(recentEvents);

  const recoveryScore = (sleepQuality * 0.22) + (health * 0.2) + (nutrition * 0.18) + (familySupport * 0.1);
  const cognitionScore = (mentalDevelopment * 0.2) + (discipline * 0.1);
  const pressurePenalty = (stress * 0.22) + hardLoad;

  const usefulEnergy = clamp(Math.round(base + ((recoveryScore - 50) * 0.55) - (pressurePenalty * 0.35)), 4, 95);
  const learningCapacity = clamp(Math.round((mentalDevelopment * 0.45) + (discipline * 0.25) + (sleepQuality * 0.15) + (familySupport * 0.15)), 5, 100);

  const actionBudgetPoints = clamp(Math.round((usefulEnergy * 0.55) + (learningCapacity * 0.45)), 5, 100);

  const clicksAvailable = clamp(
    Math.round((actionBudgetPoints / 9) + (age <= 6 ? -1 : 0)),
    age <= 3 ? 0 : 2,
    age <= 6 ? 7 : age <= 10 ? 11 : 15
  );

  const performanceMultiplier = clamp(
    Number((0.55 + (actionBudgetPoints / 120) + ((100 - stress) / 350)).toFixed(2)),
    0.45,
    1.6
  );

  return {
    clicksAvailable,
    performanceMultiplier,
    usefulEnergy,
    learningCapacity,
    actionBudgetPoints,
    breakdown: {
      age,
      sleepQuality,
      health,
      nutrition,
      stress,
      discipline,
      mentalDevelopment,
      familySupport,
      hardLoad,
    },
    message: `Presupuesto del periodo: energía útil ${usefulEnergy}, capacidad ${learningCapacity}, rendimiento x${performanceMultiplier}.`,
  };
}
