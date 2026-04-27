import { BASE_RANDOM_EVENTS, CHAIN_EVENTS, ERA_BY_YEAR, HISTORICAL_EVENTS } from '../data/historicalEvents.js';
import { DIFFICULTY_PRESETS, ROLE_DEFINITIONS } from '../data/roles.js';
import { weightedPick } from './random.js';

export function resolveEraFromYear(year) {
  return ERA_BY_YEAR.find((era) => year >= era.min && year <= era.max)?.id || 'moderna';
}

function eventWeight(event, { roleId, difficultyId }) {
  const roleBias = event.roleBias?.[roleId] ?? 1;
  const crisisWeight = DIFFICULTY_PRESETS[difficultyId]?.crisisWeight ?? 1;
  const rolePerks = ROLE_DEFINITIONS[roleId]?.perks ?? ROLE_DEFINITIONS.plebeyo.perks;
  const policyAffinity = event.categories?.includes('economica') ? rolePerks.economia : event.categories?.includes('politica') ? rolePerks.politica : 1;
  return Math.max(0.1, roleBias * crisisWeight * policyAffinity);
}

function matchesEventWindow(event, year) {
  const start = event.startYear ?? -Infinity;
  const end = event.endYear ?? Infinity;
  return year >= start && year <= end;
}

function notConsumed(event, consumedIds) {
  if (!event.oncePerGame) return true;
  return !consumedIds.has(event.id);
}

function buildChainEvent(chainDef) {
  return {
    ...chainDef,
    type: 'encadenado',
    categories: ['consecuencia'],
    risk: 0.45,
  };
}

export function drawYearEvent({ world, player }) {
  const year = world.year;
  const era = resolveEraFromYear(year);
  const consumedIds = new Set(world.eventHistory.map((evt) => evt.id));

  const availableChain = CHAIN_EVENTS
    .filter((chain) => world.chainFlags.includes(chain.requiresFlag) && chain.era.includes(era))
    .map(buildChainEvent);

  const historical = HISTORICAL_EVENTS.filter(
    (event) => event.era.includes(era) && matchesEventWindow(event, year) && notConsumed(event, consumedIds),
  );

  const random = BASE_RANDOM_EVENTS.filter((event) => event.era.includes(era));

  const candidateEvents = [...availableChain, ...historical, ...random];

  const selected = weightedPick(candidateEvents, (event) => eventWeight(event, { roleId: player.roleId, difficultyId: player.difficultyId }));

  return {
    ...selected,
    era,
    year,
  };
}
