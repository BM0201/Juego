import { resolveYearEvent } from './eventEngine.js';
import { getStageByAge, STAGE_DECISIONS } from './stageConfig.js';
import { applyEffects, getImpactMultiplier, summarizeStatChanges } from './statEngine.js';

export function createInitialGameState(character) {
  return {
    age: 0,
    year: character.birthDate.year,
    stats: { ...character.initialStats },
    timeline: [
      `${character.name} nace en ${character.country} (${character.birthDate.year}) dentro de un ${character.family.familyCondition.toLowerCase()}.`,
    ],
    lastSummary: 'Empieza tu historia. Elige una decisión anual.',
    lastYearReport: null,
    eventHistory: {},
  };
}

export function getStageDecisions(age) {
  const stage = getStageByAge(age);
  return {
    stage,
    decisions: STAGE_DECISIONS[stage.key] || [],
  };
}

export function progressOneYear({ gameState, character, decisionId }) {
  const { stage, decisions } = getStageDecisions(gameState.age);
  const decision = decisions.find((item) => item.id === decisionId);

  if (!decision) {
    return {
      ...gameState,
      lastSummary: 'Debes elegir una decisión antes de avanzar el tiempo.',
    };
  }

  const multiplier = getImpactMultiplier(gameState.age);
  const decisionStats = applyEffects(gameState.stats, decision.effects, multiplier);

  const event = resolveYearEvent({
    stageKey: stage.key,
    age: gameState.age,
    year: gameState.year,
    family: character.family,
    stats: decisionStats,
    educationStartAge: character.educationStartAge,
    eventHistory: gameState.eventHistory,
  });

  const finalStats = event ? applyEffects(decisionStats, event.effects, 1) : decisionStats;
  const statChanges = summarizeStatChanges(gameState.stats, finalStats);

  const nextAge = gameState.age + 1;
  const nextYear = gameState.year + 1;
  const nextStage = getStageByAge(nextAge);
  const stageText = nextStage.key !== stage.key ? ` Pasas a la etapa: ${nextStage.label}.` : '';

  const decisionText = `Con la decisión "${decision.title}", ${decision.summary.toLowerCase()}`;
  const eventText = event ? ` Evento: ${event.text}` : ' Sin eventos relevantes extraordinarios.';
  const summary = `${decisionText}${eventText}${stageText}`;

  const timelineEntry = `Año ${nextYear} · Edad ${nextAge}: ${summary}`;

  return {
    ...gameState,
    age: nextAge,
    year: nextYear,
    stats: finalStats,
    timeline: [...gameState.timeline, timelineEntry],
    lastSummary: summary,
    lastYearReport: statChanges,
    eventHistory: event
      ? {
          ...gameState.eventHistory,
          [event.id]: nextYear,
        }
      : gameState.eventHistory,
  };
}
