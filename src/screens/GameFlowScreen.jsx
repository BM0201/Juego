import { useEffect, useMemo, useState } from 'react';
import MainDashboard from './MainDashboard.jsx';
import TabDetailScreen from './TabDetailScreen.jsx';
import GuidedTutorial from '../components/tutorial/GuidedTutorial.jsx';
import PopupEventModal from '../components/layout/PopupEventModal.jsx';
import { TUTORIAL_STEPS } from '../data/configs/setupConfig.js';
import { resolvePopupEvent } from '../engine/popupEventEngine.js';
import { resolvePopupChoice } from '../engine/popupResolver.js';
import { useGameState } from '../state/gameState.js';
import { usePlanningState } from '../state/planningState.js';

const TUTORIAL_STORAGE_KEY = 'cronicas_tutorial_seen_v2';

function GameFlowScreen({ character, onRestart }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingPopup, setPendingPopup] = useState(null);
  const { simulation, advanceYear, trainSkill } = useGameState(character);
  const planning = usePlanningState(simulation, character.family);

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

  const popupContext = useMemo(
    () => ({
      age: simulation.age,
      year: simulation.year,
      stats: simulation.stats,
      family: character.family,
      popupHistory: simulation.popupHistory || {},
    }),
    [simulation.age, simulation.year, simulation.stats, simulation.popupHistory, character.family]
  );

  const finalizeYearAdvance = (popupOutcome = null) => {
    advanceYear(planning.plan.annualPlan, popupOutcome);
    planning.clearPlan();
    planning.closePlanning();
  };

  const handleAdvanceYear = () => {
    if (pendingPopup) return;

    const popup = resolvePopupEvent(popupContext);
    if (popup) {
      setPendingPopup(popup);
      return;
    }

    finalizeYearAdvance(null);
  };

  const handlePopupChoice = (choiceId) => {
    const popupOutcome = resolvePopupChoice({ popupEvent: pendingPopup, choiceId });
    setPendingPopup(null);
    finalizeYearAdvance(popupOutcome);
  };

  const handleSavePlanAndBack = () => {
    planning.closePlanning();
  };

  return (
    <>
      {showTutorial ? <GuidedTutorial steps={TUTORIAL_STEPS} onClose={closeTutorial} /> : null}
      {pendingPopup ? <PopupEventModal popupEvent={pendingPopup} onChoose={handlePopupChoice} /> : null}

      {planning.isPlanningOpen ? (
        <TabDetailScreen
          tabs={planning.visibleTabs}
          activeTab={planning.activeTab}
          onTabChange={planning.setActiveTab}
          plan={planning.plan}
          getFocusForTab={planning.getFocusForTab}
          onSelectFocus={planning.setFocusForTab}
          simulation={simulation}
          character={character}
          onBack={handleSavePlanAndBack}
          onTrainSkill={(skillId) => trainSkill(skillId)}
        />
      ) : (
        <MainDashboard
          character={character}
          simulation={simulation}
          stageLabel={planning.plan.stage.label}
          selectedDecision={planning.plan.annualPlan}
          activePlanning={planning.planning}
          planningAccess={planning.planningAccess}
          hiddenTabs={planning.hiddenTabs}
          visibleTabs={planning.visibleTabs}
          onOpenPlanning={planning.openPlanning}
          onOpenPlanningTab={(tab) => planning.openPlanning(tab)}
          onAdvanceYear={handleAdvanceYear}
          onRestart={onRestart}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      )}
    </>
  );
}

export default GameFlowScreen;
