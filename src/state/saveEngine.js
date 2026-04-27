const STORAGE_KEY = 'historical_sim_saves_v2';
const AUTOSAVE_SLOT_ID = 'autosave';

function nowIso() {
  return new Date().toISOString();
}

function readRawSaves() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRawSaves(slots) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

export function listSaves() {
  return readRawSaves().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function loadSave(slotId) {
  return readRawSaves().find((slot) => slot.id === slotId) || null;
}

export function upsertSave({ id, label, state, isCheckpoint = false }) {
  const slots = readRawSaves();
  const slotId = id || `save-${Math.random().toString(36).slice(2, 9)}`;
  const payload = {
    id: slotId,
    label: label || 'Crónica sin título',
    updatedAt: nowIso(),
    createdAt: slots.find((item) => item.id === slotId)?.createdAt || nowIso(),
    isCheckpoint,
    state,
  };

  const next = [...slots.filter((item) => item.id !== slotId), payload];
  writeRawSaves(next);
  return payload;
}

export function deleteSave(slotId) {
  const slots = readRawSaves().filter((slot) => slot.id !== slotId);
  writeRawSaves(slots);
}

export function autosaveYearly(state) {
  return upsertSave({
    id: AUTOSAVE_SLOT_ID,
    label: `Auto ${state.player.name} (${state.world.year})`,
    state,
    isCheckpoint: false,
  });
}

export function createCheckpoint(state) {
  return upsertSave({
    id: `checkpoint-${state.world.year}-${Math.random().toString(36).slice(2, 6)}`,
    label: `Checkpoint año ${state.world.year}`,
    state,
    isCheckpoint: true,
  });
}
