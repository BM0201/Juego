import GameHeader from '../components/layout/GameHeader.jsx';

const PRIORITY_STATS = [
  { key: 'health', label: 'Salud' },
  { key: 'sleep', label: 'Sueño' },
  { key: 'development', label: 'Desarrollo mental' },
  { key: 'bond', label: 'Vínculo familiar' },
];

function toneByValue(value) {
  if (value >= 70) return 'good';
  if (value >= 45) return 'mid';
  return 'risk';
}

function MainDashboard({
  character,
  simulation,
  stageLabel,
  visibleTabs = [],
  selectedDecision,
  activePlanning,
  planningAccess,
  hiddenTabs = [],
  onOpenPlanning,
  onOpenPlanningTab,
  onAdvanceYear,
  onRestart,
  onOpenTutorial,
}) {
  const ctaLabel = selectedDecision ? 'Cerrar año' : 'Avanzar año';

  return (
    <section className="game-layout">
      <GameHeader character={character} age={simulation.age} year={simulation.year} stageLabel={stageLabel} />

      <section className="status-strip card" aria-label="Estado principal">
        {PRIORITY_STATS.map((stat) => {
          const value = simulation.stats?.[stat.key] ?? 0;
          return (
            <article key={stat.key} className="status-chip">
              <p className="tiny muted">{stat.label}</p>
              <div className="status-chip-row">
                <strong>{value}</strong>
                <span className={`status-dot ${toneByValue(value)}`} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="card life-feed" data-tour="recent-events">
        <div className="life-feed-head">
          <p className="section-label">Diario de vida</p>
          <button className="secondary ghost" onClick={onOpenTutorial}>Ayuda</button>
        </div>

        <article className="feed-block" data-tour="last-summary">
          <h3>Resumen del último año</h3>
          <p>{simulation.lastSummary}</p>
        </article>

        <article className="feed-block">
          <h3>Evento destacado del contexto</h3>
          {simulation.contextEvents?.length ? (
            <p>
              <strong>{simulation.contextEvents[0].year}:</strong> {simulation.contextEvents[0].text}
            </p>
          ) : (
            <p className="muted">Todavía no hay un evento de contexto destacado.</p>
          )}
        </article>

        <article className="feed-block">
          <h3>Eventos recientes</h3>
          {simulation.recentEvents.length ? (
            <ul className="event-feed">
              {simulation.recentEvents.slice(0, 4).map((item) => (
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
            <p className="muted">Aún no hay eventos registrados. Avanza el primer año para iniciar el diario narrativo.</p>
          )}
        </article>
      </section>

      <section className="cta-panel card" data-tour="advance-button">
        <button className="primary-cta" onClick={onAdvanceYear}>{ctaLabel}</button>
        <p className="tiny muted">Avanza el tiempo cuando tengas claro tu enfoque anual.</p>
      </section>

      <section className="card compact" data-tour="plan-button">
        <div className="planning-head">
          <p className="section-label">Navegación de sistemas</p>
          {planningAccess.unlocked ? (
            <button className="secondary" onClick={() => onOpenPlanning()}>Abrir planificación</button>
          ) : null}
        </div>

        {planningAccess.unlocked ? (
          <div className="tab-shortcuts">
            {visibleTabs.map((tab) => (
              <button key={tab} className="tab-shortcut" onClick={() => onOpenPlanningTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        ) : (
          <p className="tiny muted">{planningAccess.message}</p>
        )}

        {hiddenTabs.length ? <p className="tiny muted">Sistemas bloqueados por etapa: {hiddenTabs.join(' · ')}.</p> : null}
      </section>

      <section className="card context-grid" data-tour="context-block">
        <article>
          <p className="section-label">Riesgos a vigilar</p>
          <ul className="compact-list">
            {simulation.context.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </article>
        <article>
          <p className="section-label">Oportunidades del periodo</p>
          <ul className="compact-list">
            {simulation.context.opportunities.map((opportunity) => (
              <li key={opportunity}>{opportunity}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card compact">
        <p className="section-label">Plan actual</p>
        {selectedDecision ? (
          <>
            <p><strong>{selectedDecision.title}</strong></p>
            <p className="tiny muted">{selectedDecision.summary}</p>
          </>
        ) : (
          <p className="muted">Sin planificación anual seleccionada.</p>
        )}
        <p className="tiny muted">
          Vida: {activePlanning.vida || 'sin definir'} · Mente: {activePlanning.mente || 'sin definir'} · Familia: {activePlanning.familia || 'sin definir'} · Escuela: {activePlanning.escuela || 'sin definir'}
        </p>
      </section>

      <section className="card compact monetization-preview">
        <p className="section-label">Espacios futuros (sin anuncios activos)</p>
        <ul className="compact-list tiny muted">
          <li>Modal opcional de anuncio recompensado al pedir reintento.</li>
          <li>Interstitial ocasional entre ciclos largos (no permanente).</li>
          <li>Promoción interna discreta de contenido premium narrativo.</li>
        </ul>
      </section>

      <button className="restart" onClick={onRestart}>Reiniciar partida</button>
    </section>
  );
}

export default MainDashboard;
