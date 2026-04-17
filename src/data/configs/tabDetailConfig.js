export const TAB_METRIC_CONFIG = {
  Vida: [
    { key: 'health', label: 'Salud', source: 'health', causes: 'Enfermedad, descanso y alimentación diaria.', improve: 'Dormir mejor y sostener comida regular.' },
    { key: 'sleep', label: 'Sueño', source: 'sleep', causes: 'Rutina irregular, estrés del hogar.', improve: 'Establecer horarios y reducir estímulos nocturnos.' },
    { key: 'nutrition', label: 'Nutrición', source: 'nutrition', causes: 'Calidad de alimentos y escasez temporal.', improve: 'Mejorar calidad y constancia de comidas.' },
    { key: 'energy', label: 'Energía', source: 'energy', causes: 'Sueño, salud y carga diaria.', improve: 'Balancear descanso y actividad física.' },
    { key: 'physical', label: 'Resistencia física', source: 'physical', causes: 'Juego activo, salud base y fatiga.', improve: 'Incrementar actividad física gradual.' },
  ],
  Mente: [
    { key: 'stress', label: 'Estrés', source: 'stress', causes: 'Conflictos, cansancio y cambios bruscos.', improve: 'Crear rutina calma y descanso emocional.' },
    { key: 'curiosity', label: 'Curiosidad', source: 'curiosity', causes: 'Estímulos de juego y aprendizaje.', improve: 'Fomentar exploración y lectura guiada.' },
    { key: 'agency', label: 'Autocontrol', source: 'agency', causes: 'Disciplina, hábitos y consistencia.', improve: 'Pequeñas metas y reglas claras.' },
    { key: 'sociability', label: 'Sociabilidad', source: 'sociability', causes: 'Interacción con familia y pares.', improve: 'Aumentar actividades colaborativas.' },
    { key: 'emotional', label: 'Estabilidad emocional', source: 'emotional', causes: 'Apego, descanso y seguridad del entorno.', improve: 'Refuerzo afectivo y rutina predecible.' },
  ],
  Familia: [
    { key: 'motherBond', label: 'Vínculo con madre', source: 'motherBond', causes: 'Tiempo compartido y apoyo afectivo.', improve: 'Buscar momentos de cercanía diaria.' },
    { key: 'fatherBond', label: 'Vínculo con padre', source: 'fatherBond', causes: 'Disponibilidad y participación cotidiana.', improve: 'Incluir actividades conjuntas simples.' },
    { key: 'caregiverBond', label: 'Vínculo con cuidadores', source: 'caregiverBond', causes: 'Continuidad de cuidado y trato.', improve: 'Mejorar comunicación y respeto mutuo.' },
    { key: 'siblings', label: 'Relación con hermanos', source: 'siblings', causes: 'Cooperación o competencia en casa.', improve: 'Promover tareas y juegos compartidos.' },
    { key: 'homeSupport', label: 'Apoyo del hogar', source: 'homeSupport', causes: 'Recursos y estabilidad familiar.', improve: 'Organizar rutinas y apoyo básico.' },
    { key: 'discipline', label: 'Disciplina familiar', source: 'discipline', causes: 'Normas claras e implementación constante.', improve: 'Mantener reglas estables y justas.' },
  ],
  Escuela: [
    { key: 'formalSchool', label: 'Escuela formal', source: 'formalSchool', causes: 'Acceso institucional y asistencia.', improve: 'Sostener práctica de lectura y escritura.' },
    { key: 'homeLearning', label: 'Aprendizaje doméstico', source: 'homeLearning', causes: 'Transmisión de hábitos en casa.', improve: 'Agregar tareas de aprendizaje diarias.' },
    { key: 'fieldTasks', label: 'Tareas del campo', source: 'fieldTasks', causes: 'Participación productiva temprana.', improve: 'Asignar tareas progresivas y seguras.' },
    { key: 'tradeCraft', label: 'Oficio', source: 'tradeCraft', causes: 'Exposición a habilidades manuales.', improve: 'Practicar técnicas básicas con guía.' },
    { key: 'institutional', label: 'Institución religiosa/social', source: 'institutional', causes: 'Red institucional y normas externas.', improve: 'Aprovechar mentoría y estructura.' },
    { key: 'careInstitution', label: 'Hospicio/orfanato', source: 'careInstitution', causes: 'Contexto de cuidado institucional.', improve: 'Buscar referentes estables y rutina.' },
  ],
};

