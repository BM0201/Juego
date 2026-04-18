import assert from 'node:assert/strict';
import { createInitialSimulation, runAnnualProgression, applyAnnualOutputToSimulation } from '../src/engine/yearlyProgressionEngine.js';
import {
  interactWithVillageNpc,
  setOccupation,
  tradeWithNpc,
} from '../src/engine/villageGameplayEngine.js';
import { getActionAvailability } from '../src/engine/gameplayRules.js';
import { loadGameSnapshot, saveGameSnapshot, clearGameSnapshot } from '../src/state/persistence.js';
import { getEconomicContext, scaleInternalSalary } from '../src/engine/economicEraEngine.js';
import { generateName } from '../src/engine/nameGenerator.js';
import { resolveEducationContext } from '../src/engine/educationEraEngine.js';
import { computeTrainingBudget } from '../src/engine/trainingBudgetEngine.js';
import { getCareerOptions, getSocialActions } from '../src/engine/socialCareerSystem.js';

function createTestCharacter() {
  return {
    name: 'Test Character',
    country: 'Francia',
    birthDate: { year: 1900, month: 1, day: 1 },
    educationStartAge: 6,
    family: {
      familyCondition: 'Hogar estable',
      socialClassKey: 'middle',
      socialClassLabel: 'Clase media',
      discipline: 60,
      foodAccess: 65,
      careAccess: 66,
      householdResources: 60,
      familyStability: 62,
      illnessChance: 0.1,
      negativeRisk: 0.1,
      positiveEventBoost: 0,
      opportunityBias: 0,
    },
    initialStats: { health: 60, sleep: 60, bond: 60, development: 60, emotional: 60 },
    area: { key: 'aldea', label: 'Aldea / Pueblo', hometown: 'Saint-Éloi', moveCost: 1900 },
  };
}

function mockStorage() {
  const store = new Map();
  global.window = {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key),
    },
  };
  return store;
}

function validateAgeGatingAndActionPoints() {
  const character = createTestCharacter();
  const simulation = createInitialSimulation(character);

  const occupationAttempt = setOccupation({
    simulation,
    occupation: { id: 'trabajo_tiempo_completo', title: 'Trabajos', salary: 2600 },
  });
  assert.equal(occupationAttempt.success, false, 'No debe permitir ocupación en infancia.');

  const npc = simulation.village.npcs[0];
  const firstInteraction = interactWithVillageNpc({ simulation, npcId: npc.id, interactionType: 'hablar' });
  assert.equal(firstInteraction.success, false, 'No debe permitir interacción comunitaria antes de la edad mínima.');

  const teenSim = {
    ...simulation,
    age: 16,
    year: 1916,
    influence: 30,
    actionEconomy: { ...simulation.actionEconomy, year: 1916, maxPoints: 4, pointsRemaining: 1, actionUsage: {}, categoryUsage: {} },
  };
  const availability = getActionAvailability({ simulation: teenSim, actionKey: 'policy' });
  assert.equal(availability.allowed, false, 'No debe permitir política sin puntos suficientes.');
}

function validateAnnualProgressContract() {
  const character = createTestCharacter();
  const simulation = { ...createInitialSimulation(character), age: 10, year: 1910 };

  const noPlan = runAnnualProgression({ simulation, character, annualPlan: null });
  assert.equal(noPlan.success, false, 'Sin plan anual no debe cerrar año en edad con agencia.');
  assert.equal(noPlan.reason, 'missing_annual_plan');

  const annualPlan = { id: 'plan_ok', title: 'Plan', summary: 'Plan', effects: { health: 1 }, selectedItems: [] };
  const ok = runAnnualProgression({ simulation, character, annualPlan });
  assert.equal(ok.success, true, 'Con plan anual válido debe cerrar año.');
  const next = applyAnnualOutputToSimulation({ simulation, annualOutput: ok });
  assert.equal(next.year, 1911, 'El año debe avanzar.');
  assert.equal(next.actionEconomy.year, 1911, 'La economía de acciones debe resetearse al nuevo año.');
}

function validatePersistence() {
  const store = mockStorage();
  const character = createTestCharacter();
  const simulation = createInitialSimulation(character);

  saveGameSnapshot({ character, simulation });
  assert.ok(store.size > 0, 'Debe persistir snapshot en localStorage.');

  const loaded = loadGameSnapshot();
  assert.equal(loaded.character.country, 'Francia', 'Debe hidratar el personaje guardado.');
  assert.equal(loaded.simulation.year, 1900, 'Debe hidratar la simulación guardada.');

  store.set('cronicas_save_v1', '{invalid json');
  const corrupted = loadGameSnapshot();
  assert.equal(corrupted, null, 'Datos corruptos deben caer en fallback seguro.');

  clearGameSnapshot();
  assert.equal(window.localStorage.getItem('cronicas_save_v1'), null, 'Reset debe limpiar snapshot.');
}

