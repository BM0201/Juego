import { useEffect, useState } from 'react';
import MainDashboard from './MainDashboard.jsx';
import TabDetailScreen from './TabDetailScreen.jsx';
import GuidedTutorial from '../components/tutorial/GuidedTutorial.jsx';
import { TUTORIAL_STEPS } from '../data/configs/setupConfig.js';
import { useGameState } from '../state/gameState.js';
import { PRIMARY_TABS, usePlanningState } from '../state/planningState.js';

const TUTORIAL_STORAGE_KEY = 'cronicas_tutorial_seen_v1';

function GameFlowScreen({ character, onRestart }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const { simulation, advanceYear } = useGameState(character);
  const planning = usePlanningState(simulation.age);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!seen) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
  };

  const handleAdvanceYear = () => {
    advanceYear(planning.plan.annualPlan);
    planning.clearPlan();
    planning.closePlanning();
  };

  const handleSavePlanAndBack = () => {
    planning.closePlanning();
  };

  return (
    <>
      {showTutorial ? <GuidedTutorial steps={TUTORIAL_STEPS} onClose={closeTutorial} /> : null}

      {planning.isPlanningOpen ? (
        <TabDetailScreen
          tabs={PRIMARY_TABS}
          activeTab={planning.activeTab}
          onTabChange={planning.setActiveTab}
          plan={planning.plan}
          getFocusForTab={planning.getFocusForTab}
          onSelectFocus={planning.setFocusForTab}
          simulation={simulation}
          character={character}
          onBack={handleSavePlanAndBack}
        />
      ) : (
        <MainDashboard
          character={character}
          simulation={simulation}
          stageLabel={planning.plan.stage.label}
          selectedDecision={planning.plan.annualPlan}
          activePlanning={planning.planning}
          onOpenPlanning={planning.openPlanning}
          onAdvanceYear={handleAdvanceYear}
          onRestart={onRestart}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      )}
    </>
  );
}

export default GameFlowScreen;
