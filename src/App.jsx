import { useState } from 'react';
import OnboardingFlow from './components/layout/OnboardingFlow.jsx';
import GameFlowScreen from './screens/GameFlowScreen.jsx';
import { clearGameSnapshot, loadGameSnapshot } from './state/persistence.js';

function App() {
  const [savedSnapshot, setSavedSnapshot] = useState(() => loadGameSnapshot());
  const [character, setCharacter] = useState(() => savedSnapshot?.character || null);

  const handleRestart = () => {
    clearGameSnapshot();
    setSavedSnapshot(null);
    setCharacter(null);
  };

  const handleReady = (nextCharacter) => {
    setSavedSnapshot(null);
    setCharacter(nextCharacter);
  };

  return (
    <main className="app-shell">
      {!character ? (
        <OnboardingFlow onReady={handleReady} />
      ) : (
        <GameFlowScreen character={character} initialSimulation={savedSnapshot?.simulation || null} onRestart={handleRestart} />
      )}
    </main>
  );
}

export default App;
