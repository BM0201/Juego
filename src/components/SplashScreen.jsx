function SplashScreen({ onContinue }) {
  return (
    <section className="card centered">
      <p className="muted">Proyecto móvil narrativo</p>
      <h1>Crónicas de Vida</h1>
      <p>Por Estudio Aurora Interactive</p>
      <button onClick={onContinue}>Empezar</button>
    </section>
  );
}

export default SplashScreen;
