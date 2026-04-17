function getSelectedFocusIds(context) {
  return context.annualPlan?.selectedItems?.map((item) => item.id) || [];
}

function resolveRuralChildLabor(context, event) {
  const selected = getSelectedFocusIds(context);

  const supportSignals = [
    context.stats.health >= 58,
    context.stats.sleep >= 52,
    context.stats.bond >= 52,
    context.family.discipline >= 55,
    selected.includes('mejorar_sueno'),
    selected.includes('reducir_estres'),
    selected.includes('ayudar_en_casa') || selected.includes('ayudar_con_entusiasmo'),
  ].filter(Boolean).length;

  const strainSignals = [
    context.stats.sleep <= 48,
    context.stats.emotional <= 48,
    context.stats.development <= 46,
    context.family.householdResources <= 38,
    context.family.negativeRisk >= 0.1,
    selected.includes('evitar_trabajo'),
  ].filter(Boolean).length;

  if (supportSignals >= 5 && strainSignals <= 1) {
    return {
      ...event,
      text: 'Tu familia necesitó más ayuda en el campo este año. Pudiste sostener el esfuerzo con buena coordinación y el hogar cerró la temporada con algo de alivio.',
      effects: { health: 2, bond: 4, development: 1, emotional: 1, sleep: -1 },
      outcome: 'positivo',
    };
  }

  if (strainSignals >= 4 || (supportSignals <= 2 && context.stats.sleep < 50)) {
    return {
      ...event,
      text: 'Tu familia te envió al campo más de lo previsto. El sobreesfuerzo te dejó cansado, con estrés y menor avance formativo en el año.',
      effects: { health: -3, sleep: -6, emotional: -5, development: -4, bond: -2 },
      outcome: 'negativo',
    };
  }

  return {
    ...event,
    text: 'Tu familia necesitó más ayuda en el campo este año. Aportaste en casa y mejoró el vínculo, pero el cansancio redujo parte del progreso escolar.',
    effects: { health: 1, bond: 3, development: -2, emotional: -2, sleep: -3 },
    outcome: 'mixto',
  };
}

const DYNAMIC_EVENT_RESOLVERS = {
  rural_child_labor: resolveRuralChildLabor,
};

export function resolveDynamicEventOutcome(event, context) {
  const resolver = DYNAMIC_EVENT_RESOLVERS[event.dynamicResolver];
  if (!resolver) return event;
  return resolver(context, event);
}
