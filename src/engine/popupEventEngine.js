import { POPUP_EVENTS } from '../data/events/popupEvents.js';
import { weightedPick } from '../utils/random.js';

function passesRange(value, min, max) {
  if (typeof min === 'number' && value < min) return false;
  if (typeof max === 'number' && value > max) return false;
  return true;
}

function matchesPopupConditions(event, context) {
  const { conditions = {} } = event;

  if (!passesRange(context.age, conditions.ageMin, conditions.ageMax)) return false;

  if (conditions.family) {
    if (!passesRange(context.family.householdResources, conditions.family.householdResourcesMin, conditions.family.householdResourcesMax)) return false;
    if (!passesRange(context.family.foodAccess, conditions.family.foodAccessMin, conditions.family.foodAccessMax)) return false;
    if (!passesRange(context.family.careAccess, conditions.family.careAccessMin, conditions.family.careAccessMax)) return false;
  }

  return true;
}

function isInCooldown(eventId, cooldown, popupHistory, year) {
  if (!cooldown || cooldown <= 0) return false;
  const lastYear = popupHistory[eventId];
  if (typeof lastYear !== 'number') return false;
  return year - lastYear <= cooldown;
}

function resolvePopupChance(context) {
  if (context.age <= 2) return 0.15;
  if (context.age <= 6) return 0.28;
  if (context.age <= 11) return 0.34;
  return 0.24;
}

export function resolvePopupEvent(context) {
  const chance = resolvePopupChance(context);
  if (Math.random() > chance) return null;

  const candidates = POPUP_EVENTS
    .filter((event) => matchesPopupConditions(event, context))
    .filter((event) => !isInCooldown(event.id, event.cooldown, context.popupHistory || {}, context.year));

  if (!candidates.length) return null;

  const selected = weightedPick(candidates, 'weight');

  return {
    ...selected,
    prompt: selected.text,
    urgency: context.age <= 10 ? 'alta' : 'media',
  };
}
