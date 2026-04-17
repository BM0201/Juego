function PopupEventModal({ popupEvent, onChoose }) {
  if (!popupEvent) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal card">
        <h3>Decisión urgente</h3>
        <p>{popupEvent.prompt}</p>
        <p className="tiny muted">Debes elegir ahora. Este suceso no forma parte de la planificación anual.</p>
        <div className="options-stack">
          {popupEvent.choices.map((choice) => (
            <button key={choice.id} className="option" onClick={() => onChoose(choice.id)}>
              <span>{choice.label}</span>
              <small>{choice.hint}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PopupEventModal;
