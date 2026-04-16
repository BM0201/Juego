function CountrySelection({ options, selected, onSelect }) {
  return (
    <section className="card">
      <h2>Selecciona país de origen</h2>
      <p className="muted">Mostramos 3 países coherentes con la época elegida.</p>
      <div className="options-stack">
        {options.map((country) => (
          <button
            key={country}
            className={selected === country ? 'option active' : 'option'}
            onClick={() => onSelect(country)}
          >
            {country}
          </button>
        ))}
      </div>
    </section>
  );
}

export default CountrySelection;
