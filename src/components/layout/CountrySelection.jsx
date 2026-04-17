function CountrySelection({ options, onSelect }) {
  return (
    <section className="card">
      <h2>Selecciona país de origen</h2>
      <p className="muted">Francia 1890 es el perfil histórico más robusto por ahora.</p>
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
