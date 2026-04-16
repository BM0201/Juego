function TutorialModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="modal card">
        <h3>Tutorial rápido</h3>
        <ul>
          <li>Las barras muestran tu estado físico, emocional y de desarrollo.</li>
          <li>Cada año eliges una decisión y avanzas el tiempo.</li>
          <li>De 0 a 5 años el impacto es mayor que en etapas posteriores.</li>
          <li>Los eventos cambian según país, año, familia y stats.</li>
        </ul>
        <button onClick={onClose}>Entendido</button>
      </section>
    </div>
  );
}

export default TutorialModal;
