import { computeTrainingBudget } from './trainingBudgetEngine.js';
import {
  buildInitialSkills,
  computeSkillClickGain,
  computeSkillStatEffects,
  SKILL_DEFINITIONS,
} from './skillProgression.js';

function buildEmptyEffects() {
  return { health: 0, sleep: 0, bond: 0, development: 0, emotional: 0 };
}

function mergeEffects(base, extra) {
  const result = { ...base };
  Object.entries(extra).forEach(([key, value]) => {
    result[key] = Number(((result[key] || 0) + value).toFixed(2));
  });
  return result;
}

export function createTrainingState({ age, year, stats, family, recentEvents = [], previousSkills = null, educationContext = null }) {
  const budget = computeTrainingBudget({ age, stats, family, recentEvents, educationContext });

  return {
    periodId: `${year}-edad-${age}`,
    clicksAvailable: budget.clicksAvailable,
    clicksUsed: 0,
    performanceMultiplier: budget.performanceMultiplier,
    usefulEnergy: budget.usefulEnergy,
    learningCapacity: budget.learningCapacity,
    actionBudgetPoints: budget.actionBudgetPoints,
    budgetBreakdown: budget.breakdown,
    budgetMessage: budget.message,
    educationContext,
    skills: previousSkills || buildInitialSkills(stats),
    accumulatedEffects: buildEmptyEffects(),
    history: [],
    lastTrainingFeedback: null,
  };
}

export function trainSkillClick({ training, skillId }) {
  if (!training || training.clicksAvailable <= 0) {
    return {
      training,
      success: false,
      message: 'No quedan clicks de entrenamiento en este periodo.',
    };
  }

  const skillDef = SKILL_DEFINITIONS[skillId];
  if (!skillDef) {
    return {
      training,
      success: false,
      message: 'La habilidad seleccionada no existe.',
    };
  }

  const currentLevel = training.skills[skillId] || 0;
  const gain = computeSkillClickGain({ skillId, currentLevel, efficiency: training.performanceMultiplier });
  const nextLevel = Math.min(100, Number((currentLevel + gain).toFixed(2)));
  const effectiveGain = Number((nextLevel - currentLevel).toFixed(2));
  const effects = computeSkillStatEffects(skillId, effectiveGain);

  const updated = {
    ...training,
    clicksAvailable: training.clicksAvailable - 1,
    clicksUsed: training.clicksUsed + 1,
    skills: {
      ...training.skills,
      [skillId]: nextLevel,
    },
    accumulatedEffects: mergeEffects(training.accumulatedEffects, effects),
    history: [
      ...training.history,
      {
        skillId,
        skillLabel: skillDef.label,
        gain: effectiveGain,
        effects,
      },
    ],
    lastTrainingFeedback: `+${effectiveGain} en ${skillDef.label}`,
  };

  return {
    training: updated,
    success: true,
    message: `Entrenaste ${skillDef.label}. Progreso +${effectiveGain}.`,
  };
}

export function summarizeTrainingPeriod(training) {
  if (!training || !training.history.length) {
    return {
      summaryText: 'Sin entrenamiento activo en este periodo.',
      effects: buildEmptyEffects(),
    };
  }

  const topSkills = Object.entries(
    training.history.reduce((acc, item) => {
      acc[item.skillLabel] = (acc[item.skillLabel] || 0) + item.gain;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, value]) => `${label} +${value.toFixed(1)}`)
    .join(' · ');

  return {
    summaryText: `Entrenamiento del periodo (${training.clicksUsed} clicks): ${topSkills}.`,
    effects: training.accumulatedEffects,
  };
}

export function prepareNextTrainingState({ previousTraining, age, year, stats, family, recentEvents = [], educationContext = null }) {
  return createTrainingState({
    age,
    year,
    stats,
    family,
    recentEvents,
    previousSkills: previousTraining?.skills || null,
    educationContext: educationContext || previousTraining?.educationContext || null,
  });
}


export function canTrainSkillById({ training, skillId }) {
  const age = training?.budgetBreakdown?.age || 0;
  const educationContext = training?.educationContext || null;

  if (educationContext && !educationContext.formalAccess && skillId === 'lectura') {
    return { allowed: false, reason: educationContext.restrictionReason };
  }

  if (skillId === 'lectura' && age < 6) {
    return { allowed: false, reason: 'Lectura estructurada se desbloquea desde los 6 años.' };
  }

  if (skillId === 'resistencia_fisica' && age < 5) {
    return { allowed: false, reason: 'Resistencia física requiere mayor desarrollo corporal (5+).' };
  }

  if (skillId === 'disciplina' && age < 4) {
    return { allowed: false, reason: 'Disciplina entrenable se habilita desde los 4 años.' };
  }

  if (skillId === 'coordinacion' && age < 3) {
    return { allowed: false, reason: 'Coordinación dirigida requiere al menos 3 años.' };
  }

  if (training?.clicksAvailable <= 0) {
    return { allowed: false, reason: 'No quedan clicks de entrenamiento este periodo.' };
  }

  return { allowed: true, reason: 'Disponible.' };
}
