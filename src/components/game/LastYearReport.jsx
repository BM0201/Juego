function LastYearReport({ summary, statChanges }) {
  return (
    <section className="card compact">
      <p>
        <strong>Resultado anual:</strong> {summary}
      </p>
      {statChanges?.length ? (
        <p className="muted tiny">
          Cambios: {statChanges.join(' · ')}
        </p>
      ) : null}
    </section>
  );
}

export default LastYearReport;
