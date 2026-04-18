import { useState } from 'react';
import {
  applyAnnualOutputToSimulation,
  createInitialSimulation,
  runAnnualProgression,
} from '../engine/yearlyProgressionEngine.js';
import { trainSkillClick } from '../engine/skillTrainingEngine.js';
import { evaluateAchievements } from '../engine/achievementEngine.js';
import {
  enactPolicy,
  exploreVillagePlace,
  interactWithVillageNpc,
  moveToLocation,
  setOccupation,
  tradeWithNpc,
} from '../engine/villageGameplayEngine.js';
import { ensureActionEconomy } from '../engine/gameplayRules.js';
import { saveGameSnapshot } from './persistence.js';
import { getEconomicContext } from '../engine/economicEraEngine.js';
import { resolveEducationContext } from '../engine/educationEraEngine.js';

export function useGameState(character, initialSimulation = null) {
  const [simulation, setSimulation] = useState(() => {
    const base = initialSimulation || createInitialSimulation(character);
    const achieved = evaluateAchievements(base);
    const economicContext = base.economicContext || getEconomicContext({ year: base.year, country: base.country || character.country });
    const educationContext = base.educationContext || resolveEducationContext({ year: base.year, age: base.age });
    const training = base.training && !base.training.educationContext
      ? { ...base.training, educationContext }
      : base.training;
    return {
      ...base,
      country: base.country || character.country,
      training,
      economicContext,
      educationContext,
      actionEconomy: ensureActionEconomy(base),
      achievements: achieved.achievements,
    };
  });

  const persistSnapshot = (nextSimulation) => {
    saveGameSnapshot({ character, simulation: nextSimulation });
  };

  const advanceYear = (annualPlan, popupOutcome = null) => {
    let output = null;
    setSimulation((prev) => {
      const annualOutput = runAnnualProgression({ simulation: prev, character, annualPlan, popupOutcome });
      const nextSimulation = applyAnnualOutputToSimulation({ simulation: prev, annualOutput });
      const achievementResult = evaluateAchievements(nextSimulation);
      output = annualOutput;

      const hydrated = {
        ...nextSimulation,
        actionEconomy: ensureActionEconomy(nextSimulation),
        achievements: achievementResult.achievements,
        keyMoments: [
          ...(achievementResult.newMomentsFromAchievements || []),
          ...(nextSimulation.keyMoments || []),
        ].slice(0, 30),
      };

      persistSnapshot(hydrated);
      return hydrated;
    });
    return output;
  };

  const trainSkill = (skillId) => {
    let feedback = null;

    setSimulation((prev) => {
      const result = trainSkillClick({ training: prev.training, skillId });
      feedback = result.message;
      const next = {
        ...prev,
        training: result.training,
      };
      persistSnapshot(next);
      return next;
    });

    return feedback;
  };

  const changeLocation = (targetAreaKey) => {
    let payload = null;
    setSimulation((prev) => {
      const result = moveToLocation({ simulation: prev, character, targetAreaKey });
      payload = result;
      const next = { ...result.simulation, actionEconomy: ensureActionEconomy(result.simulation) };
      persistSnapshot(next);
      return next;
    });
    return payload;
  };

  const interactNpc = ({ npcId, interactionType }) => {
    let payload = null;
    setSimulation((prev) => {
      const result = interactWithVillageNpc({ simulation: prev, npcId, interactionType });
      payload = result;
      const next = { ...result.simulation, actionEconomy: ensureActionEconomy(result.simulation) };
      persistSnapshot(next);
      return next;
    });
    return payload;
  };

  const tradeNpc = ({ npcId, itemId, mode, barterItemId }) => {
    let payload = null;
    setSimulation((prev) => {
      const result = tradeWithNpc({ simulation: prev, npcId, itemId, mode, barterItemId });
      payload = result;
      const next = { ...result.simulation, actionEconomy: ensureActionEconomy(result.simulation) };
      persistSnapshot(next);
      return next;
    });
    return payload;
  };

  const chooseOccupation = (occupation) => {
    let payload = null;
    setSimulation((prev) => {
      const result = setOccupation({ simulation: prev, occupation });
      payload = result;
      const next = { ...result.simulation, actionEconomy: ensureActionEconomy(result.simulation) };
      persistSnapshot(next);
      return next;
    });
    return payload;
  };

  const applyPolicy = (policyId) => {
    let payload = null;
    setSimulation((prev) => {
      const result = enactPolicy({ simulation: prev, policyId });
      payload = result;
      const next = { ...result.simulation, actionEconomy: ensureActionEconomy(result.simulation) };
      persistSnapshot(next);
      return next;
    });
    return payload;
  };

  const explorePlace = (placeName) => {
    let payload = null;
    setSimulation((prev) => {
      const result = exploreVillagePlace({ simulation: prev, placeName });
      payload = result;
      const next = { ...result.simulation, actionEconomy: ensureActionEconomy(result.simulation) };
      persistSnapshot(next);
      return next;
    });
    return payload;
  };

  const clearAchievementNotifications = () => {
    setSimulation((prev) => ({
      ...prev,
      achievements: {
        ...prev.achievements,
        newlyUnlocked: [],
      },
    }));
  };

  return {
    simulation,
    advanceYear,
    trainSkill,
    clearAchievementNotifications,
    changeLocation,
    interactNpc,
    tradeNpc,
    chooseOccupation,
    applyPolicy,
    explorePlace,
  };
}
