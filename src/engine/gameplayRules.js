import { resolveSocialEraRule } from './socialCareerSystem.js';

export const ANNUAL_ACTION_BALANCE = {
  version: 1,
  maxPointsByAge: [
    { maxAge: 5, points: 2 },
    { maxAge: 11, points: 3 },
    { maxAge: 17, points: 4 },
    { maxAge: Number.POSITIVE_INFINITY, points: 5 },
  ],
  actions: {
    explore_location: { cost: 1, category: 'exploration', minAge: 6, maxPerYear: 3 },
    npc_interaction: { cost: 1, category: 'social', minAge: 6, maxPerYear: 4 },
    trade: { cost: 1, category: 'trade', minAge: 10, maxPerYear: 3 },
    policy: { cost: 2, category: 'politics', minAge: 16, maxPerYear: 2, minInfluence: 20 },
    occupation_change: { cost: 1, category: 'work', minAge: 14, maxPerYear: 1 },
    move_location: { cost: 2, category: 'mobility', minAge: 14, maxPerYear: 1 },
  },
};

function resolveMaxActionPoints(age = 0) {
  return ANNUAL_ACTION_BALANCE.maxPointsByAge.find((entry) => age <= entry.maxAge)?.points || 3;
}

function normalizeUsage(value) {
  return Number.isFinite(value) ? value : 0;
}

function inferLifeStage(age = 0) {
  if (age <= 5) return 'infancia';
  if (age <= 11) return 'niñez';
  if (age <= 17) return 'adolescencia';
  return 'adultez';
}

function checkOccupationRequirements({ simulation, occupation }) {
  const stage = inferLifeStage(simulation.age);
  if (stage === 'infancia' || stage === 'niñez') {
    return { allowed: false, reason: 'Demasiado joven para empleo formal.' };
  }

  if (occupation.id === 'militar' && simulation.age < 17) {
    return { allowed: false, reason: 'Carrera militar disponible desde los 17 años.' };
  }

  if (occupation.id === 'carrera_especial') {
    const development = simulation.stats?.development || 0;
    const emotional = simulation.stats?.emotional || 0;
    if (simulation.age < 18 || development < 65 || emotional < 55 || (simulation.influence || 0) < 20) {
      return {
        allowed: false,
        reason: 'Carreras especiales requieren 18+, buen desarrollo/emoción e influencia cívica.',
      };
    }
  }

  return { allowed: true };
}

export function createAnnualActionEconomy({ age = 0, year = 0 }) {
  const maxPoints = resolveMaxActionPoints(age);
  return {
    version: ANNUAL_ACTION_BALANCE.version,
    year,
    maxPoints,
    pointsRemaining: maxPoints,
    actionUsage: {},
    categoryUsage: {},
  };
}

export function ensureActionEconomy(simulation = {}) {
  const current = simulation.actionEconomy;
  if (!current || current.version !== ANNUAL_ACTION_BALANCE.version || current.year !== simulation.year) {
    return createAnnualActionEconomy({ age: simulation.age, year: simulation.year });
  }

  return {
    ...current,
    pointsRemaining: normalizeUsage(current.pointsRemaining),
    maxPoints: normalizeUsage(current.maxPoints) || resolveMaxActionPoints(simulation.age),
    actionUsage: current.actionUsage || {},
    categoryUsage: current.categoryUsage || {},
  };
}

export function getActionAvailability({ simulation, actionKey, occupation = null }) {
  const economy = ensureActionEconomy(simulation);
  const config = ANNUAL_ACTION_BALANCE.actions[actionKey];
  if (!config) return { allowed: false, reason: 'Acción desconocida.', economy };

  if (simulation.age < config.minAge) {
    return { allowed: false, reason: `Acción disponible desde los ${config.minAge} años.`, economy };
  }

  if (config.minInfluence && (simulation.influence || 0) < config.minInfluence) {
    return { allowed: false, reason: `Necesitas ${config.minInfluence} de influencia para esta acción.`, economy };
  }

  if (actionKey === 'occupation_change') {
    const occupationCheck = checkOccupationRequirements({ simulation, occupation: occupation || {} });
    if (!occupationCheck.allowed) return { ...occupationCheck, economy };
  }

  const dynamicMaxPerYear = actionKey === 'npc_interaction'
    ? resolveSocialEraRule(simulation.year).maxSocialActions
    : config.maxPerYear;
  const usage = normalizeUsage(economy.actionUsage[actionKey]);
  if (usage >= dynamicMaxPerYear) {
    return { allowed: false, reason: `Límite anual alcanzado para esta acción (${dynamicMaxPerYear}).`, economy };
  }

  if (economy.pointsRemaining < config.cost) {
    return { allowed: false, reason: 'No tienes suficientes puntos de acción este año.', economy };
  }

  return {
    allowed: true,
    reason: 'Acción disponible.',
    cost: config.cost,
    remainingAfter: economy.pointsRemaining - config.cost,
    economy,
  };
}

export function consumeAction({ simulation, actionKey }) {
  const economy = ensureActionEconomy(simulation);
  const config = ANNUAL_ACTION_BALANCE.actions[actionKey];
  if (!config) return economy;

  return {
    ...economy,
    pointsRemaining: Math.max(0, economy.pointsRemaining - config.cost),
    actionUsage: {
      ...economy.actionUsage,
      [actionKey]: normalizeUsage(economy.actionUsage[actionKey]) + 1,
    },
    categoryUsage: {
      ...economy.categoryUsage,
      [config.category]: normalizeUsage(economy.categoryUsage[config.category]) + 1,
    },
  };
}
