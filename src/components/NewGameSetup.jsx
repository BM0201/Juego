import { useMemo } from 'react';
import { DIFFICULTY_PRESETS, DYNASTY_NAMES, ROLE_DEFINITIONS } from '../data/roles.js';
import { createPlayerProfile, createRandomAppearance, getAllowedAppearanceOptions, sanitizeAppearance } from '../core/characterEngine.js';
import CharacterEditor from './CharacterEditor.jsx';

const CENTURY_OPTIONS = [
  { id: 'XIV', label: 'Siglo XIV', year: 1350 },
  { id: 'XVI', label: 'Siglo XVI', year: 1550 },
  { id: 'XIX', label: 'Siglo XIX', year: 1850 },
  { id: 'XXI', label: 'Siglo XXI', year: 2000 },
];

function eraByYear(year) {
  if (year < 1400) return 'antigua';
  if (year < 1600) return 'medieval';
  if (year < 1800) return 'renacentista';
  if (year < 1946) return 'industrial';
  return 'moderna';
}

export default function NewGameSetup({ draft, setDraft, onStart }) {
  const era = eraByYear(draft.startYear);

  const appearanceOptions = useMemo(() => (
    getAllowedAppearanceOptions({
      era,
      roleId: draft.roleId,
      gender: draft.gender,
      legacyScore: 0,
    })
  ), [era, draft.roleId, draft.gender]);

  const updateDraft = (patch) => {
    const next = { ...draft, ...patch };
    if (patch.roleId || patch.gender || patch.startYear) {
      const nextEra = eraByYear(next.startYear);
      const fallbackAppearance = next.appearance || createRandomAppearance({ era: nextEra, roleId: next.roleId, gender: next.gender, legacyScore: 0 });
      next.appearance = sanitizeAppearance({ appearance: fallbackAppearance, era: nextEra, roleId: next.roleId, gender: next.gender, legacyScore: 0 });
    }
    setDraft(next);
  };

  const handleStart = () => {
    const profile = createPlayerProfile({
      name: draft.name,
      gender: draft.gender,
      roleId: draft.roleId,
      difficultyId: draft.difficultyId,
      dynastyName: draft.dynastyName,
      era,
      appearance: draft.appearance,
    });
    onStart({ profile, startYear: draft.startYear });
  };

  return (
    <section className="panel">
      <h3>Crear crónica histórica</h3>
      <div className="setup-grid">
        <label className="field">
          <span>Nombre</span>
          <input value={draft.name} onChange={(evt) => updateDraft({ name: evt.target.value })} placeholder="Ej. Leonor" />
        </label>

        <label className="field">
          <span>Género</span>
          <select value={draft.gender} onChange={(evt) => updateDraft({ gender: evt.target.value })}>
            <option value="m">Masculino</option>
            <option value="f">Femenino</option>
          </select>
        </label>

        <label className="field">
          <span>Época inicial</span>
          <select value={draft.startYear} onChange={(evt) => updateDraft({ startYear: Number(evt.target.value) })}>
            {CENTURY_OPTIONS.map((option) => (
              <option key={option.id} value={option.year}>{option.label} ({option.year})</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Rol social</span>
          <select value={draft.roleId} onChange={(evt) => updateDraft({ roleId: evt.target.value })}>
            {Object.values(ROLE_DEFINITIONS).map((role) => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Dificultad</span>
          <select value={draft.difficultyId} onChange={(evt) => updateDraft({ difficultyId: evt.target.value })}>
            {Object.values(DIFFICULTY_PRESETS).map((difficulty) => (
              <option key={difficulty.id} value={difficulty.id}>{difficulty.label}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Dinastía</span>
          <input list="dynasty-list" value={draft.dynastyName} onChange={(evt) => updateDraft({ dynastyName: evt.target.value })} />
          <datalist id="dynasty-list">
            {DYNASTY_NAMES.map((name) => <option key={name} value={name} />)}
          </datalist>
        </label>
      </div>

      <CharacterEditor profileDraft={draft} appearanceOptions={appearanceOptions} onPatch={updateDraft} />

      <div className="row between">
        <p className="muted">
          Rol: <strong>{ROLE_DEFINITIONS[draft.roleId].label}</strong> ·
          Dificultad: <strong>{DIFFICULTY_PRESETS[draft.difficultyId].label}</strong>
        </p>
        <button type="button" className="btn primary" onClick={handleStart}>Comenzar simulación</button>
      </div>
    </section>
  );
}
