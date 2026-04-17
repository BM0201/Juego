import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import MainDashboard from './MainDashboard.jsx';
import TabDetailScreen from './TabDetailScreen.jsx';
import { TUTORIAL_STEPS } from '../data/configs/setupConfig.js';
import { resolvePopupEvent } from '../engine/popupEventEngine.js';
import { resolvePopupChoice } from '../engine/popupResolver.js';
import { useGameState } from '../state/gameState.js';
import { usePlanningState } from '../state/planningState.js';

const GuidedTutorial = lazy(() => import('../components/tutorial/GuidedTutorial.jsx'));
const PopupEventModal = lazy(() => import('../components/layout/PopupEventModal.jsx'));

const TUTORIAL_STORAGE_KEY = 'cronicas_tutorial_seen_v2';

function FeedbackToast({ feedback, onDismiss }) {
  useEffect(() => {
    if (!feedback) return undefined;
    const timer = window.setTimeout(onDismiss, 2600);
    return () => window.clearTimeout(timer);
  }, [feedback, onDismiss]);

  if (!feedback) return null;

  return (
    <div className={`feedback-toast ${feedback.tone || 'neutral'}`} role="status" aria-live="polite">
      {feedback.message}
    </div>
  );
}

function AchievementToast({ items = [], onDismiss }) {
  useEffect(() => {
    if (!items.length) return undefined;
    const timer = window.setTimeout(onDismiss, 3600);
    return () => window.clearTimeout(timer);
  }, [items, onDismiss]);

  if (!items.length) return null;

  return (
    <section className="achievement-toast" role="status" aria-live="polite">
      <p><strong>🎉 Nuevos logros desbloqueados</strong></p>
      <ul>
        {items.slice(0, 3).map((item) => (
          <li key={item.id}>{item.icon} {item.title}</li>
        ))}
      </ul>
    </section>
  );
}

function GameFlowScreen({ character, onRestart }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingPopup, setPendingPopup] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const {
    simulation,
    advanceYear,
    trainSkill,
    clearAchievementNotifications,
    changeLocation,
    interactNpc,
    tradeNpc,
    chooseOccupation,
    applyPolicy,
  } = useGameState(character);
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
      relationships: simulation.relationships || [],
      area: simulation.area || character.area,
    }),
    [simulation.age, simulation.year, simulation.stats, simulation.popupHistory, simulation.relationships, simulation.area, character.family, character.area]
  );

  const clearFeedback = () => setFeedback(null);

  const finalizeYearAdvance = (popupOutcome = null) => {
    advanceYear(planning.plan.annualPlanResolved, popupOutcome);
    planning.clearPlan();
    planning.closePlanning();
  };

  const handleAdvanceYear = () => {
    if (pendingPopup) return;

    const popup = resolvePopupEvent(popupContext);
    if (popup) {
      setPendingPopup(popup);
      setFeedback({ message: '⚠️ Surgió una decisión urgente. Elige una acción para cerrar el año.', tone: 'warning' });
      return;
    }

    finalizeYearAdvance(null);
    setFeedback({ message: '✅ Año cerrado. Revisa resumen, relaciones, logros y línea temporal.', tone: 'positive' });
  };

  const handlePopupChoice = (choiceId) => {
    const popupOutcome = resolvePopupChoice({ popupEvent: pendingPopup, choiceId });
    setPendingPopup(null);
    finalizeYearAdvance(popupOutcome);
    setFeedback({ message: '✅ Decisión urgente resuelta y año actualizado.', tone: 'positive' });
  };

  const handleSavePlanAndBack = () => {
    planning.closePlanning();
    setFeedback({ message: 'Plan guardado. Puedes cerrar el año cuando quieras.', tone: 'neutral' });
  };

  const handleMoveLocation = (areaKey) => {
    const message = changeLocation(areaKey);
    if (message) setFeedback({ message: `📍 ${message}`, tone: 'neutral' });
  };

  const handleNpcInteraction = (payload) => {
    const message = interactNpc(payload);
    if (message) setFeedback({ message: `🤝 ${message}`, tone: 'positive' });
  };

  const handleTrade = (payload) => {
    const message = tradeNpc(payload);
    if (message) setFeedback({ message: `💱 ${message}`, tone: 'neutral' });
  };

  const handleOccupation = (occupation) => {
    chooseOccupation(occupation);
    setFeedback({ message: `💼 Ocupación actualizada: ${occupation.title}.`, tone: 'positive' });
  };

  const handlePolicy = (policyId) => {
    const message = applyPolicy(policyId);
    if (message) setFeedback({ message: `🏛️ ${message}`, tone: 'warning' });
  };

  const handleTrainSkill = (skillId) => {
    const message = trainSkill(skillId);
    if (message) {
      setFeedback({ message: `🎯 ${message}`, tone: 'positive' });
    }
  };

  return (
    <>
      <FeedbackToast feedback={feedback} onDismiss={clearFeedback} />
      <AchievementToast items={simulation.achievements?.newlyUnlocked || []} onDismiss={clearAchievementNotifications} />

      <Suspense fallback={null}>
        {showTutorial ? <GuidedTutorial steps={TUTORIAL_STEPS} onClose={closeTutorial} /> : null}
        {pendingPopup ? <PopupEventModal popupEvent={pendingPopup} onChoose={handlePopupChoice} /> : null}
      </Suspense>

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
          onTrainSkill={handleTrainSkill}
        />
      ) : (
        <MainDashboard
          character={character}
          simulation={simulation}
          stageInfo={planning.plan.stage}
          stageLabel={planning.plan.stage.label}
          selectedDecision={planning.plan.annualPlanResolved}
          isImplicitDecision={!planning.plan.annualPlan && !!planning.plan.annualPlanResolved?.implicitYearProgression}
          activePlanning={planning.planning}
          planningAccess={planning.planningAccess}
          hiddenTabs={planning.hiddenTabs}
          visibleTabs={planning.visibleTabs}
          onOpenPlanning={planning.openPlanning}
          onOpenPlanningTab={(tab) => planning.openPlanning(tab)}
          onAdvanceYear={handleAdvanceYear}
          onRestart={onRestart}
          onOpenTutorial={() => setShowTutorial(true)}
          onMoveLocation={handleMoveLocation}
          onNpcInteraction={handleNpcInteraction}
          onTrade={handleTrade}
          onOccupationChange={handleOccupation}
          onPolicyAction={handlePolicy}
        />
      )}
    </>
  );
}

export default GameFlowScreen;