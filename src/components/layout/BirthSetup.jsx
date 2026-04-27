import { useState } from 'react';
import { CENTURY_OPTIONS } from '../../data/configs/setupConfig.js';
import { DIFFICULTY_PRESETS, PLAYER_ROLES } from '../../data/configs/playerConfig.js';

function BirthSetup({ onSubmit }) {
  const [selectedCentury, setSelectedCentury] = useState(CENTURY_OPTIONS[2].label);
  const [selectedRole, setSelectedRole] = useState(PLAYER_ROLES[0].id);
  const [selectedDifficulty, setSelectedDifficulty] = useState('estadista');
  const [dynastyName, setDynastyName] = useState('');

  return (
    <section className="card">
      <h2>Configura el origen de tu dinastía histórica</h2>
      <p className="muted tiny">El siglo define el contexto global; rol y dificultad cambian cómo de dura será tu partida.</p>

      <h3>1) Siglo de inicio</h3>
      <div className="options-stack">
        {CENTURY_OPTIONS.map((century) => (
          <button
            key={century.label}
            className={`option ${selectedCentury === century.label ? 'active' : ''}`}
            onClick={() => setSelectedCentury(century.label)}
          >
            <strong>{century.icon} {century.label}</strong>
            <small>{century.start} - {century.end}</small>
            <small>{century.vibe}</small>
          </button>
        ))}
      </div>

      <label>
        2) Rol inicial
        <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
          {PLAYER_ROLES.map((role) => (
            <option key={role.id} value={role.id}>{role.label} — {role.description}</option>
          ))}
        </select>
      </label>

      <label>
        3) Dificultad
        <select value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)}>
          {DIFFICULTY_PRESETS.map((difficulty) => (
            <option key={difficulty.id} value={difficulty.id}>{difficulty.label} — {difficulty.description}</option>
          ))}
        </select>
      </label>

      <label>
        4) Nombre de dinastía (opcional)
        <input
          type="text"
          value={dynastyName}
          placeholder="Ej: Casa Monteluz"
          maxLength={28}
          onChange={(event) => setDynastyName(event.target.value)}
        />
      </label>

      <div className="tag-row">
        <span className="pill pill-eligible">Personalizable: siglo, rol, dificultad, dinastía</span>
        <span className="pill pill-random">Aleatorio: país, fecha, ciudad, contexto familiar</span>
      </div>

      <button
        onClick={() => onSubmit({
          century: selectedCentury,
          roleId: selectedRole,
          difficultyId: selectedDifficulty,
          dynastyName,
        })}
      >
        Continuar
      </button>
    </section>
  );
}

export default BirthSetup;
