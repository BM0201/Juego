import { CONTEXT_EVENTS } from '../data/events/contextEvents.js';
import { weightedPick } from '../utils/random.js';

function passesRange(value, min, max) {
  if (typeof min === 'number' && value < min) return false;
  if (typeof max === 'number' && value > max) return false;
  return true;
}

function matchesConditions(event, context) {
  const { conditions = {} } = event;

  if (!passesRange(context.age, conditions.ageMin, conditions.ageMax)) return false;
  if (conditions.countries?.length && !conditions.countries.includes(context.country)) return false;
  if (conditions.classKeys?.length && !conditions.classKeys.includes(context.family.socialClassKey)) return false;
  if (conditions.seasons?.length && !conditions.seasons.includes(context.season)) return false;

  if (conditions.family) {
    if (!passesRange(context.family.householdResources, conditions.family.householdResourcesMin, conditions.family.householdResourcesMax)) return false;
    if (!passesRange(context.family.foodAccess, conditions.family.foodAccessMin, conditions.family.foodAccessMax)) return false;
    if (!passesRange(context.family.careAccess, conditions.family.careAccessMin, conditions.family.careAccessMax)) return false;
  }

  if (conditions.stats) {
    if (!passesRange(context.stats.health, conditions.stats.healthMin, conditions.stats.healthMax)) return false;
    if (!passesRange(context.stats.sleep, conditions.stats.sleepMin, conditions.stats.sleepMax)) return false;
  }

  return true;
}

function isInCooldown(event, history, year) {
  if (!event.cooldown) return false;
  const last = history[event.id];
  if (typeof last !== 'number') return false;
  return year - last <= event.cooldown;
}

function adjustWeight(event, context) {
  let weight = event.weight;
  if (event.effects.health < 0) weight += context.family.illnessChance * 6;
  if (event.effects.health > 0 && context.family.opportunityBias > 0) weight += context.family.opportunityBias * 8;
  return Math.max(0.1, weight);
}

export function resolveContextEvent(context) {
  const candidates = CONTEXT_EVENTS
    .filter((event) => matchesConditions(event, context))
    .filter((event) => !isInCooldown(event, context.contextEventHistory || {}, context.year))
    .map((event) => ({ ...event, weight: adjustWeight(event, context) }));

  if (!candidates.length) return null;

  const noneWeight = Math.max(3, 10 - Math.floor(candidates.length / 2));
  const selected = weightedPick([...candidates, { id: '__none__', weight: noneWeight }], 'weight');

  if (selected.id === '__none__') return null;

  return {
    ...selected,
    id: `context_${selected.id}`,
    contextMeta: {
      sourceId: selected.id.replace(/^context_/, ''),
      category: 'context',
    },
  };
}
