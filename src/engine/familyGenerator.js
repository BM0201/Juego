import { weightedPick } from '../utils/random.js';

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function vary(value, range = 8) {
  const randomDelta = Math.round((Math.random() * 2 - 1) * range);
  return clamp(value + randomDelta);
}

export function generateFamilyFromProfile(profile) {
  const socialClass = weightedPick(profile.classDistribution);

  const context = {
    socialClassKey: socialClass.key,
    socialClassLabel: socialClass.label,
    householdResources: vary(socialClass.householdResources),
    familyStability: vary(socialClass.familyStability),
    foodAccess: vary(socialClass.foodAccess),
    careAccess: vary(socialClass.careAccess),
    illnessChance: Math.max(0.03, socialClass.illnessChance + (Math.random() * 0.06 - 0.03)),
    positiveEventBoost: socialClass.positiveEventBoost,
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
