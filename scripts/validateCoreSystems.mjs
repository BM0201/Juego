import { getAllowedAppearanceOptions, createPlayerProfile, generateNpc } from '../src/core/characterEngine.js';
import { createNewGameState, decideEventOption, ensurePendingEvent } from '../src/core/simulationEngine.js';
import { autosaveYearly, createCheckpoint } from '../src/state/saveEngine.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

global.localStorage = {
  _data: {},
  getItem(key) { return this._data[key] ?? null; },
  setItem(key, value) { this._data[key] = String(value); },
  removeItem(key) { delete this._data[key]; },
};

const options = getAllowedAppearanceOptions({ era: 'medieval', roleId: 'plebeyo', gender: 'm', legacyScore: 0 });
assert(options.accessories.every((item) => item.roles.includes('plebeyo')), 'Filtrado de accesorios por rol inválido.');

const player = createPlayerProfile({
  name: 'Prueba',
  gender: 'f',
  roleId: 'rey',
  difficultyId: 'hierro',
  dynastyName: 'Valcor',
  era: 'industrial',
  appearance: null,
});

const state = ensurePendingEvent(createNewGameState(player, 1850));
const currentEvent = state.world.pendingEvent;
assert(currentEvent?.options?.length >= 2, 'Evento sin decisiones suficientes.');
decideEventOption(state, currentEvent.options[1].id);
assert(state.world.pendingEvent === null, 'Evento no se resolvió.');

const npc = generateNpc({ era: 'industrial', roleId: 'noble', legacyScore: 55 });
assert(!!npc.appearance, 'NPC generado sin apariencia.');

const auto = autosaveYearly(state);
const cp = createCheckpoint(state);
assert(auto.id === 'autosave', 'Autoguardado no usa slot fijo.');
assert(cp.isCheckpoint, 'Checkpoint no marcado correctamente.');

console.log('✅ Core systems validation: all scenarios passed.');
