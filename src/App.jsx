import { useState } from 'react';
import OnboardingFlow from './components/game/OnboardingFlow.jsx';
import GameScreen from './components/GameScreen.jsx';

function App() {
  const [character, setCharacter] = useState(null);

  if (!character) {
    return (
      <main className="app-shell">
        <OnboardingFlow onReady={setCharacter} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <GameScreen character={character} onRestart={() => setCharacter(null)} />
    </main>
  );
}

export default App;
