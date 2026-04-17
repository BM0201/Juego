const COUNTRY_FLAGS = {
  Francia: '🇫🇷',
  Alemania: '🇩🇪',
  España: '🇪🇸',
  'Reino Unido': '🇬🇧',
  Italia: '🇮🇹',
};

function formatMoney(value = 0) {
  return new Intl.NumberFormat('es-ES').format(Math.max(0, Math.round(value)));
}

function GameHeader({ character, simulation }) {
  const flag = COUNTRY_FLAGS[character.country] || '🏳️';
  const occupation = simulation.occupation || { title: 'Sin ocupación', icon: '🧭' };

  return (
    <header className="bitlife-header" data-tour="header">
      <div className="bitlife-identity">
        <div className="bitlife-avatar">{character.avatar || '🧑'}</div>
        <div>
          <h2>{flag} {character.name}</h2>
          <p>{occupation.icon} {occupation.title}</p>
        </div>
      </div>
      <div className="bitlife-balance">
        <p>Balance bancario</p>
        <strong>${formatMoney(simulation.bankBalance || 0)}</strong>
        <small>Edad {simulation.age} · Año {simulation.year}</small>
      </div>
    </header>
  );
}

export default GameHeader;
