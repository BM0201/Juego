import { SURPRISE_EVENTS } from '../data/events/surpriseEvents.js';
import { weightedPick } from '../utils/random.js';
import { applyRelationshipImpact } from './relationshipEngine.js';

function passesRange(value, min, max) {
  if (typeof min === 'number' && value < min) return false;
  if (typeof max === 'number' && value > max) return false;
  return true;
}

function matchesConditions(event, context) {
  const conditions = event.conditions || {};
  if (conditions.forced && context.forceEventId !== event.id) return false;
  if (conditions.forced) return true;

  if (!passesRange(context.age, conditions.ageMin, conditions.ageMax)) return false;
  if (conditions.area?.length && !conditions.area.includes(context.areaKey)) return false;
  return true;
}

function isInCooldown(eventId, cooldown, historyByEvent, year) {
  if (!cooldown) return false;
  const last = historyByEvent[eventId];
  if (typeof last !== 'number') return false;
  return year - last <= cooldown;
}

function shouldTriggerSurprise(age) {
  if (age < 6) return Math.random() < 0.35;
  if (age < 14) return Math.random() < 0.48;
  if (age < 40) return Math.random() < 0.56;
  return Math.random() < 0.42;
}

export function resolveSurpriseEvents({
  age,
  year,
  areaKey,
  surpriseEventHistory = {},
  relationships = [],
  pendingFollowUpEventId = null,
}) {
  let currentRelationships = relationships;
  const history = { ...surpriseEventHistory };
  let nextFollowUp = null;
  const surprises = [];

  const forceEventId = pendingFollowUpEventId;
  const shouldRun = !!forceEventId || shouldTriggerSurprise(age);
  if (!shouldRun) {
    return {
      surprises,
      relationships: currentRelationships,
      surpriseEventHistory: history,
      pendingFollowUpEventId: null,
    };
  }

  const runs = forceEventId ? 1 : Math.random() < 0.22 ? 2 : 1;

  for (let i = 0; i < runs; i += 1) {
    const forcedId = i === 0 ? forceEventId : null;
    const context = { age, areaKey, forceEventId: forcedId };

    const candidates = SURPRISE_EVENTS
      .filter((item) => matchesConditions(item, context))
      .filter((item) => !isInCooldown(item.id, item.cooldown || 2, history, year));

    if (!candidates.length) continue;

    const selected = forcedId
      ? candidates.find((item) => item.id === forcedId) || null
      : weightedPick(candidates, 'weight');
    if (!selected) continue;

    history[selected.id] = year;

    let relationshipMeta = null;
    if (selected.relationship?.role) {
      const relResult = applyRelationshipImpact({
        relationships: currentRelationships,
        targetRole: selected.relationship.role,
        delta: selected.relationship.delta || 0,
        status: selected.relationship.status,
        note: `${year}: ${selected.text}`,
        year,
      });
      currentRelationships = relResult.relationships;
      if (relResult.targetName) {
        relationshipMeta = {
          role: selected.relationship.role,
          targetName: relResult.targetName,
          delta: selected.relationship.delta || 0,
          status: selected.relationship.status || 'activo',
        };
      }
    }

    surprises.push({
      id: `surprise_${selected.id}_${year}_${i}`,
      sourceId: selected.id,
      title: 'Evento sorpresa',
      text: selected.text,
      effects: selected.effects,
      tone: selected.tone || 'mixed',
      relationMeta: relationshipMeta,
      surpriseMeta: {
        sourceId: selected.id,
        followUpEventId: selected.followUpEventId || null,
      },
    });

    if (selected.followUpEventId) nextFollowUp = selected.followUpEventId;
  }

  return {
    surprises,
    relationships: currentRelationships,
    surpriseEventHistory: history,
    pendingFollowUpEventId: nextFollowUp,
  };
}
