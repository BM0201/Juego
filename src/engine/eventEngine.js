import { INFANCY_EVENTS } from '../data/events/infancyEvents.js';
import { weightedPick } from '../utils/random.js';
import { resolveDynamicEventOutcome } from './dynamicEventResolvers.js';

function passesRange(value, min, max) {
  if (typeof min === 'number' && value < min) return false;
  if (typeof max === 'number' && value > max) return false;
  return true;
}

function matchesConditions(event, context) {
  const { conditions = {} } = event;

  if (!passesRange(context.age, conditions.ageMin, conditions.ageMax)) return false;
  if (!passesRange(context.year, conditions.yearMin, conditions.yearMax)) return false;

  if (conditions.countries?.length && !conditions.countries.includes(context.country)) return false;
  if (conditions.classKeys?.length && !conditions.classKeys.includes(context.family.socialClassKey)) return false;
  if (conditions.seasons?.length && !conditions.seasons.includes(context.season)) return false;

  if (conditions.family) {
    if (!passesRange(context.family.careAccess, conditions.family.careAccessMin, conditions.family.careAccessMax)) return false;
    if (!passesRange(context.family.foodAccess, conditions.family.foodAccessMin, conditions.family.foodAccessMax)) return false;
    if (
      !passesRange(
        context.family.householdResources,
        conditions.family.householdResourcesMin,
        conditions.family.householdResourcesMax
      )
    )
      return false;
    if (
      !passesRange(
        context.family.familyStability,
        conditions.family.familyStabilityMin,
        conditions.family.familyStabilityMax
      )
    )
      return false;
    if (!passesRange(context.family.discipline, conditions.family.disciplineMin, conditions.family.disciplineMax)) return false;
  }

  if (conditions.stats) {
    if (!passesRange(context.stats.health, conditions.stats.healthMin, conditions.stats.healthMax)) return false;
    if (!passesRange(context.stats.sleep, conditions.stats.sleepMin, conditions.stats.sleepMax)) return false;
    if (!passesRange(context.stats.bond, conditions.stats.bondMin, conditions.stats.bondMax)) return false;
    if (!passesRange(context.stats.development, conditions.stats.developmentMin, conditions.stats.developmentMax))
      return false;
    if (!passesRange(context.stats.emotional, conditions.stats.emotionalMin, conditions.stats.emotionalMax))
      return false;
  }

  if (conditions.planningAny?.length) {
    const selectedFocusIds = context.annualPlan?.selectedItems?.map((item) => item.id) || [];
    if (!conditions.planningAny.some((id) => selectedFocusIds.includes(id))) {
      return false;
    }
  }

  return true;
}

function isInCooldown(eventId, cooldown, historyByEventId, year) {
  if (!cooldown || cooldown <= 0) return false;
  const lastYear = historyByEventId[eventId];
  if (typeof lastYear !== 'number') return false;
  return year - lastYear <= cooldown;
}

function adjustWeight(event, context) {
  let weight = event.weight || 1;

  if (event.effects.health < 0) {
    weight += context.family.illnessChance * 8;
    weight += (context.family.negativeRisk || 0) * 10;
    if (context.stats.health < 50) weight += 2;
  }

  if ((event.effects.bond < 0 || event.effects.emotional < 0) && context.family.familyStability < 45) {
    weight += 2 + Math.max(0, (55 - context.family.discipline) / 10);
  }

  if ((event.effects.health > 0 || event.effects.development > 0) && context.family.positiveEventBoost > 0) {
    weight += context.family.positiveEventBoost * 10;
  }

  if (event.effects.development > 0 || event.effects.emotional > 0) {
    weight += Math.max(0, (context.family.opportunityBias || 0) * 10);
  }

  return Math.max(0.1, weight);
}

export function resolveYearEvent(context) {
  const candidates = INFANCY_EVENTS.filter((event) => {
    if (event.stage !== context.stageKey) return false;
    if (!matchesConditions(event, context)) return false;
    if (isInCooldown(event.id, event.cooldown, context.eventHistory, context.year)) return false;
    return true;
  }).map((event) => ({ ...event, weight: adjustWeight(event, context) }));

  if (!candidates.length) {
    return null;
  }

  const noEventWeight = Math.max(2, 10 - Math.floor(candidates.length / 3));
  const pool = [...candidates, { id: '__none__', weight: noEventWeight }];
  const selected = weightedPick(pool, 'weight');

  if (selected.id === '__none__') return null;
  return resolveDynamicEventOutcome(selected, context);
}
