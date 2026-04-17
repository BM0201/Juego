function SplashScreen({ onContinue }) {
  return (
    <section className="card centered">
      <p className="muted">Simulador narrativo histórico</p>
      <h1>Crónicas de Vida</h1>
      <p>Estudio Aurora Interactive</p>
      <button onClick={onContinue}>Empezar</button>
    </section>
  );
}

export default SplashScreen;
