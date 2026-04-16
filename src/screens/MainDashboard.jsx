import GameHeader from '../components/layout/GameHeader.jsx';

function MainDashboard({
  character,
  simulation,
  stageLabel,
  selectedDecision,
  activePlanning,
  onOpenPlanning,
  onAdvanceYear,
  onRestart,
  onOpenTutorial,
}) {
  return (
    <section className="game-layout">
      <GameHeader character={character} age={simulation.age} year={simulation.year} stageLabel={stageLabel} />

      <section className="card narrative-card" data-tour="last-summary">
        <p className="section-label">Resumen del último año</p>
        <p>{simulation.lastSummary}</p>
      </section>

      <section className="card" data-tour="recent-events">
        <p className="section-label">Eventos recientes</p>
        {simulation.recentEvents.length ? (
          <ul className="event-feed">
            {simulation.recentEvents.slice(0, 5).map((item) => (
              <li key={`${item.year}-${item.text}`} className={`event-item ${item.tone}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
                <small>{item.year}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Aún no hay eventos registrados. Avanza el primer año para iniciar el feed narrativo.</p>
        )}
      </section>

      <section className="card context-grid" data-tour="context-block">
        <article>
          <p className="section-label">Riesgos próximos</p>
          <ul>
            {simulation.context.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </article>
        <article>
          <p className="section-label">Oportunidades próximas</p>
          <ul>
            {simulation.context.opportunities.map((opportunity) => (
              <li key={opportunity}>{opportunity}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card compact">
        <p className="section-label">Áreas más débiles</p>
        <div className="weak-area-list">
          {simulation.weakAreas.map((area) => (
            <span key={area.key} className="weak-chip">
              {area.key}: {area.value}
            </span>
          ))}
        </div>
      </section>

      <section className="card compact">
        <p className="section-label">Selección activa por categoría</p>
        <p className="tiny muted">
          Vida: {activePlanning.vida || 'sin definir'} · Mente: {activePlanning.mente || 'sin definir'} · Familia: {activePlanning.familia || 'sin definir'} · Escuela: {activePlanning.escuela || 'sin definir'}
        </p>
      </section>

      <section className="card compact" data-tour="technical-output">
        <p className="section-label">Resultado técnico anual</p>
        <p className="tiny muted">
          Eventos: {simulation.lastAnnualOutput?.triggeredEvents.length || 0} · Cambios de stats: {simulation.lastAnnualOutput?.statChanges.length || 0}
        </p>
      </section>

      <section className="card compact">
        <p className="section-label">Preparación actual</p>
        {selectedDecision ? (
          <>
            <p><strong>{selectedDecision.title}</strong> · {selectedDecision.summary}</p>
            <p className="tiny muted">Enfoques activos: {selectedDecision.selectedItems?.map((item) => item.title).join(' · ')}</p>
          </>
        ) : (
          <p>Sin planificación anual seleccionada.</p>
        )}
      </section>

      <div className="actions-row">
        <button className="secondary" onClick={onOpenPlanning} data-tour="plan-button">Planificar año</button>
        <button onClick={onAdvanceYear} data-tour="advance-button">Avanzar año</button>
      </div>

      <button className="secondary" onClick={onOpenTutorial}>Ver tutorial</button>
      <button className="restart" onClick={onRestart}>Reiniciar partida</button>
    </section>
  );
}

export default MainDashboard;
