export const CENTURIES = [
  { label: '1700s', start: 1700, end: 1799 },
  { label: '1800s', start: 1800, end: 1899 },
  { label: '1900s', start: 1900, end: 1999 },
  { label: '2000s', start: 2000, end: 2099 },
];

export const COUNTRIES_BY_RANGE = [
  {
    start: 1700,
    end: 1799,
    countries: ['España', 'Francia', 'Imperio Otomano', 'Portugal', 'Qing (China)'],
  },
  {
    start: 1800,
    end: 1899,
    countries: ['México', 'Reino Unido', 'Japón', 'Argentina', 'Estados Unidos'],
  },
  {
    start: 1900,
    end: 1999,
    countries: ['España', 'Brasil', 'Estados Unidos', 'India', 'Alemania'],
  },
  {
    start: 2000,
    end: 2099,
    countries: ['Colombia', 'Chile', 'Canadá', 'Corea del Sur', 'Nigeria'],
  },
];

export const SOCIAL_CLASSES = ['Muy baja', 'Baja', 'Media', 'Alta'];

export const FAMILY_CONDITIONS = [
  'Hogar estable con apoyo emocional',
  'Familia trabajadora con recursos limitados',
  'Hogar conflictivo con poca atención',
  'Familia extensa con apoyo intermitente',
  'Padre o madre ausente, cuidado compartido',
];

export const LIFE_STAGES = [
  { key: 'infancia', label: 'Infancia', minAge: 0, maxAge: 11 },
  { key: 'adolescencia', label: 'Adolescencia', minAge: 12, maxAge: 17 },
  { key: 'adultez', label: 'Adultez', minAge: 18, maxAge: 120 },
];

export const EARLY_CHILDHOOD_OPTIONS = [
  {
    id: 'sleep_better',
    title: 'Dormir mejor',
    effect: { health: 8, sleep: 14, bond: 2, development: 3 },
    consequence: 'Descansaste bien y tu cuerpo responde mejor.',
  },
  {
    id: 'eat_better',
    title: 'Comer mejor',
    effect: { health: 10, sleep: 1, bond: 3, development: 2 },
    consequence: 'Una mejor nutrición fortaleció tu energía diaria.',
  },
  {
    id: 'play_explore',
    title: 'Explorar y jugar',
    effect: { health: 2, sleep: -2, bond: 4, development: 10 },
    consequence: 'Descubriste nuevas cosas y mejoraste tus habilidades.',
  },
  {
    id: 'seek_attention',
    title: 'Buscar atención familiar',
    effect: { health: 1, sleep: 0, bond: 12, development: 4 },
    consequence: 'Te sentiste más acompañado, eso impacta tu confianza.',
  },
];

export const STAGE_DECISIONS = {
  infancia: EARLY_CHILDHOOD_OPTIONS,
  adolescencia: [
    {
      id: 'study_routine',
      title: 'Mejorar rutina de estudio',
      effect: { health: 0, sleep: -1, bond: 0, development: 7 },
      consequence: 'Te enfocas más y mejoras tu progreso académico.',
    },
    {
      id: 'healthy_habits',
      title: 'Crear hábitos saludables',
      effect: { health: 6, sleep: 4, bond: 0, development: 2 },
      consequence: 'Tu energía y consistencia mejoran semana a semana.',
    },
    {
      id: 'socialize',
      title: 'Socializar más',
      effect: { health: 0, sleep: -1, bond: 7, development: 1 },
      consequence: 'Construyes vínculos nuevos, aunque te desvelas un poco.',
    },
  ],
  adultez: [
    {
      id: 'work_focus',
      title: 'Priorizar trabajo',
      effect: { health: -1, sleep: -2, bond: -1, development: 8 },
      consequence: 'Tu carrera avanza, pero aumentan el cansancio y la presión.',
    },
    {
      id: 'balance_life',
      title: 'Buscar equilibrio personal',
      effect: { health: 4, sleep: 4, bond: 4, development: 2 },
      consequence: 'Mejoras bienestar general con avances más sostenibles.',
    },
    {
      id: 'family_time',
      title: 'Dedicar tiempo a familia',
      effect: { health: 1, sleep: 1, bond: 8, development: 1 },
      consequence: 'Fortaleces tu red cercana y recuperas estabilidad emocional.',
    },
  ],
};

export const TUTORIAL_STEPS = [
  'Cada año eliges una decisión.',
  'Tus stats suben o bajan según lo que hagas.',
  'La infancia tiene impacto más fuerte en tu futuro.',
];
