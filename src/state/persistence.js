const SAVE_KEY = 'cronicas_save_v1';
const SAVE_SCHEMA_VERSION = 1;

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function getSaveMetadata() {
  return { key: SAVE_KEY, version: SAVE_SCHEMA_VERSION };
}

export function loadGameSnapshot() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isObject(parsed) || parsed.version !== SAVE_SCHEMA_VERSION || !isObject(parsed.payload)) {
      return null;
    }

    if (!isObject(parsed.payload.character) || !isObject(parsed.payload.simulation)) {
      return null;
    }

    return parsed.payload;
  } catch (_error) {
    return null;
  }
}

export function saveGameSnapshot(payload) {
  if (!isObject(payload) || !isObject(payload.character) || !isObject(payload.simulation)) return;
  const serialized = JSON.stringify({
    version: SAVE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    payload,
  });
  window.localStorage.setItem(SAVE_KEY, serialized);
}

export function clearGameSnapshot() {
  window.localStorage.removeItem(SAVE_KEY);
}

