import { weightedPick } from '../utils/random.js';

function clamp(value) {
  return Math.max(-100, Math.min(100, Math.round(value)));
}

function addSmallVariance(effects = {}) {
  const output = {};
  Object.entries(effects).forEach(([key, value]) => {
    const jitter = Math.random() < 0.4 ? (Math.random() < 0.5 ? -1 : 1) : 0;
    output[key] = clamp(value + jitter);
  });
  return output;
}

export function resolvePopupChoice({ popupEvent, choiceId }) {
  const choice = popupEvent.choices.find((item) => item.id === choiceId);
  if (!choice) return null;

  const outcome = weightedPick(choice.outcomes, 'weight');
  const effects = addSmallVariance(outcome.effects);

  return {
    id: `popup_${popupEvent.id}_${choice.id}`,
    title: `Decisión urgente: ${popupEvent.text}`,
    text: `${popupEvent.text} Elegiste: ${choice.label}. Resultado: ${outcome.text}`,
    effects,
    popupMeta: {
      eventId: popupEvent.id,
      choiceId: choice.id,
      choiceLabel: choice.label,
      outcomeText: outcome.text,
    },
  };
}
