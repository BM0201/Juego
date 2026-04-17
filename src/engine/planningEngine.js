import { LIFE_STAGES } from '../data/configs/stagePlanningConfig.js';
import { TAB_FOCUS_OPTIONS } from '../data/configs/tabDetailConfig.js';
import {
  buildMentalModel,
  canDoComplexLearning,
  canDoFieldWork,
  canPlanYear,
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
  const mental = buildMentalModel({ stats, family });
  const planGate = canPlanYear({ age, stats, family });
  const allowedTabs = planGate.allowed ? getAllowedTabsByAge(age) : [];

  let tier = 'none';
  if (planGate.allowed && age <= 6) tier = 'limited';
  if (planGate.allowed && age >= 7 && age <= 10) tier = 'partial';
  if (planGate.allowed && age >= 11) tier = 'full';

  const blockedReasons = [];
  if (!planGate.allowed) blockedReasons.push(planGate.reason);
  if (age <= 3) blockedReasons.push('Solo acciones básicas: dormir, comer, jugar y buscar atención.');

  return {
    unlocked: planGate.allowed,
    tier,
    stage,
    mental,
    allowedTabs,
    message: planGate.reason,
    blockedReasons,
    currentEvent,
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
