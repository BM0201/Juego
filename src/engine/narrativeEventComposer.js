import { NARRATIVE_EVENT_TEMPLATES } from '../data/events/narrativeEventTemplates.js';

const PLACEHOLDER_REGEX = /\[([^\]]+)\]/g;

function interpolate(value, variables) {
  if (typeof value !== 'string') return value;
  return value.replace(PLACEHOLDER_REGEX, (_, key) => {
    const replacement = variables[key];
    return replacement === undefined || replacement === null ? `[${key}]` : String(replacement);
  });
}

function hasUnresolvedPlaceholders(value) {
  return typeof value === 'string' && /\[[^\]]+\]/.test(value);
}

function normalizeTemplate(template, variables) {
  const textLines = template.textLines.map((line) => interpolate(line, variables));
  const event = {
    title: interpolate(template.title, variables),
    text: textLines.join('\n'),
    impact: interpolate(template.impact, variables),
    options: template.options.map((option) => interpolate(option, variables)),
    tone: interpolate(template.tone, variables),
    tags: [...template.tags],
  };

  const unresolvedFields = Object.entries(event)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((item, idx) => (hasUnresolvedPlaceholders(item) ? `${key}[${idx}]` : null))
          .filter(Boolean);
      }
      return hasUnresolvedPlaceholders(value) ? [key] : [];
    });

  return { event, unresolvedFields };
}

export function composeNarrativeEvent(type, variables = {}) {
  const template = NARRATIVE_EVENT_TEMPLATES[type];
  if (!template) {
    throw new Error(`Tipo de evento desconocido: ${type}`);
  }

  const { event, unresolvedFields } = normalizeTemplate(template, variables);
  return {
    ...event,
    type,
    isReady: unresolvedFields.length === 0,
    unresolvedFields,
  };
}

export function composeNarrativeEventPack(variables = {}) {
  return Object.keys(NARRATIVE_EVENT_TEMPLATES).map((type) => composeNarrativeEvent(type, variables));
}
