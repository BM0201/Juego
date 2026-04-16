function CountrySelection({ options, onSelect }) {
  return (
    <section className="card">
      <h2>Selecciona país de origen</h2>
      <p className="muted">Para esta iteración, Francia 1890 es el perfil histórico más robusto.</p>
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
