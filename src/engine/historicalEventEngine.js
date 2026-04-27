import { weightedPick } from '../utils/random.js';
import { ERA_HISTORICAL_EVENTS } from '../data/historical/eraHistoricalEvents.js';
import { getDifficultyPreset } from './difficultyEngine.js';

function isInCooldown(eventId, history = {}, year = 0, cooldown = 0) {
  if (!cooldown) return false;
  const lastYear = history[eventId];
  if (!Number.isFinite(lastYear)) return false;
  return (year - lastYear) <= cooldown;
}

export function resolveHistoricalEventV2({ country, year, roleId = 'plebeyo', difficultyId = 'estadista', historicalEventHistory = {} }) {
  const difficulty = getDifficultyPreset(difficultyId);

  const candidates = ERA_HISTORICAL_EVENTS
    .filter((event) => event.countries.includes(country))
    .filter((event) => year >= event.startYear && year <= event.endYear)
    .filter((event) => !isInCooldown(event.id, historicalEventHistory, year, event.cooldown))
    .map((event) => {
      const roleModifier = event.roleBias?.[roleId] || 0;
      const crisisModifier = difficulty.modifiers.randomCrisisChance || 1;
      return {
        ...event,
        weight: Math.max(0.2, (event.weight || 1) * crisisModifier + roleModifier),
      };
    });

  if (!candidates.length) return null;

  const noEventWeight = Math.max(2, 10 - candidates.length);
  const selected = weightedPick([...candidates, { id: '__none__', weight: noEventWeight }], 'weight');
  if (selected.id === '__none__') return null;

  return {
    id: selected.id,
    title: selected.title,
    text: selected.text,
    effects: selected.effects,
    tone: selected.tone || 'mixed',
    tags: selected.tags || [],
    meta: {
      era: selected.era,
      roleBias: selected.roleBias?.[roleId] || 0,
    },
  };
}
