export const CENTURY_OPTIONS = [
  { label: '1700s', start: 1700, end: 1799, icon: '🏰', vibe: 'Linajes entre monarquías, comercio marítimo y revoluciones tempranas.' },
  { label: '1800s', start: 1800, end: 1899, icon: '⚙️', vibe: 'Cambio industrial, migraciones y transformación social profunda.' },
  { label: '1900s', start: 1900, end: 1999, icon: '📻', vibe: 'Siglo de guerras, reconstrucción y modernización acelerada.' },
  { label: '2000s', start: 2000, end: 2099, icon: '🌐', vibe: 'Globalización, internet y sociedades hiperconectadas.' },
];

export const COUNTRY_WINDOWS = [
  { start: 1700, end: 1799, options: ['Francia', 'España', 'Reino Unido'] },
  { start: 1800, end: 1899, options: ['Francia', 'España', 'Italia'] },
  { start: 1900, end: 1999, options: ['Francia', 'Alemania', 'Reino Unido'] },
  { start: 2000, end: 2099, options: ['Francia', 'España', 'Alemania'] },
];

export const HISTORICAL_CRISIS_WINDOWS = [
  { startYear: 1756, endYear: 1763, title: 'Guerra de los Siete Años' },
  { startYear: 1789, endYear: 1799, title: 'Revolución francesa y guerras napoleónicas tempranas' },
  { startYear: 1803, endYear: 1815, title: 'Guerras napoleónicas' },
  { startYear: 1845, endYear: 1849, title: 'Crisis agrarias europeas' },
  { startYear: 1914, endYear: 1918, title: 'Primera Guerra Mundial' },
  { startYear: 1929, endYear: 1933, title: 'Gran Depresión' },
  { startYear: 1939, endYear: 1945, title: 'Segunda Guerra Mundial' },
  { startYear: 1962, endYear: 1962, title: 'Crisis de los misiles' },
  { startYear: 2008, endYear: 2009, title: 'Crisis financiera global' },
  { startYear: 2020, endYear: 2022, title: 'Pandemia global' },
];

export const TUTORIAL_STEPS = [
  {
    title: 'Header estilo simulador de vida',
    description: 'Aquí ves avatar, nombre, ocupación actual y balance bancario.',
    target: '[data-tour="header"]',
  },
  {
    title: 'Narrativa anual',
    description: 'La pantalla principal muestra el diario con eventos personales, comunitarios e históricos.',
    target: '[data-tour="last-summary"]',
  },
  {
    title: 'Tabs inferiores',
    description: 'Usa Occupation, Assets, Relationships y Activities para gestionar tu vida.',
    target: '[data-tour="plan-button"]',
  },
  {
    title: 'Botón central Age',
    description: 'El botón central avanza el año y procesa economía, comunidad y política.',
    target: '[data-tour="advance-button"]',
  },
  {
    title: 'Ayuda contextual',
    description: 'Puedes reabrir este tutorial desde el botón de ayuda.',
    target: '[data-tour="help-settings"]',
  },
];
