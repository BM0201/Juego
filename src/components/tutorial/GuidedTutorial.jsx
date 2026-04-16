import { useEffect, useMemo, useState } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function GuidedTutorial({ steps, onClose }) {
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const step = steps[index];

  useEffect(() => {
    const update = () => {
      const element = document.querySelector(step.target);
      if (!element) {
        setTargetRect(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step]);

  const popoverStyle = useMemo(() => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const preferredTop = targetRect.bottom + 12;
    const top = clamp(preferredTop, 12, window.innerHeight - 180);
    const left = clamp(targetRect.left, 12, window.innerWidth - 300);

    return { top: `${top}px`, left: `${left}px` };
  }, [targetRect]);

  const spotlightStyle = useMemo(() => {
    if (!targetRect) return { display: 'none' };
    return {
      top: `${targetRect.top - 6}px`,
      left: `${targetRect.left - 6}px`,
      width: `${targetRect.width + 12}px`,
      height: `${targetRect.height + 12}px`,
    };
  }, [targetRect]);

  const nextStep = () => {
    if (index === steps.length - 1) {
      onClose();
      return;
    }
    setIndex((prev) => prev + 1);
  };

  const prevStep = () => setIndex((prev) => Math.max(0, prev - 1));

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true">
      <div className="tour-spotlight" style={spotlightStyle} />
      <section className="tour-popover" style={popoverStyle}>
        <p className="section-label">Paso {index + 1} de {steps.length}</p>
        <h4>{step.title}</h4>
        <p>{step.description}</p>
        <div className="tour-actions">
          <button className="secondary" onClick={onClose}>Cerrar</button>
          <button className="secondary" onClick={prevStep} disabled={index === 0}>Atrás</button>
          <button onClick={nextStep}>{index === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
        </div>
      </section>
    </div>
  );
}

export default GuidedTutorial;
