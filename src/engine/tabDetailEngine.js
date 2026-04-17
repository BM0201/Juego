import { TAB_METRIC_CONFIG, TAB_TRAITS } from '../data/configs/tabDetailConfig.js';

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

function parseDelta(reportLines, label) {
  if (!reportLines?.length) return 0;
  const entry = reportLines.find((line) => line.startsWith(`${label} `));
  if (!entry) return 0;
  const value = Number(entry.split(' ').at(-1));
  return Number.isFinite(value) ? value : 0;
}

function deriveBaseMetrics({ stats, family }) {
  const physical = clamp((stats.health * 0.6) + (stats.sleep * 0.25) + (stats.development * 0.15));

  return {
    health: stats.health,
    sleep: stats.sleep,
    nutrition: clamp((stats.health + family.foodAccess) / 2),
    energy: clamp((stats.sleep + stats.health + stats.emotional) / 3),
    physical,

    stress: clamp(100 - ((stats.sleep + stats.emotional) / 2)),
    curiosity: clamp((stats.development + stats.emotional) / 2),
    agency: clamp((stats.emotional + stats.development) / 2),
    sociability: clamp((stats.bond + stats.emotional) / 2),
    emotional: clamp(stats.emotional),

    motherBond: clamp(stats.bond + 6),
    fatherBond: clamp(stats.bond - 2),
    caregiverBond: clamp((stats.bond + family.careAccess) / 2),
    siblings: clamp((stats.bond + 45) / 2),
    homeSupport: clamp((family.familyStability + family.householdResources) / 2),
    discipline: clamp((family.familyStability + stats.emotional) / 2),

    formalSchool: clamp(stats.development - 8),
    homeLearning: clamp((stats.development + family.careAccess) / 2),
    fieldTasks: clamp((stats.development + family.householdResources) / 2),
    tradeCraft: clamp(stats.development - 4),
    institutional: clamp((family.careAccess + family.familyStability) / 2),
    careInstitution: clamp(100 - family.familyStability),
  };
}

const DELTA_LABEL_MAP = {
  health: 'Salud',
  sleep: 'Sueño',
  nutrition: 'Salud',
  energy: 'Sueño',
  physical: 'Salud',
  stress: 'Mente',
  curiosity: 'Desarrollo',
  agency: 'Mente',
  sociability: 'Vínculo',
  emotional: 'Mente',
  motherBond: 'Vínculo',
  fatherBond: 'Vínculo',
  caregiverBond: 'Vínculo',
  siblings: 'Vínculo',
  homeSupport: 'Vínculo',
  discipline: 'Mente',
  formalSchool: 'Desarrollo',
  homeLearning: 'Desarrollo',
  fieldTasks: 'Desarrollo',
  tradeCraft: 'Desarrollo',
  institutional: 'Vínculo',
  careInstitution: 'Mente',
};

function buildReason(metric, delta, recentEventText) {
  if (delta < 0) {
    return `Bajó por ${recentEventText ? recentEventText.toLowerCase() : metric.causes.toLowerCase()}`;
  }
  if (delta > 0) {
    return `Subió por ${recentEventText ? recentEventText.toLowerCase() : 'práctica y contexto favorable'}`;
  }
  return `Sin cambio notable. Causa probable: ${metric.causes.toLowerCase()}`;
}

function buildRecommendation(metric, value) {
  if (value < 45) {
    return `Prioridad alta: ${metric.improve}`;
  }
  if (value < 65) {
    return `Conviene reforzar: ${metric.improve}`;
  }
  return 'Nivel estable: mantén consistencia.';
}

export function buildTabDetailModel({ tab, simulation, character }) {
  const baseMetrics = deriveBaseMetrics({ stats: simulation.stats, family: character.family });
  const config = TAB_METRIC_CONFIG[tab] || [];
  const recentEventText = simulation.recentEvents?.[0]?.text;

  const metrics = config.map((item) => {
    const value = baseMetrics[item.source];
    const recentChange = parseDelta(simulation.lastYearReport, DELTA_LABEL_MAP[item.source]);

    return {
      ...item,
      value,
      recentChange,
      explanation: buildReason(item, recentChange, recentEventText),
      recommendation: buildRecommendation(item, value),
    };
  });

  const weakest = [...metrics].sort((a, b) => a.value - b.value).slice(0, 2);
  const strongestShift = [...metrics].sort((a, b) => Math.abs(b.recentChange) - Math.abs(a.recentChange))[0];

  const lastChangeSummary = strongestShift
    ? `${strongestShift.label} ${
        strongestShift.recentChange > 0 ? `subió +${strongestShift.recentChange}` : `bajó ${strongestShift.recentChange}`
      }.`
    : 'Aún no hay cambios registrados en esta área.';

  const traits = TAB_TRAITS[tab] || [];

  return {
    metrics,
    traits,
    lastChangeSummary,
    improvementFocus: weakest.map((item) => `${item.label}: ${item.recommendation}`),
    advice: `En ${tab.toLowerCase()}, prioriza lo más débil antes de avanzar el año.`,
  };
}
