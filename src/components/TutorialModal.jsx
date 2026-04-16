function TutorialModal({ steps, onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="modal card">
        <h3>Tutorial rápido</h3>
        <ul>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <button onClick={onClose}>Entendido</button>
      </section>
    </div>
  );
}

export default TutorialModal;
