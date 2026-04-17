import assert from 'node:assert/strict';
import {
  applyAnnualOutputToSimulation,
  createInitialSimulation,
  runAnnualProgression,
} from '../src/engine/yearlyProgressionEngine.js';

function withDeterministicRandom(value, callback) {
  const originalRandom = Math.random;
  Math.random = () => value;
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

function createTestCharacter() {
  return {
    name: 'Test Character',
    country: 'Testland',
    birthDate: { year: 1900, month: 1, day: 1 },
    educationStartAge: 6,
    family: {
      familyCondition: 'Hogar estable',
      socialClassKey: 'middle',
      socialClassLabel: 'Clase media',
      discipline: 55,
      foodAccess: 65,
      careAccess: 66,
      householdResources: 60,
      familyStability: 62,
      illnessChance: 0.1,
      negativeRisk: 0.1,
      positiveEventBoost: 0,
      opportunityBias: 0,
    },
    initialStats: {
      health: 60,
      sleep: 60,
      bond: 60,
      development: 60,
      emotional: 60,
    },
  };
}

function runCase({ age, year, annualPlan = null, popupOutcome = null }) {
  const character = createTestCharacter();
  const baseSimulation = createInitialSimulation(character);
  const simulation = {
    ...baseSimulation,
    age,
    year,
    recentEvents: [],
    contextEvents: [],
    eventHistory: {},
    contextEventHistory: {},
    popupHistory: {},
  };

  const annualOutput = withDeterministicRandom(0.999999, () => runAnnualProgression({
    simulation,
    character,
    annualPlan,
    popupOutcome,
  }));
  const nextSimulation = applyAnnualOutputToSimulation({ simulation, annualOutput });
  return { simulation, annualOutput, nextSimulation };
}

function validateAnnualLoop() {
  // 1) Edad 0, sin annualPlan, sin popup -> avanza.
  {
    const { nextSimulation } = runCase({ age: 0, year: 1900 });
    assert.equal(nextSimulation.age, 1, 'Escenario 1: la edad no avanzó correctamente en infancia pasiva.');
    assert.equal(nextSimulation.year, 1901, 'Escenario 1: el año no avanzó correctamente en infancia pasiva.');
  }

  // 2) Edad 0, sin annualPlan, con popup resuelto -> aplica, avanza y guarda history.
  {
    const popupOutcome = {
      id: 'popup_test_infancy',
      title: 'Decisión urgente',
      text: 'Popup de prueba',
      effects: { health: 5 },
      popupMeta: {
        eventId: 'popup_infancy',
        choiceId: 'a',
        choiceLabel: 'A',
        outcomeText: 'Resultado de prueba',
      },
    };

    const { simulation, nextSimulation } = runCase({ age: 0, year: 1900, popupOutcome });
    assert.equal(nextSimulation.age, 1, 'Escenario 2: la edad no avanzó con popup en infancia.');
    assert.equal(nextSimulation.year, 1901, 'Escenario 2: el año no avanzó con popup en infancia.');
    assert.equal(nextSimulation.popupHistory.popup_infancy, 1901, 'Escenario 2: popupHistory no se guardó.');
    assert.equal(
      nextSimulation.stats.health - simulation.stats.health,
      5,
      'Escenario 2: los efectos del popup no se aplicaron exactamente una vez en infancia.'
    );
  }

  // 3) Edad >= 5, con annualPlan válido -> avanza normal.
  {
    const annualPlan = {
      id: 'plan_valido',
      title: 'Plan válido',
      summary: 'Plan de prueba',
      effects: { development: 2, emotional: 1 },
      selectedItems: [],
    };
    const { nextSimulation } = runCase({ age: 6, year: 1906, annualPlan });
    assert.equal(nextSimulation.age, 7, 'Escenario 3: la edad no avanzó con plan válido.');
    assert.equal(nextSimulation.year, 1907, 'Escenario 3: el año no avanzó con plan válido.');
  }

  // 4) Edad >= 5, sin plan cuando se requiere -> no rompe y conserva estado.
  {
    const { simulation, annualOutput, nextSimulation } = runCase({ age: 6, year: 1906 });
    assert.equal(nextSimulation.age, simulation.age, 'Escenario 4: no debía avanzar sin plan en edad con agencia.');
    assert.equal(nextSimulation.year, simulation.year, 'Escenario 4: no debía avanzar sin plan en edad con agencia.');
    assert.match(
      annualOutput.annualSummary,
      /No hay enfoque anual guardado/i,
      'Escenario 4: el mensaje de bloqueo esperado no apareció.'
    );
  }

  // 5) Sin doble aplicación de popup effects/eventos.
  {
    const annualPlan = {
      id: 'plan_neutro',
      title: 'Plan neutro',
      summary: 'Sin cambios',
      effects: { health: 0, sleep: 0, bond: 0, development: 0, emotional: 0 },
      selectedItems: [],
    };
    const popupOutcome = {
      id: 'popup_test_once',
      title: 'Decisión urgente',
      text: 'Popup de prueba única',
      effects: { health: 7 },
      popupMeta: {
        eventId: 'popup_once',
        choiceId: 'b',
        choiceLabel: 'B',
        outcomeText: 'Impacto único',
      },
    };

    const { simulation, annualOutput, nextSimulation } = runCase({
      age: 6,
      year: 1906,
      annualPlan,
      popupOutcome,
    });

    assert.equal(
      nextSimulation.stats.health - simulation.stats.health,
      7,
      'Escenario 5: el efecto del popup parece haberse aplicado más de una vez.'
    );
    assert.equal(annualOutput.triggeredEvents.length, 1, 'Escenario 5: se esperaban eventos únicos (solo popup).');
  }
}

try {
  validateAnnualLoop();
  console.log('✅ Validación anual: todos los escenarios pasaron.');
} catch (error) {
  console.error('❌ Validación anual falló.');
  console.error(error);
  process.exitCode = 1;
}
