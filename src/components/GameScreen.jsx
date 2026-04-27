import { useMemo } from 'react';
import AvatarRenderer from './AvatarRenderer.jsx';
import EventCard from './EventCard.jsx';

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="bar"><i style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export default function GameScreen({ state, saves, onAdvanceYear, onDecide, onManualSave, onCreateCheckpoint, onLoadSave, onDeleteSave, onRestart }) {
  const stats = state.player.stats;
  const keyStats = useMemo(() => [
    ['Salud', stats.salud],
    ['Dinero', stats.dinero],
    ['Influencia', stats.influencia],
    ['Felicidad', stats.felicidad],
    ['Prestigio', stats.prestigio],
    ['Energía', stats.energia],
  ], [stats]);

  return (
    <div className="game-layout">
      <header className="panel header-panel">
        <div className="row between wrap">
          <div>
            <h2>{state.player.name} · Casa {state.player.dynasty.name}</h2>
            <p className="muted">
              Año {state.world.year} ({state.world.era}) · Edad {state.player.stats.edad} · Rol {state.player.roleId} · Dificultad {state.player.difficultyId}
            </p>
            <p className="tiny">Autoguardado anual activo · Checkpoint cada 10 años</p>
          </div>
          <div className="row gap-sm">
            <button type="button" className="btn" onClick={onRestart}>Nueva partida</button>
            <button type="button" className="btn primary" onClick={onAdvanceYear}>Avanzar año</button>
          </div>
        </div>
      </header>

      <section className="panel top-grid">
        <AvatarRenderer appearance={state.player.appearance} age={state.player.stats.edad} name={state.player.name} />
        <div className="stats-grid">
          {keyStats.map(([label, value]) => <Stat key={label} label={label} value={value} />)}
          <article className="dynasty-box">
            <h4>Dinastía</h4>
            <p>Generación: <strong>{state.player.dynasty.generation}</strong></p>
            <p>Legado: <strong>{state.player.dynasty.legacyScore}</strong></p>
            <p>Herederos: <strong>{state.player.dynasty.heirs.length}</strong></p>
          </article>
        </div>
      </section>

      <EventCard event={state.world.pendingEvent} onDecide={onDecide} />

      <section className="panel">
        <div className="row between">
          <h3>NPCs del año</h3>
          <small className="muted">Apariencias aleatorias coherentes por época/rol</small>
        </div>
        <div className="npc-grid">
          {state.npcs.map((npc) => (
            <article key={npc.id} className="npc-card">
              <AvatarRenderer compact appearance={npc.appearance} age={24} name={npc.name} />
              <p><strong>{npc.name}</strong></p>
              <p className="tiny">{npc.roleId} · {npc.relation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="row between">
          <h3>Bitácora reciente</h3>
          <div className="row gap-sm">
            <button type="button" className="btn" onClick={onManualSave}>Guardar slot</button>
            <button type="button" className="btn" onClick={onCreateCheckpoint}>Checkpoint</button>
          </div>
        </div>
        <ul className="log-list">
          {state.log.slice(0, 10).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
        </ul>
      </section>

      <section className="panel">
        <h3>Saves ({saves.length})</h3>
        <div className="save-list">
          {saves.map((save) => (
            <article key={save.id} className="save-item">
              <div>
                <strong>{save.label}</strong>
                <p className="tiny muted">{new Date(save.updatedAt).toLocaleString()}</p>
              </div>
              <div className="row gap-sm">
                <button type="button" className="btn" onClick={() => onLoadSave(save.id)}>Cargar</button>
                {save.id !== 'autosave' ? <button type="button" className="btn danger" onClick={() => onDeleteSave(save.id)}>Eliminar</button> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {state.gameOver ? (
        <section className="panel danger-zone">
          <h3>Fin de la línea dinástica</h3>
          <p>{state.deathReason}</p>
        </section>
      ) : null}
    </div>
  );
}
