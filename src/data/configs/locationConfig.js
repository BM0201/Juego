export const LOCATION_AREAS = [
  {
    key: 'ciudad_grande',
    label: 'Ciudad Grande',
    description: 'Gran densidad urbana, más trabajos, ritmo alto y eventos impredecibles.',
    moveCost: 7200,
    tags: ['urbano', 'caotico', 'oportunidades_altas'],
    eventBias: { job: 1.4, community: 0.8, chaos: 1.35, nature: 0.4 },
    defaultHometowns: ['Berlín', 'París', 'Londres', 'Madrid', 'Roma', 'Buenos Aires'],
  },
  {
    key: 'ciudad_pequena',
    label: 'Ciudad Pequeña',
    description: 'Balance entre oportunidades laborales y vida social estable.',
    moveCost: 3800,
    tags: ['mixto', 'estable'],
    eventBias: { job: 1.1, community: 1.1, chaos: 0.9, nature: 0.8 },
    defaultHometowns: ['Toledo', 'León', 'Bremen', 'Lille', 'Turín', 'Granada'],
  },
  {
    key: 'aldea',
    label: 'Aldea / Pueblo',
    description: 'Comunidad cerrada, pocos empleos formales, relaciones profundas y eventos comunales.',
    moveCost: 1900,
    tags: ['comunidad', 'tradicion'],
    eventBias: { job: 0.7, community: 1.35, chaos: 0.6, nature: 1.1 },
    defaultHometowns: ['Santa Lucía', 'Valle Verde', 'San Miguel', 'La Loma', 'El Molino', 'Ribera Alta'],
  },
  {
    key: 'casa_remota',
    label: 'Casa Remota',
    description: 'Aislamiento, autosuficiencia y eventos ligados a clima y naturaleza.',
    moveCost: 1200,
    tags: ['aislamiento', 'naturaleza'],
    eventBias: { job: 0.45, community: 0.65, chaos: 0.45, nature: 1.45 },
    defaultHometowns: ['Bosque Norte', 'Río Frío', 'Monte Azul', 'Sierra Lejana', 'Punta Brava', 'Las Rocas'],
  },
];

const COUNTRY_HOMETOWNS = {
  Francia: {
    ciudad_grande: ['París', 'Lyon', 'Marsella', 'Lille'],
    ciudad_pequena: ['Tours', 'Dijon', 'Rennes', 'Amiens'],
    aldea: ['Saint-Éloi', 'Montclair', 'Boisvert', 'Lacroux'],
    casa_remota: ['Refugio de Ardèche', 'Cabaña del Jura', 'Valle de Lozère'],
  },
  España: {
    ciudad_grande: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
    ciudad_pequena: ['León', 'Toledo', 'Cádiz', 'Oviedo'],
    aldea: ['Valdeverde', 'San Pedro del Monte', 'La Vega Alta', 'Río Claro'],
    casa_remota: ['Sierra Nevada Norte', 'Caserío del Ebro', 'La Cumbre'],
  },
  Alemania: {
    ciudad_grande: ['Berlín', 'Hamburgo', 'Múnich', 'Colonia'],
    ciudad_pequena: ['Bremen', 'Leipzig', 'Potsdam', 'Heidelberg'],
    aldea: ['Waldheim', 'Steinbach', 'Hohenfeld', 'Lindenau'],
    casa_remota: ['Bosque Negro', 'Cabaña de Harz', 'Valle de Baviera'],
  },
  'Reino Unido': {
    ciudad_grande: ['Londres', 'Manchester', 'Birmingham', 'Liverpool'],
    ciudad_pequena: ['York', 'Bath', 'Canterbury', 'Norwich'],
    aldea: ['Oakbridge', 'Riverford', 'North Hollow', 'Millbrook'],
    casa_remota: ['Highlands Shelter', 'Cabin in Snowdonia', 'Cornwall Moor'],
  },
  Italia: {
    ciudad_grande: ['Roma', 'Milán', 'Nápoles', 'Turín'],
    ciudad_pequena: ['Siena', 'Parma', 'Bérgamo', 'Modena'],
    aldea: ['San Lorenzo', 'Valle Bianca', 'Monteverde', 'Rocca Alta'],
    casa_remota: ['Refugio Alpino', 'Casa del Etna', 'Abruzzo Norte'],
  },
};

function seededIndex(seed, length) {
  if (!length) return 0;
  return Math.abs(seed % length);
}

function getHometownPool(country, area) {
  return COUNTRY_HOMETOWNS[country]?.[area.key] || area.defaultHometowns;
}

export function resolveHometown({ areaKey, country, year, randomSeed = null }) {
  const area = LOCATION_AREAS.find((item) => item.key === areaKey) || LOCATION_AREAS[0];
  const names = getHometownPool(country, area);

  if (!names.length) return 'Lugar desconocido';

  if (typeof randomSeed === 'number') {
    return names[seededIndex(randomSeed, names.length)];
  }

  const seed = year * 31 + country.length * 17 + area.key.length * 13;
  return names[seededIndex(seed, names.length)];
}

export function getAreaByKey(areaKey) {
  return LOCATION_AREAS.find((item) => item.key === areaKey) || LOCATION_AREAS[0];
}
