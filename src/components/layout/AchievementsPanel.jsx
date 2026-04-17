function AchievementsPanel({ achievements }) {
  const catalog = achievements?.catalog || [];
  const unlockedIds = new Set(achievements?.unlockedIds || []);
  const unlocked = catalog.filter((item) => unlockedIds.has(item.id));
  const pending = catalog.filter((item) => !unlockedIds.has(item.id));

  return (
    <section className="card">
      <div className="life-feed-head">
        <p className="section-label">Logros</p>
        <strong>{achievements?.progress?.unlocked || 0}/{achievements?.progress?.total || catalog.length}</strong>
      </div>

      <div className="achievement-grid">
        {unlocked.slice(0, 6).map((item) => (
          <article key={item.id} className="achievement-chip unlocked">
            <p>{item.icon} <strong>{item.title}</strong></p>
            <small>{item.description}</small>
          </article>
        ))}
      </div>

      {pending.length ? (
        <details className="achievement-pending">
          <summary>Ver por conseguir ({pending.length})</summary>
          <ul>
            {pending.slice(0, 8).map((item) => (
              <li key={item.id}>{item.icon} {item.title}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

export default AchievementsPanel;
