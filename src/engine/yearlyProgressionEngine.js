import { resolveYearEvent } from './eventEngine.js';
import { resolveContextEvent } from './contextEventEngine.js';
import {
  buildAnnualSummary,
  buildTimelineEntry,
  evaluateWeakAreas,
  evaluateYearContext,
  resolveEventTone,
} from './summaryEngine.js';
import { buildImplicitYearProgression, getStageByAge } from './planningEngine.js';
import { applyEffects, getImpactMultiplier, summarizeStatChanges } from './statExplanationEngine.js';
import {
  createTrainingState,
  prepareNextTrainingState,
  summarizeTrainingPeriod,
} from './skillTrainingEngine.js';
import { upsertRomanticNpc } from './npcEngine.js';
import { resolveRelationshipYearEvent } from './relationshipEngine.js';
import { resolveSurpriseEvents } from './surpriseEventEngine.js';
import { createStarterInventory } from './economyEngine.js';
import { resolveCommunityEvent, resolveHistoricalEvent } from './communityEventEngine.js';
import { resolvePoliticalLevel } from './politicsEngine.js';
import { createVillageState, maybeUpgradeLocation } from './villageEngine.js';

function resolveSeasonByYear(year) {
  const cycle = year % 4;
  if (cycle === 0) return 'siembra';
  if (cycle === 1) return 'crecimiento';
  if (cycle === 2) return 'cosecha';
  return 'invierno';
}

function summarizeTabImpact(before, after) {
  const byTab = {
    Vida: (after.health - before.health) + (after.sleep - before.sleep),
    Mente: after.emotional - before.emotional,
    Familia: after.bond - before.bond,
    Escuela: after.development - before.development,
  };

  return Object.entries(byTab)
    .map(([tab, value]) => {
      if (value > 1) return `${tab} mejoró`;
      if (value < -1) return `${tab} empeoró`;
      return `${tab} quedó estable`;
    })
    .join(' · ');
}

function applyMetaEffects(meta = {}, effects = {}) {
  const next = { ...meta };
  next.influence = Math.max(0, Math.min(100, Math.round((next.influence || 0) + (effects.influence || 0))));
  next.looks = Math.max(0, Math.min(100, Math.round((next.looks || 50) + (effects.looks || 0))));
  next.fame = Math.max(0, Math.min(100, Math.round((next.fame || 0) + (effects.fame || 0))));
  next.bankBalance = Math.round((next.bankBalance || 0) + (effects.bankBalance || 0));
  return next;
}

function resolveAnnualSalary(occupation = {}, influence = 0) {
  const baseSalary = occupation.salary || 0;
  const bonus = Math.round(baseSalary * Math.max(0, influence) / 400);
  return baseSalary + bonus;
}

function buildAnnualRewards({ before, after, movedStage, stageLabel, relationships = [], influence }) {
  const rewards = [];
  const milestones = [
    { key: 'health', label: 'Salud sólida' },
    { key: 'sleep', label: 'Descanso consistente' },
    { key: 'bond', label: 'Vínculo fortalecido' },
    { key: 'development', label: 'Desarrollo destacado' },
    { key: 'emotional', label: 'Estabilidad emocional' },
  ];

  milestones.forEach((item) => {
    if ((before[item.key] || 0) < 70 && (after[item.key] || 0) >= 70) {
      rewards.push(item.label);
    }
  });

  const average = Math.round((after.health + after.sleep + after.bond + after.development + after.emotional) / 5);
  if (average >= 65) rewards.push('Año equilibrado');
  if (movedStage) rewards.push(`Nueva etapa: ${stageLabel}`);

  if (relationships.some((npc) => npc.affinity >= 55 && npc.status !== 'fallecido')) {
    rewards.push('Relación significativa consolidada');
  }

  if (influence >= 55) rewards.push('Presencia cívica en ascenso');

  return rewards;
}

