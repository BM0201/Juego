export const CONTEXT_EVENTS = [
  {
    id: 'harsh_winter_context',
    weight: 6,
    cooldown: 3,
    text: 'El invierno fue especialmente duro y exigió más cuidados en casa.',
    effects: { health: -3, sleep: -2, emotional: -2 },
    conditions: {
      seasons: ['invierno'],
      family: { householdResourcesMax: 60 },
      countries: ['Francia', 'Alemania', 'Reino Unido'],
    },
  },
  {
    id: 'bad_harvest_context',
    weight: 5,
    cooldown: 3,
    text: 'La cosecha salió mal y el hogar entró en periodo de ajuste.',
    effects: { health: -2, emotional: -2, bond: -1 },
    conditions: {
      seasons: ['cosecha'],
      classKeys: ['working_rural', 'smallholder', 'precarious'],
      family: { foodAccessMax: 58 },
    },
  },
  {
    id: 'home_illness_context',
    weight: 6,
    cooldown: 2,
    text: 'Una enfermedad en casa alteró rutinas y tiempos de cuidado.',
    effects: { sleep: -2, emotional: -3, development: -1 },
    conditions: {
      family: { careAccessMax: 55 },
      stats: { healthMax: 62 },
    },
  },
  {
    id: 'economic_relief_context',
    weight: 4,
    cooldown: 3,
    text: 'Hubo una mejora económica temporal en el hogar.',
    effects: { health: 2, sleep: 1, emotional: 2 },
    conditions: {
      family: { householdResourcesMin: 45 },
    },
  },
  {
    id: 'family_move_context',
    weight: 3,
    cooldown: 5,
    text: 'La familia tuvo que mudarse y reajustar su rutina.',
    effects: { emotional: -2, development: 1, bond: -1 },
    conditions: {
      ageMin: 2,
      ageMax: 14,
    },
  },
  {
    id: 'field_help_need_context',
    weight: 5,
    cooldown: 2,
    text: 'El hogar necesitó más ayuda en tareas del campo este periodo.',
    effects: { development: 1, sleep: -1, bond: 1 },
    conditions: {
      ageMin: 7,
      ageMax: 12,
      classKeys: ['working_rural', 'smallholder', 'precarious'],
      family: { householdResourcesMax: 55 },
      seasons: ['siembra', 'cosecha'],
    },
  },
];
