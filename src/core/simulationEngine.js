import { createRandomAppearance, generateNpc, ageAppearance, inheritAppearanceFromParents } from './characterEngine.js';
import { resolveDecision } from './decisionEngine.js';
import { drawYearEvent, resolveEraFromYear } from './eventEngine.js';
import { DIFFICULTY_PRESETS } from '../data/roles.js';
import { clamp, roll } from './random.js';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function createInitialNpcs(era, legacyScore) {
  return [
    generateNpc({ era, roleId: 'plebeyo', legacyScore }),
    generateNpc({ era, roleId: 'comerciante', legacyScore }),
    generateNpc({ era, roleId: 'noble', legacyScore }),
  ];
}

export function createNewGameState(playerProfile, startYear = 1500) {
  const era = resolveEraFromYear(startYear);
  const player = clone(playerProfile);
  if (!player.appearance) {
    player.appearance = createRandomAppearance({ era, roleId: player.roleId, gender: player.gender, legacyScore: 0 });
  }

  return {
    meta: {
      startedAt: new Date().toISOString(),
      saveVersion: 2,
      checkpointYear: startYear,
      tutorialSeen: false,
    },
    world: {
      year: startYear,
      era,
      country: 'Castilla',
      eventHistory: [],
      chainFlags: [],
      pendingEvent: null,
      checkpoints: [],
    },
    player,
    npcs: createInitialNpcs(era, player.dynasty.legacyScore),
    log: ['Comienza una nueva crónica histórica.'],
    gameOver: false,
    deathReason: null,
  };
}

function triggerDeathChance(state) {
  const { player } = state;
  const difficulty = DIFFICULTY_PRESETS[player.difficultyId] || DIFFICULTY_PRESETS.estadista;
  const baseMortality = player.stats.edad > 65 ? 0.15 : player.stats.edad > 50 ? 0.05 : 0.02;
  const healthPenalty = player.stats.salud < 30 ? 0.14 : player.stats.salud < 50 ? 0.06 : 0;
  const pressure = difficulty.mortalityPressure;
  return roll((baseMortality + healthPenalty) * pressure);
}

function addHeirIfApplicable(state) {
  const childChance = state.player.stats.edad >= 20 && state.player.stats.edad <= 45 ? 0.25 : 0.04;
  if (!roll(childChance)) return;

  const parents = [{ appearance: state.player.appearance }];
  const inheritedAppearance = inheritAppearanceFromParents(parents);

  const child = {
    id: `heir-${Math.random().toString(36).slice(2, 9)}`,
    name: `${state.player.dynasty.name.split(' ')[0]} ${Math.floor(Math.random() * 90 + 10)}`,
    age: 0,
    roleId: state.player.roleId,
    appearance: inheritedAppearance,
  };

  state.player.dynasty.heirs.push(child);
  state.player.dynasty.currentHeirId = child.id;
  state.log.unshift(`Nace un heredero en la casa ${state.player.dynasty.name}: ${child.name}.`);
}

function applyDynastyLegacy(state, decisionImpact) {
  const delta = Math.round((decisionImpact.influencia + decisionImpact.prestigio + decisionImpact.felicidad * 0.5) / 8);
  state.player.dynasty.legacyScore = clamp(state.player.dynasty.legacyScore + delta, 0, 100);
  if (delta >= 3) {
    state.player.dynasty.legacyMoments.unshift(`Año ${state.world.year}: la casa gana prestigio por decisiones acertadas.`);
  }
}

export function ensurePendingEvent(state) {
  if (state.world.pendingEvent || state.gameOver) return state;
  state.world.pendingEvent = drawYearEvent({ world: state.world, player: state.player });
  return state;
}

export function decideEventOption(state, optionId) {
  if (!state.world.pendingEvent || state.gameOver) return state;
  const event = state.world.pendingEvent;
  const option = event.options.find((item) => item.id === optionId) || event.options[0];
  const resolution = resolveDecision({ player: state.player, event, option });

  state.player.stats = {
    ...state.player.stats,
    ...resolution.nextStats,
  };

  state.player.unlocked.accessories = Array.from(new Set([...state.player.unlocked.accessories, ...resolution.unlocks]));
  state.world.chainFlags = Array.from(new Set([...state.world.chainFlags, ...resolution.chainFlags]));
  state.world.eventHistory.unshift({
    id: event.id,
    title: event.title,
    year: state.world.year,
    option: option.label,
    type: event.type,
  });

  applyDynastyLegacy(state, resolution.nextStats);

  state.log.unshift(
    `Año ${state.world.year} — ${event.title}: elegiste "${option.label}"${resolution.riskTriggered ? ' y el riesgo te pasó factura.' : '.'}`,
  );

  state.world.pendingEvent = null;
  return state;
}

export function advanceYear(state) {
  if (state.gameOver) return state;
  if (state.world.pendingEvent) {
    state.log.unshift('Debes resolver el evento pendiente antes de avanzar año.');
    return state;
  }

  state.world.year += 1;
  state.world.era = resolveEraFromYear(state.world.year);
  state.player.stats.edad += 1;
  state.player.stats.energia = clamp(state.player.stats.energia - 6 + Math.round(Math.random() * 8));
  state.player.stats.salud = clamp(state.player.stats.salud - 2 + Math.round(Math.random() * 4));
  state.player.appearance = ageAppearance(state.player.appearance, state.player.stats.edad);

  addHeirIfApplicable(state);

  if (state.player.stats.edad % 10 === 0) {
    state.meta.checkpointYear = state.world.year;
    state.world.checkpoints.unshift({ year: state.world.year, snapshotAt: new Date().toISOString() });
  }

  if (state.player.stats.salud <= 0 || triggerDeathChance(state)) {
    const heir = state.player.dynasty.heirs.find((child) => child.id === state.player.dynasty.currentHeirId) || state.player.dynasty.heirs[0];
    if (heir) {
      state.player.name = heir.name;
      state.player.stats.edad = 16;
      state.player.stats.salud = 68;
      state.player.stats.energia = 60;
      state.player.appearance = {
        ...heir.appearance,
        accessoryId: 'ninguno',
      };
      state.player.dynasty.generation += 1;
      state.player.dynasty.legacyMoments.unshift(`Año ${state.world.year}: muerte del líder, la dinastía continúa.`);
      state.log.unshift(`Muere el líder de la casa ${state.player.dynasty.name}; asume el heredero ${heir.name}.`);
      state.player.dynasty.heirs = [];
      state.player.dynasty.currentHeirId = null;
    } else {
      state.gameOver = true;
      state.deathReason = `La línea dinástica terminó en el año ${state.world.year}.`;
      state.log.unshift(state.deathReason);
      return state;
    }
  }

  state.npcs = createInitialNpcs(state.world.era, state.player.dynasty.legacyScore);
  ensurePendingEvent(state);
  return state;
}
