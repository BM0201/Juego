import { getBarTone } from '../../engine/statExplanationEngine.js';

function StatBar({ label, value, hint }) {
  const tone = getBarTone(value);

  return (
    <article className="stat-card" title={hint}>
      <div className="stat-card-head">
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <div className="bar-track">
        <div className={`bar-fill ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <p className="stat-hint">{hint}</p>
    </article>
  );
}

export default StatBar;
