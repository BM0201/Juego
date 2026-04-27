import { createPlayerProfile } from '../src/core/characterEngine.js';
import { createNewGameState, advanceYear, decideEventOption, ensurePendingEvent } from '../src/core/simulationEngine.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const player = createPlayerProfile({
  name: 'Tester',
  gender: 'm',
  roleId: 'comerciante',
  difficultyId: 'estadista',
  dynastyName: 'de Alba',
  era: 'renacentista',
  appearance: null,
});

const originalRandom = Math.random;

try {
  // Hacemos la prueba determinística para evitar falsos negativos por mortalidad aleatoria.
  Math.random = () => 0.99;

  const state = ensurePendingEvent(createNewGameState(player, 1550));
  const initialYear = state.world.year;

  for (let i = 0; i < 5; i += 1) {
    assert(state.world.pendingEvent, 'Debe existir un evento antes de decidir.');
    const firstOption = state.world.pendingEvent.options[0];
    decideEventOption(state, firstOption.id);
    advanceYear(state);
  }

  assert(state.world.year === initialYear + 5, 'El año no avanzó correctamente.');
  assert(state.world.eventHistory.length >= 5, 'No se registraron eventos históricos.');
  assert(state.player.stats.edad >= 21, 'La edad no avanzó correctamente.');

  console.log('✅ Validación anual: todos los escenarios pasaron.');
} finally {
  Math.random = originalRandom;
}
