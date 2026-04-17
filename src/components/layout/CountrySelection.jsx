import { LOCATION_AREAS } from '../../data/configs/locationConfig.js';

function CountrySelection({ options, selectedArea, onAreaChange, onSelect }) {
  return (
    <section className="card">
      <h2>Selecciona origen cultural</h2>
      <p className="muted">Define primero tu entorno inicial (ciudad grande, ciudad pequeña, aldea o casa remota) y luego tu país de origen.</p>

      <div className="options-stack">
        {LOCATION_AREAS.map((area) => (
          <button
            key={area.key}
            className={`option ${selectedArea === area.key ? 'active' : ''}`}
            onClick={() => onAreaChange(area.key)}
          >
            <strong>{area.label}</strong>
            <small>{area.description}</small>
          </button>
        ))}
      </div>

      <h3>País</h3>
      <p className="muted tiny">Francia 1890 sigue siendo el perfil histórico más robusto, pero puedes explorar otros contextos.</p>
      <div className="options-stack">
        {options.map((country) => (
          <button key={country} className="option" onClick={() => onSelect(country)}>
            {country}
          </button>
        ))}
      </div>
    </section>
  );
}

export default CountrySelection;
