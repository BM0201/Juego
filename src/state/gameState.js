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
  interactWithVillageNpc,
  moveToLocation,
  setOccupation,
  tradeWithNpc,
} from '../engine/villageGameplayEngine.js';

export function useGameState(character) {
  const [simulation, setSimulation] = useState(() => {
    const base = createInitialSimulation(character);
    const achieved = evaluateAchievements(base);
    return {
      ...base,
      achievements: achieved.achievements,
    };
  });

  const advanceYear = (annualPlan, popupOutcome = null) => {
    setSimulation((prev) => {
      const annualOutput = runAnnualProgression({ simulation: prev, character, annualPlan, popupOutcome });
      const nextSimulation = applyAnnualOutputToSimulation({ simulation: prev, annualOutput });
      const achievementResult = evaluateAchievements(nextSimulation);

      return {
        ...nextSimulation,
        achievements: achievementResult.achievements,
        keyMoments: [
          ...(achievementResult.newMomentsFromAchievements || []),
          ...(nextSimulation.keyMoments || []),
        ].slice(0, 30),
      };
    });
  };

  const trainSkill = (skillId) => {
    let feedback = null;

    setSimulation((prev) => {
      const result = trainSkillClick({ training: prev.training, skillId });
      feedback = result.message;
      return {
        ...prev,
        training: result.training,
      };
    });

    return feedback;
  };

  const changeLocation = (targetAreaKey) => {
    let feedback = null;
    setSimulation((prev) => {
      const result = moveToLocation({ simulation: prev, character, targetAreaKey });
      feedback = result.message;
      return result.simulation;
    });
    return feedback;
  };

  const interactNpc = ({ npcId, interactionType }) => {
    let feedback = null;
    setSimulation((prev) => {
      const result = interactWithVillageNpc({ simulation: prev, npcId, interactionType });
      feedback = result.message;
      return result.simulation;
    });
    return feedback;
  };

  const tradeNpc = ({ npcId, itemId, mode, barterItemId }) => {
    let feedback = null;
    setSimulation((prev) => {
      const result = tradeWithNpc({ simulation: prev, npcId, itemId, mode, barterItemId });
      feedback = result.message;
      return result.simulation;
    });
    return feedback;
  };

  const chooseOccupation = (occupation) => {
    setSimulation((prev) => setOccupation({ simulation: prev, occupation }));
  };

  const applyPolicy = (policyId) => {
    let feedback = null;
    setSimulation((prev) => {
      const result = enactPolicy({ simulation: prev, policyId });
      feedback = result.message;
      return result.simulation;
    });
    return feedback;
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
  };
}
