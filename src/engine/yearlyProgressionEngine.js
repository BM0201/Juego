import { resolveYearEvent } from './eventEngine.js';
import { resolveContextEvent } from './contextEventEngine.js';
import {
  buildAnnualSummary,
  buildTimelineEntry,
  evaluateWeakAreas,
  evaluateYearContext,
  resolveEventTone,
} from './summaryEngine.js';
import { getStageByAge } from './planningEngine.js';
import { applyEffects, getImpactMultiplier, summarizeStatChanges } from './statExplanationEngine.js';
import {
  createTrainingState,
  prepareNextTrainingState,
  summarizeTrainingPeriod,
} from './skillTrainingEngine.js';

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

export function createInitialSimulation(character) {
  const initialAge = 0;
  const initialYear = character.birthDate.year;
  const initialStats = { ...character.initialStats };
  const initialTimeline = [
    `${character.name} nace en ${character.country} (${character.birthDate.year}) dentro de un ${character.family.familyCondition.toLowerCase()}.`,
  ];

  return {
    age: initialAge,
    year: initialYear,
    stats: initialStats,
    timeline: initialTimeline,
    lastSummary: 'Empieza tu historia. Revisa el estado general y planifica antes de avanzar el año.',
    lastYearReport: null,
    eventHistory: {},
    contextEventHistory: {},
    popupHistory: {},
    training: createTrainingState({ age: initialAge, year: initialYear, stats: initialStats, family: character.family }),
    recentEvents: [],
    contextEvents: [],
    context: evaluateYearContext({ stats: initialStats, family: character.family, stageLabel: 'Infancia' }),
    weakAreas: evaluateWeakAreas({ stats: initialStats, family: character.family }),
    lastAnnualOutput: null,
  };
}

export function runAnnualProgression({ simulation, character, annualPlan, popupOutcome = null }) {
  const stage = getStageByAge(simulation.age);

  if (!annualPlan) {
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
      training: simulation.training,
      weakAreas: simulation.weakAreas,
    };
  }

  const decisionEfficiency = Math.max(0.65, Math.min(1.25, (simulation.training?.actionBudgetPoints || 50) / 60));
  const plannedStats = applyEffects(simulation.stats, annualPlan.effects, getImpactMultiplier(simulation.age) * decisionEfficiency);

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
    annualPlan,
    educationStartAge: character.educationStartAge,
    eventHistory: simulation.eventHistory,
    season: resolveSeasonByYear(simulation.year),
  });

  const triggeredEvents = [
    ...(popupOutcome ? [popupOutcome] : []),
    ...(contextEvent ? [contextEvent] : []),
    ...(event ? [event] : []),
  ];

  const statsAfterEvents = triggeredEvents.reduce((current, item) => applyEffects(current, item.effects, 1), statsAfterTraining);

  const nextAge = simulation.age + 1;
  const nextYear = simulation.year + 1;
  const nextStage = getStageByAge(nextAge);
  const movedStage = nextStage.key !== stage.key;

  const statChanges = summarizeStatChanges(simulation.stats, statsAfterEvents);
  const consequenceTone = resolveEventTone(triggeredEvents.length ? triggeredEvents : [{ effects: annualPlan.effects }]);
  const tabImpactSummary = summarizeTabImpact(simulation.stats, statsAfterEvents);

  const popupDecisionSummary = popupOutcome
    ? `Decisión urgente resuelta: ${popupOutcome.popupMeta.choiceLabel}. ${popupOutcome.popupMeta.outcomeText}`
    : '';

  const annualSummary = `${buildAnnualSummary({
    planTitle: annualPlan.summary,
    eventNarrative: [trainingSummary.summaryText, ...(popupDecisionSummary ? [popupDecisionSummary] : []), ...triggeredEvents.map((item) => item.text)].join(' '),
    stageLabel: nextStage.label,
    movedStage,
    consequenceTone,
  })} Impacto por área: ${tabImpactSummary}. Presupuesto/rendimiento aplicado: x${decisionEfficiency.toFixed(2)} sobre decisiones anuales.`;

  const newContext = evaluateYearContext({
    stats: statsAfterEvents,
    family: character.family,
    stageLabel: nextStage.label,
  });

  const budgetNarrative = `Presupuesto aplicado: energía útil ${simulation.training?.usefulEnergy || 0}, capacidad ${simulation.training?.learningCapacity || 0}, rendimiento x${simulation.training?.performanceMultiplier || 0}.`;

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
  ].slice(0, 5);

  const recentEvents = [
    {
      year: nextYear,
      title: triggeredEvents.length ? 'Evento del periodo' : 'Periodo estable',
      text: triggeredEvents.length
        ? [...triggeredEvents.map((item) => item.text), trainingSummary.summaryText, budgetNarrative].join(' ')
        : `No hubo incidentes mayores. ${trainingSummary.summaryText} ${budgetNarrative}`,
      tone: consequenceTone === 'positivo' ? 'positive' : consequenceTone === 'negativo' ? 'negative' : 'neutral',
    },
    ...simulation.recentEvents,
  ].slice(0, 5);

  const nextTraining = prepareNextTrainingState({
    previousTraining: simulation.training,
    age: nextAge,
    year: nextYear,
    stats: statsAfterEvents,
    family: character.family,
    recentEvents,
  });

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
    timelineEntry: buildTimelineEntry({ year: nextYear, age: nextAge, summary: annualSummary }),
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
    training: nextTraining,
    weakAreas: evaluateWeakAreas({ stats: statsAfterEvents, family: character.family }),
  };
}

export function applyAnnualOutputToSimulation({ simulation, annualOutput }) {
  if (!annualOutput.timelineEntry && !annualOutput.triggeredEvents.length && !annualOutput.statChanges.length) {
    return {
      ...simulation,
      lastSummary: annualOutput.annualSummary,
      lastAnnualOutput: annualOutput,
    };
  }

  return {
    ...simulation,
    age: annualOutput.updatedCharacter.age,
    year: annualOutput.updatedCharacter.year,
    stats: annualOutput.updatedCharacter.stats,
    timeline: [...simulation.timeline, annualOutput.timelineEntry],
    lastSummary: annualOutput.annualSummary,
    lastYearReport: annualOutput.statChanges,
    eventHistory: annualOutput.eventHistory,
    contextEventHistory: annualOutput.contextEventHistory,
    popupHistory: annualOutput.popupHistory,
    training: annualOutput.training,
    recentEvents: annualOutput.recentEvents,
    contextEvents: annualOutput.contextEvents,
    context: {
      risks: annualOutput.newRisks,
      opportunities: annualOutput.newOpportunities,
    },
    weakAreas: annualOutput.weakAreas,
    lastAnnualOutput: annualOutput,
  };
}

export function progressYear({ simulation, character, annualPlan, popupOutcome = null }) {
  const annualOutput = runAnnualProgression({ simulation, character, annualPlan, popupOutcome });
  return applyAnnualOutputToSimulation({ simulation, annualOutput });
}
