import { formatCurrencyByContext } from '../../engine/economicEraEngine.js';

const COUNTRY_FLAGS = {
  Francia: '🇫🇷',
  Alemania: '🇩🇪',
  España: '🇪🇸',
  'Reino Unido': '🇬🇧',
  Italia: '🇮🇹',
};

function GameHeader({ character, simulation }) {
  const flag = COUNTRY_FLAGS[character.country] || '🏳️';
  const occupation = simulation.occupation || { title: 'Sin ocupación', icon: '🧭' };
  const economicContext = simulation.economicContext;
  const educationContext = simulation.educationContext;
  const actionEconomy = simulation.actionEconomy || { pointsRemaining: 0, maxPoints: 0 };

  return (
    <header className="bitlife-header" data-tour="header">
      <div className="bitlife-identity">
        <div className="bitlife-avatar">{character.avatar || '🧑'}</div>
        <div>
          <h2>{flag} {character.name}</h2>
          <p>{occupation.icon} {occupation.title} · {simulation.area?.label || 'Ubicación'}</p>
          <small>{educationContext?.label || 'Educación contextual'}</small>
        </div>
      </div>
      <div className="bitlife-balance">
        <p>Balance ({economicContext?.currencyLabel || 'moneda'})</p>
        <strong>{formatCurrencyByContext(simulation.bankBalance || 0, economicContext)}</strong>
        <small>Edad {simulation.age} · Año {simulation.year} · {economicContext?.eraLabel || 'Era'}</small>
        <small>Acciones: {actionEconomy.pointsRemaining}/{actionEconomy.maxPoints}</small>
      </div>
    </header>
  );
}

export default GameHeader;
