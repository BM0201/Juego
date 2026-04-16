function GameHeader({ character, age, year, stageLabel }) {
  return (
    <header className="card compact">
      <h2>{character.name}</h2>
      <p>
        Edad: {age} · Año: {year} · País: {character.country} · Clase: {character.family.socialClassLabel}
      </p>
      <p className="stage-badge">Etapa actual: {stageLabel}</p>
      <p className="muted tiny">{character.family.familyCondition}</p>
    </header>
  );
}

export default GameHeader;
