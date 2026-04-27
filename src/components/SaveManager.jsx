export default function SaveManager({ saves, onLoad, onDelete, onManualSave, onCreateCheckpoint }) {
  return (
    <section className="panel">
      <div className="row between">
        <h3>Guardado y checkpoints</h3>
        <div className="row gap-sm">
          <button type="button" className="btn" onClick={onManualSave}>Guardar slot</button>
          <button type="button" className="btn" onClick={onCreateCheckpoint}>Crear checkpoint</button>
        </div>
      </div>

      <div className="save-list">
        {!saves.length ? <p className="muted">Aún no hay partidas guardadas.</p> : null}
        {saves.map((save) => (
          <article key={save.id} className="save-item">
            <div>
              <strong>{save.label}</strong>
              <p className="muted tiny">{new Date(save.updatedAt).toLocaleString()} {save.isCheckpoint ? '• checkpoint' : ''}</p>
            </div>
            <div className="row gap-sm">
              <button type="button" className="btn" onClick={() => onLoad(save.id)}>Cargar</button>
              {save.id !== 'autosave' ? (
                <button type="button" className="btn danger" onClick={() => onDelete(save.id)}>Eliminar</button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
