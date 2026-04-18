const EDUCATION_ERAS = [
  {
    key: 'aprendizaje_preindustrial',
    minYear: 1600,
    maxYear: 1799,
    label: 'Aprendizaje de oficio y tutoría',
    formalEducationStartAge: 11,
    learningMultiplier: 0.72,
    pathways: ['Oficio familiar', 'Tutoría religiosa', 'Aprendizaje por observación'],
    occupationBias: { oficio: 1.2, academico: 0.6 },
  },
  {
    key: 'educacion_industrial',
    minYear: 1800,
    maxYear: 1919,
    label: 'Escolarización básica en expansión',
    formalEducationStartAge: 9,
    learningMultiplier: 0.86,
    pathways: ['Escuela elemental', 'Aprendiz técnico', 'Gremio local'],
    occupationBias: { oficio: 1.05, academico: 0.85 },
  },
  {
    key: 'educacion_moderna',
    minYear: 1920,
    maxYear: 1989,
    label: 'Educación moderna estructurada',
    formalEducationStartAge: 7,
    learningMultiplier: 1,
    pathways: ['Escuela pública', 'Formación técnica', 'Bachillerato'],
    occupationBias: { oficio: 0.95, academico: 1 },
  },
  {
    key: 'educacion_contemporanea',
    minYear: 1990,
    maxYear: 2200,
    label: 'Educación masiva y especialización',
    formalEducationStartAge: 6,
    learningMultiplier: 1.1,
    pathways: ['Escuela + digital', 'Formación profesional', 'Universidad'],
    occupationBias: { oficio: 0.9, academico: 1.15 },
  },
];

export function resolveEducationContext({ year = 1900, age = 0 }) {
  const era = EDUCATION_ERAS.find((item) => year >= item.minYear && year <= item.maxYear) || EDUCATION_ERAS[2];
  const formalAccess = age >= era.formalEducationStartAge;
  return {
    ...era,
    formalAccess,
    restrictionReason: formalAccess
      ? 'Acceso formal disponible para tu edad y época.'
      : `En esta época la educación formal empieza cerca de los ${era.formalEducationStartAge} años.`,
  };
}
