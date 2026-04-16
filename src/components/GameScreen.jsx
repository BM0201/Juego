import { useMemo, useState } from 'react';
import events from '../data/events.json';
import { LIFE_STAGES, STAGE_DECISIONS, TUTORIAL_STEPS } from '../data/gameData';
import TutorialModal from './TutorialModal';

const tabs = ['Vida', 'Mente', 'Familia', 'Escuela', 'Perfil'];

const clamp = (value) => Math.max(0, Math.min(100, value));

function getStageByAge(age) {
  return LIFE_STAGES.find((stage) => age >= stage.minAge && age <= stage.maxAge) || LIFE_STAGES[0];
}

function applyEffects(baseStats, effect, multiplier = 1) {
  return {
    health: clamp(baseStats.health + Math.round((effect.health || 0) * multiplier)),
    sleep: clamp(baseStats.sleep + Math.round((effect.sleep || 0) * multiplier)),
    bond: clamp(baseStats.bond + Math.round((effect.bond || 0) * multiplier)),
    development: clamp(baseStats.development + Math.round((effect.development || 0) * multiplier)),
  };
}

function pickEvent(stageKey, age) {
  const candidates = events.filter((event) => {
    const inAgeRange = age >= event.minAge && age <= event.maxAge;
    return event.stage === stageKey && inAgeRange;
  });

  if (!candidates.length) {
    return null;
  }

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const selected = shuffled[0];
  return Math.random() <= selected.chance ? selected : null;
}

function GameScreen({ character, onRestart }) {
  const [activeTab, setActiveTab] = useState('Vida');
  const [stats, setStats] = useState({
    health: 62,
    sleep: 58,
    bond: 50,
    development: 54,
  });
  const [timeline, setTimeline] = useState([
    `Naces en ${character.country} (${character.birthDate.year}) en una familia ${character.socialClass.toLowerCase()}.`,
  ]);
  const [age, setAge] = useState(0);
  const [year, setYear] = useState(character.birthDate.year);
  const [selectedDecisionId, setSelectedDecisionId] = useState(null);
  const [lastConsequence, setLastConsequence] = useState('Selecciona una decisión y avanza el tiempo.');
  const [showTutorial, setShowTutorial] = useState(true);

  const currentStage = useMemo(() => getStageByAge(age), [age]);
  const stageOptions = STAGE_DECISIONS[currentStage.key] || STAGE_DECISIONS.infancia;

  const selectedDecision = useMemo(
    () => stageOptions.find((option) => option.id === selectedDecisionId),
    [selectedDecisionId, stageOptions]
  );

  const applyDecision = () => {
    if (!selectedDecision) {
      setLastConsequence('Necesitas elegir una decisión para avanzar.');
      return;
    }

    const impactMultiplier = age <= 5 ? 1.3 : 1;
    const nextAge = age + 1;
    const nextYear = year + 1;
    const nextStage = getStageByAge(nextAge);

    setStats((prev) => {
      const withDecision = applyEffects(prev, selectedDecision.effect, impactMultiplier);
      const randomEvent = pickEvent(currentStage.key, age);

      if (randomEvent) {
        setTimeline((prevTimeline) => [
          ...prevTimeline,
          `Año ${nextYear} (edad ${nextAge}): ${selectedDecision.consequence}`,
          `Evento: ${randomEvent.text}`,
        ]);
        setLastConsequence(`${selectedDecision.consequence} Evento: ${randomEvent.text}`);
        return applyEffects(withDecision, randomEvent.effect);
      }

      setTimeline((prevTimeline) => [
        ...prevTimeline,
        `Año ${nextYear} (edad ${nextAge}): ${selectedDecision.consequence}`,
      ]);
      setLastConsequence(selectedDecision.consequence);
      return withDecision;
    });

    setAge(nextAge);
    setYear(nextYear);
    setSelectedDecisionId(null);

    if (nextStage.key !== currentStage.key) {
      setTimeline((prev) => [...prev, `Etapa alcanzada: ${nextStage.label}.`]);
    }
  };

  const statItems = [
    { label: 'Salud', key: 'health' },
    { label: 'Sueño', key: 'sleep' },
    { label: 'Vínculo', key: 'bond' },
    { label: 'Desarrollo', key: 'development' },
  ];

  return (
    <section className="game-layout">
      {showTutorial ? <TutorialModal steps={TUTORIAL_STEPS} onClose={() => setShowTutorial(false)} /> : null}

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <header className="card compact">
        <h2>{character.name}</h2>
        <p>
          Edad: {age} · Año: {year} · País: {character.country} · Clase: {character.socialClass}
        </p>
        <p className="stage-badge">Etapa actual: {currentStage.label}</p>
      </header>

      <div className="stats-grid">
        {statItems.map((item) => (
          <article className="card compact" key={item.key}>
            <small>{item.label}</small>
            <strong>{stats[item.key]}</strong>
          </article>
        ))}
      </div>

      <section className="card">
        <h3>Línea de vida</h3>
        <ul className="timeline">
          {timeline.slice(-7).map((entry, index) => (
            <li key={`${entry}-${index}`}>{entry}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Decisión del año</h3>
        <p className="muted">Etapa jugable: {currentStage.label}.</p>
        <div className="options-stack">
          {stageOptions.map((option) => (
            <button
              key={option.id}
              className={selectedDecisionId === option.id ? 'option active' : 'option'}
              onClick={() => setSelectedDecisionId(option.id)}
            >
              {option.title}
            </button>
          ))}
        </div>
        <button onClick={applyDecision}>Avanzar tiempo</button>
      </section>

      <section className="card compact">
        <strong>Consecuencia:</strong> {lastConsequence}
      </section>

      <button className="restart" onClick={onRestart}>
        Reiniciar partida
      </button>
    </section>
  );
}

export default GameScreen;
