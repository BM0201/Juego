function FamilyPreview({ character, onContinue }) {
  return (
    <section className="card">
      <h2>Contexto familiar histórico</h2>
      <p><strong>Nombre:</strong> {character.name}</p>
      <p><strong>Clase social:</strong> {character.family.socialClassLabel}</p>
      <p><strong>Condición familiar:</strong> {character.family.familyCondition}</p>
      <p className="muted tiny">
        Recursos: {character.family.householdResources} · Estabilidad: {character.family.familyStability} · Alimentación: {character.family.foodAccess} · Atención: {character.family.careAccess}
      </p>
      <button onClick={onContinue}>Entrar al juego</button>
    </section>
  );
}

export default FamilyPreview;
