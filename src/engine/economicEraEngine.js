const ECONOMIC_ERAS = [
  {
    key: 'preindustrial',
    label: 'Economía preindustrial',
    minYear: 1600,
    maxYear: 1799,
    internalPriceMultiplier: 0.3,
    internalSalaryMultiplier: 0.28,
    displayRate: 12,
    currencies: {
      Francia: { symbol: '₶', label: 'livres' },
      España: { symbol: '₥', label: 'maravedíes' },
      Alemania: { symbol: '₮', label: 'thalers' },
      Italia: { symbol: '₣', label: 'florines' },
      'Reino Unido': { symbol: '£', label: 'libras antiguas' },
      default: { symbol: '¤', label: 'monedas' },
    },
  },
  {
    key: 'industrial',
    label: 'Industrialización temprana',
    minYear: 1800,
    maxYear: 1919,
    internalPriceMultiplier: 0.55,
    internalSalaryMultiplier: 0.52,
    displayRate: 5,
    currencies: {
      Francia: { symbol: '₣', label: 'francos históricos' },
      España: { symbol: '₧', label: 'pesetas históricas' },
      Alemania: { symbol: 'ℳ', label: 'marcos' },
      Italia: { symbol: '₤', label: 'liras históricas' },
      'Reino Unido': { symbol: '£', label: 'libras' },
      default: { symbol: '$', label: 'moneda industrial' },
    },
  },
  {
    key: 'moderna',
    label: 'Economía moderna',
    minYear: 1920,
    maxYear: 1989,
    internalPriceMultiplier: 0.82,
    internalSalaryMultiplier: 0.88,
    displayRate: 1.8,
    currencies: {
      Francia: { symbol: '₣', label: 'francos modernos' },
      España: { symbol: '₧', label: 'pesetas' },
      Alemania: { symbol: 'DM', label: 'marcos alemanes' },
      Italia: { symbol: '₤', label: 'liras' },
      'Reino Unido': { symbol: '£', label: 'libras' },
      default: { symbol: '$', label: 'moneda moderna' },
    },
  },
  {
    key: 'contemporanea',
    label: 'Economía contemporánea',
    minYear: 1990,
    maxYear: 2200,
    internalPriceMultiplier: 1,
    internalSalaryMultiplier: 1,
    displayRate: 1,
    currencies: {
      Francia: { symbol: '€', label: 'euros' },
      España: { symbol: '€', label: 'euros' },
      Alemania: { symbol: '€', label: 'euros' },
      Italia: { symbol: '€', label: 'euros' },
      'Reino Unido': { symbol: '£', label: 'libras' },
      default: { symbol: '$', label: 'créditos' },
    },
  },
];

export function resolveEconomicEra(year = 1900) {
  return ECONOMIC_ERAS.find((era) => year >= era.minYear && year <= era.maxYear) || ECONOMIC_ERAS[ECONOMIC_ERAS.length - 1];
}

export function getEconomicContext({ year, country }) {
  const era = resolveEconomicEra(year);
  const currency = era.currencies[country] || era.currencies.default;
  return {
    eraKey: era.key,
    eraLabel: era.label,
    currencySymbol: currency.symbol,
    currencyLabel: currency.label,
    internalPriceMultiplier: era.internalPriceMultiplier,
    internalSalaryMultiplier: era.internalSalaryMultiplier,
    displayRate: era.displayRate,
  };
}

export function scaleInternalPrice(baseValue = 0, context) {
  return Math.max(1, Math.round(baseValue * (context?.internalPriceMultiplier || 1)));
}

export function scaleInternalSalary(baseValue = 0, context) {
  return Math.max(0, Math.round(baseValue * (context?.internalSalaryMultiplier || 1)));
}

export function scaleInternalDelta(baseValue = 0, context) {
  const multiplier = context?.internalPriceMultiplier || 1;
  if (baseValue === 0) return 0;
  const raw = Math.round(Math.abs(baseValue) * multiplier);
  return baseValue > 0 ? Math.max(1, raw) : -Math.max(1, raw);
}

export function formatCurrencyByContext(value = 0, context = null) {
  const safeValue = Math.max(0, Math.round(value));
  const displayRate = context?.displayRate || 1;
  const displayValue = Math.round(safeValue * displayRate);
  const symbol = context?.currencySymbol || '$';
  const number = new Intl.NumberFormat('es-ES').format(displayValue);
  return `${symbol}${number}`;
}
