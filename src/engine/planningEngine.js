import { LIFE_STAGES } from '../data/configs/stagePlanningConfig.js';
import { TAB_FOCUS_OPTIONS } from '../data/configs/tabDetailConfig.js';

export const TAB_TO_CATEGORY = {
  Vida: 'vida',
  Mente: 'mente',
  Familia: 'familia',
  Escuela: 'escuela',
};

export function getStageByAge(age) {
  return LIFE_STAGES.find((stage) => age >= stage.minAge && age <= stage.maxAge) || LIFE_STAGES[0];
}

export function getTabFocusOptionsByLabel(tabLabel) {
  return TAB_FOCUS_OPTIONS[TAB_TO_CATEGORY[tabLabel]] || [];
}

export function buildAnnualPlanFromPlanning(planning) {
  const selectedItems = Object.entries(planning)
    .map(([category, optionId]) => (TAB_FOCUS_OPTIONS[category] || []).find((option) => option.id === optionId))
    .filter(Boolean);

  if (!selectedItems.length) {
    return null;
  }

  const effects = selectedItems.reduce((acc, item) => {
    Object.entries(item.effects).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + value;
    });
    return acc;
  }, {});

  return {
    id: selectedItems.map((item) => item.id).join('+'),
    title: `Plan anual (${selectedItems.length} enfoques)` ,
    summary: selectedItems.map((item) => item.title).join(', '),
    effects,
    selectedItems,
  };
}
