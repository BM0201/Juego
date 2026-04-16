function TimelineView({ entries }) {
  return (
    <section className="card">
      <h3>Línea de vida</h3>
      <ul className="timeline">
        {entries.slice(-7).map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>
    </section>
  );
}

export default TimelineView;
