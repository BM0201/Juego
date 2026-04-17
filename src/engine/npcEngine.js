import { pickRandom } from '../utils/random.js';

const FRIEND_NAMES = ['Lucía', 'Mateo', 'Inés', 'Tomás', 'Clara', 'Rafael', 'Elena', 'Nicolás'];
const RIVAL_NAMES = ['Gael', 'Bruno', 'Amelia', 'Valeria', 'Sergio', 'Irene'];
const MENTOR_NAMES = ['Doña Teresa', 'Profesor Alain', 'Maestra Sofía', 'Don Ernesto'];

function safeName(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value.trim();
}

function createNpc(id, name, role, affinity = 0, avatar = '🙂') {
  return {
    id,
    name,
    role,
    affinity,
    avatar,
    status: 'activo',
    lastInteraction: null,
    notes: [],
  };
}

export function generateInitialNpcs({ character }) {
  const relatives = character.family.relatives || {};
  const sibling = Array.isArray(relatives.siblings) && relatives.siblings.length
    ? relatives.siblings[0]
    : pickRandom(FRIEND_NAMES);

  return [
    createNpc('npc_madre', safeName(relatives.mother, 'Madre'), 'familia', 16, '👩'),
    createNpc('npc_padre', safeName(relatives.father, 'Padre'), 'familia', 10, '👨'),
    createNpc('npc_amistad', safeName(sibling, pickRandom(FRIEND_NAMES) || 'Amistad cercana'), 'amistad', 6, '🧑‍🤝‍🧑'),
    createNpc('npc_mentor', pickRandom(MENTOR_NAMES) || 'Mentor/a', 'mentor', 4, '🧠'),
    createNpc('npc_rival', pickRandom(RIVAL_NAMES) || 'Rival', 'rival', -8, '⚡'),
  ];
}

export function upsertRomanticNpc(relationships, age) {
  if (age < 14) return relationships;
  if (relationships.some((npc) => npc.role === 'pareja')) return relationships;

  return [
    ...relationships,
    {
      id: 'npc_pareja',
      name: 'Interés romántico',
      role: 'pareja',
      affinity: 0,
      avatar: '💘',
      status: 'activo',
      lastInteraction: null,
      notes: [],
    },
  ];
}
