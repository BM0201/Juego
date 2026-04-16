import { INFANCY_EVENTS } from '../data/events/infancyEvents.js';
import { chance } from '../utils/random.js';

function matchesCondition(event, context) {
  if (context.age < event.minAge || context.age > event.maxAge) return false;
  if (event.stage !== context.stageKey) return false;
  return true;
}

function profileAdjustments(event, context) {
  let score = event.baseChance;

  if (event.tags.includes('salud')) {
    score += context.family.illnessChance * 0.2;
    if (context.stats.health < 45) score += 0.08;
  }

  if (event.tags.includes('atencion')) {
    score += (50 - context.family.careAccess) / 500;
  }

  if (event.tags.includes('comida')) {
    score += (50 - context.family.foodAccess) / 450;
  }

  if (event.tags.includes('apego')) {
    score += (50 - context.family.familyStability) / 450;
  }

  if (event.tags.includes('escuela') && context.age < context.educationStartAge) {
    score -= 0.08;
  }

  if (event.effects.health > 0 || event.effects.development > 0 || event.effects.emotional > 0) {
    score += context.family.positiveEventBoost;
  }

  return Math.max(0.02, Math.min(0.9, score));
}

function isInCooldown(eventId, cooldown, historyByEventId, year) {
  if (!cooldown || cooldown <= 0) return false;
  const lastYear = historyByEventId[eventId];
  if (typeof lastYear !== 'number') return false;
  return year - lastYear <= cooldown;
}

export function resolveYearEvent(context) {
  const eligible = INFANCY_EVENTS.filter((event) => matchesCondition(event, context));

  const weighted = eligible
    .filter((event) => !isInCooldown(event.id, event.cooldown, context.eventHistory, context.year))
    .map((event) => ({
      event,
      chance: profileAdjustments(event, context),
    }));

  for (const item of weighted) {
    if (chance(item.chance)) {
      return item.event;
    }
  }

  return null;
}
