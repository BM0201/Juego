const CATEGORY_LABELS = {
  economica: 'Económica',
  social: 'Social',
  politica: 'Política',
  militar: 'Militar',
  diplomatica: 'Diplomática',
  sanitaria: 'Sanitaria',
  consecuencia: 'Consecuencia',
};

export default function EventCard({ event, onDecide }) {
  if (!event) {
    return (
      <section className="panel">
        <h3>Sin evento activo</h3>
        <p className="muted">Avanza al siguiente año para generar un nuevo evento histórico.</p>
      </section>
    );
  }

  return (
    <section className="panel event-card fade-in">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p className="muted tiny">
        Año {event.year} · {event.type} · {event.categories?.map((category) => CATEGORY_LABELS[category] || category).join(', ')}
      </p>

      <div className="choice-grid">
        {event.options.map((option) => (
          <button key={option.id} type="button" className="btn choice" onClick={() => onDecide(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
