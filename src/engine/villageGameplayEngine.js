import { applyEffects } from './statExplanationEngine.js';
import { findCatalogItem, getDynamicPrice } from './economyEngine.js';
import { buildMoveOptions, createVillageState } from './villageEngine.js';
import { getAreaByKey } from '../data/configs/locationConfig.js';
import { getPolicyOptions, resolvePoliticalLevel } from './politicsEngine.js';
import { consumeAction, getActionAvailability } from './gameplayRules.js';
import { formatCurrencyByContext, getEconomicContext, scaleInternalDelta, scaleInternalPrice } from './economicEraEngine.js';
import { getSocialActions, resolveRomanceProgress } from './socialCareerSystem.js';

function clampInfluence(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function updateNpcList(list, npcId, updater) {
  return list.map((npc) => (npc.id === npcId ? updater(npc) : npc));
}

function resolveInteraction(interactionType, socialAction = null) {
  if (socialAction) {
    return {
      relation: socialAction.relationDelta,
      influence: socialAction.influenceDelta,
      text: `${socialAction.label}: interacción resuelta en ${socialAction.interactionType}.`,
      reputationalRisk: socialAction.reputationalRisk || 0,
    };
  }

  switch (interactionType) {
    case 'hablar':
      return { relation: 4, influence: 1, text: 'Conversación cercana: la relación mejoró.' };
    case 'favor':
      return { relation: 6, influence: 2, text: 'Ayudaste en un favor comunitario.' };
    case 'regalo':
      return { relation: 8, influence: 1, bankDelta: -120, text: 'Entregaste un regalo y generaste buena voluntad.' };
    case 'trabajar':
      return { relation: 3, influence: 2, bankDelta: 180, text: 'Trabajaste para este NPC y ganaste dinero.' };
    default:
      return { relation: 0, influence: 0, text: 'Sin cambios relevantes.' };
  }
}

export function moveToLocation({ simulation, character, targetAreaKey }) {
  const availability = getActionAvailability({ simulation, actionKey: 'move_location' });
  if (!availability.allowed) {
    return { simulation, message: availability.reason, success: false, reason: 'action_blocked' };
  }

  const targetArea = getAreaByKey(targetAreaKey);
  const options = buildMoveOptions({ country: character.country, year: simulation.year, currentAreaKey: simulation.area.key });
  const moveOption = options.find((item) => item.key === targetArea.key);
  if (!moveOption || moveOption.isCurrent) {
    return { simulation, message: 'Ya te encuentras en esa ubicación.', success: false, reason: 'already_there' };
  }

  const economyContext = getEconomicContext({ year: simulation.year, country: character.country });
  const moveCost = scaleInternalPrice(moveOption.moveCost, economyContext);
  const bankBalance = (simulation.bankBalance || 0) - moveCost;
  if (bankBalance < 0) {
    return { simulation, message: 'No tienes suficiente balance para mudarte.', success: false, reason: 'insufficient_funds' };
  }

  const nextArea = {
    key: targetArea.key,
    label: targetArea.label,
    hometown: moveOption.hometown,
    moveCost: targetArea.moveCost,
  };

  const nextVillage = createVillageState({ areaKey: targetArea.key, country: character.country, year: simulation.year });

  return {
    simulation: {
      ...simulation,
      bankBalance,
      area: nextArea,
      village: nextVillage,
      actionEconomy: consumeAction({ simulation, actionKey: 'move_location' }),
      yearsInLocation: 0,
      relationships: (simulation.relationships || []).map((npc) => (
        npc.role === 'amistad' ? { ...npc, affinity: Math.max(-20, npc.affinity - 6) } : npc
      )),
      recentEvents: [
        {
          year: simulation.year,
          title: 'Mudanza',
          text: `Te mudaste a ${targetArea.label} (${moveOption.hometown}). Coste total (interno): ${moveCost}.`,
          tone: 'neutral',
        },
        ...(simulation.recentEvents || []),
      ].slice(0, 8),
    },
    message: `Te mudaste a ${targetArea.label}.`,
    success: true,
    reason: 'moved',
  };
}

export function interactWithVillageNpc({ simulation, npcId, interactionType, socialActionId = null }) {
  const availability = getActionAvailability({ simulation, actionKey: 'npc_interaction' });
  if (!availability.allowed) {
    return { simulation, message: availability.reason, success: false, reason: 'action_blocked' };
  }

  const target = (simulation.village?.npcs || []).find((npc) => npc.id === npcId);
  if (!target) return { simulation, message: 'NPC no encontrado.', success: false, reason: 'npc_missing' };

  const socialAction = getSocialActions({ year: simulation.year, age: simulation.age }).actions.find((action) => action.id === socialActionId) || null;
  const impact = resolveInteraction(interactionType, socialAction);
  const updatedVillageNpcs = updateNpcList(simulation.village.npcs, npcId, (npc) => ({
    ...npc,
    relation: Math.max(-100, Math.min(100, npc.relation + impact.relation)),
  }));

  const linkedRelation = (simulation.relationships || []).find((rel) => rel.name === target.name);
  const relationships = linkedRelation
    ? (simulation.relationships || []).map((rel) => (rel.name === target.name ? { ...rel, affinity: rel.affinity + impact.relation } : rel))
    : [
        {
          id: `rel_${target.id}`,
          name: target.name,
          role: 'aldea',
          affinity: impact.relation,
          status: 'activo',
          notes: [`${simulation.year}: ${impact.text}`],
        },
        ...(simulation.relationships || []),
      ].slice(0, 20);

  const romanceResult = resolveRomanceProgress({
    simulation: { ...simulation, relationships },
    targetNpc: linkedRelation || relationships.find((rel) => rel.name === target.name),
    action: socialAction || { romancePotential: 0, relationDelta: impact.relation, label: interactionType },
    year: simulation.year,
  });

  return {
    simulation: {
      ...simulation,
      bankBalance: (simulation.bankBalance || 0) + (impact.bankDelta || 0),
      influence: clampInfluence((simulation.influence || 0) + impact.influence),
      village: {
        ...simulation.village,
        npcs: updatedVillageNpcs,
      },
      relationships: romanceResult.relationships,
      actionEconomy: consumeAction({ simulation, actionKey: 'npc_interaction' }),
    },
    message: romanceResult.message ? `${impact.text} ${romanceResult.message}` : impact.text,
    success: true,
    reason: 'interaction_applied',
  };
}

export function tradeWithNpc({ simulation, npcId, itemId, mode = 'buy', barterItemId = null }) {
  const availability = getActionAvailability({ simulation, actionKey: 'trade' });
  if (!availability.allowed) {
    return { simulation, message: availability.reason, success: false, reason: 'action_blocked' };
  }

  const npc = (simulation.village?.npcs || []).find((item) => item.id === npcId);
  if (!npc) return { simulation, message: 'No puedes comerciar con ese NPC.', success: false, reason: 'npc_missing' };

  const sourceInventory = mode === 'buy' ? npc.inventory || [] : simulation.inventory || [];
  const item = sourceInventory.find((entry) => entry.id === itemId) || findCatalogItem(itemId);
  if (!item) return { simulation, message: 'Objeto no disponible.', success: false, reason: 'item_missing' };

  const price = getDynamicPrice({
    baseValue: item.baseValue,
    relationAffinity: npc.relation || 0,
    mode,
    year: simulation.year,
    country: simulation.country || '',
  });
  if (mode === 'buy' && (simulation.bankBalance || 0) < price) {
    return { simulation, message: 'Fondos insuficientes para comprar.', success: false, reason: 'insufficient_funds' };
  }

  let bankBalance = simulation.bankBalance || 0;
  let inventory = [...(simulation.inventory || [])];
  let npcInventory = [...(npc.inventory || [])];

  if (mode === 'buy') {
    bankBalance -= price;
    inventory = [...inventory, item];
    npcInventory = npcInventory.filter((entry, index) => !(entry.id === item.id && index === npcInventory.findIndex((i) => i.id === item.id)));
  } else {
    bankBalance += price;
    inventory = inventory.filter((entry, index) => !(entry.id === item.id && index === inventory.findIndex((i) => i.id === item.id)));
    npcInventory = [...npcInventory, item];
  }

  if (barterItemId) {
    const offered = inventory.find((entry) => entry.id === barterItemId);
    if (offered) {
      inventory = inventory.filter((entry, index) => !(entry.id === offered.id && index === inventory.findIndex((i) => i.id === offered.id)));
      npcInventory.push(offered);
      bankBalance += Math.round(offered.baseValue * 0.35);
    }
  }

  const villageNpcs = updateNpcList(simulation.village.npcs, npc.id, (entry) => ({
    ...entry,
    relation: entry.relation + 2,
    inventory: npcInventory,
  }));

  return {
    simulation: {
      ...simulation,
      bankBalance,
      inventory,
      village: {
        ...simulation.village,
        npcs: villageNpcs,
      },
      influence: clampInfluence((simulation.influence || 0) + 1),
      actionEconomy: consumeAction({ simulation, actionKey: 'trade' }),
    },
    message: mode === 'buy'
      ? `Compraste ${item.name} por ${formatCurrencyByContext(price, getEconomicContext({ year: simulation.year, country: simulation.country || '' }))}.`
      : `Vendiste ${item.name} por ${formatCurrencyByContext(price, getEconomicContext({ year: simulation.year, country: simulation.country || '' }))}.`,
    success: true,
    reason: 'trade_completed',
  };
}

export function setOccupation({ simulation, occupation }) {
  const availability = getActionAvailability({ simulation, actionKey: 'occupation_change', occupation });
  if (!availability.allowed) {
    return { simulation, message: availability.reason, success: false, reason: 'action_blocked' };
  }

  return {
    simulation: {
      ...simulation,
      occupation,
      actionEconomy: consumeAction({ simulation, actionKey: 'occupation_change' }),
      recentEvents: [
        {
          year: simulation.year,
          title: 'Cambio de ocupación',
          text: `Ahora trabajas como ${occupation.title}.`,
          tone: 'positive',
        },
        ...(simulation.recentEvents || []),
      ].slice(0, 8),
    },
    message: `Ocupación actualizada: ${occupation.title}.`,
    success: true,
    reason: 'occupation_changed',
  };
}

export function enactPolicy({ simulation, policyId }) {
  const availability = getActionAvailability({ simulation, actionKey: 'policy' });
  if (!availability.allowed) {
    return { simulation, message: availability.reason, success: false, reason: 'action_blocked' };
  }

  const level = resolvePoliticalLevel(simulation.influence || 0);
  const policy = getPolicyOptions(level.key).find((entry) => entry.id === policyId);
  if (!policy) {
    return { simulation, message: 'No puedes aplicar esa política aún.', success: false, reason: 'policy_locked' };
  }

  const effects = policy.effects || {};
  const stats = applyEffects(simulation.stats, effects);
  const economyContext = getEconomicContext({ year: simulation.year, country: simulation.country || '' });
  const bankDelta = scaleInternalDelta(effects.bankBalance || 0, economyContext);

  return {
    simulation: {
      ...simulation,
      stats,
      bankBalance: (simulation.bankBalance || 0) + bankDelta,
      influence: clampInfluence((simulation.influence || 0) + (effects.influence || 0)),
      politicalLevel: resolvePoliticalLevel((simulation.influence || 0) + (effects.influence || 0)).key,
      actionEconomy: consumeAction({ simulation, actionKey: 'policy' }),
      recentEvents: [
        {
          year: simulation.year,
          title: 'Decisión política',
          text: `${policy.title}: cambiaste el rumbo de la comunidad.`,
          tone: 'mixed',
        },
        ...(simulation.recentEvents || []),
      ].slice(0, 8),
    },
    message: `${policy.title} aplicada.`,
    success: true,
    reason: 'policy_applied',
  };
}

export function exploreVillagePlace({ simulation, placeName }) {
  const availability = getActionAvailability({ simulation, actionKey: 'explore_location' });
  if (!availability.allowed) {
    return { simulation, message: availability.reason, success: false, reason: 'action_blocked' };
  }

  const places = simulation.village?.places || [];
  if (!places.includes(placeName)) {
    return { simulation, message: 'Lugar no disponible en esta ubicación.', success: false, reason: 'place_missing' };
  }

  const roll = Math.random();
  const baseReward = Math.max(1, Math.round((simulation.influence || 0) / 20));
  const economyContext = getEconomicContext({ year: simulation.year, country: simulation.country || '' });
  let effects = { influence: 1, bankBalance: 0, emotional: 1 };
  let text = `Visitaste ${placeName}.`;
  let tone = 'neutral';

  if (roll < 0.33) {
    effects = { influence: 2 + baseReward, bankBalance: 120, emotional: 1 };
    text = `En ${placeName} encontraste una oportunidad local y ganaste ${formatCurrencyByContext(120, economyContext)}.`;
    tone = 'positive';
  } else if (roll < 0.66) {
    effects = { influence: 1, bankBalance: -80, emotional: -1 };
    text = `Explorar ${placeName} te costó suministros y tiempo (${formatCurrencyByContext(80, economyContext)}).`;
    tone = 'mixed';
  } else {
    effects = { influence: 1 + baseReward, bankBalance: 0, emotional: 2 };
    text = `Conociste gente influyente en ${placeName}; mejoró tu reputación local.`;
    tone = 'positive';
  }

  return {
    simulation: {
      ...simulation,
      influence: clampInfluence((simulation.influence || 0) + (effects.influence || 0)),
      bankBalance: (simulation.bankBalance || 0) + (effects.bankBalance || 0),
      stats: applyEffects(simulation.stats, { emotional: effects.emotional || 0 }),
      actionEconomy: consumeAction({ simulation, actionKey: 'explore_location' }),
      recentEvents: [
        {
          year: simulation.year,
          title: `Exploración: ${placeName}`,
          text,
          tone,
        },
        ...(simulation.recentEvents || []),
      ].slice(0, 8),
    },
    message: text,
    success: true,
    reason: 'exploration_resolved',
    outcome: effects,
  };
}
