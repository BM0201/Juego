import { TUTORIAL_POINTS } from '../../data/configs/setupConfig.js';

function TutorialOverlay({ onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="modal card">
        <h3>Tutorial rápido</h3>
        <ul>
          {TUTORIAL_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <button onClick={onClose}>Entendido</button>
      </section>
    </div>
  );
}

export default TutorialOverlay;
