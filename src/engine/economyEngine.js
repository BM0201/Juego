import { ITEM_CATALOG, STARTER_INVENTORY_IDS } from '../data/economy/itemCatalog.js';
import { getEconomicContext, scaleInternalPrice } from './economicEraEngine.js';

function cloneItem(item) {
  return { ...item };
}

export function createStarterInventory() {
  return STARTER_INVENTORY_IDS
    .map((id) => ITEM_CATALOG.find((item) => item.id === id))
    .filter(Boolean)
    .map(cloneItem);
}

export function findCatalogItem(itemId) {
  return ITEM_CATALOG.find((item) => item.id === itemId) || null;
}

export function buildMerchantInventory(seed = 1) {
  const start = Math.abs(seed) % ITEM_CATALOG.length;
  const inventory = [];
  for (let i = 0; i < 4; i += 1) {
    inventory.push(cloneItem(ITEM_CATALOG[(start + i * 2) % ITEM_CATALOG.length]));
  }
  return inventory;
}

export function getDynamicPrice({ baseValue = 0, relationAffinity = 0, mode = 'buy', year = 1900, country = '' }) {
  const affinityDiscount = Math.max(-0.25, Math.min(0.25, relationAffinity / 400));
  const modeMultiplier = mode === 'sell' ? 0.6 : 1.05;
  const context = getEconomicContext({ year, country });
  const eraAdjusted = scaleInternalPrice(baseValue, context);
  return Math.max(2, Math.round(eraAdjusted * modeMultiplier * (1 - affinityDiscount)));
}

export function groupInventory(inventory = []) {
  return inventory.reduce((acc, item) => {
    const category = item.category || 'Otros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});
}
