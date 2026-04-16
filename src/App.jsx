import { useState } from 'react';
import OnboardingFlow from './components/layout/OnboardingFlow.jsx';
import GameFlowScreen from './screens/GameFlowScreen.jsx';

function App() {
  const [character, setCharacter] = useState(null);

  return (
    <main className="app-shell">
      {!character ? (
        <OnboardingFlow onReady={setCharacter} />
      ) : (
        <GameFlowScreen character={character} onRestart={() => setCharacter(null)} />
      )}
    </main>
  );
}

export default App;
