function DecisionPanel({ stageLabel, options, selectedDecisionId, onSelect, onAdvance }) {
  return (
    <section className="card">
      <h3>Decisión del año</h3>
      <p className="muted">Etapa jugable: {stageLabel}.</p>
      <div className="options-stack">
        {options.map((option) => (
          <button
            key={option.id}
            className={selectedDecisionId === option.id ? 'option active' : 'option'}
            onClick={() => onSelect(option.id)}
          >
            <span>{option.title}</span>
            <small>{option.summary}</small>
          </button>
        ))}
      </div>
      <button onClick={onAdvance}>Avanzar tiempo</button>
    </section>
  );
}

export default DecisionPanel;
