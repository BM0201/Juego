import AvatarRenderer from './AvatarRenderer.jsx';
import { APPEARANCE_COLORS } from '../data/appearanceCatalog.js';

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(evt) => onChange(evt.target.value)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function ColorRow({ label, values, value, onChange }) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="color-row">
        {values.map((color) => (
          <button
            type="button"
            key={color}
            className={`color-dot ${value === color ? 'active' : ''}`}
            style={{ background: color }}
            onClick={() => onChange(color)}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function CharacterEditor({ profileDraft, appearanceOptions, onPatch }) {
  const appearance = profileDraft.appearance;

  return (
    <section className="panel editor-grid">
      <div>
        <h3>Editor visual del personaje</h3>
        <p className="muted">Opciones filtradas por época y rol social. Restricciones reales activas.</p>

        <SelectField
          label="Corte de pelo"
          value={appearance.hairStyleId}
          onChange={(value) => onPatch({ appearance: { ...appearance, hairStyleId: value } })}
          options={appearanceOptions.hairStyles}
        />

        <SelectField
          label="Barba"
          value={appearance.beardStyleId}
          onChange={(value) => onPatch({ appearance: { ...appearance, beardStyleId: value } })}
          options={appearanceOptions.beardStyles}
        />

        <SelectField
          label="Accesorio"
          value={appearance.accessoryId}
          onChange={(value) => onPatch({ appearance: { ...appearance, accessoryId: value } })}
          options={appearanceOptions.accessories}
        />

        <SelectField
          label="Ropa"
          value={appearance.clothingId}
          onChange={(value) => onPatch({ appearance: { ...appearance, clothingId: value } })}
          options={appearanceOptions.clothing}
        />

        <ColorRow
          label="Color de pelo"
          values={APPEARANCE_COLORS.hair}
          value={appearance.hairColor}
          onChange={(value) => onPatch({ appearance: { ...appearance, hairColor: value } })}
        />

        <ColorRow
          label="Color de ojos"
          values={APPEARANCE_COLORS.eyes}
          value={appearance.eyeColor}
          onChange={(value) => onPatch({ appearance: { ...appearance, eyeColor: value } })}
        />

        <ColorRow
          label="Tono de piel"
          values={APPEARANCE_COLORS.skin}
          value={appearance.skinTone}
          onChange={(value) => onPatch({ appearance: { ...appearance, skinTone: value } })}
        />
      </div>

      <div className="avatar-preview">
        <AvatarRenderer appearance={appearance} name={profileDraft.name} age={16} />
        <small className="muted">Vista previa en tiempo real</small>
      </div>
    </section>
  );
}
