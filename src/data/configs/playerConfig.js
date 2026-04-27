export const PLAYER_ROLES = [
  {
    id: 'plebeyo',
    label: 'Plebeyo',
    description: 'Empiezas con pocos privilegios, pero aprendes a sobrevivir en contextos hostiles.',
    modifiers: { resilience: 1.08, influenceGain: 0.9, learning: 1, economy: 1 },
  },
  {
    id: 'comerciante',
    label: 'Comerciante',
    description: 'Acceso temprano a redes económicas y lectura de oportunidades de mercado.',
    modifiers: { resilience: 0.98, influenceGain: 1, learning: 1, economy: 1.18 },
  },
  {
    id: 'diplomatico',
    label: 'Diplomático',
    description: 'Facilidad para relaciones complejas y negociación política.',
    modifiers: { resilience: 1, influenceGain: 1.24, learning: 1.05, economy: 0.95 },
  },
  {
    id: 'militar',
    label: 'Militar',
    description: 'Disciplina alta y gran tolerancia al riesgo, con desgaste emocional superior.',
    modifiers: { resilience: 1.15, influenceGain: 1.05, learning: 0.9, economy: 0.95 },
  },
  {
    id: 'erudito',
    label: 'Erudito',
    description: 'Avance intelectual superior con menor tracción política al inicio.',
    modifiers: { resilience: 0.96, influenceGain: 0.92, learning: 1.22, economy: 1 },
  },
  {
    id: 'noble',
    label: 'Noble',
    description: 'Ventaja de red e influencia inicial, pero presión social elevada.',
    modifiers: { resilience: 0.95, influenceGain: 1.3, learning: 1.02, economy: 1.1 },
  },
];

export const DIFFICULTY_PRESETS = [
  {
    id: 'cronista',
    label: 'Cronista (fácil)',
    description: 'Más margen de error, progresión más amable.',
    modifiers: { positiveEffectMultiplier: 1.15, negativeEffectMultiplier: 0.85, salaryMultiplier: 1.08, randomCrisisChance: 0.82 },
  },
  {
    id: 'estadista',
    label: 'Estadista (normal)',
    description: 'Balance recomendado entre reto y progreso.',
    modifiers: { positiveEffectMultiplier: 1, negativeEffectMultiplier: 1, salaryMultiplier: 1, randomCrisisChance: 1 },
  },
  {
    id: 'hierro',
    label: 'Voluntad de Hierro (difícil)',
    description: 'Errores costosos y consecuencias históricas más severas.',
    modifiers: { positiveEffectMultiplier: 0.9, negativeEffectMultiplier: 1.2, salaryMultiplier: 0.92, randomCrisisChance: 1.18 },
  },
];

export const DYNASTY_NAME_POOL = [
  'de la Aurora',
  'Monteluz',
  'del Roble',
  'Río Claro',
  'Valdoria',
  'del Trigal',
  'Argent',
  'del Norte',
];
