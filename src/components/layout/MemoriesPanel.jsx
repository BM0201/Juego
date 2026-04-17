function MemoriesPanel({ memories = [], keyMoments = [] }) {
  return (
    <section className="card">
      <p className="section-label">Momentos clave y recuerdos</p>
      <div className="memory-columns">
        <article>
          <h3>Momentos clave</h3>
          {keyMoments.length ? (
            <ul className="event-feed">
              {keyMoments.slice(0, 4).map((moment) => (
                <li key={moment.id} className={`event-item ${moment.tone || 'neutral'}`}>
                  <div>
                    <strong>{moment.title}</strong>
                    <p>{moment.summary}</p>
                  </div>
                  <small>{moment.year}</small>
                </li>
              ))}
            </ul>
          ) : <p className="muted tiny">Aún no hay momentos clave registrados.</p>}
        </article>

        <article>
          <h3>Recuerdos</h3>
          {memories.length ? (
            <ul className="event-feed">
              {memories.slice(0, 4).map((memory) => (
                <li key={memory.id} className={`event-item ${memory.tone || 'neutral'}`}>
                  <div>
                    <strong>{memory.title}</strong>
                    <p>{memory.description}</p>
                  </div>
                  <small>{memory.year}</small>
                </li>
              ))}
            </ul>
          ) : <p className="muted tiny">Los recuerdos aparecerán cuando vivas eventos de alto impacto.</p>}
        </article>
      </div>
    </section>
  );
}

export default MemoriesPanel;
