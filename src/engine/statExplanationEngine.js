export const STAT_META = {
  health: { label: 'Salud', hint: 'Resistencia física y riesgo de enfermedad.' },
  sleep: { label: 'Sueño', hint: 'Calidad del descanso y recuperación diaria.' },
  bond: { label: 'Vínculo', hint: 'Seguridad afectiva con cuidadores cercanos.' },
  development: { label: 'Desarrollo', hint: 'Progreso motor, cognitivo y social.' },
  emotional: { label: 'Mente', hint: 'Estabilidad emocional y regulación interna.' },
};

export const BASE_STATS = {
  health: 58,
  sleep: 56,
  bond: 52,
  development: 50,
  emotional: 50,
};

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

export function applyEffects(stats, effects = {}, multiplier = 1) {
  const next = { ...stats };
  Object.keys(STAT_META).forEach((key) => {
    next[key] = clamp(next[key] + (effects[key] || 0) * multiplier);
  });
  return next;
}

export function getImpactMultiplier(age) {
  if (age <= 5) return 1.45;
  if (age <= 11) return 1.15;
  return 1;
}

export function getBarTone(value) {
  if (value >= 75) return 'good';
  if (value >= 45) return 'mid';
  return 'risk';
}

export function summarizeStatChanges(before, after) {
  return Object.entries(STAT_META)
    .map(([key, meta]) => {
      const diff = after[key] - before[key];
      if (!diff) return null;
      const signal = diff > 0 ? '+' : '';
      return `${meta.label} ${signal}${diff}`;
    })
    .filter(Boolean);
}
