import { DIFFICULTY_PRESETS, ROLE_DEFINITIONS } from '../data/roles.js';
import { clamp, roll } from './random.js';

const STAT_KEYS = ['salud', 'dinero', 'influencia', 'felicidad', 'prestigio', 'energia'];

function applyRiskAndDifficulty(value, { isPositive, difficulty }) {
  const multiplier = isPositive ? difficulty.positiveEffectMultiplier : difficulty.negativeEffectMultiplier;
  return Math.round(value * multiplier);
}

export function resolveDecision({ player, event, option }) {
  const difficulty = DIFFICULTY_PRESETS[player.difficultyId] || DIFFICULTY_PRESETS.estadista;
  const rolePerks = ROLE_DEFINITIONS[player.roleId]?.perks || ROLE_DEFINITIONS.plebeyo.perks;

  const nextStats = { ...player.stats };
  for (const key of STAT_KEYS) {
    const raw = option.effects?.[key] ?? 0;
    const roleFactor = key === 'dinero' ? rolePerks.economia : key === 'influencia' ? rolePerks.politica : key === 'felicidad' ? rolePerks.social : 1;
    const adjusted = Math.round(raw * roleFactor);
    const finalValue = applyRiskAndDifficulty(adjusted, {
      isPositive: adjusted >= 0,
      difficulty,
    });
    nextStats[key] = clamp((nextStats[key] ?? 0) + finalValue, 0, 100);
  }

  const optionRisk = option.effects?.riesgo ?? event.risk ?? 0.5;
  const riskTriggered = roll(optionRisk * difficulty.mortalityPressure * (nextStats.salud < 30 ? 1.2 : 1));

  if (riskTriggered) {
    nextStats.salud = clamp(nextStats.salud - Math.round(5 + optionRisk * 10));
    nextStats.felicidad = clamp(nextStats.felicidad - 4);
  }

  const unlocks = [];
  if (nextStats.prestigio >= 40) unlocks.push('joya');
  if (nextStats.prestigio >= 50) unlocks.push('cetro');
  if (nextStats.influencia >= 35) unlocks.push('monoculo');

  return {
    nextStats,
    riskTriggered,
    chainFlags: option.chainFlags || [],
    unlocks,
  };
}
