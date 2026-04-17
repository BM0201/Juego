export const COUNTRY_WINDOWS = [
  { start: 1700, end: 1799, options: ['Francia', 'España', 'Reino Unido'] },
  { start: 1800, end: 1899, options: ['Francia', 'España', 'Italia'] },
  { start: 1900, end: 1999, options: ['Francia', 'Alemania', 'Reino Unido'] },
  { start: 2000, end: 2099, options: ['Francia', 'España', 'Alemania'] },
];

export const TUTORIAL_STEPS = [
  {
    title: 'Tu identidad actual',
    description: 'Aquí ves quién eres, tu edad, año histórico y país de origen.',
    target: '[data-tour="header"]',
  },
  {
    title: 'Pantalla principal',
    description: 'Este bloque resume lo que pasó en el último año y te da contexto narrativo.',
    target: '[data-tour="last-summary"]',
  },
  {
    title: 'Eventos del año',
    description: 'Aquí se listan los eventos recientes y su impacto positivo, negativo o mixto.',
    target: '[data-tour="recent-events"]',
  },
  {
    title: 'Desbloqueo de agencia',
    description: 'En infancia temprana no planificas de forma consciente: cuidadores y contexto empujan el año. Más adelante se desbloquea la agencia.',
    target: '[data-tour="planning-gate"]',
  },
  {
    title: 'Planificación por tabs',
    description: 'Cuando se desbloquee, Planificar año abre Vida, Mente, Familia y Escuela. El tiempo solo avanza desde el botón principal.',
    target: '[data-tour="plan-button"]',
  },
  {
    title: 'Avanzar año',
    description: 'Solo este botón procesa decisiones + contexto y ejecuta el salto anual.',
    target: '[data-tour="advance-button"]',
  },
  {
    title: 'Ayuda y ajustes',
    description: 'Este tutorial aparece una vez y puedes reabrirlo cuando quieras desde el botón de ayuda.',
    target: '[data-tour="help-settings"]',
  },
];
