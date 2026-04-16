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

  const onBirthSubmit = (date) => {
    setBirthDate(date);
    setCountryOptions(buildCountryOptions(date.year));
    setStep('country');
  };

  const onCountrySelect = (country) => {
    setDraftCharacter(createCharacter({ birthDate, country }));
    setStep('family');
  };

  const startFieldScenario = () => {
    const scenarioCharacter = {
      ...draftCharacter,
      family: {
        ...draftCharacter.family,
        socialClassKey: 'working_rural',
        socialClassLabel: 'Trabajadora rural / campesina',
        familyCondition: 'Familia rural que depende del trabajo del campo',
      },
      scenarioPreset: 'rural_field_8',
    };

    onReady(scenarioCharacter);
  };

  return (
    <>
      {step === 'splash' ? <SplashScreen onContinue={() => setStep('birth')} /> : null}
      {step === 'birth' ? <BirthSetup onSubmit={onBirthSubmit} /> : null}
      {step === 'country' ? <CountrySelection options={countryOptions} onSelect={onCountrySelect} /> : null}
      {step === 'family' && draftCharacter ? (
        <FamilyPreview
          character={draftCharacter}
          onContinue={() => onReady(draftCharacter)}
          onPlayFieldCase={startFieldScenario}
        />
      ) : null}
    </>
  );
}

export default OnboardingFlow;
