import { useMemo } from 'react';
import TopTabs from '../components/tabs/TopTabs.jsx';
import DecisionPlanner from '../components/tabs/DecisionPlanner.jsx';
import SkillTrainingPanel from '../components/tabs/SkillTrainingPanel.jsx';
import { buildTabDetailModel } from '../engine/tabDetailEngine.js';

function TabDetailScreen({
  tabs,
  activeTab,
  onTabChange,
  plan,
  getFocusForTab,
  onSelectFocus,
  simulation,
  character,
  onBack,
  onTrainSkill,
}) {
  const detail = useMemo(
    () => buildTabDetailModel({ tab: activeTab, simulation, character }),
    [activeTab, simulation, character]
  );

  return (
    <section className="game-layout">
      <TopTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

      <section className="card">
        <p className="section-label">Detalle de {activeTab}</p>
        <p className="muted tiny">Etapa actual: {plan.stage.label}. Esta vista no avanza el tiempo.</p>
        <p className="tiny"><strong>Último cambio:</strong> {detail.lastChangeSummary}</p>
      </section>

      <section className="card">
        <p className="section-label">HUD de progreso útil</p>
        <div className="detail-metric-list">
          {detail.metrics.map((metric) => (
            <article key={metric.key} className="detail-metric-item">
              <div className="detail-top">
                <strong>{metric.label}</strong>
                <span>{metric.value}</span>
              </div>
              <div className="bar-track">
                <div className={`bar-fill ${metric.value >= 70 ? 'good' : metric.value >= 45 ? 'mid' : 'risk'}`} style={{ width: `${metric.value}%` }} />
              </div>
              <p className="tiny muted">Cambio reciente: {metric.recentChange > 0 ? `+${metric.recentChange}` : metric.recentChange}</p>
              <p className="tiny muted">{metric.explanation}</p>
              <p className="tiny"><strong>Qué conviene mejorar:</strong> {metric.recommendation}</p>
            </article>
          ))}
        </div>
      </section>

      <SkillTrainingPanel tabLabel={activeTab} training={simulation.training} onTrainSkill={onTrainSkill} />

      <section className="card compact">
        <p className="section-label">Qué conviene mejorar ahora</p>
        <ul className="compact-list">
          {detail.improvementFocus.map((focus) => (
            <li key={focus}>{focus}</li>
          ))}
        </ul>
      </section>

      {detail.traits.length ? (
        <section className="card compact">
          <p className="section-label">Rasgos actuales</p>
          <p>{detail.traits.join(' · ')}</p>
          <p className="tiny muted">{detail.advice}</p>
        </section>
      ) : null}

      <DecisionPlanner
        stageLabel={plan.stage.label}
        options={plan.focusOptionsByTab[activeTab] || []}
        selectedDecisionId={getFocusForTab(activeTab)}
        onSelect={(optionId) => onSelectFocus(activeTab, optionId)}
        onPrimaryAction={onBack}
        primaryLabel="Guardar enfoque anual"
        emptyMessage="No hay acciones habilitadas en esta categoría para tu edad/contexto actual."
      />

      <button className="secondary" onClick={onBack}>Volver al panel principal</button>
    </section>
  );
}

export default TabDetailScreen;
