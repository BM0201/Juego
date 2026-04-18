import { getEconomicContext, scaleInternalSalary } from './economicEraEngine.js';

export const SOCIAL_ERA_RULES = [
  {
    eraKey: 'preindustrial',
    minYear: 1600,
    maxYear: 1799,
    romanceMinAge: 16,
    maxSocialActions: 2,
    spaces: ['Familia extensa', 'Iglesia/templo', 'Mercado local', 'Fiestas comunales', 'Gremio/oficio'],
    actions: [
      { id: 'visita_familiar', label: 'Visitar familia', interactionType: 'hablar', relationDelta: 4, influenceDelta: 0, reputationalRisk: 0.02, romancePotential: 0.08 },
      { id: 'encuentro_mercado', label: 'Conversar en mercado', interactionType: 'favor', relationDelta: 3, influenceDelta: 1, reputationalRisk: 0.05, romancePotential: 0.12 },
      { id: 'asistir_templo', label: 'Asistir a ceremonia', interactionType: 'hablar', relationDelta: 2, influenceDelta: 1, reputationalRisk: 0.01, romancePotential: 0.06 },
      { id: 'cortejo_supervisado', label: 'Cortejo supervisado', interactionType: 'regalo', relationDelta: 5, influenceDelta: 0, reputationalRisk: 0.12, romancePotential: 0.24 },
    ],
  },
  {
    eraKey: 'industrial',
    minYear: 1800,
    maxYear: 1919,
    romanceMinAge: 15,
    maxSocialActions: 3,
    spaces: ['Fábrica/taller', 'Plaza/feria', 'Escuela básica', 'Club vecinal', 'Iglesia'],
    actions: [
      { id: 'feria_local', label: 'Ir a feria local', interactionType: 'hablar', relationDelta: 3, influenceDelta: 1, reputationalRisk: 0.05, romancePotential: 0.14 },
      { id: 'baile_social', label: 'Asistir a baile social', interactionType: 'favor', relationDelta: 4, influenceDelta: 1, reputationalRisk: 0.08, romancePotential: 0.2 },
      { id: 'intercambiar_cartas', label: 'Intercambiar cartas', interactionType: 'regalo', relationDelta: 5, influenceDelta: 0, reputationalRisk: 0.04, romancePotential: 0.22 },
      { id: 'circulo_oficio', label: 'Círculo de oficio', interactionType: 'trabajar', relationDelta: 2, influenceDelta: 2, reputationalRisk: 0.03, romancePotential: 0.08 },
    ],
  },
  {
    eraKey: 'moderna',
    minYear: 1920,
    maxYear: 1989,
    romanceMinAge: 14,
    maxSocialActions: 4,
    spaces: ['Escuela', 'Trabajo', 'Barrio', 'Club social', 'Universidad'],
    actions: [
      { id: 'salida_barrio', label: 'Salida en el barrio', interactionType: 'hablar', relationDelta: 3, influenceDelta: 1, reputationalRisk: 0.04, romancePotential: 0.18 },
      { id: 'cita_formal', label: 'Cita formal', interactionType: 'regalo', relationDelta: 6, influenceDelta: 0, reputationalRisk: 0.06, romancePotential: 0.26 },
      { id: 'club_social', label: 'Reunión de club social', interactionType: 'favor', relationDelta: 4, influenceDelta: 2, reputationalRisk: 0.03, romancePotential: 0.15 },
      { id: 'actividad_laboral', label: 'Actividad laboral conjunta', interactionType: 'trabajar', relationDelta: 2, influenceDelta: 2, reputationalRisk: 0.03, romancePotential: 0.09 },
    ],
  },
  {
    eraKey: 'contemporanea',
    minYear: 1990,
    maxYear: 2200,
    romanceMinAge: 14,
    maxSocialActions: 5,
    spaces: ['Trabajo', 'Universidad', 'Eventos', 'Redes sociales', 'Apps de citas'],
    actions: [
      { id: 'chat_redes', label: 'Conversar en redes', interactionType: 'hablar', relationDelta: 2, influenceDelta: 1, reputationalRisk: 0.05, romancePotential: 0.2 },
      { id: 'cita_app', label: 'Cita por app', interactionType: 'favor', relationDelta: 4, influenceDelta: 0, reputationalRisk: 0.07, romancePotential: 0.28 },
      { id: 'evento_comunidad', label: 'Evento comunitario', interactionType: 'favor', relationDelta: 3, influenceDelta: 2, reputationalRisk: 0.02, romancePotential: 0.16 },
      { id: 'videollamada', label: 'Videollamada', interactionType: 'regalo', relationDelta: 3, influenceDelta: 0, reputationalRisk: 0.01, romancePotential: 0.22 },
    ],
  },
];

