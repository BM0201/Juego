import { useEffect, useMemo, useState } from 'react';
import {
  buildAnnualPlanFromPlanning,
  getTabFocusOptionsByLabel,
  resolvePlanningAccess,
  TAB_TO_CATEGORY,
} from '../engine/planningEngine.js';

export const PRIMARY_TABS = ['Vida', 'Mente', 'Familia', 'Escuela'];

export const EMPTY_PLANNING = {
  vida: null,
  mente: null,
  familia: null,
  escuela: null,
};

export function usePlanningState(simulation, family) {
  const [activeTab, setActiveTab] = useState('Vida');
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [planning, setPlanning] = useState(EMPTY_PLANNING);

  const optionContext = useMemo(
    () => ({
      age: simulation.age,
      stats: simulation.stats,
      family,
      currentEvent: simulation.recentEvents?.[0] || null,
    }),
    [simulation.age, simulation.stats, simulation.recentEvents, family]
  );

  const planningAccess = useMemo(
    () => resolvePlanningAccess(optionContext),
    [optionContext]
  );

  const visibleTabs = useMemo(
    () => PRIMARY_TABS.filter((tab) => planningAccess.allowedTabs.includes(tab)),
    [planningAccess.allowedTabs]
  );

  const hiddenTabs = useMemo(
    () => PRIMARY_TABS.filter((tab) => !planningAccess.allowedTabs.includes(tab)),
    [planningAccess.allowedTabs]
  );

  const focusOptionsByTab = useMemo(
    () => Object.fromEntries(PRIMARY_TABS.map((tab) => [tab, getTabFocusOptionsByLabel(tab, planningAccess, optionContext)])),
    [planningAccess, optionContext]
  );

  useEffect(() => {
    if (visibleTabs.length && !visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    setPlanning((prev) => {
      const next = { ...prev };
      let changed = false;

      PRIMARY_TABS.forEach((tab) => {
        const category = TAB_TO_CATEGORY[tab];
        const allowedIds = new Set((focusOptionsByTab[tab] || []).map((item) => item.id));
        if (next[category] && !allowedIds.has(next[category])) {
          next[category] = null;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [focusOptionsByTab]);

  const plan = useMemo(
    () => ({
      stage: planningAccess.stage,
      focusOptionsByTab,
      annualPlan: buildAnnualPlanFromPlanning(planning, planningAccess, optionContext),
    }),
    [planning, planningAccess, focusOptionsByTab, optionContext]
  );

  const setFocusForTab = (tabLabel, optionId) => {
    if (!planningAccess.allowedTabs.includes(tabLabel)) return;

    const category = TAB_TO_CATEGORY[tabLabel];
    const allowedOption = (focusOptionsByTab[tabLabel] || []).find((option) => option.id === optionId);
    if (!category || !allowedOption) return;

    setPlanning((prev) => ({ ...prev, [category]: optionId }));
  };

  const getFocusForTab = (tabLabel) => planning[TAB_TO_CATEGORY[tabLabel]];

  const clearPlan = () => setPlanning(EMPTY_PLANNING);

  const openPlanning = (preferredTab = null) => {
    if (!planningAccess.unlocked) return;
    if (!visibleTabs.length) return;

    if (preferredTab && visibleTabs.includes(preferredTab)) {
      setActiveTab(preferredTab);
    }

    setIsPlanningOpen(true);
  };

  return {
    plan,
    planning,
    planningAccess,
    visibleTabs,
    hiddenTabs,
    setFocusForTab,
    getFocusForTab,
    clearPlan,
    activeTab,
    setActiveTab,
    isPlanningOpen,
    openPlanning,
    closePlanning: () => setIsPlanningOpen(false),
  };
}
