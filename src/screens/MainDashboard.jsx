import { useMemo, useState } from 'react';
import GameHeader from '../components/layout/GameHeader.jsx';
import { buildMoveOptions } from '../engine/villageEngine.js';
import { getPolicyOptions, resolvePoliticalLevel } from '../engine/politicsEngine.js';
import { groupInventory, getDynamicPrice } from '../engine/economyEngine.js';
import { ANNUAL_ACTION_BALANCE, getActionAvailability } from '../engine/gameplayRules.js';
import { formatCurrencyByContext, scaleInternalPrice } from '../engine/economicEraEngine.js';
import { evaluateJobAccess, getCareerOptions, getSocialActions } from '../engine/socialCareerSystem.js';

const NAV_TABS = [
  { key: 'occupation', label: 'Ocupación', icon: '💼' },
  { key: 'assets', label: 'Activos', icon: '💰' },
  { key: 'relationships', label: 'Relaciones', icon: '❤️' },
  { key: 'activities', label: 'Actividades', icon: '🎯' },
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
                  <p>{npc.role} · {npc.status}{npc.romanceStage ? ` · ${npc.romanceStage}` : ''}</p>
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
  onExplorePlace,
}) {
  const [activeTab, setActiveTab] = useState('age');
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);
  const [selectedBarterItemId, setSelectedBarterItemId] = useState('');

  const merchants = (simulation.village?.npcs || []).filter((npc) => ['comerciante', 'herrero'].includes(npc.role));
  const selectedMerchant = merchants.find((npc) => npc.id === selectedMerchantId) || merchants[0] || null;

  const moveOptions = useMemo(
    () => buildMoveOptions({ country: character.country, year: simulation.year, currentAreaKey: simulation.area?.key }),
    [character.country, simulation.year, simulation.area?.key]
  );

  const inventoryByCategory = useMemo(() => groupInventory(simulation.inventory || []), [simulation.inventory]);
  const politicalLevel = resolvePoliticalLevel(simulation.influence || 0);
  const policyOptions = getPolicyOptions(politicalLevel.key);
  const actionEconomy = simulation.actionEconomy || { pointsRemaining: 0, maxPoints: 0 };
  const canTrade = getActionAvailability({ simulation, actionKey: 'trade' });
  const canExplore = getActionAvailability({ simulation, actionKey: 'explore_location' });
  const canMove = getActionAvailability({ simulation, actionKey: 'move_location' });
  const canInteract = getActionAvailability({ simulation, actionKey: 'npc_interaction' });
  const canSetOccupation = (occupation) => getActionAvailability({ simulation, actionKey: 'occupation_change', occupation });
  const canApplyPolicy = getActionAvailability({ simulation, actionKey: 'policy' });
  const economyContext = simulation.economicContext;
  const socialContext = getSocialActions({ year: simulation.year, age: simulation.age });
  const careerOptions = getCareerOptions({
    year: simulation.year,
    economicContext: simulation.economicContext,
    educationContext: simulation.educationContext,
    influence: simulation.influence || 0,
  });

  return (
    <section className="game-layout bitlife-shell">
      <GameHeader character={character} simulation={simulation} />
      <section className="card compact">
        <p className="section-label">Economía anual de acciones</p>
        <p><strong>{actionEconomy.pointsRemaining}</strong> / {actionEconomy.maxPoints} puntos disponibles</p>
        <p className="tiny muted">
          Era: {simulation.economicContext?.eraLabel || 'N/D'} · Moneda: {simulation.economicContext?.currencyLabel || 'N/D'}
        </p>
        <p className="tiny muted">
          Ubicación: {simulation.area?.label || 'N/D'} · Ocupación: {simulation.occupation?.title || 'Sin ocupación'}
        </p>
        <p className="tiny muted">
          Educación: {simulation.educationContext?.label || 'General'} · {simulation.educationContext?.restrictionReason || ''}
        </p>
        <p className="tiny muted">
          Costos: {Object.entries(ANNUAL_ACTION_BALANCE.actions).map(([key, value]) => `${key}:${value.cost}`).join(' · ')}
        </p>
        <p className="tiny muted">
          Restricciones activas: {[canTrade, canExplore, canMove, canInteract, canApplyPolicy].filter((item) => !item.allowed).map((item) => item.reason).slice(0, 2).join(' · ') || 'Ninguna relevante'}
        </p>
      </section>

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
          {careerOptions.map((job) => {
            const ageAccess = canSetOccupation(job);
            const careerAccess = evaluateJobAccess({ job, age: simulation.age, educationContext: simulation.educationContext, stats: simulation.stats });
            const access = ageAccess.allowed && careerAccess.allowed
              ? { allowed: true, reason: 'Disponible' }
              : { allowed: false, reason: !ageAccess.allowed ? ageAccess.reason : careerAccess.reason };
            return (
              <ListRow
                key={job.id}
                icon={job.icon}
                title={job.title}
                desc={access.allowed
                  ? `Riesgo ${(job.hazardLevel * 100).toFixed(0)}% · Prestigio ${(job.socialPrestige * 100).toFixed(0)}%`
                  : `Bloqueado: ${access.reason}`}
                right={formatCurrencyByContext(job.salary, economyContext)}
                onClick={access.allowed ? () => onOccupationChange(job) : undefined}
              />
            );
          })}
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
                    right={<span className={`rarity-chip ${itemRarityClass(item.rarity)}`}>{formatCurrencyByContext(item.baseValue, economyContext)}</span>}
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
                    <button className="secondary" disabled={!canTrade.allowed} onClick={() => onTrade({ npcId: selectedMerchant.id, itemId: item.id, mode: 'buy' })}>
                      {canTrade.allowed ? 'Comprar' : 'Bloqueado'}
                      {' '}
                      ({formatCurrencyByContext(getDynamicPrice({
                        baseValue: item.baseValue,
                        relationAffinity: selectedMerchant.relation,
                        mode: 'buy',
                        year: simulation.year,
                        country: character.country,
                      }), economyContext)})
                    </button>
                    {!canTrade.allowed ? <p className="tiny muted">{canTrade.reason}</p> : null}
                  </div>
                ))}

                {(simulation.inventory || []).slice(0, 4).map((item, idx) => (
                  <div key={`sell-${item.id}-${idx}`} className="trade-row compact">
                    <span>Vender: {item.name}</span>
                    <button className="ghost" disabled={!canTrade.allowed} onClick={() => onTrade({ npcId: selectedMerchant.id, itemId: item.id, mode: 'sell' })}>Vender</button>
                  </div>
                ))}

                <div className="trade-row compact">
                  <span>Trueque parcial</span>
                  <select value={selectedBarterItemId} onChange={(event) => setSelectedBarterItemId(event.target.value)}>
                    <option value="">Sin item de trueque</option>
                    {(simulation.inventory || []).map((item, idx) => (
                      <option key={`barter-${item.id}-${idx}`} value={item.id}>
                        {item.name} (≈ -{formatCurrencyByContext(Math.round(item.baseValue * 0.35), economyContext)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMerchant?.inventory?.slice(0, 3).map((item) => (
                  <div key={`barter-buy-${selectedMerchant.id}-${item.id}`} className="trade-row compact">
                    <span>
                      Comprar {item.name} con trueque parcial
                    </span>
                    <button
                      className="ghost"
                      disabled={!canTrade.allowed || !selectedBarterItemId}
                      onClick={() => onTrade({
                        npcId: selectedMerchant.id,
                        itemId: item.id,
                        mode: 'buy',
                        barterItemId: selectedBarterItemId || null,
                      })}
                    >
                      Comprar ({formatCurrencyByContext(getDynamicPrice({
                        baseValue: item.baseValue,
                        relationAffinity: selectedMerchant.relation,
                        mode: 'buy',
                        year: simulation.year,
                        country: character.country,
                      }), economyContext)})
                    </button>
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
            <p className="tiny muted">Espacios sociales de la era: {socialContext.spaces.join(' · ')}</p>
            {(simulation.village?.places || []).map((place) => (
              <ListRow
                key={place}
                icon="📍"
                title={place}
                desc={canExplore.allowed ? 'Visitar lugar (puede activar evento local)' : `Bloqueado: ${canExplore.reason}`}
                onClick={canExplore.allowed ? () => onExplorePlace(place) : undefined}
              />
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
                right={option.isCurrent ? 'Actual' : canMove.allowed ? formatCurrencyByContext(scaleInternalPrice(option.moveCost, economyContext), economyContext) : 'Bloqueado'}
                onClick={option.isCurrent || !canMove.allowed ? undefined : () => onMoveLocation(option.key)}
              />
            ))}
            {!canMove.allowed ? <p className="tiny muted">{canMove.reason}</p> : null}
          </section>

          <section className="card bitlife-list">
            <p className="group-header">NPCs de la comunidad</p>
            <p className="tiny muted">Acciones sociales disponibles en la era: {socialContext.actions.map((action) => action.label).join(' · ')}</p>
            {(simulation.village?.npcs || []).slice(0, 10).map((npc) => (
              <div className="npc-card" key={npc.id}>
                <div>
                  <strong>{npc.avatar} {npc.name}</strong>
                  <p>{npc.occupation} · {npc.personality}</p>
                </div>
                <div className="npc-actions">
                  {socialContext.actions.slice(0, 3).map((action) => (
                    <button
                      className="ghost"
                      key={`${npc.id}-${action.id}`}
                      disabled={!canInteract.allowed}
                      onClick={() => onNpcInteraction({ npcId: npc.id, interactionType: action.interactionType, socialActionId: action.id })}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!canInteract.allowed ? <p className="tiny muted">{canInteract.reason}</p> : null}
          </section>

          <section className="card bitlife-list">
            <p className="group-header">Influencia y política</p>
            <p><strong>Nivel:</strong> {politicalLevel.label} ({simulation.influence || 0}/100)</p>
            {policyOptions.map((policy) => (
              <ListRow
                key={policy.id}
                icon="🏛️"
                title={policy.title}
                desc={canApplyPolicy.allowed ? 'Aplicar decisión comunitaria' : `Bloqueado: ${canApplyPolicy.reason}`}
                onClick={canApplyPolicy.allowed ? () => onPolicyAction(policy.id) : undefined}
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
