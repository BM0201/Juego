import { useState } from 'react';
import {
  applyAnnualOutputToSimulation,
  createInitialSimulation,
  runAnnualProgression,
} from '../engine/yearlyProgressionEngine.js';

export function useGameState(character) {
  const [simulation, setSimulation] = useState(() => createInitialSimulation(character));

  const advanceYear = (annualPlan) => {
    setSimulation((prev) => {
      const annualOutput = runAnnualProgression({ simulation: prev, character, annualPlan });
      return applyAnnualOutputToSimulation({ simulation: prev, annualOutput });
    });
  };

  return {
    simulation,
    advanceYear,
  };
}
