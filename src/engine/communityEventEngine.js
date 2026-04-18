import { weightedPick } from '../utils/random.js';
import { WORLD_HISTORICAL_EVENTS } from '../data/historical/worldEvents.js';

const COMMUNITY_EVENTS = [
  {
    id: 'festival_cosecha',
    weight: 7,
    areaKeys: ['aldea', 'ciudad_pequena'],
    text: 'Se celebra el festival de cosecha y toda la comunidad participa.',
    effects: { emotional: 2, bond: 2, influence: 2 },
    tone: 'positive',
  },
  {
    id: 'incendio_barrio',
    weight: 4,
    areaKeys: ['ciudad_grande', 'ciudad_pequena'],
    text: 'Un incendio en el barrio exige cooperación y respuesta rápida.',
    effects: { health: -2, emotional: -2, influence: 1 },
    tone: 'negative',
  },
  {
    id: 'elecciones_locales',
    weight: 5,
    areaKeys: ['ciudad_grande', 'ciudad_pequena', 'aldea'],
    text: 'Llegan elecciones locales; tus acciones públicas se vuelven más visibles.',
    effects: { influence: 3, development: 1 },
    tone: 'mixed',
  },
  {
    id: 'mercado_especial',
    weight: 6,
    areaKeys: ['aldea', 'ciudad_pequena', 'ciudad_grande'],
    text: 'Un mercado especial trae comerciantes con objetos únicos.',
    effects: { influence: 1, development: 2 },
    tone: 'positive',
  },
  {
    id: 'tormenta_remota',
    weight: 5,
    areaKeys: ['casa_remota', 'aldea'],
    text: 'Una tormenta intensa golpea la zona y pone a prueba tu resiliencia.',
    effects: { health: -1, emotional: -1, development: 2 },
    tone: 'mixed',
  },
];

export function resolveCommunityEvent({ areaKey, influence = 0 }) {
  const pool = COMMUNITY_EVENTS.filter((item) => item.areaKeys.includes(areaKey));
  if (!pool.length) return null;
  const triggerChance = 0.35 + Math.min(0.2, influence / 500);
  if (Math.random() > triggerChance) return null;
  return weightedPick(pool);
}

export function resolveHistoricalEvent({ country, year }) {
  const candidates = WORLD_HISTORICAL_EVENTS.filter((event) => event.country === country && year >= event.startYear && year <= event.endYear);
  if (!candidates.length) return null;
  return weightedPick(candidates.map((event) => ({ ...event, weight: event.weight || 1 })));
}
