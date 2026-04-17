import { LIFE_STAGES } from '../data/configs/stagePlanningConfig.js';
import { TAB_FOCUS_OPTIONS } from '../data/configs/tabDetailConfig.js';
import {
  buildMentalModel,
  canDoComplexLearning,
  canDoFieldWork,
  canPlanYear,
  supportsImplicitInfancyProgression,
  canTrainSkill,
  classifyOption,
} from './actionAccessEngine.js';

export const TAB_TO_CATEGORY = {
  Vida: 'vida',
  Mente: 'mente',
  Familia: 'familia',
  Escuela: 'escuela',
};

export function getStageByAge(age) {
  return LIFE_STAGES.find((stage) => age >= stage.minAge && age <= stage.maxAge) || LIFE_STAGES[0];
}

const PASSIVE_INFANCY_PLANS = [
  {
    id: 'passive_sleep_routine',
    title: 'Rutina de descanso protegida',
    summary: 'Cuidadores priorizan sueño y regulación diaria.',
    effects: { sleep: 8, health: 3, emotional: 2, bond: 1, development: 1 },
  },
  {
    id: 'passive_nutrition_focus',
    title: 'Alimentación y cuidado básico',
    summary: 'Se refuerza nutrición, higiene y controles básicos.',
    effects: { health: 7, sleep: 2, development: 2, emotional: 1 },
  },
  {
    id: 'passive_guided_play',
    title: 'Juego guiado y estimulación',
    summary: 'Más juego supervisado para desarrollo temprano.',
    effects: { development: 8, bond: 2, emotional: 2, sleep: -1 },
  },
  {
    id: 'passive_caregiver_attention',
    title: 'Apego con cuidadores',
    summary: 'Mayor contención emocional y vínculo familiar.',
    effects: { bond: 8, emotional: 5, development: 2, sleep: 1 },
  },
];

function selectPassiveInfancyPlan(stats = {}) {
  const priorities = [
    { key: 'sleep', planId: 'passive_sleep_routine' },
    { key: 'health', planId: 'passive_nutrition_focus' },
    { key: 'development', planId: 'passive_guided_play' },
    { key: 'bond', planId: 'passive_caregiver_attention' },
    { key: 'emotional', planId: 'passive_caregiver_attention' },
  ];

  const lowest = priorities.reduce(
    (acc, item) => {
      const value = stats?.[item.key] ?? 50;
      return value < acc.value ? { ...item, value } : acc;
    },
    { key: 'development', planId: 'passive_guided_play', value: stats?.development ?? 50 }
  );

  return PASSIVE_INFANCY_PLANS.find((plan) => plan.id === lowest.planId) || PASSIVE_INFANCY_PLANS[2];
}

export function buildImplicitYearProgression({ age, stats }) {
  if (!supportsImplicitInfancyProgression(age)) {
    return {
      enabled: false,
      reason: 'Sin modo pasivo: etapa con planificación consciente.',
      annualPlan: null,
    };
  }

  const selectedPlan = selectPassiveInfancyPlan(stats);

  return {
    enabled: true,
    reason: 'En esta etapa los cuidadores y el contexto definen gran parte del año.',
    annualPlan: {
      id: `implicit_${selectedPlan.id}`,
      title: 'Autopiloto de infancia temprana',
      summary: selectedPlan.summary,
      effects: selectedPlan.effects,
      selectedItems: [selectedPlan],
      implicitYearProgression: true,
    },
  };
}

function getAllowedTabsByAge(age) {
  if (age <= 3) return [];
  if (age <= 6) return ['Vida', 'Familia'];
  if (age <= 10) return ['Vida', 'Mente', 'Familia', 'Escuela'];
  return ['Vida', 'Mente', 'Familia', 'Escuela'];
}

function validateOptionAccess({ option, age, stats, family, currentEvent }) {
  const kind = classifyOption(option.id);

  if (kind === 'field_work') {
    return canDoFieldWork({ age, stats, family, currentEvent });
  }

  if (kind === 'complex_learning') {
    return canDoComplexLearning({ age, stats, family });
  }

  if (kind === 'specialized_training') {
    return canTrainSkill({ age, stats, family });
  }

  return { allowed: true, reason: 'Acción básica habilitada.' };
}

export function resolvePlanningAccess({ age, stats, family, currentEvent = null }) {
  const stage = getStageByAge(age);
  const earlyPassiveStage = supportsImplicitInfancyProgression(age);
  const mental = buildMentalModel({ stats, family });
  const planGate = canPlanYear({ age, stats, family });
  const implicitYearProgression = buildImplicitYearProgression({ age, stats });
  const allowedTabs = planGate.allowed ? getAllowedTabsByAge(age) : [];

  let tier = 'none';
  if (planGate.allowed && age <= 6) tier = 'limited';
  if (planGate.allowed && age >= 7 && age <= 10) tier = 'partial';
  if (planGate.allowed && age >= 11) tier = 'full';

  const blockedReasons = [];
  if (!planGate.allowed) blockedReasons.push(planGate.reason);
  if (earlyPassiveStage) blockedReasons.push('No estás haciendo nada mal: la agencia consciente llega más adelante.');

  return {
    unlocked: planGate.allowed,
    tier,
    stage,
    mental,
    allowedTabs,
    message: earlyPassiveStage
      ? 'La planificación consciente aún no aplica en esta etapa.'
      : planGate.reason,
    blockedReasons,
    currentEvent,
    implicitYearProgression,
    earlyPassiveStage,
  };
}

export function getTabFocusOptionsByLabel(tabLabel, access = null, context = null) {
  const options = TAB_FOCUS_OPTIONS[TAB_TO_CATEGORY[tabLabel]] || [];

  if (!access) return options;
  if (!access.allowedTabs.includes(tabLabel)) return [];

  const age = context?.age ?? 0;
  const stats = context?.stats ?? {};
  const family = context?.family ?? {};
  const currentEvent = context?.currentEvent || access.currentEvent;

  return options.filter((option) => validateOptionAccess({ option, age, stats, family, currentEvent }).allowed);
}

export function buildAnnualPlanFromPlanning(planning, access = null, context = null) {
  const age = context?.age ?? 0;
  const stats = context?.stats ?? {};
  const family = context?.family ?? {};
  const currentEvent = context?.currentEvent || access?.currentEvent;

  const selectedItems = Object.entries(planning)
    .map(([category, optionId]) => (TAB_FOCUS_OPTIONS[category] || []).find((option) => option.id === optionId))
    .filter(Boolean)
    .filter((option) => !access || validateOptionAccess({ option, age, stats, family, currentEvent }).allowed);

  if (!selectedItems.length) {
    return null;
  }

  const effects = selectedItems.reduce((acc, item) => {
    Object.entries(item.effects).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + value;
    });
    return acc;
  }, {});

  return {
    id: selectedItems.map((item) => item.id).join('+'),
    title: `Plan anual (${selectedItems.length} enfoques)`,
    summary: selectedItems.map((item) => item.title).join(', '),
    effects,
    selectedItems,
  };
}
