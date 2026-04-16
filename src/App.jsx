import { useMemo, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import BirthSetup from './components/BirthSetup';
import CountrySelection from './components/CountrySelection';
import FamilySetup from './components/FamilySetup';
import GameScreen from './components/GameScreen';
import { COUNTRIES_BY_RANGE, FAMILY_CONDITIONS, SOCIAL_CLASSES } from './data/gameData';

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

function buildCountryOptions(year) {
  const range = COUNTRIES_BY_RANGE.find((entry) => year >= entry.start && year <= entry.end);
  const source = range ? [...range.countries] : ['España', 'México', 'Brasil'];
  const selected = [];

  while (selected.length < 3 && source.length > 0) {
    const index = Math.floor(Math.random() * source.length);
    selected.push(source.splice(index, 1)[0]);
  }

  return selected;
}

function App() {
  const [step, setStep] = useState('splash');
  const [birthDate, setBirthDate] = useState(null);
  const [countryOptions, setCountryOptions] = useState([]);
  const [country, setCountry] = useState('');
  const [socialClass, setSocialClass] = useState('');
  const [familyCondition, setFamilyCondition] = useState('');

  const character = useMemo(() => {
    if (!birthDate || !country) {
      return null;
    }

    return {
      name: 'Alex de la Vega',
      country,
      socialClass,
      familyCondition,
      birthDate,
    };
  }, [birthDate, country, socialClass, familyCondition]);

  const handleBirthSubmit = (payload) => {
    setBirthDate(payload);
    setCountryOptions(buildCountryOptions(payload.year));
    setStep('country');
  };

  const handleCountrySelection = (value) => {
    setCountry(value);
    setSocialClass(randomFrom(SOCIAL_CLASSES));
    setFamilyCondition(randomFrom(FAMILY_CONDITIONS));
    setStep('family');
  };

  const resetGame = () => {
    setStep('splash');
    setBirthDate(null);
    setCountryOptions([]);
    setCountry('');
    setSocialClass('');
    setFamilyCondition('');
  };

  return (
    <main className="app-shell">
      {step === 'splash' ? <SplashScreen onContinue={() => setStep('birth')} /> : null}
      {step === 'birth' ? <BirthSetup onSubmit={handleBirthSubmit} /> : null}
      {step === 'country' ? (
        <CountrySelection options={countryOptions} selected={country} onSelect={handleCountrySelection} />
      ) : null}
      {step === 'family' ? (
        <FamilySetup
          condition={familyCondition}
          socialClass={socialClass}
          onContinue={() => setStep('game')}
        />
      ) : null}
      {step === 'game' && character ? <GameScreen character={character} onRestart={resetGame} /> : null}
    </main>
  );
}

export default App;
