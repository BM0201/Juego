function DecisionPlanner({
  stageLabel,
  options,
  selectedDecisionId,
  onSelect,
  onPrimaryAction,
  primaryLabel = 'Guardar planificación',
  emptyMessage = 'No hay opciones disponibles en esta etapa.',
}) {
  return (
    <section className="card">
      <h3>Plan anual</h3>
      <p className="muted">Etapa jugable: {stageLabel}.</p>
      <div className="options-stack">
        {options.length ? options.map((option) => (
          <button
            key={option.id}
            className={selectedDecisionId === option.id ? 'option active' : 'option'}
            onClick={() => onSelect(option.id)}
          >
            <span>{option.title}</span>
            <small>{option.summary}</small>
          </button>
        )) : <p className="tiny muted">{emptyMessage}</p>}
      </div>
      <button onClick={onPrimaryAction}>{primaryLabel}</button>
    </section>
  );
}

export default DecisionPlanner;
