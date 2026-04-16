import { useMemo, useState } from 'react';
import Tabs from './ui/Tabs.jsx';
import StatBar from './ui/StatBar.jsx';
import TimelineView from './ui/TimelineView.jsx';
import GameHeader from './game/GameHeader.jsx';
import DecisionPanel from './game/DecisionPanel.jsx';
import LastYearReport from './game/LastYearReport.jsx';
import TutorialModal from './game/TutorialModal.jsx';
import { createInitialGameState, getStageDecisions, progressOneYear } from '../engine/gameEngine.js';
import { STAT_META } from '../engine/statEngine.js';

const TABS = ['Vida', 'Mente', 'Familia', 'Escuela', 'Perfil'];

function GameScreen({ character, onRestart }) {
  const [activeTab, setActiveTab] = useState('Vida');
  const [gameState, setGameState] = useState(() => createInitialGameState(character));
  const [selectedDecisionId, setSelectedDecisionId] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const stageData = useMemo(() => getStageDecisions(gameState.age), [gameState.age]);

  const advanceTime = () => {
    setGameState((prev) => progressOneYear({ gameState: prev, character, decisionId: selectedDecisionId }));
    setSelectedDecisionId(null);
  };

  return (
    <section className="game-layout">
      {showTutorial ? <TutorialModal onClose={() => setShowTutorial(false)} /> : null}

      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <GameHeader
        character={character}
        age={gameState.age}
        year={gameState.year}
        stageLabel={stageData.stage.label}
      />

      <div className="stats-stack">
        {Object.entries(STAT_META).map(([key, meta]) => (
          <StatBar key={key} label={meta.label} hint={meta.hint} value={gameState.stats[key]} />
        ))}
      </div>

      <LastYearReport summary={gameState.lastSummary} statChanges={gameState.lastYearReport} />

      <TimelineView entries={gameState.timeline} />

      <DecisionPanel
        stageLabel={stageData.stage.label}
        options={stageData.decisions}
        selectedDecisionId={selectedDecisionId}
        onSelect={setSelectedDecisionId}
        onAdvance={advanceTime}
      />

      <button className="restart" onClick={onRestart}>
        Reiniciar partida
      </button>
    </section>
  );
}

export default GameScreen;
