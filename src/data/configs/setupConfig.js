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
    title: 'Riesgos y oportunidades',
    description: 'Este panel te muestra qué debes corregir y dónde tienes margen de mejora.',
    target: '[data-tour="context-block"]',
  },
  {
    title: 'Planificación por tabs',
    description: 'Desde Planificar año pasas a tabs para preparar Vida, Mente, Familia y Escuela. El tiempo no avanza allí.',
    target: '[data-tour="plan-button"]',
  },
  {
    title: 'Avanzar año',
    description: 'Solo este botón procesa decisiones + contexto y ejecuta el salto anual.',
    target: '[data-tour="advance-button"]',
  },
  {
    title: 'Resultado anual',
    description: 'Después del avance, revisa aquí qué salió bien y qué salió mal para planificar mejor.',
    target: '[data-tour="technical-output"]',
  },
];
