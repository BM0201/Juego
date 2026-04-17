import { useMemo, useState } from 'react';
import GameHeader from '../components/layout/GameHeader.jsx';
import { buildMoveOptions } from '../engine/villageEngine.js';
import { getPolicyOptions, resolvePoliticalLevel } from '../engine/politicsEngine.js';
import { groupInventory, getDynamicPrice } from '../engine/economyEngine.js';

const NAV_TABS = [
  { key: 'occupation', label: 'Ocupación', icon: '💼' },
  { key: 'assets', label: 'Activos', icon: '💰' },
  { key: 'relationships', label: 'Relaciones', icon: '❤️' },
  { key: 'activities', label: 'Actividades', icon: '🎯' },
];

const OCCUPATION_OPTIONS = [
  { id: 'educacion', title: 'Educación', desc: 'Volver a estudiar para mejores trabajos.', icon: '🎓', salary: 450 },
  { id: 'freelance', title: 'Gigs freelance', desc: 'Dinero rápido, ingresos variables.', icon: '🧢', salary: 620 },
  { id: 'reclutador', title: 'Reclutador', desc: 'Conseguir empleo por agencia.', icon: '📞', salary: 1300 },
  { id: 'trabajo_tiempo_completo', title: 'Trabajos', desc: 'Listado de empleos de tiempo completo.', icon: '💵', salary: 2600 },
  { id: 'militar', title: 'Militar', desc: 'Entrenamiento exigente y carrera de riesgo.', icon: '🛡️', salary: 1950 },
  { id: 'medio_tiempo', title: 'Part-Time', desc: 'Ingresos por hora y mayor flexibilidad.', icon: '🕒', salary: 900 },
  { id: 'carrera_especial', title: 'Carreras especiales', desc: 'Rutas únicas con fama y prestigio.', icon: '🎩', salary: 4200 },
];

const METRICS = [
  { key: 'emotional', label: 'Happiness', icon: '😊', color: 'good' },
  { key: 'health', label: 'Health', icon: '❤️', color: 'good' },
  { key: 'development', label: 'Smarts', icon: '💡', color: 'mid' },
  { key: 'looks', label: 'Looks', icon: '🔥', color: 'mid' },
  { key: 'fame', label: 'Fame', icon: '⭐', color: 'risk' },
  { key: 'influence', label: 'Influence', icon: '🏛️', color: 'good' },
];

function metricValue(simulation, key) {
  if (key in simulation.stats) return simulation.stats[key] || 0;
  return simulation[key] || 0;
}

function itemRarityClass(rarity = 'común') {
  if (rarity.includes('legend')) return 'legendary';
  if (rarity.includes('épico')) return 'epic';
  if (rarity.includes('raro')) return 'rare';
  return 'common';
}

