import { APPEARANCE_COLORS, getAppearanceCatalog } from '../data/appearanceCatalog.js';
import { DIFFICULTY_PRESETS, DYNASTY_NAMES, ROLE_DEFINITIONS } from '../data/roles.js';
import { pickRandom } from './random.js';

const DEFAULT_NAME_POOL = ['Aldo', 'Iria', 'Mateo', 'Livia', 'Nora', 'Bruno', 'Selene', 'Dario'];
const NPC_NAME_POOL = ['Rodolfo', 'Aurelia', 'Tomás', 'Elena', 'Hugo', 'Camila', 'Raimundo', 'Isabel'];

function normalizeGender(gender = 'm') {
  return gender === 'f' ? 'f' : 'm';
}

function ensureRole(roleId) {
  return ROLE_DEFINITIONS[roleId] ? roleId : 'plebeyo';
}

function resolveUnlock(unlock, legacyScore = 0) {
  if (!unlock || unlock === 'base') return true;
  const match = String(unlock).match(/legacy_(\d+)/);
  if (!match) return false;
  return legacyScore >= Number(match[1]);
}

export function getAllowedAppearanceOptions({ era, roleId, gender, legacyScore = 0 }) {
  const catalog = getAppearanceCatalog();
  const safeRole = ensureRole(roleId);
  const safeGender = normalizeGender(gender);

  const hairStyles = catalog.hairStyles.filter((item) => item.eras.includes(era) && item.genders.includes(safeGender));
  const beardStyles = catalog.beardStyles.filter((item) => item.eras.includes(era));
  const accessories = catalog.accessories.filter(
    (item) => item.eras.includes(era) && item.roles.includes(safeRole) && resolveUnlock(item.unlock, legacyScore),
  );

  const allowedTiers = ROLE_DEFINITIONS[safeRole].allowedClothingTiers;
  const clothing = catalog.clothing.filter(
    (item) => item.eras.includes(era) && item.roles.includes(safeRole) && allowedTiers.includes(item.tier),
  );

  return {
    hairStyles,
    beardStyles,
    accessories,
    clothing,
    colors: APPEARANCE_COLORS,
  };
}

export function createRandomAppearance({ era, roleId, gender, legacyScore = 0 }) {
  const options = getAllowedAppearanceOptions({ era, roleId, gender, legacyScore });
  return {
    hairStyleId: pickRandom(options.hairStyles)?.id || 'corto_recto',
    beardStyleId: pickRandom(options.beardStyles)?.id || 'sin_barba',
    accessoryId: pickRandom(options.accessories)?.id || 'ninguno',
    clothingId: pickRandom(options.clothing)?.id || 'tunica',
    hairColor: pickRandom(options.colors.hair),
    eyeColor: pickRandom(options.colors.eyes),
    skinTone: pickRandom(options.colors.skin),
    facialTrait: pickRandom(['cicatriz', 'pecas', 'sereno', 'intenso', 'amable', 'ninguno']),
  };
}

export function sanitizeAppearance({ appearance, era, roleId, gender, legacyScore = 0 }) {
  const options = getAllowedAppearanceOptions({ era, roleId, gender, legacyScore });
  const setOrFallback = (value, list, fallbackId) => (list.some((item) => item.id === value) ? value : list[0]?.id || fallbackId);
  return {
    hairStyleId: setOrFallback(appearance?.hairStyleId, options.hairStyles, 'corto_recto'),
    beardStyleId: setOrFallback(appearance?.beardStyleId, options.beardStyles, 'sin_barba'),
    accessoryId: setOrFallback(appearance?.accessoryId, options.accessories, 'ninguno'),
    clothingId: setOrFallback(appearance?.clothingId, options.clothing, 'tunica'),
    hairColor: APPEARANCE_COLORS.hair.includes(appearance?.hairColor) ? appearance.hairColor : APPEARANCE_COLORS.hair[0],
    eyeColor: APPEARANCE_COLORS.eyes.includes(appearance?.eyeColor) ? appearance.eyeColor : APPEARANCE_COLORS.eyes[0],
    skinTone: APPEARANCE_COLORS.skin.includes(appearance?.skinTone) ? appearance.skinTone : APPEARANCE_COLORS.skin[0],
    facialTrait: appearance?.facialTrait || 'ninguno',
  };
}

function roleStats(roleId) {
  return ROLE_DEFINITIONS[ensureRole(roleId)].startingStats;
}

export function createPlayerProfile({ name, gender, roleId, difficultyId, dynastyName, era, appearance }) {
  const safeRole = ensureRole(roleId);
  const safeDifficulty = DIFFICULTY_PRESETS[difficultyId] ? difficultyId : 'estadista';
  const safeName = name?.trim() || pickRandom(DEFAULT_NAME_POOL);
  const safeDynasty = dynastyName?.trim() || pickRandom(DYNASTY_NAMES);

  return {
    id: `pj-${Date.now()}`,
    name: safeName,
    gender: normalizeGender(gender),
    roleId: safeRole,
    difficultyId: safeDifficulty,
    dynasty: {
      name: safeDynasty,
      generation: 1,
      legacyScore: 0,
      heirs: [],
      currentHeirId: null,
      legacyMoments: [],
    },
    stats: {
      ...roleStats(safeRole),
      edad: 16,
    },
    appearance: sanitizeAppearance({ appearance, era, roleId: safeRole, gender: normalizeGender(gender), legacyScore: 0 }),
    unlocked: {
      accessories: ['ninguno'],
      clothing: ['harapos', 'tunica', 'traje_lino'].filter(Boolean),
    },
  };
}

export function generateNpc({ era, roleId = 'plebeyo', legacyScore = 0 }) {
  const npcRole = ROLE_DEFINITIONS[roleId] ? roleId : pickRandom(Object.keys(ROLE_DEFINITIONS));
  const gender = pickRandom(['m', 'f']);
  return {
    id: `npc-${Math.random().toString(36).slice(2, 9)}`,
    name: pickRandom(NPC_NAME_POOL),
    roleId: npcRole,
    relation: pickRandom(['rival', 'aliado', 'neutral']),
    appearance: createRandomAppearance({ era, roleId: npcRole, gender, legacyScore }),
  };
}

export function ageAppearance(appearance, age) {
  if (age < 48) return appearance;
  return {
    ...appearance,
    hairColor: age > 65 ? '#c8c8c8' : appearance.hairColor,
    facialTrait: age > 60 ? 'arrugas' : appearance.facialTrait,
  };
}

export function inheritAppearanceFromParents(parents) {
  if (!parents?.length) return null;
  const sourceA = parents[0]?.appearance;
  const sourceB = parents[1]?.appearance || sourceA;
  if (!sourceA) return null;
  return {
    hairStyleId: pickRandom([sourceA.hairStyleId, sourceB.hairStyleId]),
    beardStyleId: pickRandom([sourceA.beardStyleId, sourceB.beardStyleId]),
    accessoryId: 'ninguno',
    clothingId: 'tunica',
    hairColor: pickRandom([sourceA.hairColor, sourceB.hairColor]),
    eyeColor: pickRandom([sourceA.eyeColor, sourceB.eyeColor]),
    skinTone: pickRandom([sourceA.skinTone, sourceB.skinTone]),
    facialTrait: pickRandom([sourceA.facialTrait, sourceB.facialTrait, 'ninguno']),
  };
}
