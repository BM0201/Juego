import { useMemo, useState } from 'react';

function normalizeEntries(entries = []) {
  return entries.map((entry, index) => {
    if (typeof entry === 'string') {
      return {
        id: `legacy_${index}`,
        year: null,
        age: null,
        type: 'legacy',
        title: 'Registro',
        summary: entry,
        tone: 'neutral',
      };
    }
    return entry;
  });
}

function TimelinePanel({ entries = [], decisionHistory = [] }) {
  const [view, setView] = useState('recent');
  const normalized = useMemo(() => normalizeEntries(entries), [entries]);

  const filtered = useMemo(() => {
    const sorted = [...normalized].reverse();
    if (view === 'key') {
      return sorted.filter((entry) => /transición|logro|momento|origen/i.test(`${entry.title} ${entry.summary}`)).slice(0, 8);
    }
    return sorted.slice(0, 10);
  }, [normalized, view]);

  return (
    <section className="card">
      <div className="life-feed-head">
        <h3>Línea de vida interactiva</h3>
        <div className="timeline-switcher">
          <button className={`secondary ghost ${view === 'recent' ? 'active-filter' : ''}`} onClick={() => setView('recent')}>Recientes</button>
          <button className={`secondary ghost ${view === 'key' ? 'active-filter' : ''}`} onClick={() => setView('key')}>Momentos clave</button>
        </div>
      </div>

      <ul className="timeline">
        {filtered.map((entry) => (
          <li key={entry.id} className={`timeline-item ${entry.tone || 'neutral'}`}>
            <strong>{entry.year ? `${entry.year} · ${entry.title}` : entry.title}</strong>
            <p>{entry.summary}</p>
          </li>
        ))}
      </ul>

      {decisionHistory.length ? (
        <details className="timeline-decisions">
          <summary>Revisar decisiones pasadas</summary>
          <ul>
            {decisionHistory.slice(0, 8).map((item, index) => (
              <li key={`${item.year}-${index}`}>
                <strong>{item.year}</strong>: {item.planTitle}
                {item.popupChoice ? ` · Popup: ${item.popupChoice}` : ''}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

export default TimelinePanel;
