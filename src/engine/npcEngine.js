import { pickRandom } from '../utils/random.js';
import { generateRelativeName } from './nameGenerator.js';

const FRIEND_NAMES = ['Lucía', 'Mateo', 'Inés', 'Tomás', 'Clara', 'Rafael', 'Elena', 'Nicolás'];
const RIVAL_NAMES = ['Gael', 'Bruno', 'Amelia', 'Valeria', 'Sergio', 'Irene'];
const MENTOR_NAMES = ['Teresa', 'Alain', 'Sofía', 'Ernesto'];

function safeName(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value.trim();
}

function createNpc(id, name, role, affinity = 0, avatar = '🙂', sex = 'male') {
  return {
    id,
    name,
    role,
    sex,
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

  const friendSex = Math.random() < 0.5 ? 'male' : 'female';
  const rivalSex = Math.random() < 0.5 ? 'male' : 'female';
  const mentorSex = Math.random() < 0.5 ? 'male' : 'female';
  const generatedFriend = generateRelativeName(character.country, character.birthDate.year, { sex: friendSex });
  const generatedRival = generateRelativeName(character.country, character.birthDate.year + 1, { sex: rivalSex });
  const generatedMentor = generateRelativeName(character.country, character.birthDate.year - 20, { sex: mentorSex });

  return [
    createNpc('npc_madre', safeName(relatives.mother, 'Madre'), 'familia', 16, '👩', 'female'),
    createNpc('npc_padre', safeName(relatives.father, 'Padre'), 'familia', 10, '👨', 'male'),
    createNpc('npc_amistad', safeName(sibling, generatedFriend?.fullName || pickRandom(FRIEND_NAMES) || 'Amistad cercana'), 'amistad', 6, '🧑‍🤝‍🧑', friendSex),
    createNpc('npc_mentor', generatedMentor?.fullName || pickRandom(MENTOR_NAMES) || 'Mentor/a', 'mentor', 4, '🧠', mentorSex),
    createNpc('npc_rival', generatedRival?.fullName || pickRandom(RIVAL_NAMES) || 'Rival', 'rival', -8, '⚡', rivalSex),
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
      sex: Math.random() < 0.5 ? 'male' : 'female',
      affinity: 0,
      avatar: '💘',
      status: 'activo',
      lastInteraction: null,
      notes: [],
    },
  ];
}