function validateTradeWithBarter() {
  const character = createTestCharacter();
  const simulation = {
    ...createInitialSimulation(character),
    age: 18,
    year: 1918,
    actionEconomy: {
      version: 1,
      year: 1918,
      maxPoints: 5,
      pointsRemaining: 5,
      actionUsage: {},
      categoryUsage: {},
    },
  };
  const merchant = simulation.village.npcs.find((npc) => npc.role === 'comerciante' && (npc.inventory || []).length);
  const itemToBuy = merchant.inventory[0];
  const barterItem = simulation.inventory[0];

  const result = tradeWithNpc({
    simulation,
    npcId: merchant.id,
    itemId: itemToBuy.id,
    mode: 'buy',
    barterItemId: barterItem.id,
  });

  assert.equal(result.success, true, 'El trueque parcial debe estar habilitado en el motor.');
  assert.ok(result.simulation.bankBalance !== simulation.bankBalance, 'El balance debe cambiar tras comprar/truequear.');
}

function validateLocationUpgradeConsistency() {
  const character = createTestCharacter();
  const simulation = {
    ...createInitialSimulation(character),
    age: 22,
    year: 1922,
    influence: 70,
    yearsInLocation: 8,
    area: { ...createInitialSimulation(character).area, key: 'aldea', label: 'Aldea / Pueblo', hometown: 'Saint-Éloi' },
  };

  const annualPlan = { id: 'upgrade_test', title: 'Plan', summary: 'Plan', effects: { health: 0 }, selectedItems: [] };
  const output = runAnnualProgression({ simulation, character, annualPlan });
  assert.equal(output.success, true);
  assert.equal(output.area.key, 'ciudad_pequena', 'Debe upgradear de aldea a ciudad pequeña con condiciones cumplidas.');
  assert.notEqual(output.area.hometown, 'Saint-Éloi', 'El hometown debe recalcularse para la nueva ubicación.');
}

function validateHistoricalEconomyLayer() {
  const preindustrial = getEconomicContext({ year: 1750, country: 'España' });
  const contemporary = getEconomicContext({ year: 2005, country: 'España' });
  assert.notEqual(preindustrial.currencySymbol, contemporary.currencySymbol, 'La moneda visible debe cambiar entre eras.');

  const oldSalary = scaleInternalSalary(2000, preindustrial);
  const modernSalary = scaleInternalSalary(2000, contemporary);
  assert.ok(oldSalary < modernSalary, 'Los salarios internos deben reescalarse por era económica.');
}

function validateNamingBySex() {
  const male = generateName('España', 1900, { sex: 'male', preferLegacy: true });
  const female = generateName('España', 1900, { sex: 'female', preferLegacy: true });
  assert.notEqual(male.firstName, female.firstName, 'El pool de nombres por sexo no debe mezclarse.');
  assert.equal(male.sex, 'male');
  assert.equal(female.sex, 'female');
}

function validateEducationByEra() {
  const preindustrial = resolveEducationContext({ year: 1750, age: 8 });
  const contemporary = resolveEducationContext({ year: 2005, age: 8 });
  assert.equal(preindustrial.formalAccess, false, 'En era preindustrial el acceso formal debe estar más restringido.');
  assert.equal(contemporary.formalAccess, true, 'En era contemporánea el acceso formal debe iniciar antes.');

  const basePayload = {
    age: 8,
    stats: { sleep: 60, health: 60, emotional: 60, development: 60 },
    family: { foodAccess: 60, discipline: 60, familyStability: 60, careAccess: 60 },
    recentEvents: [],
  };
  const preBudget = computeTrainingBudget({ ...basePayload, educationContext: preindustrial });
  const modernBudget = computeTrainingBudget({ ...basePayload, educationContext: contemporary });
  assert.ok(preBudget.actionBudgetPoints < modernBudget.actionBudgetPoints, 'La época debe afectar el presupuesto de aprendizaje.');
}

function validateSocialAndLaborSystems() {
  const earlySocial = getSocialActions({ year: 1750, age: 18 });
  const modernSocial = getSocialActions({ year: 2005, age: 18 });
  assert.notDeepEqual(earlySocial.spaces, modernSocial.spaces, 'La socialización debe variar por era.');
  assert.ok(earlySocial.maxSocialActions < modernSocial.maxSocialActions, 'La frecuencia social anual debe variar por era.');

  const economicContext = getEconomicContext({ year: 1900, country: 'Francia' });
  const educationContext = resolveEducationContext({ year: 1900, age: 22 });
  const careers = getCareerOptions({ year: 1900, economicContext, educationContext, influence: 40 });
  const panadero = careers.find((job) => job.id === 'panadero');
  const guardia = careers.find((job) => job.id === 'guardia');
  assert.ok(guardia.salary !== panadero.salary, 'Trabajos distintos no deben pagar igual por defecto.');
  assert.ok(guardia.hazardLevel > panadero.hazardLevel, 'El perfil de riesgo debe diferenciar oficios.');
}

try {
  validateAgeGatingAndActionPoints();
  validateAnnualProgressContract();
  validatePersistence();
  validateTradeWithBarter();
  validateLocationUpgradeConsistency();
  validateHistoricalEconomyLayer();
  validateNamingBySex();
  validateEducationByEra();
  validateSocialAndLaborSystems();
  console.log('✅ Core systems validation: all scenarios passed.');
} catch (error) {
  console.error('❌ Core systems validation failed.');
  console.error(error);
  process.exitCode = 1;
}