export const TAB_FOCUS_OPTIONS = {
  vida: [
    { id: 'mejorar_sueno', title: 'Mejorar sueño', summary: 'Regular horarios y descanso nocturno.', effects: { sleep: 9, health: 3, emotional: 2 } },
    { id: 'comer_mejor', title: 'Comer mejor', summary: 'Aumentar calidad y constancia de comidas.', effects: { health: 8, development: 3 } },
    { id: 'aumentar_resistencia', title: 'Aumentar resistencia', summary: 'Actividad física gradual y sostenida.', effects: { health: 4, sleep: -1, development: 3 } },
  ],
  mente: [
    { id: 'reducir_estres', title: 'Reducir estrés', summary: 'Rutinas más calmas y pausas de recuperación.', effects: { emotional: 7, sleep: 3 } },
    { id: 'socializar', title: 'Socializar', summary: 'Incrementar contacto positivo con pares.', effects: { emotional: 4, bond: 4, sleep: -1 } },
    { id: 'fomentar_curiosidad', title: 'Fomentar curiosidad', summary: 'Estimular preguntas y exploración guiada.', effects: { development: 6, emotional: 2 } },
  ],
  familia: [
    { id: 'obedecer', title: 'Obedecer', summary: 'Alinear conducta con normas del hogar.', effects: { bond: 3, emotional: 2 } },
    { id: 'ayudar_en_casa', title: 'Ayudar en casa', summary: 'Participar activamente en tareas.', effects: { bond: 4, development: 4 } },
    { id: 'acercarse_a_madre', title: 'Acercarse a madre', summary: 'Fortalecer vínculo con figura materna.', effects: { bond: 7, emotional: 4 } },
    { id: 'acercarse_a_padre', title: 'Acercarse a padre', summary: 'Fortalecer vínculo con figura paterna.', effects: { bond: 6, emotional: 3 } },
  ],
  escuela: [
    { id: 'aprender_lectura', title: 'Aprender lectura', summary: 'Fortalecer alfabetización temprana.', effects: { development: 8, emotional: 1 } },
    { id: 'aprender_cosecha', title: 'Centrarse en cosechar', summary: 'Priorizar rendimiento en cosecha familiar.', effects: { development: 5, health: 1 } },
    { id: 'aprender_a_arar', title: 'Aprender a arar la tierra', summary: 'Entrenar técnica de arado con supervisión.', effects: { development: 6, health: 2, sleep: -1 } },
    { id: 'mejorar_disciplina', title: 'Mejorar disciplina', summary: 'Sostener hábitos de estudio/trabajo.', effects: { development: 6, sleep: -1, emotional: 2 } },
    { id: 'obedecer_minimo', title: 'Obedecer pero hacer el mínimo', summary: 'Cumplir con resistencia pasiva.', effects: { bond: 1, emotional: -1, development: 1 } },
    { id: 'evitar_trabajo', title: 'Evitar el trabajo', summary: 'Reducir participación en tareas del campo.', effects: { sleep: 2, bond: -4, emotional: -2 } },
    { id: 'ayudar_con_entusiasmo', title: 'Ayudar con entusiasmo', summary: 'Involucrarte activamente y con iniciativa.', effects: { bond: 5, development: 4, sleep: -2 } },
    { id: 'aprendizaje_domestico', title: 'Aprendizaje doméstico', summary: 'Entrenar en casa habilidades básicas.', effects: { development: 5, bond: 2 } },
  ],
};

export const TAB_TRAITS = {
  Mente: ['Curiosidad emergente', 'Autocontrol en desarrollo', 'Sensibilidad al entorno familiar'],
};
