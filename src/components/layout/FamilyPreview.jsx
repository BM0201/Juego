function FamilyPreview({ character, onContinue }) {
  const siblings = character.family.relatives?.siblings || [];

  return (
    <section className="card">
      <h2>Contexto familiar histórico</h2>
      <p><strong>Nombre:</strong> {character.name}</p>
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

      <button onClick={onContinue}>Entrar al juego</button>
    </section>
  );
}

export default FamilyPreview;
