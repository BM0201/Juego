export const LIFE_STAGES = [
  { key: 'infancia', label: 'Infancia', minAge: 0, maxAge: 11 },
  { key: 'adolescencia', label: 'Adolescencia', minAge: 12, maxAge: 17 },
  { key: 'adultez', label: 'Adultez', minAge: 18, maxAge: 120 },
];

export const STAGE_DECISIONS = {
  infancia: [
    {
      id: 'sleep_routine',
      title: 'Ordenar rutina de sueño',
      summary: 'Dormir mejor mejora salud y regulación emocional.',
      effects: { health: 4, sleep: 10, bond: 1, development: 2, emotional: 4 },
    },
    {
      id: 'nutrition_focus',
      title: 'Cuidar alimentación',
      summary: 'Comidas más constantes sostienen crecimiento y energía.',
      effects: { health: 8, sleep: 1, bond: 1, development: 4, emotional: 1 },
    },
    {
      id: 'guided_play',
      title: 'Juego guiado diario',
      summary: 'El juego estructurado impulsa desarrollo temprano.',
      effects: { health: 1, sleep: -1, bond: 3, development: 9, emotional: 2 },
    },
    {
      id: 'seek_caregiver_attention',
      title: 'Buscar atención del cuidador',
      summary: 'Más apego y contención emocional en casa.',
      effects: { health: 0, sleep: 0, bond: 9, development: 3, emotional: 6 },
    },
  ],
  adolescencia: [
    {
      id: 'study_consistency',
      title: 'Sostener estudio',
      summary: 'Aumenta progreso académico con algo de fatiga.',
      effects: { health: -1, sleep: -2, bond: 0, development: 8, emotional: -1 },
    },
    {
      id: 'social_balance',
      title: 'Equilibrar amistades',
      summary: 'Mejora pertenencia social y estabilidad emocional.',
      effects: { health: 0, sleep: -1, bond: 5, development: 2, emotional: 4 },
    },
  ],
  adultez: [
    {
      id: 'work_push',
      title: 'Priorizar trabajo',
      summary: 'Sube desarrollo profesional, baja descanso.',
      effects: { health: -1, sleep: -2, bond: -1, development: 7, emotional: -1 },
    },
    {
      id: 'life_balance',
      title: 'Priorizar equilibrio',
      summary: 'Mejora bienestar integral y vínculo.',
      effects: { health: 3, sleep: 4, bond: 5, development: 2, emotional: 5 },
    },
  ],
};

export function getStageByAge(age) {
  return LIFE_STAGES.find((stage) => age >= stage.minAge && age <= stage.maxAge) || LIFE_STAGES[0];
}