function buildPopupDrivenAnnualPlan(popupOutcome) {
  if (!popupOutcome) return null;
  return {
    id: `popup_driven_${popupOutcome.popupMeta?.eventId || 'emergency'}`,
    title: 'Resolución urgente del periodo',
    summary: 'El año avanza por una decisión urgente, sin planificación manual completa.',
    effects: {},
    selectedItems: [],
    popupDrivenProgression: true,
  };
}

function normalizeTimelineEntries(entries = []) {
  return entries.map((entry, index) => {
    if (typeof entry === 'string') {
      return {
        id: `legacy_${index}`,
        year: null,
        age: null,
        type: 'legacy',
        title: 'Registro histórico',
        summary: entry,
        tone: 'neutral',
        metadata: {},
      };
    }
    return entry;
  });
}

function collectMemories({ year, age, events = [], rewards = [] }) {
  const memories = [];
  events.forEach((event, index) => {
    const impact = Object.values(event.effects || {}).reduce((sum, value) => sum + Math.abs(value), 0);
    if (impact >= 6 || /fallec|pareja|mentor|sorpresa|históri|polític/i.test(event.text || '')) {
      memories.push({
        id: `memory_${year}_${index}_${event.id || 'event'}`,
        year,
        age,
        title: event.title || 'Recuerdo importante',
        description: event.text,
        tone: event.tone || 'neutral',
      });
    }
  });

  rewards.slice(0, 2).forEach((reward, index) => {
    memories.push({
      id: `memory_reward_${year}_${index}`,
      year,
      age,
      title: 'Recompensa de vida',
      description: `Desbloqueaste: ${reward}`,
      tone: 'positive',
    });
  });

  return memories.slice(0, 4);
}

function collectKeyMoments({ year, age, movedStage, nextStage, events = [], rewards = [] }) {
  const moments = [];
  if (movedStage) {
    moments.push({
      id: `moment_stage_${year}`,
      year,
      age,
      type: 'etapa',
      title: `Nueva etapa: ${nextStage.label}`,
      summary: `Entraste a ${nextStage.label.toLowerCase()} y cambió tu marco de decisiones.`,
      tone: 'positive',
    });
  }

  events.forEach((event, index) => {
    if (/fallec|duelo|ruptura|pareja|mentor|histori|sorpresa|elecciones/i.test(event.text || '')) {
      moments.push({
        id: `moment_event_${year}_${index}`,
        year,
        age,
        type: 'evento',
        title: event.title || 'Momento de quiebre',
        summary: event.text,
        tone: event.tone || 'neutral',
      });
    }
  });

  if (rewards.length >= 2) {
    moments.push({
      id: `moment_rewards_${year}`,
      year,
      age,
      type: 'hito',
      title: 'Año de múltiples recompensas',
      summary: rewards.join(' · '),
      tone: 'positive',
    });
  }

  return moments.slice(0, 4);
}

export function createInitialSimulation(character) {
  const initialAge = 0;
  const initialYear = character.birthDate.year;
  const initialStats = { ...character.initialStats };
  const initialArea = character.area || { key: 'ciudad_pequena', label: 'Ciudad Pequeña', hometown: 'Sin definir' };
  const initialTimeline = [
    {
      id: `timeline_birth_${initialYear}`,
      year: initialYear,
      age: 0,
      type: 'origen',
      title: 'Nacimiento',
      summary: `${character.name} nace en ${character.country}, ${initialArea.hometown || 'su comunidad'}, dentro de un ${character.family.familyCondition.toLowerCase()}.`,
      tone: 'positive',
      metadata: { country: character.country, areaKey: initialArea.key },
    },
  ];

  return {
    age: initialAge,
    year: initialYear,
    stats: initialStats,
    timeline: initialTimeline,
    lastSummary: 'Empieza tu historia. Durante la infancia temprana el progreso es pasivo: puedes avanzar el año sin planificación manual.',
    lastYearReport: null,
    eventHistory: {},
    contextEventHistory: {},
    popupHistory: {},
    surpriseEventHistory: {},
    pendingSurpriseFollowUpId: null,
    training: createTrainingState({ age: initialAge, year: initialYear, stats: initialStats, family: character.family }),
    recentEvents: [],
    contextEvents: [],
    context: evaluateYearContext({ stats: initialStats, family: character.family, stageLabel: 'Infancia' }),
    weakAreas: evaluateWeakAreas({ stats: initialStats, family: character.family }),
    lastRewards: [],
    lastAnnualOutput: null,
    area: initialArea,
    yearsInLocation: 0,
    relationships: character.keyNpcs || [],
    memories: [],
    keyMoments: [],
    decisionHistory: [],
    occupation: { id: 'sin_empleo', title: 'Sin ocupación', icon: '🧭', salary: 0 },
    bankBalance: Math.max(250, Math.round((character.family.householdResources || 50) * 24)),
    influence: 8,
    looks: 50,
    fame: 0,
    village: createVillageState({ areaKey: initialArea.key, country: character.country, year: initialYear }),
    inventory: createStarterInventory(),
    politicalLevel: resolvePoliticalLevel(8).key,
    activeCommunityEvent: null,
    activeHistoricalEvent: null,
  };
}

