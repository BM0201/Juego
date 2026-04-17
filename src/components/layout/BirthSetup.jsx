import { useState } from 'react';
import { CENTURY_OPTIONS } from '../../data/configs/setupConfig.js';

function BirthSetup({ onSubmit }) {
  const [selectedCentury, setSelectedCentury] = useState(CENTURY_OPTIONS[2].label);

  return (
    <section className="card">
      <h2>Escoge el siglo en el que deseas iniciar tu linaje</h2>
      <p className="muted">
        ✅ <strong>Elegible:</strong> solo el siglo.
      </p>
      <p className="muted tiny" title="Mes, día, país, tipo de ubicación y ciudad se generan automáticamente para que cada partida sea única.">
        🎲 <strong>Aleatorio:</strong> año exacto, fecha de nacimiento, país y ubicación inicial.
      </p>

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

      <div className="tag-row">
        <span className="pill pill-eligible">Elegible por jugador</span>
        <span className="pill pill-random">Generado aleatoriamente</span>
      </div>

      <button onClick={() => onSubmit(selectedCentury)}>Continuar</button>
    </section>
  );
}

export default BirthSetup;
