export const ITEM_CATALOG = [
  { id: 'herramienta_hierro', category: 'Herramientas', name: 'Herramienta de hierro', description: 'Mejora oficios y trabajos manuales.', baseValue: 240, rarity: 'común', effects: { development: 3 } },
  { id: 'kit_medico', category: 'Herramientas', name: 'Kit médico básico', description: 'Útil para recuperarte tras eventos duros.', baseValue: 310, rarity: 'raro', effects: { health: 5 } },
  { id: 'pan_artesanal', category: 'Comida', name: 'Pan artesanal', description: 'Comida simple que sube energía y ánimo.', baseValue: 32, rarity: 'común', effects: { health: 2, emotional: 1 } },
  { id: 'estofado_casa', category: 'Comida', name: 'Estofado de la casa', description: 'Comida caliente que fortalece el vínculo social.', baseValue: 58, rarity: 'común', effects: { health: 2, bond: 2 } },
  { id: 'libro_estrategia', category: 'Objetos de valor', name: 'Libro de estrategia', description: 'Aumenta inteligencia y visión política.', baseValue: 470, rarity: 'épico', effects: { development: 5, influence: 2 } },
  { id: 'traje_elegante', category: 'Objetos de valor', name: 'Traje elegante', description: 'Mejora apariencia e impacto social.', baseValue: 640, rarity: 'raro', effects: { looks: 6, influence: 1 } },
  { id: 'reliquia_familiar', category: 'Recuerdos', name: 'Reliquia familiar', description: 'Objeto emocional difícil de reemplazar.', baseValue: 820, rarity: 'legendario', effects: { emotional: 3, bond: 3 } },
  { id: 'pasaporte_local', category: 'Documentos', name: 'Permiso de residencia', description: 'Facilita mudanzas y trámites locales.', baseValue: 250, rarity: 'raro', effects: { influence: 1 } },
  { id: 'amuleto_luna', category: 'Objetos de valor', name: 'Amuleto lunar', description: 'Objeto especial de buena fortuna.', baseValue: 730, rarity: 'épico', effects: { emotional: 2, fame: 2 } },
  { id: 'semillas_premium', category: 'Herramientas', name: 'Semillas premium', description: 'Ideal para aldea/casa remota.', baseValue: 180, rarity: 'común', effects: { health: 1, development: 2 } },
];

export const STARTER_INVENTORY_IDS = ['pan_artesanal', 'herramienta_hierro'];