export const JOB_PROFILES = [
  {
    id: 'panadero', title: 'Panadero', icon: '🥖', basePay: 820, hazardLevel: 0.18, mortalityRisk: 0.04, illnessRisk: 0.12,
    socialPrestige: 0.45, scarcityValue: 0.38, requiredEducation: 'basic', physicalDemand: 0.55, mentalDemand: 0.35,
    stability: 0.72, exposure: 0.7, eraAvailability: ['preindustrial', 'industrial', 'moderna', 'contemporanea'],
    economicEraModifier: { preindustrial: 0.9, industrial: 1.02, moderna: 1.08, contemporanea: 1.12 },
  },
  {
    id: 'guardia', title: 'Guardia', icon: '🛡️', basePay: 980, hazardLevel: 0.62, mortalityRisk: 0.18, illnessRisk: 0.09,
    socialPrestige: 0.58, scarcityValue: 0.44, requiredEducation: 'basic', physicalDemand: 0.72, mentalDemand: 0.48,
    stability: 0.65, exposure: 0.82, eraAvailability: ['preindustrial', 'industrial', 'moderna', 'contemporanea'],
    economicEraModifier: { preindustrial: 0.95, industrial: 1.05, moderna: 1.1, contemporanea: 1.15 },
  },
  {
    id: 'herrero', title: 'Herrero', icon: '⚒️', basePay: 900, hazardLevel: 0.48, mortalityRisk: 0.12, illnessRisk: 0.16,
    socialPrestige: 0.5, scarcityValue: 0.52, requiredEducation: 'none', physicalDemand: 0.78, mentalDemand: 0.35,
    stability: 0.63, exposure: 0.58, eraAvailability: ['preindustrial', 'industrial'],
    economicEraModifier: { preindustrial: 1.12, industrial: 1.06 },
  },
  {
    id: 'obrero_fabrica', title: 'Obrero de fábrica', icon: '🏭', basePay: 860, hazardLevel: 0.55, mortalityRisk: 0.14, illnessRisk: 0.2,
    socialPrestige: 0.4, scarcityValue: 0.35, requiredEducation: 'none', physicalDemand: 0.8, mentalDemand: 0.42,
    stability: 0.52, exposure: 0.74, eraAvailability: ['industrial', 'moderna'],
    economicEraModifier: { industrial: 1.08, moderna: 0.96 },
  },
  {
    id: 'maestro', title: 'Maestro', icon: '📚', basePay: 1040, hazardLevel: 0.09, mortalityRisk: 0.02, illnessRisk: 0.06,
    socialPrestige: 0.72, scarcityValue: 0.52, requiredEducation: 'technical', physicalDemand: 0.22, mentalDemand: 0.7,
    stability: 0.78, exposure: 0.76, eraAvailability: ['industrial', 'moderna', 'contemporanea'],
    economicEraModifier: { industrial: 0.96, moderna: 1.05, contemporanea: 1.14 },
  },
  {
    id: 'administrativo', title: 'Administrativo', icon: '🗂️', basePay: 1100, hazardLevel: 0.06, mortalityRisk: 0.01, illnessRisk: 0.08,
    socialPrestige: 0.66, scarcityValue: 0.48, requiredEducation: 'technical', physicalDemand: 0.18, mentalDemand: 0.75,
    stability: 0.81, exposure: 0.67, eraAvailability: ['moderna', 'contemporanea'],
    economicEraModifier: { moderna: 1.02, contemporanea: 1.18 },
  },
  {
    id: 'especialista', title: 'Especialista', icon: '🎓', basePay: 1480, hazardLevel: 0.11, mortalityRisk: 0.02, illnessRisk: 0.07,
    socialPrestige: 0.88, scarcityValue: 0.82, requiredEducation: 'advanced', physicalDemand: 0.16, mentalDemand: 0.88,
    stability: 0.86, exposure: 0.69, eraAvailability: ['moderna', 'contemporanea'],
    economicEraModifier: { moderna: 1.1, contemporanea: 1.25 },
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function resolveSocialEraRule(year = 1900) {
  return SOCIAL_ERA_RULES.find((rule) => year >= rule.minYear && year <= rule.maxYear) || SOCIAL_ERA_RULES[2];
}

export function getSocialActions({ year, age }) {
  const rule = resolveSocialEraRule(year);
  return {
    ...rule,
    actions: rule.actions.filter((action) => age >= Math.max(6, rule.romanceMinAge - 6) || !action.romancePotential),
  };
}

export function getCareerOptions({ year, economicContext, educationContext, influence = 0 }) {
  const eraRule = resolveSocialEraRule(year);
  return JOB_PROFILES
    .filter((job) => job.eraAvailability.includes(eraRule.eraKey))
    .map((job) => ({
      ...job,
      salary: computeJobSalary({ job, economicContext, educationContext, influence }),
    }))
    .sort((a, b) => b.salary - a.salary);
}

export function computeJobSalary({ job, economicContext, educationContext, influence = 0 }) {
  const eraKey = economicContext?.eraKey || 'moderna';
  const eraModifier = job.economicEraModifier?.[eraKey] || 1;
  const riskPremium = (job.hazardLevel * 0.18) + (job.mortalityRisk * 0.28) + (job.illnessRisk * 0.1);
  const scarcityPremium = (job.scarcityValue * 0.22) + (job.socialPrestige * 0.15);
  const influencePremium = clamp(influence, 0, 100) / 400;
  const educationFit = educationContext?.formalAccess ? 1 : 0.88;
  const base = job.basePay * eraModifier * (1 + riskPremium + scarcityPremium + influencePremium) * educationFit;
  return scaleInternalSalary(base, economicContext);
}

function educationLevelToScore(level = 'none') {
  if (level === 'advanced') return 3;
  if (level === 'technical') return 2;
  if (level === 'basic') return 1;
  return 0;
}

export function evaluateJobAccess({ job, age, educationContext, stats = {} }) {
  if (age < 14) return { allowed: false, reason: 'Trabajo formal bloqueado antes de 14 años.' };
  if (age < 18 && educationLevelToScore(job.requiredEducation) >= 2) {
    return { allowed: false, reason: 'Este oficio requiere mayor madurez/estudio (18+).' };
  }

  const requiredScore = educationLevelToScore(job.requiredEducation);
  const currentScore = educationContext?.formalAccess ? 2 : 0;
  if (requiredScore > currentScore + 1) {
    return { allowed: false, reason: 'Nivel educativo insuficiente para este oficio en la época actual.' };
  }

  if ((stats.health || 0) < 35 && job.physicalDemand > 0.65) {
    return { allowed: false, reason: 'Salud insuficiente para la exigencia física del trabajo.' };
  }

  return { allowed: true, reason: 'Disponible' };
}

export function resolveCareerYearlyOutcome({ occupation, simulation, economicContext }) {
  if (!occupation || occupation.id === 'sin_empleo') {
    return { effects: { health: 0, emotional: 0, bond: 0 }, criticalIncident: null, socialDrift: 0 };
  }

  const fatigue = Math.round((occupation.physicalDemand * 4) + (occupation.mentalDemand * 3));
  const stress = Math.round((occupation.mentalDemand * 4) - (occupation.stability * 2));
  const socialDrift = Math.round((occupation.exposure * 4) - fatigue / 3);

  const hazardMultiplier = economicContext?.eraKey === 'preindustrial' ? 1.35 : economicContext?.eraKey === 'industrial' ? 1.2 : 1;
  const healthPenalty = Math.round(fatigue * hazardMultiplier);

  const riskRoll = Math.random();
  const criticalThreshold = clamp((occupation.mortalityRisk * hazardMultiplier) + (occupation.hazardLevel * 0.15), 0, 0.4);
  const criticalIncident = riskRoll < criticalThreshold
    ? {
        title: 'Accidente laboral grave',
        text: `Tu trabajo como ${occupation.title} casi te cuesta la vida este año.`,
        effects: { health: -12, emotional: -6 },
      }
    : null;

  return {
    effects: {
      health: -(Math.max(1, Math.round(healthPenalty / 3))) + (occupation.stability > 0.7 ? 1 : 0),
      emotional: -(Math.max(0, Math.round(stress / 4))) + (occupation.socialPrestige > 0.7 ? 1 : 0),
      bond: socialDrift >= 0 ? 1 : -1,
    },
    criticalIncident,
    socialDrift,
  };
}

export function resolveRomanceProgress({ simulation, targetNpc, action, year }) {
  if (!targetNpc) return { relationships: simulation.relationships || [], message: null };

  const relationships = [...(simulation.relationships || [])];
  const idx = relationships.findIndex((rel) => rel.id === targetNpc.id);
  if (idx < 0) return { relationships, message: null };

  const rule = resolveSocialEraRule(simulation.year);
  if (simulation.age < rule.romanceMinAge || action.romancePotential <= 0) {
    return { relationships, message: null };
  }

  const npc = { ...relationships[idx] };
  const scoreGain = Math.round((action.relationDelta || 0) + (action.romancePotential * 10));
  const reputationFactor = (simulation.influence || 0) >= 40 ? 2 : 0;
  npc.romanceScore = (npc.romanceScore || 0) + scoreGain + reputationFactor;

  let stageMessage = null;
  if (npc.romanceScore >= 18 && npc.role !== 'pareja') {
    npc.role = 'interes_romantico';
    npc.romanceStage = 'interes';
    stageMessage = `${npc.name} ahora muestra interés romántico.`;
  }
  if (npc.romanceScore >= 36 && npc.role !== 'pareja') {
    npc.romanceStage = 'cortejo';
    stageMessage = `Avanzas a etapa de cortejo con ${npc.name}.`;
  }
  if (npc.romanceScore >= 54) {
    npc.role = 'pareja';
    npc.romanceStage = 'vinculo';
    stageMessage = `${npc.name} y tú formalizaron la relación.`;
  }

  npc.notes = [`${year}: ${action.label}`, ...(npc.notes || [])].slice(0, 8);
  relationships[idx] = npc;

  return { relationships, message: stageMessage };
}