export function runAnnualProgression({ simulation, character, annualPlan, popupOutcome = null }) {
  const stage = getStageByAge(simulation.age);
  const implicitYearProgression = buildImplicitYearProgression({ age: simulation.age, stats: simulation.stats });
  const resolvedAnnualPlan = annualPlan
    || (implicitYearProgression.enabled ? implicitYearProgression.annualPlan : null)
    || buildPopupDrivenAnnualPlan(popupOutcome);

  if (!resolvedAnnualPlan) {
    return {
      updatedCharacter: {
        age: simulation.age,
        year: simulation.year,
        stats: simulation.stats,
      },
      triggeredEvents: [],
      statChanges: [],
      annualSummary: 'No hay enfoque anual guardado. Planifica en las tabs antes de avanzar el año.',
      newRisks: simulation.context.risks,
      newOpportunities: simulation.context.opportunities,
      timelineEntry: null,
      recentEvents: simulation.recentEvents,
      contextEvents: simulation.contextEvents,
      eventHistory: simulation.eventHistory,
      contextEventHistory: simulation.contextEventHistory,
      popupHistory: simulation.popupHistory,
      surpriseEventHistory: simulation.surpriseEventHistory,
      pendingSurpriseFollowUpId: simulation.pendingSurpriseFollowUpId,
      training: simulation.training,
      weakAreas: simulation.weakAreas,
      rewards: [],
      relationships: simulation.relationships,
      memories: [],
      keyMoments: [],
      decisionLog: null,
      bankBalance: simulation.bankBalance,
      influence: simulation.influence,
      looks: simulation.looks,
      fame: simulation.fame,
      politicalLevel: simulation.politicalLevel,
      area: simulation.area,
      yearsInLocation: simulation.yearsInLocation || 0,
      village: simulation.village,
      activeCommunityEvent: simulation.activeCommunityEvent,
      activeHistoricalEvent: simulation.activeHistoricalEvent,
    };
  }

  const enrichedRelationships = upsertRomanticNpc(simulation.relationships || [], simulation.age);
  const decisionEfficiency = Math.max(0.65, Math.min(1.25, (simulation.training?.actionBudgetPoints || 50) / 60));
  const plannedStats = applyEffects(simulation.stats, resolvedAnnualPlan.effects, getImpactMultiplier(simulation.age) * decisionEfficiency);

  const trainingSummary = summarizeTrainingPeriod(simulation.training);
  const statsAfterTraining = applyEffects(plannedStats, trainingSummary.effects, 1);
  const statsAfterPopup = popupOutcome ? applyEffects(statsAfterTraining, popupOutcome.effects, 1) : statsAfterTraining;

  const contextEvent = resolveContextEvent({
    age: simulation.age,
    year: simulation.year,
    country: character.country,
    season: resolveSeasonByYear(simulation.year),
    family: character.family,
    stats: statsAfterPopup,
    contextEventHistory: simulation.contextEventHistory,
  });

  const event = resolveYearEvent({
    stageKey: stage.key,
    age: simulation.age,
    year: simulation.year,
    country: character.country,
    family: character.family,
    stats: statsAfterPopup,
    annualPlan: resolvedAnnualPlan,
    educationStartAge: character.educationStartAge,
    eventHistory: simulation.eventHistory,
    season: resolveSeasonByYear(simulation.year),
  });

  const surpriseResult = resolveSurpriseEvents({
    age: simulation.age,
    year: simulation.year,
    areaKey: simulation.area?.key || character.area?.key || 'ciudad_pequena',
    surpriseEventHistory: simulation.surpriseEventHistory,
    relationships: enrichedRelationships,
    pendingFollowUpEventId: simulation.pendingSurpriseFollowUpId,
  });

  const relationshipResult = resolveRelationshipYearEvent({
    age: simulation.age,
    year: simulation.year,
    relationships: surpriseResult.relationships,
  });

  const communityEvent = resolveCommunityEvent({
    areaKey: simulation.area?.key || 'ciudad_pequena',
    influence: simulation.influence || 0,
  });

  const historicalEvent = resolveHistoricalEvent({ country: character.country, year: simulation.year });

  const relationalEvent = relationshipResult?.event || null;
  const finalRelationships = relationshipResult?.relationships || surpriseResult.relationships;

  const nonPopupEvents = [
    ...(contextEvent ? [contextEvent] : []),
    ...(event ? [event] : []),
    ...(surpriseResult.surprises || []),
    ...(relationalEvent ? [relationalEvent] : []),
    ...(communityEvent ? [{ ...communityEvent, title: 'Evento comunitario' }] : []),
    ...(historicalEvent ? [{ ...historicalEvent, title: historicalEvent.title }] : []),
  ];

  const triggeredEvents = popupOutcome ? [popupOutcome, ...nonPopupEvents] : nonPopupEvents;
  const statsAfterEvents = nonPopupEvents.reduce((current, item) => applyEffects(current, item.effects, 1), statsAfterPopup);

  const metaAfterEvents = nonPopupEvents.reduce(
    (meta, item) => applyMetaEffects(meta, item.effects || {}),
    {
      influence: simulation.influence || 0,
      bankBalance: simulation.bankBalance || 0,
      looks: simulation.looks || 50,
      fame: simulation.fame || 0,
    }
  );

  const annualSalary = resolveAnnualSalary(simulation.occupation, metaAfterEvents.influence);
  const metaWithSalary = applyMetaEffects(metaAfterEvents, { bankBalance: annualSalary, fame: annualSalary > 5000 ? 1 : 0 });

  const nextAge = simulation.age + 1;
  const nextYear = simulation.year + 1;
  const nextStage = getStageByAge(nextAge);
  const movedStage = nextStage.key !== stage.key;

  const statChanges = summarizeStatChanges(simulation.stats, statsAfterEvents);
  const consequenceTone = resolveEventTone(triggeredEvents.length ? triggeredEvents : [{ effects: resolvedAnnualPlan.effects }]);
  const tabImpactSummary = summarizeTabImpact(simulation.stats, statsAfterEvents);
  const rewards = buildAnnualRewards({
    before: simulation.stats,
    after: statsAfterEvents,
    movedStage,
    stageLabel: nextStage.label,
    relationships: finalRelationships,
    influence: metaWithSalary.influence,
  });

  const popupDecisionSummary = popupOutcome
    ? `Decisión urgente resuelta: ${popupOutcome.popupMeta.choiceLabel}. ${popupOutcome.popupMeta.outcomeText}`
    : '';

  const annualSummary = `${buildAnnualSummary({
    planTitle: resolvedAnnualPlan.summary,
    eventNarrative: [trainingSummary.summaryText, ...(popupDecisionSummary ? [popupDecisionSummary] : []), ...nonPopupEvents.map((item) => item.text)].join(' '),
    stageLabel: nextStage.label,
    movedStage,
    consequenceTone,
  })} Impacto por área: ${tabImpactSummary}. Presupuesto/rendimiento aplicado: x${decisionEfficiency.toFixed(2)}.${resolvedAnnualPlan.implicitYearProgression ? ' (Modo pasivo de infancia temprana)' : ''}${resolvedAnnualPlan.popupDrivenProgression ? ' (Avance por resolución urgente)' : ''}`;

  const newContext = evaluateYearContext({
    stats: statsAfterEvents,
    family: character.family,
    stageLabel: nextStage.label,
  });

  const contextEvents = [
    ...(contextEvent
      ? [{
          year: nextYear,
          id: contextEvent.id,
          text: contextEvent.text,
          effects: contextEvent.effects,
        }]
      : []),
    ...(simulation.contextEvents || []),
  ].slice(0, 8);

  const recentEvents = [
    {
      year: nextYear,
      title: triggeredEvents.length ? 'Evento del periodo' : 'Periodo estable',
      text: triggeredEvents.length
        ? [...triggeredEvents.map((item) => item.text), trainingSummary.summaryText, `Ingresos anuales: $${annualSalary}.`].join(' ')
        : `No hubo incidentes mayores. ${trainingSummary.summaryText}`,
      tone: consequenceTone === 'positivo' ? 'positive' : consequenceTone === 'negativo' ? 'negative' : 'neutral',
    },
    ...simulation.recentEvents,
  ].slice(0, 8);

  const upgradedArea = maybeUpgradeLocation(simulation.area, metaWithSalary.influence, (simulation.yearsInLocation || 0) + 1);
  const finalArea = upgradedArea
    ? { ...simulation.area, key: upgradedArea.key, label: upgradedArea.label }
    : simulation.area;

  const nextTraining = prepareNextTrainingState({
    previousTraining: simulation.training,
    age: nextAge,
    year: nextYear,
    stats: statsAfterEvents,
    family: character.family,
    recentEvents,
  });

  const memories = collectMemories({ year: nextYear, age: nextAge, events: triggeredEvents, rewards });
  const keyMoments = collectKeyMoments({ year: nextYear, age: nextAge, movedStage, nextStage, events: triggeredEvents, rewards });

  return {
    updatedCharacter: {
      age: nextAge,
      year: nextYear,
      stats: statsAfterEvents,
    },
    triggeredEvents,
    statChanges,
    annualSummary,
    newRisks: newContext.risks,
    newOpportunities: newContext.opportunities,
    timelineEntry: buildTimelineEntry({
      year: nextYear,
      age: nextAge,
      summary: annualSummary,
      type: 'anual',
      title: movedStage ? `Transición a ${nextStage.label}` : 'Cierre anual',
      tone: consequenceTone === 'positivo' ? 'positive' : consequenceTone === 'negativo' ? 'negative' : 'neutral',
      metadata: {
        planTitle: resolvedAnnualPlan.title,
        popupDriven: !!popupOutcome,
        surpriseCount: (surpriseResult.surprises || []).length,
        areaKey: finalArea?.key || 'ciudad_pequena',
      },
    }),
    recentEvents,
    contextEvents,
    decisionEfficiency,
    eventHistory: event
      ? {
          ...simulation.eventHistory,
          [event.id]: nextYear,
        }
      : simulation.eventHistory,
    contextEventHistory: contextEvent?.contextMeta?.sourceId
      ? {
          ...simulation.contextEventHistory,
          [contextEvent.contextMeta.sourceId]: nextYear,
        }
      : simulation.contextEventHistory,
    popupHistory: popupOutcome?.popupMeta?.eventId
      ? {
          ...simulation.popupHistory,
          [popupOutcome.popupMeta.eventId]: nextYear,
        }
      : simulation.popupHistory,
    surpriseEventHistory: surpriseResult.surpriseEventHistory,
    pendingSurpriseFollowUpId: surpriseResult.pendingFollowUpEventId,
    training: nextTraining,
    weakAreas: evaluateWeakAreas({ stats: statsAfterEvents, family: character.family }),
    rewards,
    relationships: finalRelationships,
    memories,
    keyMoments,
    decisionLog: {
      year: nextYear,
      age: nextAge,
      planTitle: resolvedAnnualPlan.title,
      planSummary: resolvedAnnualPlan.summary,
      popupChoice: popupOutcome?.popupMeta?.choiceLabel || null,
      area: finalArea?.label || character.area?.label || 'Ciudad',
    },
    bankBalance: metaWithSalary.bankBalance,
    influence: metaWithSalary.influence,
    looks: metaWithSalary.looks,
    fame: metaWithSalary.fame,
    politicalLevel: resolvePoliticalLevel(metaWithSalary.influence).key,
    area: finalArea,
    yearsInLocation: upgradedArea ? 0 : (simulation.yearsInLocation || 0) + 1,
    village: upgradedArea
      ? createVillageState({ areaKey: upgradedArea.key, country: character.country, year: nextYear })
      : simulation.village,
    activeCommunityEvent: communityEvent || null,
    activeHistoricalEvent: historicalEvent || null,
  };
}

