import { ACHIEVEMENT_CATALOG } from '../data/achievements/achievementCatalog.js';

function avgStats(stats) {
  const values = [stats.health, stats.sleep, stats.bond, stats.development, stats.emotional];
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countAbove(relationships, threshold) {
  return relationships.filter((item) => item.status !== 'fallecido' && item.affinity >= threshold).length;
}

function maxPositiveDelta(report = []) {
  if (!Array.isArray(report) || !report.length) return 0;
  return report.reduce((max, row) => {
    if (typeof row === 'string') {
      const match = row.match(/([+-]?\d+)/);
      const value = match ? Number(match[1]) : 0;
      return Math.max(max, value);
    }
    if (typeof row?.delta === 'number') return Math.max(max, row.delta);
    return max;
  }, 0);
}

function hasGriefAndRecovery(simulation) {
  const hasLossMoment = (simulation.keyMoments || []).some((moment) => /falleci|duelo/i.test(moment.summary || ''));
  return hasLossMoment && simulation.stats.emotional >= 45;
}

function evaluateRule(id, simulation) {
  const age = simulation.age;
  const stats = simulation.stats;
  const rel = simulation.relationships || [];
  const avg = avgStats(stats);

  switch (id) {
    case 'first_year': return age >= 1;
    case 'five_years': return age >= 5;
    case 'teen_unlocked': return age >= 13;
    case 'adult_unlocked': return age >= 18;
    case 'elder_unlocked': return age >= 60;
    case 'iron_health': return stats.health >= 80;
    case 'mindful_soul': return stats.emotional >= 80;
    case 'family_anchor': return stats.bond >= 80;
    case 'rest_master': return stats.sleep >= 80;
    case 'bright_future': return stats.development >= 80;
    case 'balanced_life': return avg >= 72;
    case 'resilience': return maxPositiveDelta(simulation.lastYearReport) >= 12;
    case 'storm_survivor': return /negativo/i.test(simulation.lastSummary || '') && avg >= 35;
    case 'popup_decider': return Object.keys(simulation.popupHistory || {}).length >= 1;
    case 'popup_veteran': return Object.keys(simulation.popupHistory || {}).length >= 5;
    case 'surprise_collector': return Object.keys(simulation.surpriseEventHistory || {}).length >= 10;
    case 'social_bloom': return countAbove(rel, 40) >= 3;
    case 'true_love': return rel.some((item) => item.role === 'pareja' && item.affinity >= 45 && item.status === 'activo');
    case 'grief_and_growth': return hasGriefAndRecovery(simulation);
    case 'legendary_friend': return rel.some((item) => item.affinity >= 75 && item.status !== 'fallecido');
    case 'memory_keeper': return (simulation.memories || []).length >= 8;
    case 'key_moment_hunter': return (simulation.keyMoments || []).length >= 6;
    case 'timeline_builder': return (simulation.timeline || []).length >= 12;
    case 'city_survivor': return simulation.area?.key === 'ciudad' && age >= 18;
    case 'town_heart': return simulation.area?.key === 'pueblo' && age >= 18;
    case 'historical_witness': return (simulation.contextEvents || []).length >= 5;
    default:
      return false;
  }
}

export function evaluateAchievements(simulation) {
  const unlockedIds = simulation.achievements?.unlockedIds || [];
  const unlockedSet = new Set(unlockedIds);

  const newlyUnlocked = ACHIEVEMENT_CATALOG
    .filter((item) => !unlockedSet.has(item.id))
    .filter((item) => evaluateRule(item.id, simulation));

  if (!newlyUnlocked.length) {
    return {
      achievements: {
        catalog: ACHIEVEMENT_CATALOG,
        unlockedIds,
        newlyUnlocked: [],
        progress: {
          unlocked: unlockedIds.length,
          total: ACHIEVEMENT_CATALOG.length,
        },
      },
      newMomentsFromAchievements: [],
    };
  }

  const allUnlocked = [...unlockedIds, ...newlyUnlocked.map((item) => item.id)];

  return {
    achievements: {
      catalog: ACHIEVEMENT_CATALOG,
      unlockedIds: allUnlocked,
      newlyUnlocked,
      progress: {
        unlocked: allUnlocked.length,
        total: ACHIEVEMENT_CATALOG.length,
      },
    },
    newMomentsFromAchievements: newlyUnlocked.map((item) => ({
      id: `achievement_${item.id}_${simulation.year}`,
      year: simulation.year,
      age: simulation.age,
      type: 'logro',
      title: `Logro desbloqueado: ${item.title}`,
      summary: item.description,
      tone: 'positive',
    })),
  };
}
