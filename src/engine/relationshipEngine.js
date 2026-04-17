import { pickRandom } from '../utils/random.js';

function clamp(value) {
  return Math.max(-100, Math.min(100, Math.round(value)));
}

function updateNpc(relationships, npcId, updater) {
  return relationships.map((npc) => (npc.id === npcId ? updater(npc) : npc));
}

export function findNpcByRole(relationships, role) {
  const active = relationships.filter((npc) => npc.role === role && npc.status !== 'fallecido');
  if (!active.length) return null;
  return pickRandom(active);
}

export function applyRelationshipImpact({ relationships, targetRole, delta = 0, status, note, year }) {
  const target = findNpcByRole(relationships, targetRole);
  if (!target) return { relationships, targetName: null };

  const updated = updateNpc(relationships, target.id, (npc) => ({
    ...npc,
    affinity: clamp(npc.affinity + delta),
    status: status || npc.status,
    lastInteraction: year,
    notes: note ? [note, ...(npc.notes || [])].slice(0, 6) : npc.notes,
  }));

  return {
    relationships: updated,
    targetName: target.name,
  };
}

const RELATIONSHIP_INTERACTIONS = [
  {
    id: 'family_conversation',
    weight: 8,
    minAge: 6,
    maxAge: 80,
    role: 'familia',
    text: 'Tuvieron una conversación sincera en casa que mejoró el entendimiento.',
    effects: { emotional: 1, bond: 2 },
    delta: 4,
    tone: 'positive',
  },
  {
    id: 'friend_adventure',
    weight: 7,
    minAge: 7,
    maxAge: 40,
    role: 'amistad',
    text: 'Una aventura con tu amistad cercana reforzó su confianza mutua.',
    effects: { emotional: 2, development: 1 },
    delta: 5,
    tone: 'positive',
  },
  {
    id: 'rival_pressure',
    weight: 6,
    minAge: 9,
    maxAge: 55,
    role: 'rival',
    text: 'La presión de tu rival te exigió más de lo esperado.',
    effects: { development: 1, emotional: -2 },
    delta: -3,
    tone: 'mixed',
  },
  {
    id: 'mentor_guidance',
    weight: 6,
    minAge: 10,
    maxAge: 65,
    role: 'mentor',
    text: 'Tu mentor te dio una guía clave para el siguiente paso.',
    effects: { development: 2, emotional: 1 },
    delta: 4,
    tone: 'positive',
  },
  {
    id: 'romantic_date',
    weight: 5,
    minAge: 15,
    maxAge: 65,
    role: 'pareja',
    text: 'Compartiste un momento íntimo que fortaleció la relación.',
    effects: { emotional: 3, sleep: -1 },
    delta: 6,
    tone: 'positive',
  },
  {
    id: 'romantic_conflict',
    weight: 4,
    minAge: 16,
    maxAge: 65,
    role: 'pareja',
    text: 'Una discusión de pareja dejó emociones mezcladas.',
    effects: { emotional: -3, bond: -1 },
    delta: -7,
    tone: 'negative',
  },
];

function weightedPick(entries) {
  const total = entries.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of entries) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return entries[entries.length - 1];
}

export function resolveRelationshipYearEvent({ age, year, relationships }) {
  const pool = RELATIONSHIP_INTERACTIONS.filter((item) => age >= item.minAge && age <= item.maxAge);
  if (!pool.length) return null;
  if (Math.random() > 0.63) return null;

  const selected = weightedPick(pool);
  const target = findNpcByRole(relationships, selected.role);
  if (!target) return null;

  const note = `${year}: ${selected.text}`;
  const updatedRelationships = updateNpc(relationships, target.id, (npc) => ({
    ...npc,
    affinity: clamp(npc.affinity + selected.delta),
    lastInteraction: year,
    notes: [note, ...(npc.notes || [])].slice(0, 6),
  }));

  return {
    event: {
      id: `rel_${selected.id}`,
      title: `Relación con ${target.name}`,
      text: `${selected.text} (${target.name})`,
      effects: selected.effects,
      tone: selected.tone,
      relationMeta: {
        targetId: target.id,
        targetName: target.name,
        role: target.role,
        delta: selected.delta,
      },
    },
    relationships: updatedRelationships,
  };
}
