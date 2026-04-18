import { useState } from 'react';
import SplashScreen from './SplashScreen.jsx';
import BirthSetup from './BirthSetup.jsx';
import FamilyPreview from './FamilyPreview.jsx';
import { createCharacter } from '../../engine/createCharacter.js';
import { generateRandomBirthContext } from '../../engine/setupEngine.js';

const REROLL_LIMIT = 5;

function OnboardingFlow({ onReady }) {
  const [step, setStep] = useState('splash');
  const [selectedCentury, setSelectedCentury] = useState(null);
  const [draftCharacter, setDraftCharacter] = useState(null);
  const [randomContext, setRandomContext] = useState(null);
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDraft = (century, reroll = false) => {
    const context = generateRandomBirthContext(century);
    const birthDate = {
      year: context.year,
      month: context.month,
      day: context.day,
      century: context.century,
    };

    setIsGenerating(true);
    const character = createCharacter({ birthDate, country: context.country, areaKey: context.areaKey, sex: context.sex });
    setRandomContext(context);
    setDraftCharacter(character);

    if (reroll) {
      setRerollsUsed((prev) => prev + 1);
    }

    window.setTimeout(() => {
      setIsGenerating(false);
    }, 450);
  };

  const onCenturySubmit = (century) => {
    setSelectedCentury(century);
    setRerollsUsed(0);
    generateDraft(century);
    setStep('summary');
  };

  const onReroll = () => {
    if (!selectedCentury || rerollsUsed >= REROLL_LIMIT) return;
    generateDraft(selectedCentury, true);
  };

  return (
    <>
      {step === 'splash' ? <SplashScreen onContinue={() => setStep('birth')} /> : null}
      {step === 'birth' ? <BirthSetup onSubmit={onCenturySubmit} /> : null}
      {step === 'summary' && draftCharacter && randomContext ? (
        <FamilyPreview
          character={draftCharacter}
          randomContext={randomContext}
          rerollsUsed={rerollsUsed}
          rerollLimit={REROLL_LIMIT}
          isGenerating={isGenerating}
          onReroll={onReroll}
          onContinue={() => onReady(draftCharacter)}
        />
      ) : null}
    </>
  );
}

export default OnboardingFlow;
