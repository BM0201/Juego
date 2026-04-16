function FamilySetup({ condition, socialClass, onContinue }) {
  return (
    <section className="card">
      <h2>Contexto familiar generado</h2>
      <p>
        <strong>Clase social:</strong> {socialClass}
      </p>
      <p>
        <strong>Condición familiar:</strong> {condition}
      </p>
      <button onClick={onContinue}>Entrar al juego</button>
    </section>
  );
}

export default FamilySetup;
