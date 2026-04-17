import { applyEffects } from './statExplanationEngine.js';
import { findCatalogItem, getDynamicPrice } from './economyEngine.js';
import { buildMoveOptions, createVillageState } from './villageEngine.js';
import { getAreaByKey } from '../data/configs/locationConfig.js';
import { getPolicyOptions, resolvePoliticalLevel } from './politicsEngine.js';

function clampInfluence(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function updateNpcList(list, npcId, updater) {
  return list.map((npc) => (npc.id === npcId ? updater(npc) : npc));
}

function resolveInteraction(interactionType) {
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
  const targetArea = getAreaByKey(targetAreaKey);
  const options = buildMoveOptions({ country: character.country, year: simulation.year, currentAreaKey: simulation.area.key });
  const moveOption = options.find((item) => item.key === targetArea.key);
  if (!moveOption || moveOption.isCurrent) {
    return { simulation, message: 'Ya te encuentras en esa ubicación.' };
  }

  const bankBalance = (simulation.bankBalance || 0) - moveOption.moveCost;
  if (bankBalance < 0) {
    return { simulation, message: 'No tienes suficiente balance para mudarte.' };
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
      yearsInLocation: 0,
      relationships: (simulation.relationships || []).map((npc) => (
        npc.role === 'amistad' ? { ...npc, affinity: Math.max(-20, npc.affinity - 6) } : npc
      )),
      recentEvents: [
        {
          year: simulation.year,
          title: 'Mudanza',
          text: `Te mudaste a ${targetArea.label} (${moveOption.hometown}). Coste total: $${moveOption.moveCost}.`,
          tone: 'neutral',
        },
        ...(simulation.recentEvents || []),
      ].slice(0, 8),
    },
    message: `Te mudaste a ${targetArea.label}.`,
  };
}

export function interactWithVillageNpc({ simulation, npcId, interactionType }) {
  const target = (simulation.village?.npcs || []).find((npc) => npc.id === npcId);
  if (!target) return { simulation, message: 'NPC no encontrado.' };

  const impact = resolveInteraction(interactionType);
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

  return {
    simulation: {
      ...simulation,
      bankBalance: (simulation.bankBalance || 0) + (impact.bankDelta || 0),
      influence: clampInfluence((simulation.influence || 0) + impact.influence),
      village: {
        ...simulation.village,
        npcs: updatedVillageNpcs,
      },
      relationships,
    },
    message: impact.text,
  };
}

export function tradeWithNpc({ simulation, npcId, itemId, mode = 'buy', barterItemId = null }) {
  const npc = (simulation.village?.npcs || []).find((item) => item.id === npcId);
  if (!npc) return { simulation, message: 'No puedes comerciar con ese NPC.' };

  const sourceInventory = mode === 'buy' ? npc.inventory || [] : simulation.inventory || [];
  const item = sourceInventory.find((entry) => entry.id === itemId) || findCatalogItem(itemId);
  if (!item) return { simulation, message: 'Objeto no disponible.' };

  const price = getDynamicPrice({ baseValue: item.baseValue, relationAffinity: npc.relation || 0, mode });
  if (mode === 'buy' && (simulation.bankBalance || 0) < price) {
    return { simulation, message: 'Fondos insuficientes para comprar.' };
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
    },
    message: mode === 'buy' ? `Compraste ${item.name} por $${price}.` : `Vendiste ${item.name} por $${price}.`,
  };
}

export function setOccupation({ simulation, occupation }) {
  return {
    ...simulation,
    occupation,
    recentEvents: [
      {
        year: simulation.year,
        title: 'Cambio de ocupación',
        text: `Ahora trabajas como ${occupation.title}.`,
        tone: 'positive',
      },
      ...(simulation.recentEvents || []),
    ].slice(0, 8),
  };
}

export function enactPolicy({ simulation, policyId }) {
  const level = resolvePoliticalLevel(simulation.influence || 0);
  const policy = getPolicyOptions(level.key).find((entry) => entry.id === policyId);
  if (!policy) {
    return { simulation, message: 'No puedes aplicar esa política aún.' };
  }

  const effects = policy.effects || {};
  const stats = applyEffects(simulation.stats, effects);
  const bankDelta = effects.bankBalance || 0;

  return {
    simulation: {
      ...simulation,
      stats,
      bankBalance: (simulation.bankBalance || 0) + bankDelta,
      influence: clampInfluence((simulation.influence || 0) + (effects.influence || 0)),
      politicalLevel: resolvePoliticalLevel((simulation.influence || 0) + (effects.influence || 0)).key,
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
  };
}
