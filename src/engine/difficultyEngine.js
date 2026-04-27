import { DIFFICULTY_PRESETS, PLAYER_ROLES } from '../data/configs/playerConfig.js';

const DEFAULT_DIFFICULTY = DIFFICULTY_PRESETS.find((item) => item.id === 'estadista') || DIFFICULTY_PRESETS[0];
const DEFAULT_ROLE = PLAYER_ROLES.find((item) => item.id === 'plebeyo') || PLAYER_ROLES[0];

export function getDifficultyPreset(difficultyId = 'estadista') {
  return DIFFICULTY_PRESETS.find((item) => item.id === difficultyId) || DEFAULT_DIFFICULTY;
}

export function getRolePreset(roleId = 'plebeyo') {
  return PLAYER_ROLES.find((item) => item.id === roleId) || DEFAULT_ROLE;
}

export function applyDifficultyToEffects(effects = {}, difficultyId = 'estadista') {
  const difficulty = getDifficultyPreset(difficultyId);
  const next = {};

  Object.entries(effects || {}).forEach(([key, value]) => {
    if (!Number.isFinite(value)) return;
    const multiplier = value >= 0
      ? difficulty.modifiers.positiveEffectMultiplier
      : difficulty.modifiers.negativeEffectMultiplier;
    next[key] = Math.round(value * multiplier);
  });

  return next;
}

export function applyRoleToEffects(effects = {}, roleId = 'plebeyo') {
  const role = getRolePreset(roleId);
  const next = { ...effects };

  if (Number.isFinite(next.development)) {
    next.development = Math.round(next.development * role.modifiers.learning);
  }

  if (Number.isFinite(next.influence)) {
    next.influence = Math.round(next.influence * role.modifiers.influenceGain);
  }

  if (Number.isFinite(next.health) && next.health < 0) {
    next.health = Math.round(next.health * role.modifiers.resilience);
  }

  if (Number.isFinite(next.emotional) && next.emotional < 0) {
    next.emotional = Math.round(next.emotional * role.modifiers.resilience);
  }

  if (Number.isFinite(next.bankBalance)) {
    next.bankBalance = Math.round(next.bankBalance * role.modifiers.economy);
  }

  return next;
}
