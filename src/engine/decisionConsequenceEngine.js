import { applyDifficultyToEffects, applyRoleToEffects, getDifficultyPreset, getRolePreset } from './difficultyEngine.js';

function inferConsequenceScore(effects = {}) {
  return Object.values(effects).reduce((acc, value) => acc + (Number.isFinite(value) ? value : 0), 0);
}

export function resolveDecisionConsequences({ baseEffects = {}, roleId = 'plebeyo', difficultyId = 'estadista', activeHistoricalEvent = null }) {
  const role = getRolePreset(roleId);
  const difficulty = getDifficultyPreset(difficultyId);

  let effects = applyRoleToEffects(baseEffects, roleId);
  effects = applyDifficultyToEffects(effects, difficultyId);

  if (activeHistoricalEvent?.tags?.includes('agitacion_social') && Number.isFinite(effects.emotional)) {
    effects.emotional -= 1;
  }

  if (activeHistoricalEvent?.tags?.includes('economia') && Number.isFinite(effects.bankBalance)) {
    effects.bankBalance += Math.sign(effects.bankBalance || 0) * 1;
  }

  const score = inferConsequenceScore(effects);
  const tone = score > 2 ? 'positive' : score < -2 ? 'negative' : 'neutral';

  return {
    effects,
    score,
    tone,
    descriptor: `${role.label} · ${difficulty.label}`,
  };
}
