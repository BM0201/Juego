import { useMemo, useState } from 'react';
import { buildAnnualPlanFromPlanning, getStageByAge, getTabFocusOptionsByLabel, TAB_TO_CATEGORY } from '../engine/planningEngine.js';

export const PRIMARY_TABS = ['Vida', 'Mente', 'Familia', 'Escuela'];

export const EMPTY_PLANNING = {
  vida: null,
  mente: null,
  familia: null,
  escuela: null,
};

export function usePlanningState(age) {
  const [activeTab, setActiveTab] = useState('Vida');
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [planning, setPlanning] = useState(EMPTY_PLANNING);

  const plan = useMemo(
    () => ({
      stage: getStageByAge(age),
      focusOptionsByTab: Object.fromEntries(PRIMARY_TABS.map((tab) => [tab, getTabFocusOptionsByLabel(tab)])),
      annualPlan: buildAnnualPlanFromPlanning(planning),
    }),
    [age, planning]
  );

  const setFocusForTab = (tabLabel, optionId) => {
    const category = TAB_TO_CATEGORY[tabLabel];
    if (!category) return;
    setPlanning((prev) => ({ ...prev, [category]: optionId }));
  };

  const getFocusForTab = (tabLabel) => planning[TAB_TO_CATEGORY[tabLabel]];

  const clearPlan = () => setPlanning(EMPTY_PLANNING);

  return {
    plan,
    planning,
    setFocusForTab,
    getFocusForTab,
    clearPlan,
    activeTab,
    setActiveTab,
    isPlanningOpen,
    openPlanning: () => setIsPlanningOpen(true),
    closePlanning: () => setIsPlanningOpen(false),
  };
}
