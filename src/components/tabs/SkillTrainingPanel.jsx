import { SKILL_DEFINITIONS } from '../../engine/skillProgression.js';
import { canTrainSkillById } from '../../engine/skillTrainingEngine.js';

function SkillTrainingPanel({ tabLabel, training, onTrainSkill }) {
  const tabSkills = Object.entries(SKILL_DEFINITIONS)
    .filter(([, config]) => config.tabHints.includes(tabLabel));

  if (!training) return null;

  const availableSkills = tabSkills.filter(([skillId]) => canTrainSkillById({ training, skillId }).allowed);
  const blockedSkills = tabSkills
    .map(([skillId, config]) => ({ skillId, label: config.label, gate: canTrainSkillById({ training, skillId }) }))
    .filter((item) => !item.gate.allowed);

  return (
    <section className="card compact">
      <p className="section-label">Entrenamiento por clicks ({tabLabel})</p>
      <p className="tiny muted">Energía útil: {training.usefulEnergy} · Capacidad: {training.learningCapacity} · Puntos de esfuerzo: {training.actionBudgetPoints}</p>
      <p className="tiny muted">Clicks disponibles: {training.clicksAvailable} · Costo por click: 1 · Rendimiento: x{training.performanceMultiplier}</p>
      <p className="tiny muted">{training.budgetMessage}</p>

      <div className="detail-metric-list">
        {availableSkills.length ? availableSkills.map(([skillId, config]) => {
          const value = training.skills?.[skillId] || 0;

          return (
            <article key={skillId} className="detail-metric-item">
              <div className="detail-top">
                <strong>{config.label}</strong>
                <span>{value.toFixed(1)}</span>
              </div>
              <div className="bar-track">
                <div className={`bar-fill ${value >= 70 ? 'good' : value >= 45 ? 'mid' : 'risk'}`} style={{ width: `${value}%` }} />
              </div>
              <button
                className="secondary"
                onClick={() => onTrainSkill(skillId)}
                disabled={training.clicksAvailable <= 0}
              >
                Entrenar (+1 click)
              </button>
            </article>
          );
        }) : <p className="tiny muted">No hay habilidades entrenables visibles en esta tab para la etapa actual.</p>}
      </div>

      {blockedSkills.length ? (
        <ul className="tiny muted">
          {blockedSkills.map((item) => <li key={item.skillId}>{item.label}: {item.gate.reason}</li>)}
        </ul>
      ) : null}

      {training.lastTrainingFeedback ? (
        <p className="tiny"><strong>Última mejora:</strong> {training.lastTrainingFeedback}</p>
      ) : null}

      {training.clicksAvailable <= 0 ? <p className="tiny muted">No quedan clicks de entrenamiento este periodo.</p> : null}
    </section>
  );
}

export default SkillTrainingPanel;
