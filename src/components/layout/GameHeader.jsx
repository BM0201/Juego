function GameHeader({ character, age, year, stageLabel }) {
  const householdResources = [
    `Disciplina ${character.family.discipline}`,
    `Acceso a comida ${character.family.foodAccess}`,
    `Cuidado ${character.family.careAccess}`,
  ];

  return (
    <header className="hud-header card" data-tour="header">
      <div className="hud-header-main">
        <p className="section-label">Crónicas de vida</p>
        <h2>{character.name}</h2>
        <p className="hud-subtitle">
          Edad {age} · Año {year} · {character.country}
        </p>
      </div>

      <div className="hud-meta-grid">
        <p><strong>Clase social:</strong> {character.family.socialClassLabel}</p>
        <p><strong>Etapa:</strong> {stageLabel}</p>
        <p><strong>Hogar:</strong> {character.family.familyCondition}</p>
      </div>

      <p className="tiny muted">Recursos familiares: {householdResources.join(' · ')}.</p>
    </header>
  );
}

export default GameHeader;
