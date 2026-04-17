const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const SKILL_DEFINITIONS = {
  lectura: { label: 'Lectura', tabHints: ['Mente', 'Escuela'], baseGain: 2.3, statEffects: { development: 0.7, emotional: 0.2 } },
  disciplina: { label: 'Disciplina', tabHints: ['Mente', 'Familia'], baseGain: 2.0, statEffects: { emotional: 0.6, sleep: 0.2 } },
  coordinacion: { label: 'Coordinación', tabHints: ['Vida', 'Escuela'], baseGain: 2.1, statEffects: { health: 0.5, development: 0.4 } },
  sociabilidad: { label: 'Sociabilidad', tabHints: ['Familia', 'Mente'], baseGain: 2.0, statEffects: { bond: 0.6, emotional: 0.3 } },
  resistencia_fisica: { label: 'Resistencia física', tabHints: ['Vida'], baseGain: 2.4, statEffects: { health: 0.8, sleep: -0.15 } },
};

export const SKILL_IDS = Object.keys(SKILL_DEFINITIONS);

export function buildInitialSkills(stats) {
  return {
    lectura: clamp(Math.round((stats.development * 0.7) + (stats.emotional * 0.15)), 0, 100),
    disciplina: clamp(Math.round((stats.emotional * 0.6) + (stats.bond * 0.25)), 0, 100),
    coordinacion: clamp(Math.round((stats.health * 0.5) + (stats.development * 0.3)), 0, 100),
    sociabilidad: clamp(Math.round((stats.bond * 0.7) + (stats.emotional * 0.2)), 0, 100),
    resistencia_fisica: clamp(Math.round((stats.health * 0.75) + (stats.sleep * 0.15)), 0, 100),
  };
}

export function getDiminishingMultiplier(level) {
  return clamp(Number((1 - (level / 130)).toFixed(3)), 0.2, 1);
}

export function computeSkillClickGain({ skillId, currentLevel, efficiency }) {
  const definition = SKILL_DEFINITIONS[skillId];
  if (!definition) return 0;

  const diminishing = getDiminishingMultiplier(currentLevel);
  const gain = definition.baseGain * efficiency * diminishing;

  return Number(gain.toFixed(2));
}

export function computeSkillStatEffects(skillId, gain) {
  const definition = SKILL_DEFINITIONS[skillId];
  if (!definition) return {};

  return Object.fromEntries(
    Object.entries(definition.statEffects).map(([key, value]) => [key, Number((value * (gain / 2)).toFixed(2))])
  );
}
