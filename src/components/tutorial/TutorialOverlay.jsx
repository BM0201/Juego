import { TUTORIAL_STEPS } from '../../data/configs/setupConfig.js';

function TutorialOverlay({ onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="modal card">
        <h3>Tutorial rápido</h3>
        <ul>
          {TUTORIAL_STEPS.map((step) => (
            <li key={step.title}>
              <strong>{step.title}:</strong> {step.description}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Entendido</button>
      </section>
    </div>
  );
}

export default TutorialOverlay;
