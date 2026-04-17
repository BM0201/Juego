function roleLabel(role) {
  switch (role) {
    case 'familia': return 'Familia';
    case 'amistad': return 'Amistad';
    case 'mentor': return 'Mentor';
    case 'rival': return 'Rival';
    case 'pareja': return 'Pareja';
    default: return role;
  }
}

function toneByAffinity(value) {
  if (value >= 45) return 'good';
  if (value <= -25) return 'risk';
  return 'mid';
}

function RelationshipsPanel({ relationships = [], area }) {
  return (
    <section className="card">
      <div className="life-feed-head">
        <p className="section-label">Relaciones y entorno</p>
        <span className="tiny muted">{area?.label || 'Ciudad'} · {area?.hometown || 'Sin zona'}</span>
      </div>
      <p className="tiny muted">Estos personajes influyen directamente en eventos, popups y consecuencias de largo plazo.</p>

      <ul className="event-feed">
        {relationships.slice(0, 6).map((npc) => (
          <li key={npc.id} className="event-item neutral relationship-item">
            <div>
              <strong>{npc.name}</strong>
              <p>{roleLabel(npc.role)} · Estado: {npc.status}</p>
            </div>
            <div className="relationship-score-wrap">
              <span className={`status-dot ${toneByAffinity(npc.affinity)}`} />
              <strong>{npc.affinity}</strong>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RelationshipsPanel;
