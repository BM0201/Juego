import { useState } from 'react';
import SplashScreen from './SplashScreen.jsx';
import BirthSetup from './BirthSetup.jsx';
import CountrySelection from './CountrySelection.jsx';
import FamilyPreview from './FamilyPreview.jsx';
import { buildCountryOptions } from '../../engine/setupEngine.js';
import { createCharacter } from '../../engine/createCharacter.js';

function OnboardingFlow({ onReady }) {
  const [step, setStep] = useState('splash');
  const [birthDate, setBirthDate] = useState(null);
  const [countryOptions, setCountryOptions] = useState([]);
  const [draftCharacter, setDraftCharacter] = useState(null);

  const handleBirthSubmit = (date) => {
    setBirthDate(date);
    setCountryOptions(buildCountryOptions(date.year));
    setStep('country');
  };

  const handleCountry = (country) => {
    const character = createCharacter({ birthDate, country });
    setDraftCharacter(character);
    setStep('family');
  };

  return (
    <>
      {step === 'splash' ? <SplashScreen onContinue={() => setStep('birth')} /> : null}
      {step === 'birth' ? <BirthSetup onSubmit={handleBirthSubmit} /> : null}
      {step === 'country' ? <CountrySelection options={countryOptions} onSelect={handleCountry} /> : null}
      {step === 'family' && draftCharacter ? (
        <FamilyPreview character={draftCharacter} onContinue={() => onReady(draftCharacter)} />
      ) : null}
    </>
  );
}

export default OnboardingFlow;
