export const ROLE_DEFINITIONS = {
  plebeyo: {
    id: 'plebeyo',
    label: 'Plebeyo',
    description: 'Sobrevives con trabajo duro y pocas redes de apoyo.',
    startingStats: { dinero: 14, influencia: 4, felicidad: 48, salud: 70, prestigio: 2, energia: 65 },
    perks: { economia: 1.05, social: 1.0, militar: 0.9, politica: 0.8 },
    allowedAccessories: ['ninguno', 'bufanda', 'gorro_lana'],
    allowedClothingTiers: ['humilde', 'comun'],
  },
  comerciante: {
    id: 'comerciante',
    label: 'Comerciante',
    description: 'Tienes olfato para mercados y negociación.',
    startingStats: { dinero: 30, influencia: 8, felicidad: 50, salud: 68, prestigio: 8, energia: 62 },
    perks: { economia: 1.2, social: 1.05, militar: 0.85, politica: 1.0 },
    allowedAccessories: ['ninguno', 'anillo', 'sombrero_mercader', 'monoculo'],
    allowedClothingTiers: ['comun', 'fina'],
  },
  noble: {
    id: 'noble',
    label: 'Noble',
    description: 'Herencia, intriga y responsabilidades cortesanas.',
    startingStats: { dinero: 46, influencia: 22, felicidad: 45, salud: 66, prestigio: 24, energia: 60 },
    perks: { economia: 1.0, social: 1.2, militar: 1.0, politica: 1.2 },
    allowedAccessories: ['ninguno', 'anillo', 'joya', 'sombrero_noble', 'tiara'],
    allowedClothingTiers: ['fina', 'noble', 'real'],
  },
  rey: {
    id: 'rey',
    label: 'Monarca',
    description: 'Poder absoluto, pero cada año puede costarte el trono.',
    startingStats: { dinero: 58, influencia: 35, felicidad: 40, salud: 63, prestigio: 34, energia: 55 },
    perks: { economia: 1.0, social: 1.15, militar: 1.2, politica: 1.25 },
    allowedAccessories: ['ninguno', 'anillo', 'joya', 'corona', 'cetro'],
    allowedClothingTiers: ['noble', 'real'],
  },
  diplomatico: {
    id: 'diplomatico',
    label: 'Diplomático',
    description: 'Ganas guerras sin disparar, pero la traición es común.',
    startingStats: { dinero: 26, influencia: 26, felicidad: 52, salud: 65, prestigio: 17, energia: 63 },
    perks: { economia: 0.95, social: 1.25, militar: 0.85, politica: 1.15 },
    allowedAccessories: ['ninguno', 'anillo', 'sombrero_noble', 'monoculo'],
    allowedClothingTiers: ['comun', 'fina', 'noble'],
  },
};

export const DIFFICULTY_PRESETS = {
  cronista: {
    id: 'cronista',
    label: 'Cronista',
    description: 'Más tolerante al error. Ideal para aprender.',
    negativeEffectMultiplier: 0.8,
    positiveEffectMultiplier: 1.1,
    mortalityPressure: 0.85,
    crisisWeight: 0.8,
  },
  estadista: {
    id: 'estadista',
    label: 'Estadista',
    description: 'Equilibrado. Cada decisión importa.',
    negativeEffectMultiplier: 1,
    positiveEffectMultiplier: 1,
    mortalityPressure: 1,
    crisisWeight: 1,
  },
  hierro: {
    id: 'hierro',
    label: 'Edad de Hierro',
    description: 'Duro y realista: prosperar es raro.',
    negativeEffectMultiplier: 1.25,
    positiveEffectMultiplier: 0.9,
    mortalityPressure: 1.3,
    crisisWeight: 1.3,
  },
};

export const DYNASTY_NAMES = [
  'de Alba',
  'Valcor',
  'Mendoza',
  'Aurelio',
  'Ravenna',
  'Ibarra',
  'Drakon',
  'Sforza',
  'Arriaga',
  'Montesa',
];

export const ROLE_IDS = Object.keys(ROLE_DEFINITIONS);
export const DIFFICULTY_IDS = Object.keys(DIFFICULTY_PRESETS);
