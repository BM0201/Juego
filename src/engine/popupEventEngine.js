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

function resolveRelationshipDrivenPopup(context) {
  const relationships = context.relationships || [];
  const best = relationships
    .filter((npc) => npc.status !== 'fallecido')
    .sort((a, b) => b.affinity - a.affinity)[0];
  const worst = relationships
    .filter((npc) => npc.status !== 'fallecido')
    .sort((a, b) => a.affinity - b.affinity)[0];

  if (best && best.affinity >= 55 && Math.random() < 0.25) {
    return {
      id: `rel_popup_positive_${best.id}`,
      weight: 1,
      text: `${best.name} te propone acompañarle en una decisión importante para su futuro.`,
      choices: [
        {
          id: 'support_fully',
          label: 'Apoyar completamente',
          hint: 'Fortalece el vínculo, exige energía.',
          outcomes: [
            { weight: 6, text: `El apoyo fue decisivo y ${best.name} no lo olvidará.`, effects: { emotional: 2, bond: 2, sleep: -1 } },
            { weight: 3, text: `Apoyaste, pero terminaste agotado por la presión.`, effects: { emotional: 1, sleep: -2 } },
          ],
        },
        {
          id: 'keep_distance',
          label: 'Mantener distancia',
          hint: 'Proteges recursos, pero enfrías la relación.',
          outcomes: [
            { weight: 6, text: `${best.name} lo tomó con frialdad y se alejó un poco.`, effects: { emotional: -1, bond: -2 } },
            { weight: 3, text: 'Ambos entendieron los límites y evitaron conflicto mayor.', effects: { emotional: 1 } },
          ],
        },
      ],
    };
  }

  if (worst && worst.affinity <= -30 && Math.random() < 0.25) {
    return {
      id: `rel_popup_negative_${worst.id}`,
      weight: 1,
      text: `${worst.name} inició un conflicto público que te obliga a reaccionar de inmediato.`,
      choices: [
        {
          id: 'confront_now',
          label: 'Confrontar',
          hint: 'Defiendes tu posición con riesgo emocional.',
          outcomes: [
            { weight: 5, text: 'La discusión escaló y dejó secuelas emocionales.', effects: { emotional: -3, development: 1 } },
            { weight: 4, text: 'Lograste poner límites y recuperar control.', effects: { emotional: 1, development: 1 } },
          ],
        },
        {
          id: 'deescalate',
          label: 'Desescalar',
          hint: 'Menos drama inmediato, puede verse como debilidad.',
          outcomes: [
            { weight: 6, text: 'Evitaste daño mayor, aunque quedó tensión latente.', effects: { emotional: 1, bond: -1 } },
            { weight: 3, text: 'La tensión bajó y abriste puerta a una tregua.', effects: { emotional: 2 } },
          ],
        },
      ],
    };
  }

  return null;
}

export function resolvePopupEvent(context) {
  const chance = resolvePopupChance(context);
  if (Math.random() > chance) return null;

  const relationPopup = resolveRelationshipDrivenPopup(context);
  if (relationPopup) {
    return {
      ...relationPopup,
      prompt: relationPopup.text,
      urgency: context.age <= 10 ? 'alta' : 'media',
    };
  }

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
