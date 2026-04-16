export function buildAnnualSummary({ planTitle, eventNarrative, stageLabel, movedStage, consequenceTone }) {
  const planText = `Plan ejecutado: ${planTitle}.`;
  const eventText = eventNarrative || 'No hubo eventos extraordinarios este año.';
  const toneText = `Balance del año: ${consequenceTone}.`;
  const stageText = movedStage ? `Nueva etapa: ${stageLabel}.` : '';

  return [planText, eventText, toneText, stageText].filter(Boolean).join(' ');
}

export function buildTimelineEntry({ year, age, summary }) {
  return `Año ${year} · Edad ${age}: ${summary}`;
}

export function evaluateYearContext({ stats, family, stageLabel }) {
  const risks = [];
  const opportunities = [];

  if (stats.sleep < 45) risks.push('Cansancio acumulado: conviene priorizar descanso.');
  if (stats.health < 45 || family.illnessChance > 0.3) risks.push('Riesgo de enfermedad en el próximo periodo.');
  if (stats.bond < 45 || family.familyStability < 45) risks.push('Posible conflicto familiar y menor contención emocional.');
  if (stats.development < 45) risks.push('Retraso de desarrollo si no se refuerzan hábitos.');
  if ((family.negativeRisk || 0) > 0.08) risks.push('Contexto social frágil: alta exposición a choques negativos.');

  if (stats.bond < 60) opportunities.push('Espacio para mejorar vínculo con cuidadores.');
  if (stats.development < 65) opportunities.push('Buen momento para aprender una habilidad clave.');
  if (stats.emotional < 65 || family.discipline < 55) opportunities.push('Se puede reforzar disciplina y autorregulación.');
  if (stats.health < 70) opportunities.push('Acciones simples pueden mejorar salud general.');
  if ((family.opportunityBias || 0) > 0.05) opportunities.push('Entorno con margen real para aprovechar oportunidades positivas.');

  if (!risks.length) risks.push('Sin riesgos críticos inmediatos.');
  if (!opportunities.length) opportunities.push(`Objetivo: consolidar mejoras en ${stageLabel.toLowerCase()}.`);

  return { risks, opportunities };
}

export function evaluateWeakAreas({ stats, family }) {
  const areas = [
    { key: 'Vida', value: Math.round((stats.health + stats.sleep) / 2) },
    { key: 'Mente', value: stats.emotional },
    { key: 'Familia', value: Math.round((stats.bond + family.familyStability) / 2) },
    { key: 'Escuela', value: stats.development },
  ];

  return areas.sort((a, b) => a.value - b.value).slice(0, 2);
}

export function resolveEventTone(events) {
  const score = events
    .flatMap((event) => Object.values(event.effects || {}))
    .reduce((sum, value) => sum + value, 0);

  if (score > 2) return 'positivo';
  if (score < -2) return 'negativo';
  return 'mixto';
}
