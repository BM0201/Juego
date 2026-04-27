import { useMemo, useState } from 'react';
import './styles/global.css';
import NewGameSetup from './components/NewGameSetup.jsx';
import GameScreen from './components/GameScreen.jsx';
import { createRandomAppearance } from './core/characterEngine.js';
import { createNewGameState, advanceYear, decideEventOption, ensurePendingEvent } from './core/simulationEngine.js';
import { autosaveYearly, createCheckpoint, deleteSave, listSaves, loadSave, upsertSave } from './state/saveEngine.js';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function defaultDraft() {
  return {
    name: '',
    gender: 'm',
    roleId: 'plebeyo',
    difficultyId: 'estadista',
    dynastyName: 'de Alba',
    startYear: 1550,
    appearance: createRandomAppearance({ era: 'medieval', roleId: 'plebeyo', gender: 'm', legacyScore: 0 }),
  };
}

function loadInitialFromSaves() {
  const saves = listSaves();
  const autosave = saves.find((slot) => slot.id === 'autosave');
  const state = autosave?.state ? ensurePendingEvent(clone(autosave.state)) : null;
  return {
    state,
    saves,
  };
}

export default function App() {
  const initial = useMemo(() => loadInitialFromSaves(), []);
  const [draft, setDraft] = useState(defaultDraft);
  const [simulation, setSimulation] = useState(() => initial.state);
  const [saves, setSaves] = useState(() => initial.saves);

  const refreshSaves = () => setSaves(listSaves());

  const handleStart = ({ profile, startYear }) => {
    const game = ensurePendingEvent(createNewGameState(profile, startYear));
    setSimulation(game);
    autosaveYearly(game);
    refreshSaves();
  };

  const handleAdvanceYear = () => {
    setSimulation((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      advanceYear(next);
      autosaveYearly(next);
      refreshSaves();
      return next;
    });
  };

  const handleDecide = (optionId) => {
    setSimulation((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      decideEventOption(next, optionId);
      autosaveYearly(next);
      refreshSaves();
      return next;
    });
  };

  const handleManualSave = () => {
    if (!simulation) return;
    upsertSave({
      label: `${simulation.player.name} (${simulation.world.year})`,
      state: simulation,
      isCheckpoint: false,
    });
    refreshSaves();
  };

  const handleCheckpoint = () => {
    if (!simulation) return;
    createCheckpoint(simulation);
    refreshSaves();
  };

  const handleLoadSave = (id) => {
    const slot = loadSave(id);
    if (slot?.state) {
      setSimulation(ensurePendingEvent(clone(slot.state)));
    }
  };

  const handleDeleteSave = (id) => {
    deleteSave(id);
    refreshSaves();
  };

  const handleRestart = () => {
    setSimulation(null);
    setDraft(defaultDraft());
  };

  return (
    <main className="app-shell">
      <h1>Crónicas de Poder · Simulador Histórico</h1>
      {!simulation ? (
        <>
          <section className="panel tutorial-box fade-in">
            <h3>Tutorial rápido</h3>
            <ol>
              <li>Configura rol, dificultad y apariencia por época.</li>
              <li>Cada año genera eventos históricos o aleatorios.</li>
              <li>Gestiona stats, crea herederos y protege tu dinastía.</li>
              <li>El juego auto-guarda cada año y soporta múltiples slots.</li>
            </ol>
          </section>
          <NewGameSetup draft={draft} setDraft={setDraft} onStart={handleStart} />
        </>
      ) : (
        <GameScreen
          state={simulation}
          saves={saves}
          onAdvanceYear={handleAdvanceYear}
          onDecide={handleDecide}
          onManualSave={handleManualSave}
          onCreateCheckpoint={handleCheckpoint}
          onLoadSave={handleLoadSave}
          onDeleteSave={handleDeleteSave}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
