import { useState } from 'react';
import {
  applyAnnualOutputToSimulation,
  createInitialSimulation,
  runAnnualProgression,
} from '../engine/yearlyProgressionEngine.js';
import { trainSkillClick } from '../engine/skillTrainingEngine.js';

export function useGameState(character) {
  const [simulation, setSimulation] = useState(() => createInitialSimulation(character));

  const advanceYear = (annualPlan, popupOutcome = null) => {
    setSimulation((prev) => {
      const annualOutput = runAnnualProgression({ simulation: prev, character, annualPlan, popupOutcome });
      return applyAnnualOutputToSimulation({ simulation: prev, annualOutput });
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

  return {
    simulation,
    advanceYear,
    trainSkill,
  };
}
