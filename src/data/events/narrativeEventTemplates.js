export const NARRATIVE_EVENT_TEMPLATES = {
  figureRise: {
    title: 'Entró sonriendo, salió con agenda',
    textLines: [
      'En [PAIS], año [AÑO], [PERSONAJE] ([CARGO]) convierte [HECHO] en un acto de precisión pública.',
      'Habla poco, ocupa mucho espacio, y hasta el silencio le sale con titulares.',
      'No promete cambiarlo todo; parece más bien que el país empieza a tomar su forma.',
    ],
    impact: '[EFECTO] Además sube la polarización y la reputación política pesa más en cada decisión.',
    options: [
      'Acercarme al nuevo círculo de poder.',
      'Observar y guardar margen de maniobra.',
      'Marcar distancia y sostener perfil cívico.',
    ],
    tone: 'Carismático, agudo y ligeramente juguetón; alerta elegante sin crueldad.',
    tags: ['figura_en_ascenso', 'poder', 'opinion_publica'],
  },
  nationalMilestone: {
    title: 'El país cambió de marcha',
    textLines: [
      '[AÑO], [PAIS]: ocurre [EVENTO_REAL] y el ambiente nacional cambia de golpe.',
      'Lo [TIPO_CAMBIO] deja de ser debate de élites y entra en la mesa familiar.',
      'No parece un capítulo de libro: se nota en sueldos, trámites y conversaciones.',
    ],
    impact: '[EFECTO] Se reajustan oportunidades laborales, prestigio social y acceso institucional.',
    options: [
      'Aprovechar el cambio cuanto antes.',
      'Esperar señales y actuar con cautela.',
      'Blindar la economía familiar y avanzar por tramos.',
    ],
    tone: 'Con personalidad, inteligente, ligeramente juguetón y claro.',
    tags: ['hito_nacional', 'cambio_de_epoca', 'vida_cotidiana'],
  },
  crisis: {
    title: 'El aviso llegó antes que el pan',
    textLines: [
      '[AÑO], [PAIS]: [EVENTO_REAL] instala miedo, presión y órdenes nuevas cada semana.',
      'Con [EDAD] años, [SEXO], clase [CLASE], en [OFICIO], no hace falta ir al frente para sentirlo.',
      'El parte oficial promete normalidad; la cola del racionamiento opina distinto.',
    ],
    impact: '[EFECTO] Hay escasez, controles más duros y mayor riesgo de separación familiar.',
    options: [
      'Cumplir y no destacar.',
      'Mover contactos para reducir exposición.',
      'Resistir en pequeño y proteger al hogar.',
    ],
    tone: 'Humano, tenso e ironía seca; sin banalizar tragedias.',
    tags: ['crisis_nacional', 'reclutamiento', 'racionamiento'],
  },
  modernity: {
    title: 'El futuro hizo ruido en la esquina',
    textLines: [
      '[AÑO], [PAIS]: llega [TECNOLOGIA] y la rutina empieza a moverse de sitio.',
      'Para la clase [CLASE], con [EDAD] años, suena a oportunidad… y a manual viejo.',
      'Todavía no domina todo, pero ya decide quién se adapta primero.',
    ],
    impact: '[EFECTO] Se desbloquean trabajos nuevos y algunos oficios tradicionales pierden valor.',
    options: [
      'Adoptar temprano y aprender rápido.',
      'Esperar a que el mercado se estabilice.',
      'Combinar método tradicional con herramientas nuevas.',
    ],
    tone: 'Encantador, curioso, cálido y un poco tonto con criterio.',
    tags: ['modernidad', 'tecnologia', 'movilidad_social'],
  },
  millennium2000: {
    title: 'Nivel 2000: guardado exitoso',
    textLines: [
      '[PAIS], año 2000: llegaste al cambio de milenio con [EDAD] años y clase [CLASE].',
      '[CONTEXTO] ahora se lee distinto: cambió la época, y también el ritmo del país.',
      'Internet asoma en casa, trabajo y cibercafé; el Y2K no tumbó el mundo, solo subió la conversación.',
    ],
    impact: '[EFECTO] Se habilitan oportunidades digitales tempranas y nueva brecha generacional.',
    options: [
      'Subirme al internet temprano.',
      'Usarlo con equilibrio y bajo riesgo.',
      'Seguir con lo conocido y observar.',
    ],
    tone: 'Carismático, nostálgico, ingenioso y con encanto.',
    tags: ['milenio2000', 'internet_temprano', 'recompensa_narrativa'],
  },
};