export function applyAnnualOutputToSimulation({ simulation, annualOutput }) {
  const baseTimeline = normalizeTimelineEntries(simulation.timeline || []);

  if (!annualOutput.timelineEntry && !annualOutput.triggeredEvents.length && !annualOutput.statChanges.length) {
    return {
      ...simulation,
      timeline: baseTimeline,
      lastSummary: annualOutput.annualSummary,
      lastRewards: annualOutput.rewards || [],
      lastAnnualOutput: annualOutput,
      bankBalance: annualOutput.bankBalance,
      influence: annualOutput.influence,
      looks: annualOutput.looks,
      fame: annualOutput.fame,
      politicalLevel: annualOutput.politicalLevel,
      area: annualOutput.area,
      yearsInLocation: annualOutput.yearsInLocation,
      village: annualOutput.village,
      activeCommunityEvent: annualOutput.activeCommunityEvent,
      activeHistoricalEvent: annualOutput.activeHistoricalEvent,
    };
  }

  return {
    ...simulation,
    age: annualOutput.updatedCharacter.age,
    year: annualOutput.updatedCharacter.year,
    stats: annualOutput.updatedCharacter.stats,
    timeline: [...baseTimeline, annualOutput.timelineEntry],
    lastSummary: annualOutput.annualSummary,
    lastYearReport: annualOutput.statChanges,
    eventHistory: annualOutput.eventHistory,
    contextEventHistory: annualOutput.contextEventHistory,
    popupHistory: annualOutput.popupHistory,
    surpriseEventHistory: annualOutput.surpriseEventHistory,
    pendingSurpriseFollowUpId: annualOutput.pendingSurpriseFollowUpId,
    training: annualOutput.training,
    recentEvents: annualOutput.recentEvents,
    contextEvents: annualOutput.contextEvents,
    context: {
      risks: annualOutput.newRisks,
      opportunities: annualOutput.newOpportunities,
    },
    weakAreas: annualOutput.weakAreas,
    lastRewards: annualOutput.rewards || [],
    lastAnnualOutput: annualOutput,
    relationships: annualOutput.relationships || simulation.relationships,
    memories: [...(annualOutput.memories || []), ...(simulation.memories || [])].slice(0, 25),
    keyMoments: [...(annualOutput.keyMoments || []), ...(simulation.keyMoments || [])].slice(0, 25),
    decisionHistory: annualOutput.decisionLog
      ? [annualOutput.decisionLog, ...(simulation.decisionHistory || [])].slice(0, 30)
      : simulation.decisionHistory || [],
    bankBalance: annualOutput.bankBalance,
    influence: annualOutput.influence,
    looks: annualOutput.looks,
    fame: annualOutput.fame,
    politicalLevel: annualOutput.politicalLevel,
    area: annualOutput.area,
    yearsInLocation: annualOutput.yearsInLocation,
    village: annualOutput.village,
    activeCommunityEvent: annualOutput.activeCommunityEvent,
    activeHistoricalEvent: annualOutput.activeHistoricalEvent,
  };
}

export function progressYear({ simulation, character, annualPlan, popupOutcome = null }) {
  const annualOutput = runAnnualProgression({ simulation, character, annualPlan, popupOutcome });
  return applyAnnualOutputToSimulation({ simulation, annualOutput });
}