function ListRow({ icon, title, desc, right, onClick }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp className={`bitlife-row ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="row-left-icon">{icon}</div>
      <div className="row-content">
        <strong>{title}</strong>
        {desc ? <p>{desc}</p> : null}
      </div>
      <div className="row-right">{right || '›'}</div>
    </Comp>
  );
}

function RelationshipsView({ relationships = [] }) {
  const grouped = {
    Love: relationships.filter((npc) => npc.role === 'pareja'),
    Padres: relationships.filter((npc) => npc.role === 'familia').slice(0, 2),
    Amigos: relationships.filter((npc) => npc.role === 'amistad' || npc.role === 'aldea'),
    Otros: relationships.filter((npc) => !['pareja', 'familia', 'amistad', 'aldea'].includes(npc.role)),
  };

  return (
    <section className="card bitlife-list">
      {Object.entries(grouped).map(([group, npcs]) => (
        <div key={group}>
          <p className="group-header">{group}</p>
          {npcs.length ? npcs.map((npc) => {
            const progress = Math.max(0, Math.min(100, Math.round(((npc.affinity || 0) + 100) / 2)));
            return (
              <div className="relationship-row" key={npc.id}>
                <div className="row-left-icon">{npc.avatar || '🙂'}</div>
                <div className="row-content">
                  <strong>{npc.name}</strong>
                  <p>{npc.role} · {npc.status}</p>
                  <div className="bar-track slim">
                    <div className="bar-fill good" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="row-right">›</div>
              </div>
            );
          }) : <p className="muted tiny">Sin registros en este grupo.</p>}
        </div>
      ))}
    </section>
  );
}

function MainDashboard({
  character,
  simulation,
  planningAccess,
  visibleTabs = [],
  onOpenPlanning,
  onOpenPlanningTab,
  onAdvanceYear,
  onRestart,
  onOpenTutorial,
  onMoveLocation,
  onNpcInteraction,
  onTrade,
  onOccupationChange,
  onPolicyAction,
}) {
  const [activeTab, setActiveTab] = useState('age');
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);

  const merchants = (simulation.village?.npcs || []).filter((npc) => ['comerciante', 'herrero'].includes(npc.role));
  const selectedMerchant = merchants.find((npc) => npc.id === selectedMerchantId) || merchants[0] || null;

  const moveOptions = useMemo(
    () => buildMoveOptions({ country: character.country, year: simulation.year, currentAreaKey: simulation.area?.key }),
    [character.country, simulation.year, simulation.area?.key]
  );

  const inventoryByCategory = useMemo(() => groupInventory(simulation.inventory || []), [simulation.inventory]);
  const politicalLevel = resolvePoliticalLevel(simulation.influence || 0);
  const policyOptions = getPolicyOptions(politicalLevel.key);

  return (
    <section className="game-layout bitlife-shell">
      <GameHeader character={character} simulation={simulation} />

      {activeTab === 'age' ? (
        <>
          <section className="card age-feed" data-tour="last-summary">
            <p className="section-label">Narrativa anual</p>
            <p className="bitlife-story">{simulation.lastSummary}</p>
            {simulation.activeHistoricalEvent ? (
              <div className="feed-banner historical">
                🕰️ <strong>{simulation.activeHistoricalEvent.title}:</strong> {simulation.activeHistoricalEvent.text}
              </div>
            ) : null}
            {simulation.activeCommunityEvent ? (
              <div className="feed-banner community">
                🏘️ <strong>Comunidad:</strong> {simulation.activeCommunityEvent.text}
              </div>
            ) : null}
            <ul className="event-feed">
              {(simulation.recentEvents || []).slice(0, 4).map((event) => (
                <li className={`event-item ${event.tone || 'neutral'}`} key={`${event.year}-${event.text}`}>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.text}</p>
                  </div>
                  <small>{event.year}</small>
                </li>
              ))}
            </ul>
          </section>

          <section className="card stats-card">
            <p className="section-label">Estado del personaje</p>
            <div className="metric-stack">
              {METRICS.map((metric) => {
                const value = metricValue(simulation, metric.key);
                return (
                  <div key={metric.key} className="metric-row">
                    <div className="metric-head"><span>{metric.icon} {metric.label}</span><strong>{value}%</strong></div>
                    <div className="bar-track">
                      <div className={`bar-fill ${metric.color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'occupation' ? (
        <section className="card bitlife-list">
          <p className="group-header">Todas</p>
          {OCCUPATION_OPTIONS.map((job) => (
            <ListRow
              key={job.id}
              icon={job.icon}
              title={job.title}
              desc={job.desc}
              right={`$${new Intl.NumberFormat('es-ES').format(job.salary)}`}
              onClick={() => onOccupationChange({ id: job.id, title: job.title, icon: job.icon, salary: job.salary })}
            />
          ))}
          {planningAccess?.unlocked ? (
            <div className="occupation-actions">
              <button className="secondary" onClick={() => onOpenPlanning()}>Abrir plan anual</button>
              {visibleTabs.map((tab) => (
                <button className="ghost" key={tab} onClick={() => onOpenPlanningTab(tab)}>{tab}</button>
              ))}
            </div>
          ) : <p className="tiny muted">La planificación estratégica se desbloquea conforme creces.</p>}
        </section>
      ) : null}

      {activeTab === 'assets' ? (
        <>
          <section className="card bitlife-list">
            <p className="group-header">Inventario del jugador</p>
            {Object.entries(inventoryByCategory).map(([category, items]) => (
              <div key={category}>
                <p className="tiny muted">{category}</p>
                {items.map((item, idx) => (
                  <ListRow
                    key={`${item.id}-${idx}`}
                    icon="📦"
                    title={item.name}
                    desc={`${item.description} · Rareza: ${item.rarity}`}
                    right={<span className={`rarity-chip ${itemRarityClass(item.rarity)}`}>${item.baseValue}</span>}
                  />
                ))}
              </div>
            ))}
          </section>

          <section className="card bitlife-list">
            <p className="group-header">Comercio</p>
            {merchants.length ? (
              <>
                <div className="merchant-switcher">
                  {merchants.map((npc) => (
                    <button
                      key={npc.id}
                      className={selectedMerchant?.id === npc.id ? 'tab active-filter' : 'tab'}
                      onClick={() => setSelectedMerchantId(npc.id)}
                    >
                      {npc.avatar} {npc.name}
                    </button>
                  ))}
                </div>

                {selectedMerchant?.inventory?.map((item) => (
                  <div key={`${selectedMerchant.id}-${item.id}`} className="trade-row">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.description}</p>
                    </div>
                    <button className="secondary" onClick={() => onTrade({ npcId: selectedMerchant.id, itemId: item.id, mode: 'buy' })}>
                      Comprar (${getDynamicPrice({ baseValue: item.baseValue, relationAffinity: selectedMerchant.relation, mode: 'buy' })})
                    </button>
                  </div>
                ))}

                {(simulation.inventory || []).slice(0, 4).map((item, idx) => (
                  <div key={`sell-${item.id}-${idx}`} className="trade-row compact">
                    <span>Vender: {item.name}</span>
                    <button className="ghost" onClick={() => onTrade({ npcId: selectedMerchant.id, itemId: item.id, mode: 'sell' })}>Vender</button>
                  </div>
                ))}
              </>
            ) : <p className="tiny muted">No hay comerciantes disponibles en esta ubicación.</p>}
          </section>
        </>
      ) : null}

      {activeTab === 'relationships' ? <RelationshipsView relationships={simulation.relationships} /> : null}

      {activeTab === 'activities' ? (
        <>
          <section className="card bitlife-list">
            <p className="group-header">Explorar ubicación</p>
            <p className="tiny muted">{simulation.area?.label} · {simulation.area?.hometown}</p>
            {(simulation.village?.places || []).map((place) => (
              <ListRow key={place} icon="📍" title={place} desc="Visitar lugar" />
            ))}
          </section>

          <section className="card bitlife-list">
            <p className="group-header">Mudanza</p>
            {moveOptions.map((option) => (
              <ListRow
                key={option.key}
                icon="🚚"
                title={`${option.label} (${option.hometown})`}
                desc={option.description}
                right={option.isCurrent ? 'Actual' : `$${option.moveCost}`}
                onClick={option.isCurrent ? undefined : () => onMoveLocation(option.key)}
              />
            ))}
          </section>

          <section className="card bitlife-list">
            <p className="group-header">NPCs de la comunidad</p>
            {(simulation.village?.npcs || []).slice(0, 10).map((npc) => (
              <div className="npc-card" key={npc.id}>
                <div>
                  <strong>{npc.avatar} {npc.name}</strong>
                  <p>{npc.occupation} · {npc.personality}</p>
                </div>
                <div className="npc-actions">
                  <button className="ghost" onClick={() => onNpcInteraction({ npcId: npc.id, interactionType: 'hablar' })}>Hablar</button>
                  <button className="ghost" onClick={() => onNpcInteraction({ npcId: npc.id, interactionType: 'favor' })}>Favor</button>
                  <button className="ghost" onClick={() => onNpcInteraction({ npcId: npc.id, interactionType: 'regalo' })}>Regalo</button>
                  <button className="ghost" onClick={() => onNpcInteraction({ npcId: npc.id, interactionType: 'trabajar' })}>Trabajar</button>
                </div>
              </div>
            ))}
          </section>

          <section className="card bitlife-list">
            <p className="group-header">Influencia y política</p>
            <p><strong>Nivel:</strong> {politicalLevel.label} ({simulation.influence || 0}/100)</p>
            {policyOptions.map((policy) => (
              <ListRow
                key={policy.id}
                icon="🏛️"
                title={policy.title}
                desc="Aplicar decisión comunitaria"
                onClick={() => onPolicyAction(policy.id)}
              />
            ))}
          </section>
        </>
      ) : null}

      <section className="bitlife-bottom-nav" data-tour="plan-button">
        {NAV_TABS.slice(0, 2).map((tab) => (
          <button key={tab.key} className={activeTab === tab.key ? 'active' : ''} onClick={() => setActiveTab(tab.key)}>
            <span>{tab.icon}</span>
            <small>{tab.label}</small>
          </button>
        ))}

        <button className="age-button" data-tour="advance-button" onClick={onAdvanceYear}>
          <span>+</span>
          <strong>Age</strong>
        </button>

        {NAV_TABS.slice(2).map((tab) => (
          <button key={tab.key} className={activeTab === tab.key ? 'active' : ''} onClick={() => setActiveTab(tab.key)}>
            <span>{tab.icon}</span>
            <small>{tab.label}</small>
          </button>
        ))}
      </section>

      <section className="card compact">
        <button className="secondary" data-tour="help-settings" onClick={onOpenTutorial}>Abrir ayuda</button>
        <button className="restart" onClick={onRestart}>Reiniciar partida</button>
      </section>
    </section>
  );
}

export default MainDashboard;
