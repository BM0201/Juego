function FamilyPreview({
  character,
  randomContext,
  rerollsUsed,
  rerollLimit,
  isGenerating,
  onReroll,
  onContinue,
}) {
  const siblings = character.family.relatives?.siblings || [];
  const rerollsLeft = Math.max(0, rerollLimit - rerollsUsed);

  return (
    <section className={`card ${isGenerating ? 'pulse-card' : ''}`}>
      <h2>Resumen del personaje generado</h2>
      <p className="muted">
        <strong>Elegible:</strong> siglo <span className="pill pill-eligible">{randomContext.century}</span>
      </p>
      <p className="muted tiny" title="El resto se genera para que cada linaje sea único desde el inicio, manteniendo variedad y sorpresa como en simuladores de vida estilo BitLife.">
        ℹ️ Todo lo demás es aleatorio (año seguro, fecha, país, ciudad y contexto familiar).
      </p>

      <div className="summary-grid">
        <p><strong>🕰️ Año de nacimiento:</strong> {character.birthDate.year} <span className="pill pill-random">Aleatorio seguro</span></p>
        <p><strong>📅 Fecha:</strong> {character.birthDate.day}/{character.birthDate.month}</p>
        <p><strong>🌍 País:</strong> {character.country}</p>
        <p><strong>🏘️ Ubicación:</strong> {character.area.label}</p>
        <p><strong>📍 Ciudad:</strong> {character.area.hometown}</p>
        <p><strong>👶 Nombre:</strong> {character.name}</p>
        <p><strong>🛡️ Dinastía:</strong> {character.dynasty?.name || randomContext.dynastyName}</p>
        <p><strong>🎭 Rol inicial:</strong> {randomContext.roleLabel}</p>
        <p><strong>⚔️ Dificultad:</strong> {randomContext.difficultyLabel}</p>
      </div>

      <p className="muted tiny">Años seguros disponibles en este siglo: {randomContext.safeYearPoolSize}</p>

      <h3>Contexto familiar histórico</h3>
      <p><strong>Clase social:</strong> {character.family.socialClassLabel}</p>
      <p><strong>Condición familiar:</strong> {character.family.familyCondition}</p>
      <p className="muted tiny">
        Recursos: {character.family.householdResources} · Estabilidad: {character.family.familyStability} · Alimentación: {character.family.foodAccess} · Atención: {character.family.careAccess}
      </p>
      <p className="muted tiny">
        Disciplina: {character.family.discipline} · Oportunidades: {character.family.opportunityBias} · Riesgo social: {character.family.negativeRisk}
      </p>

      <h3>Núcleo familiar generado</h3>
      <p><strong>Padre:</strong> {character.family.relatives?.father}</p>
      <p><strong>Madre:</strong> {character.family.relatives?.mother}</p>
      <p><strong>Abuelo/a tutor:</strong> {character.family.relatives?.grandparent}</p>
      {siblings.length ? <p><strong>Hermano/a:</strong> {siblings.join(', ')}</p> : <p><strong>Hermano/a:</strong> Sin hermanos registrados</p>}

      <h3>Personajes clave al inicio</h3>
      <ul>
        {character.keyNpcs.map((npc) => (
          <li key={npc.id}><strong>{npc.name}</strong> — {npc.role}</li>
        ))}
      </ul>

      <div className="actions-row onboarding-actions">
        <button className="secondary" onClick={onReroll} disabled={rerollsLeft <= 0 || isGenerating}>
          🎲 Reroll ({rerollsLeft})
        </button>
        <button onClick={onContinue}>Comenzar</button>
      </div>
      {rerollsLeft <= 0 ? <p className="tiny muted">Límite de 5 rerolls alcanzado.</p> : null}
    </section>
  );
}

export default FamilyPreview;
