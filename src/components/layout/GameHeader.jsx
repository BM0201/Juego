import { formatCurrencyByContext } from '../../engine/economicEraEngine.js';

const COUNTRY_FLAGS = {
  Francia: '🇫🇷',
  Alemania: '🇩🇪',
  España: '🇪🇸',
  'Reino Unido': '🇬🇧',
  Italia: '🇮🇹',
};

function GameHeader({ character, simulation, stageLabel = 'Vida', pointsMessage = '', economyNarrative = null }) {
  const flag = COUNTRY_FLAGS[character.country] || '🏳️';
  const occupation = simulation.occupation || { title: 'Sin ocupación', icon: '🧭' };
  const economicContext = simulation.economicContext;
  const actionEconomy = simulation.actionEconomy || { pointsRemaining: 0, maxPoints: 0 };
  const isEarlyLife = simulation.age <= 11;

  return (
    <header className="bitlife-header clean-hud" data-tour="header">
      <div className="bitlife-identity">
        <div className="bitlife-avatar">{character.avatar || '🧑'}</div>
        <div>
          <h2>{flag} {character.name}</h2>
          <p>{stageLabel} · {simulation.area?.label || 'Ubicación actual'}</p>
          <small>{occupation.icon} {occupation.title}</small>
        </div>
      </div>

      <div className="bitlife-balance">
        <p>Edad {simulation.age} · Año {simulation.year}</p>
        <strong>
          {isEarlyLife
            ? (economyNarrative?.moneyLabel || 'Soporte familiar')
            : formatCurrencyByContext(simulation.bankBalance || 0, economicContext)}
        </strong>
        <small>{pointsMessage || `Te quedan ${actionEconomy.pointsRemaining}/${actionEconomy.maxPoints} acciones`}</small>
      </div>
    </header>
  );
}

export default GameHeader;
