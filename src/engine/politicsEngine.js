export const POLITICAL_LEVELS = [
  { key: 'ciudadano', label: 'Ciudadano común', minInfluence: 0 },
  { key: 'respetado', label: 'Miembro respetado', minInfluence: 25 },
  { key: 'consejero', label: 'Consejero', minInfluence: 55 },
  { key: 'alcalde', label: 'Alcalde/Líder', minInfluence: 80 },
];

export function resolvePoliticalLevel(influence = 0) {
  const sorted = [...POLITICAL_LEVELS].sort((a, b) => b.minInfluence - a.minInfluence);
  return sorted.find((item) => influence >= item.minInfluence) || POLITICAL_LEVELS[0];
}

export function getPolicyOptions(levelKey = 'ciudadano') {
  if (levelKey === 'alcalde') {
    return [
      { id: 'festival_publico', title: 'Organizar festival', effects: { influence: 4, bankBalance: -800, emotional: 2 } },
      { id: 'subsidio_mercado', title: 'Asignar recursos al mercado', effects: { influence: 3, bankBalance: -1200, development: 2 } },
      { id: 'ley_orden', title: 'Endurecer leyes locales', effects: { influence: -2, emotional: -1, health: 1 } },
    ];
  }

  if (levelKey === 'consejero') {
    return [
      { id: 'mediar_conflicto', title: 'Mediar conflicto vecinal', effects: { influence: 3, emotional: 1 } },
      { id: 'donar_escuela', title: 'Donar a la escuela', effects: { influence: 2, bankBalance: -350, development: 2 } },
    ];
  }

  return [
    { id: 'voluntariado', title: 'Voluntariado comunitario', effects: { influence: 2, emotional: 1 } },
    { id: 'donacion_pequena', title: 'Donar al fondo local', effects: { influence: 1, bankBalance: -120 } },
  ];
}
