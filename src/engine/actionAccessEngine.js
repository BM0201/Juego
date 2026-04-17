const RURAL_CLASS_KEYS = new Set(['working_rural', 'smallholder', 'precarious']);

const FIELD_WORK_OPTION_IDS = new Set([
  'aprender_cosecha',
  'aprender_a_arar',
  'ayudar_con_entusiasmo',
  'evitar_trabajo',
]);

const COMPLEX_LEARNING_OPTION_IDS = new Set(['aprender_lectura', 'mejorar_disciplina']);

const SPECIALIZED_TRAINING_OPTION_IDS = new Set(['aprender_a_arar', 'ayudar_con_entusiasmo']);

export function isEarlyPassiveStage(age) {
  return age >= 0 && age <= 3;
}

export function supportsImplicitInfancyProgression(age) {
  return isEarlyPassiveStage(age);
}

export function buildMentalModel({ stats = {}, family = {} }) {
  const development = stats.development || 0;
  const emotional = stats.emotional || 0;
  const intelligence = Math.round((development * 0.65) + (emotional * 0.35));
  const agency = Math.round((emotional * 0.5) + ((family.discipline || 50) * 0.3) + ((stats.bond || 50) * 0.2));

  return { development, emotional, intelligence, agency };
}

export function canPlanYear({ age, stats, family }) {
  const mental = buildMentalModel({ stats, family });

  if (supportsImplicitInfancyProgression(age)) {
    return {
      allowed: false,
      reason: 'En esta etapa los cuidadores y el contexto definen gran parte del año.',
      mental,
    };
  }

  if (age <= 6 && (mental.development < 40 || mental.agency < 43)) {
    return {
      allowed: false,
      reason: 'Aún falta desarrollo mental y agencia básica para iniciar planificación.',
      mental,
    };
  }

  if (age <= 10 && (mental.development < 50 || mental.intelligence < 50 || mental.agency < 52)) {
    return {
      allowed: false,
      reason: 'Todavía no alcanza el umbral de agencia para planificar con autonomía parcial.',
      mental,
    };
  }

  return {
    allowed: true,
    reason: 'Planificación habilitada para la etapa actual.',
    mental,
  };
}

export function canDoFieldWork({ age, stats, family, currentEvent }) {
  if (age < 7) {
    return { allowed: false, reason: 'Demasiado pequeño para tareas de campo.' };
  }

  if (!RURAL_CLASS_KEYS.has(family.socialClassKey)) {
    return { allowed: false, reason: 'El hogar actual no tiene contexto rural compatible.' };
  }

  if ((stats.health || 0) < 45) {
    return { allowed: false, reason: 'Salud insuficiente para tareas físicas de campo.' };
  }

  const eventActive = currentEvent?.id === 'rural_child_labor' || /campo/.test((currentEvent?.text || '').toLowerCase());
  const contextualNeed = (family.householdResources || 0) <= 55 && age <= 10;

  if (!eventActive && !contextualNeed) {
    return { allowed: false, reason: 'No hay evento/contexto de necesidad de trabajo rural este año.' };
  }

  return { allowed: true, reason: 'Contexto rural válido para tareas de campo.' };
}

export function canDoComplexLearning({ age, stats, family }) {
  const mental = buildMentalModel({ stats, family });
  if (age < 11) return { allowed: false, reason: 'Aprendizaje complejo bloqueado por edad.', mental };
  if (mental.development < 55 || mental.intelligence < 55) {
    return { allowed: false, reason: 'Falta desarrollo mental para aprendizaje complejo.', mental };
  }
  return { allowed: true, reason: 'Aprendizaje complejo habilitado.', mental };
}

export function canTrainSkill({ age, stats, family }) {
  const mental = buildMentalModel({ stats, family });
  if (age < 11) return { allowed: false, reason: 'Entrenamiento especializado bloqueado por edad.', mental };
  if (mental.agency < 56 || mental.development < 54) {
    return { allowed: false, reason: 'Falta agencia/desarrollo para entrenamiento especializado.', mental };
  }
  return { allowed: true, reason: 'Entrenamiento especializado habilitado.', mental };
}

export function classifyOption(optionId) {
  if (FIELD_WORK_OPTION_IDS.has(optionId)) return 'field_work';
  if (COMPLEX_LEARNING_OPTION_IDS.has(optionId)) return 'complex_learning';
  if (SPECIALIZED_TRAINING_OPTION_IDS.has(optionId)) return 'specialized_training';
  return 'basic';
}
