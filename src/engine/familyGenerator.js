import { weightedPick } from '../utils/random.js';
import { generateRelativeName } from './nameGenerator.js';

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function vary(value, range = 8) {
  const randomDelta = Math.round((Math.random() * 2 - 1) * range);
  return clamp(value + randomDelta);
}

function varyFloat(value, range = 0.04, min = -0.25, max = 0.25) {
  const randomDelta = Math.random() * range * 2 - range;
  return Math.max(min, Math.min(max, Number((value + randomDelta).toFixed(3))));
}

function maybeGenerateSibling(country, birthYear, surname) {
  if (Math.random() < 0.35) return [];
  const siblingSex = Math.random() < 0.5 ? 'male' : 'female';

  const sibling = generateRelativeName(country, Math.max(1700, birthYear + (Math.random() < 0.5 ? -2 : 2)), {
    forcedSurname: surname,
    sex: siblingSex,
  });

  return [sibling.fullName];
}

export function generateFamilyFromProfile(profile, { country, birthYear, childSurname }) {
  const socialClass = weightedPick(profile.classDistribution);

  const father = generateRelativeName(country, birthYear - 28, { forcedSurname: childSurname, sex: 'male' });
  const mother = generateRelativeName(country, birthYear - 24, { sex: 'female' });
  const grandparent = generateRelativeName(country, birthYear - 55, { forcedSurname: father.surname, sex: Math.random() < 0.5 ? 'male' : 'female' });

  const context = {
    socialClassKey: socialClass.key,
    socialClassLabel: socialClass.label,
    householdResources: vary(socialClass.householdResources),
    familyStability: vary(socialClass.familyStability),
    foodAccess: vary(socialClass.foodAccess),
    careAccess: vary(socialClass.careAccess),
    discipline: vary(socialClass.discipline || 55, 6),
    opportunityBias: varyFloat(socialClass.opportunityBias || 0),
    negativeRisk: varyFloat(socialClass.negativeRisk || 0),
    illnessChance: Math.max(0.03, socialClass.illnessChance + (Math.random() * 0.06 - 0.03)),
    positiveEventBoost: Math.max(-0.25, Math.min(0.25, (socialClass.opportunityBias || 0) + 0.02)),
    relatives: {
      father: father.fullName,
      mother: mother.fullName,
      grandparent: grandparent.fullName,
      siblings: maybeGenerateSibling(country, birthYear, childSurname),
    },
  };

  const familyCondition = buildFamilyCondition(context);

  return {
    ...context,
    familyCondition,
  };
}

function buildFamilyCondition(context) {
  if (context.householdResources < 35 || context.careAccess < 30) {
    return 'Hogar con precariedad material y cuidados intermitentes';
  }

  if (context.familyStability > 65 && context.foodAccess > 60) {
    return 'Hogar estable con rutinas consistentes y apoyo cercano';
  }

  if (context.familyStability < 45) {
    return 'Hogar con tensiones frecuentes y apego irregular';
  }

  return 'Hogar trabajador con recursos ajustados y cuidados funcionales';
}
