import { buildMerchantInventory } from './economyEngine.js';
import { getAreaByKey, LOCATION_AREAS, resolveHometown } from '../data/configs/locationConfig.js';

const NPC_ARCHETYPES = [
  { role: 'alcalde', occupation: 'Alcalde', personality: 'Pragmático', icon: '🎖️' },
  { role: 'comerciante', occupation: 'Comerciante de mercado', personality: 'Negociador', icon: '🛒' },
  { role: 'herrero', occupation: 'Herrero / Artesano', personality: 'Estricto', icon: '⚒️' },
  { role: 'tabernero', occupation: 'Tabernero', personality: 'Carismático', icon: '🍻' },
  { role: 'sacerdote', occupation: 'Guía espiritual', personality: 'Sereno', icon: '⛪' },
  { role: 'medico', occupation: 'Médico local', personality: 'Analítico', icon: '🩺' },
  { role: 'maestro', occupation: 'Maestro', personality: 'Paciente', icon: '📚' },
  { role: 'granjero', occupation: 'Granjero', personality: 'Resistente', icon: '🌾' },
  { role: 'guardia', occupation: 'Guardia', personality: 'Vigilante', icon: '🛡️' },
  { role: 'cronista', occupation: 'Cronista', personality: 'Curioso', icon: '📝' },
];

const NAME_POOL = ['Ariadna', 'Mateo', 'Ingrid', 'Noah', 'Celeste', 'Rafael', 'Sofía', 'Bruno', 'Valentina', 'Elías', 'Helena', 'Gonzalo'];

export const LOCATION_PLACES = {
  ciudad_grande: ['Mercado Central', 'Ayuntamiento', 'Distrito Financiero', 'Plaza Mayor', 'Hospital', 'Teatro'],
  ciudad_pequena: ['Mercado local', 'Ayuntamiento', 'Taberna', 'Plaza central', 'Escuela', 'Clínica'],
  aldea: ['Mercado de trueque', 'Casa comunal', 'Taberna', 'Templo', 'Plaza central', 'Huerto colectivo'],
  casa_remota: ['Refugio', 'Sendero', 'Cabaña de herramientas', 'Pozo', 'Bosque cercano'],
};

function seededIndex(seed, len) {
  return Math.abs(seed % len);
}

export function generateVillageNpcs({ areaKey, country, year }) {
  const area = getAreaByKey(areaKey);
  const areaBias = area.key.length + year + country.length;
  return NPC_ARCHETYPES.slice(0, 10).map((arch, index) => {
    const name = NAME_POOL[seededIndex(areaBias + index * 3, NAME_POOL.length)];
    return {
      id: `village_${arch.role}_${index}`,
      name: `${name} ${country.slice(0, 2).toUpperCase()}`,
      role: arch.role,
      occupation: arch.occupation,
      personality: arch.personality,
      avatar: arch.icon,
      relation: 0,
      inventory: arch.role === 'comerciante' || arch.role === 'herrero' ? buildMerchantInventory(areaBias + index) : [],
      locationTag: area.key,
      status: 'activo',
    };
  });
}

export function createVillageState({ areaKey, country, year }) {
  const area = getAreaByKey(areaKey);
  return {
    places: LOCATION_PLACES[area.key] || LOCATION_PLACES.aldea,
    npcs: generateVillageNpcs({ areaKey: area.key, country, year }),
    annualEvents: [],
  };
}

export function buildMoveOptions({ country, year, currentAreaKey }) {
  return LOCATION_AREAS.map((area) => ({
    ...area,
    hometown: resolveHometown({ areaKey: area.key, country, year }),
    isCurrent: area.key === currentAreaKey,
  }));
}

export function maybeUpgradeLocation(area, influence, yearsInLocation) {
  if (!area) return null;
  if (area.key === 'aldea' && influence >= 55 && yearsInLocation >= 8) {
    return getAreaByKey('ciudad_pequena');
  }
  if (area.key === 'ciudad_pequena' && influence >= 75 && yearsInLocation >= 12) {
    return getAreaByKey('ciudad_grande');
  }
  return null;
}
