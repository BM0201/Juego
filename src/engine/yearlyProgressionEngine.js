import { resolveYearEvent } from './eventEngine.js';
import {
  buildAnnualSummary,
  buildTimelineEntry,
  evaluateWeakAreas,
  evaluateYearContext,
  resolveEventTone,
} from './summaryEngine.js';
import { getStageByAge } from './planningEngine.js';
import { applyEffects, getImpactMultiplier, summarizeStatChanges } from './statExplanationEngine.js';

export function createInitialSimulation(character) {
  const isFieldScenario = character.scenarioPreset === 'rural_field_8';
  const initialAge = isFieldScenario ? 8 : 0;
  const initialYear = character.birthDate.year + initialAge;
  const initialStats = isFieldScenario
    ? { ...character.initialStats, health: 56, sleep: 47, bond: 54, development: 49, emotional: 46 }
    : { ...character.initialStats };
  const initialTimeline = isFieldScenario
    ? [
        `${character.name} (8 años) vive en una familia rural y este año sus padres lo mandan al campo para ayudar.`,
      ]
    : [
        `${character.name} nace en ${character.country} (${character.birthDate.year}) dentro de un ${character.family.familyCondition.toLowerCase()}.`,
      ];

  return {
    age: initialAge,
    year: initialYear,
    stats: initialStats,
    timeline: initialTimeline,
    lastSummary: isFieldScenario ? 'Caso jugable activo: tus padres te mandan al campo este año. Planifica cómo responder.' : 'Empieza tu historia. Revisa el estado general y planifica antes de avanzar el año.',
    lastYearReport: null,
    eventHistory: {},
    recentEvents: [],
    context: evaluateYearContext({ stats: initialStats, family: character.family, stageLabel: 'Infancia' }),
    weakAreas: evaluateWeakAreas({ stats: initialStats, family: character.family }),
    lastAnnualOutput: null,
  };
}

export function runAnnualProgression({ simulation, character, annualPlan }) {
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
      eventHistory: simulation.eventHistory,
      weakAreas: simulation.weakAreas,
    };
  }

  const plannedStats = applyEffects(simulation.stats, annualPlan.effects, getImpactMultiplier(simulation.age));

  const event = resolveYearEvent({
    stageKey: stage.key,
    age: simulation.age,
    year: simulation.year,
    country: character.country,
    family: character.family,
    stats: plannedStats,
    annualPlan,
    educationStartAge: character.educationStartAge,
    eventHistory: simulation.eventHistory,
  });

  const triggeredEvents = event ? [event] : [];
  const statsAfterEvents = triggeredEvents.reduce((current, item) => applyEffects(current, item.effects, 1), plannedStats);

  const nextAge = simulation.age + 1;
  const nextYear = simulation.year + 1;
  const nextStage = getStageByAge(nextAge);
  const movedStage = nextStage.key !== stage.key;

  const statChanges = summarizeStatChanges(simulation.stats, statsAfterEvents);
  const consequenceTone = resolveEventTone(triggeredEvents.length ? triggeredEvents : [{ effects: annualPlan.effects }]);
  const annualSummary = buildAnnualSummary({
    planTitle: annualPlan.summary,
    eventNarrative: triggeredEvents.map((item) => item.text).join(' '),
    stageLabel: nextStage.label,
    movedStage,
    consequenceTone,
  });

  const newContext = evaluateYearContext({
    stats: statsAfterEvents,
    family: character.family,
    stageLabel: nextStage.label,
  });

  const recentEvents = [
    {
      year: nextYear,
      title: triggeredEvents.length ? 'Evento del periodo' : 'Periodo estable',
      text: triggeredEvents.length
        ? triggeredEvents.map((item) => item.text).join(' ')
        : 'No hubo incidentes mayores, pero el plan anual dejó cambios acumulativos.',
      tone: consequenceTone === 'positivo' ? 'positive' : consequenceTone === 'negativo' ? 'negative' : 'neutral',
    },
    ...simulation.recentEvents,
  ].slice(0, 5);

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
    eventHistory: triggeredEvents.length
      ? {
          ...simulation.eventHistory,
          [triggeredEvents[0].id]: nextYear,
        }
      : simulation.eventHistory,
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
    recentEvents: annualOutput.recentEvents,
    context: {
      risks: annualOutput.newRisks,
      opportunities: annualOutput.newOpportunities,
    },
    weakAreas: annualOutput.weakAreas,
    lastAnnualOutput: annualOutput,
  };
}

export function progressYear({ simulation, character, annualPlan }) {
  const annualOutput = runAnnualProgression({ simulation, character, annualPlan });
  return applyAnnualOutputToSimulation({ simulation, annualOutput });
}
