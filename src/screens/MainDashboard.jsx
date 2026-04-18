import { useMemo, useState } from 'react';
import GameHeader from '../components/layout/GameHeader.jsx';
import { buildMoveOptions } from '../engine/villageEngine.js';
import { getPolicyOptions, resolvePoliticalLevel } from '../engine/politicsEngine.js';
import { groupInventory, getDynamicPrice } from '../engine/economyEngine.js';
import { getActionAvailability } from '../engine/gameplayRules.js';
import { formatCurrencyByContext, scaleInternalPrice } from '../engine/economicEraEngine.js';
import { evaluateJobAccess, getCareerOptions, getSocialActions } from '../engine/socialCareerSystem.js';

const PRIMARY_HUBS = [
  { key: 'vida', label: 'Vida', icon: '🏡' },
  { key: 'recursos', label: 'Recursos', icon: '🎒' },
  { key: 'relaciones', label: 'Relaciones', icon: '💞' },
  { key: 'actividades', label: 'Actividades', icon: '🧭' },
];

const RELATIONSHIP_SUBTABS = [
  { key: 'familia', label: 'Familia' },
  { key: 'amistades', label: 'Amigos' },
  { key: 'pueblo', label: 'Gente del pueblo' },
  { key: 'conocidos', label: 'Conocidos' },
  { key: 'romance', label: 'Romance' },
];

const ACTIVITY_SUBTABS = [
  { key: 'explorar', label: 'Explorar' },
  { key: 'aprender', label: 'Aprender' },
  { key: 'socializar', label: 'Socializar' },
  { key: 'trabajo', label: 'Trabajo' },
  { key: 'descanso', label: 'Descansar' },
];

const CORE_METRICS = [
  { key: 'health', label: 'Salud', icon: '❤️', color: 'good' },
  { key: 'emotional', label: 'Ánimo', icon: '😊', color: 'good' },
  { key: 'development', label: 'Desarrollo', icon: '💡', color: 'mid' },
  { key: 'bond', label: 'Vínculo', icon: '👨‍👩‍👧‍👦', color: 'good' },
  { key: 'influence', label: 'Influencia', icon: '🏛️', color: 'mid' },
  { key: 'looks', label: 'Imagen', icon: '✨', color: 'mid' },
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

function getLifeStage(age) {
  if (age <= 5) return { key: 'infancia_temprana', label: 'Primera infancia' };
  if (age <= 11) return { key: 'ninez', label: 'Niñez' };
  if (age <= 17) return { key: 'adolescencia', label: 'Adolescencia' };
  return { key: 'adultez', label: 'Adultez' };
}

function pointsRemainingText(pointsRemaining = 0) {
  if (pointsRemaining <= 0) return 'Ya no te queda tiempo este año.';
  if (pointsRemaining === 1) return 'Te queda 1 acción este año.';
  return `Te quedan ${pointsRemaining} acciones este año.`;
}

function toHumanRestriction(reason = '') {
  if (!reason) return 'Ahora mismo no puedes hacer esta acción.';
  if (/Acción disponible desde los/i.test(reason) || /Demasiado joven/i.test(reason)) return 'Aún eres demasiado pequeño para hacer esto.';
  if (/No tienes suficientes puntos/i.test(reason)) return 'No te queda suficiente tiempo este año para hacerlo.';
  if (/influencia/i.test(reason)) return 'Todavía no tienes el peso social necesario para esta decisión.';
  if (/Límite anual/i.test(reason)) return 'Ya hiciste demasiadas acciones de este tipo este año.';
  if (/insuficiente/i.test(reason)) return 'No cuentas con los recursos necesarios en este momento.';
  return reason;
}

function economyNarrative({ simulation, character, economyContext }) {
  const household = Math.max(0, Math.round(character.family?.householdResources || 0));

  if (simulation.age <= 5) {
    return {
      headline: 'Dependes de tu hogar',
      detail: `Tu familia te mantiene mientras creces. Estabilidad del hogar: ${household}/100.`,
      moneyLabel: 'Soporte familiar',
    };
  }

  if (simulation.age <= 11) {
    return {
      headline: 'Aún no administras dinero propio',
      detail: 'Tus gastos cotidianos dependen de adultos responsables del hogar.',
      moneyLabel: 'Apoyo del hogar',
    };
  }

  if (simulation.age <= 17) {
    return {
      headline: 'Economía juvenil',
      detail: 'Puedes empezar a manejar algo de dinero, pero aún dependes de apoyo familiar.',
      moneyLabel: `Disponible (${economyContext?.currencyLabel || 'moneda'})`,
    };
  }

  return {
    headline: 'Economía personal',
    detail: 'Tus decisiones económicas impactan tu estabilidad y tus oportunidades.',
    moneyLabel: `Balance (${economyContext?.currencyLabel || 'moneda'})`,
  };
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

function RelationshipDetailModal({ npc, onClose }) {
  if (!npc) return null;
  const affinity = Math.max(0, Math.min(100, Math.round(((npc.affinity || 0) + 100) / 2)));
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="card modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <p className="section-label">Detalle de relación</p>
        <h3>{npc.avatar || '🙂'} {npc.name}</h3>
        <p className="muted tiny">{npc.role} · {npc.status || 'activo'}{npc.romanceStage ? ` · ${npc.romanceStage}` : ''}</p>
        <div className="bar-track">
          <div className="bar-fill good" style={{ width: `${affinity}%` }} />
        </div>
        <p className="tiny muted" style={{ marginTop: '0.5rem' }}>
          Este vínculo evoluciona con tus acciones de socialización y decisiones anuales.
        </p>
        <button className="secondary" onClick={onClose}>Cerrar</button>
      </section>
    </div>
  );
}

function RelationshipHub({ relationships = [], activeSubtab, onSubtabChange, onInspectNpc }) {
  const grouped = {
    familia: relationships.filter((npc) => npc.role === 'familia'),
    amistades: relationships.filter((npc) => npc.role === 'amistad'),
    pueblo: relationships.filter((npc) => npc.role === 'aldea'),
    romance: relationships.filter((npc) => ['pareja', 'interes_romantico'].includes(npc.role) || npc.romanceScore >= 10),
    conocidos: relationships.filter((npc) => !['familia', 'amistad', 'aldea', 'pareja', 'interes_romantico'].includes(npc.role)),
  };

  const rows = grouped[activeSubtab] || [];

  return (
    <>
      <section className="card compact">
        <p className="section-label">Relaciones</p>
        <div className="hub-subnav">
          {RELATIONSHIP_SUBTABS.map((tab) => (
            <button
              key={tab.key}
              className={tab.key === activeSubtab ? 'tab active-filter' : 'tab'}
              onClick={() => onSubtabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card bitlife-list">
        <p className="group-header">{RELATIONSHIP_SUBTABS.find((tab) => tab.key === activeSubtab)?.label || 'Relaciones'}</p>
        {rows.length ? rows.map((npc) => {
          const affinity = Math.max(0, Math.min(100, Math.round(((npc.affinity || 0) + 100) / 2)));
          return (
            <button className="relationship-row" key={npc.id} onClick={() => onInspectNpc(npc)}>
              <div className="row-left-icon">{npc.avatar || '🙂'}</div>
              <div className="row-content">
                <strong>{npc.name}</strong>
                <p>{npc.role} · {npc.status || 'activo'}</p>
                <div className="bar-track slim">
                  <div className="bar-fill good" style={{ width: `${affinity}%` }} />
                </div>
              </div>
              <div className="row-right">Ver</div>
            </button>
          );
        }) : <p className="tiny muted" style={{ padding: '0.75rem 0.85rem' }}>Todavía no tienes registros aquí.</p>}
      </section>
    </>
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
  const [activeHub, setActiveHub] = useState('vida');
  const [activityTab, setActivityTab] = useState('explorar');
  const [relationshipTab, setRelationshipTab] = useState('familia');
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);
  const [selectedBarterItemId, setSelectedBarterItemId] = useState('');
  const [inspectedNpc, setInspectedNpc] = useState(null);

  const merchants = (simulation.village?.npcs || []).filter((npc) => ['comerciante', 'herrero'].includes(npc.role));
  const selectedMerchant = merchants.find((npc) => npc.id === selectedMerchantId) || merchants[0] || null;
  const stage = getLifeStage(simulation.age);

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
  const economyUX = economyNarrative({ simulation, character, economyContext });

  const visibleMetrics = CORE_METRICS.filter((metric) => {
    if (stage.key === 'infancia_temprana') return ['health', 'emotional', 'bond'].includes(metric.key);
    if (stage.key === 'ninez') return ['health', 'emotional', 'development', 'bond'].includes(metric.key);
    if (stage.key === 'adolescencia') return ['health', 'emotional', 'development', 'bond', 'looks'].includes(metric.key);
    return ['health', 'emotional', 'development', 'influence', 'looks'].includes(metric.key);
  });

  return (
    <section className="game-layout bitlife-shell">
      <GameHeader
        character={character}
        simulation={simulation}
        stageLabel={stage.label}
        pointsMessage={pointsRemainingText(actionEconomy.pointsRemaining)}
        economyNarrative={economyUX}
      />

      {activeHub === 'vida' ? (
        <>
          <section className="card compact">
            <p className="section-label">Tu momento actual</p>
            <p><strong>{pointsRemainingText(actionEconomy.pointsRemaining)}</strong></p>
            <p className="tiny muted">{economyUX.headline}. {economyUX.detail}</p>
          </section>

          <section className="card age-feed" data-tour="last-summary">
            <p className="section-label">Último año</p>
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
              {(simulation.recentEvents || []).slice(0, 3).map((event) => (
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
            <p className="section-label">Estado general</p>
            <div className="metric-stack">
              {visibleMetrics.map((metric) => {
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

      {activeHub === 'relaciones' ? (
        <RelationshipHub
          relationships={simulation.relationships || []}
          activeSubtab={relationshipTab}
          onSubtabChange={setRelationshipTab}
          onInspectNpc={setInspectedNpc}
        />
      ) : null}

      {activeHub === 'recursos' ? (
        <>
          <section className="card compact">
            <p className="section-label">Economía</p>
            <p><strong>{economyUX.moneyLabel}</strong></p>
            <p className="tiny muted">{simulation.age < 12 ? economyUX.detail : formatCurrencyByContext(simulation.bankBalance || 0, economyContext)}</p>
          </section>

          <section className="card bitlife-list">
            <p className="group-header">Inventario</p>
            {Object.entries(inventoryByCategory).length ? Object.entries(inventoryByCategory).map(([category, items]) => (
              <div key={category}>
                <p className="tiny muted" style={{ padding: '0.55rem 0.85rem 0.2rem' }}>{category}</p>
                {items.map((item, idx) => (
                  <ListRow
                    key={`${item.id}-${idx}`}
                    icon="📦"
                    title={item.name}
                    desc={item.description}
                    right={<span className={`rarity-chip ${itemRarityClass(item.rarity)}`}>{formatCurrencyByContext(item.baseValue, economyContext)}</span>}
                  />
                ))}
              </div>
            )) : <p className="tiny muted" style={{ padding: '0.75rem 0.85rem' }}>Aún no tienes objetos personales.</p>}
          </section>

          <section className="card bitlife-list">
            <p className="group-header">Mercado local</p>
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

                {selectedMerchant?.inventory?.slice(0, 4).map((item) => (
                  <div key={`${selectedMerchant.id}-${item.id}`} className="trade-row">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.description}</p>
                    </div>
                    <button className="secondary" disabled={!canTrade.allowed} onClick={() => onTrade({ npcId: selectedMerchant.id, itemId: item.id, mode: 'buy' })}>
                      Comprar · 1 acción
                      {' '}
                      ({formatCurrencyByContext(getDynamicPrice({
                        baseValue: item.baseValue,
                        relationAffinity: selectedMerchant.relation,
                        mode: 'buy',
                        year: simulation.year,
                        country: character.country,
                      }), economyContext)})
                    </button>
                  </div>
                ))}

                <div className="trade-row compact">
                  <span>Usar trueque parcial</span>
                  <select value={selectedBarterItemId} onChange={(event) => setSelectedBarterItemId(event.target.value)}>
                    <option value="">Sin item de trueque</option>
                    {(simulation.inventory || []).map((item, idx) => (
                      <option key={`barter-${item.id}-${idx}`} value={item.id}>
                        {item.name} (≈ -{formatCurrencyByContext(Math.round(item.baseValue * 0.35), economyContext)})
                      </option>
                    ))}
                  </select>
                </div>

                {!canTrade.allowed ? <p className="tiny muted" style={{ padding: '0.4rem 0.85rem 0.8rem' }}>{toHumanRestriction(canTrade.reason)}</p> : null}
              </>
            ) : <p className="tiny muted" style={{ padding: '0.75rem 0.85rem' }}>Hoy no hay comerciantes disponibles.</p>}
          </section>
        </>
      ) : null}

      {activeHub === 'actividades' ? (
        <>
          <section className="card compact">
            <p className="section-label">Centro de actividades</p>
            <div className="hub-subnav">
              {ACTIVITY_SUBTABS.filter((tab) => !(simulation.age < 13 && ['trabajo'].includes(tab.key))).map((tab) => (
                <button key={tab.key} className={activityTab === tab.key ? 'tab active-filter' : 'tab'} onClick={() => setActivityTab(tab.key)}>
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {activityTab === 'explorar' ? (
            <>
              <section className="card bitlife-list">
                <p className="group-header">Explorar {simulation.area?.label}</p>
                <p className="tiny muted" style={{ padding: '0.55rem 0.85rem' }}>Elige un lugar para pasar tiempo. Cada visita consume 1 acción.</p>
                {(simulation.village?.places || []).map((place) => (
                  <ListRow
                    key={place}
                    icon="📍"
                    title={place}
                    desc={canExplore.allowed ? 'Visitar lugar' : toHumanRestriction(canExplore.reason)}
                    onClick={canExplore.allowed ? () => onExplorePlace(place) : undefined}
                  />
                ))}
              </section>

              <section className="card bitlife-list">
                <p className="group-header">Mudarte</p>
                <p className="tiny muted" style={{ padding: '0.55rem 0.85rem' }}>Mudarte consume bastante tiempo este año.</p>
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
                {!canMove.allowed ? <p className="tiny muted" style={{ padding: '0.4rem 0.85rem 0.8rem' }}>{toHumanRestriction(canMove.reason)}</p> : null}
              </section>
            </>
          ) : null}

          {activityTab === 'aprender' ? (
            <section className="card bitlife-list">
              <p className="group-header">Aprender y crecer</p>
              <p className="tiny muted" style={{ padding: '0.55rem 0.85rem' }}>
                {simulation.educationContext?.label || 'Aprendizaje general'} · {simulation.educationContext?.restrictionReason || 'Sigue avanzando para desbloquear más formación.'}
              </p>
              {planningAccess?.unlocked ? (
                <div className="occupation-actions">
                  <button className="secondary" onClick={() => onOpenPlanning()}>Abrir planificación anual</button>
                  {visibleTabs.map((tab) => (
                    <button className="ghost" key={tab} onClick={() => onOpenPlanningTab(tab)}>{tab}</button>
                  ))}
                </div>
              ) : <p className="tiny muted" style={{ padding: '0 0.85rem 0.85rem' }}>Tu capacidad de planificación se desbloquea con la edad.</p>}
            </section>
          ) : null}

          {activityTab === 'socializar' ? (
            <section className="card bitlife-list">
              <p className="group-header">Socializar</p>
              <p className="tiny muted" style={{ padding: '0.55rem 0.85rem' }}>Espacios sociales actuales: {socialContext.spaces.join(' · ')}</p>
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
                        {action.label} · 1 acción
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!canInteract.allowed ? <p className="tiny muted" style={{ padding: '0.4rem 0.85rem 0.8rem' }}>{toHumanRestriction(canInteract.reason)}</p> : null}
            </section>
          ) : null}

          {activityTab === 'trabajo' ? (
            <>
              <section className="card bitlife-list">
                <p className="group-header">Trabajo y oficio</p>
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
                        ? `Riesgo ${(job.hazardLevel * 100).toFixed(0)}% · Prestigio ${(job.socialPrestige * 100).toFixed(0)}% · Cambio laboral: 1 acción`
                        : toHumanRestriction(access.reason)}
                      right={formatCurrencyByContext(job.salary, economyContext)}
                      onClick={access.allowed ? () => onOccupationChange(job) : undefined}
                    />
                  );
                })}
              </section>

              <section className="card bitlife-list">
                <p className="group-header">Influencia comunitaria</p>
                <p style={{ padding: '0.55rem 0.85rem' }}><strong>Nivel:</strong> {politicalLevel.label} ({simulation.influence || 0}/100)</p>
                {policyOptions.map((policy) => (
                  <ListRow
                    key={policy.id}
                    icon="🏛️"
                    title={policy.title}
                    desc={canApplyPolicy.allowed ? 'Aplicar decisión comunitaria (2 acciones)' : toHumanRestriction(canApplyPolicy.reason)}
                    onClick={canApplyPolicy.allowed ? () => onPolicyAction(policy.id) : undefined}
                  />
                ))}
              </section>
            </>
          ) : null}

          {activityTab === 'descanso' ? (
            <section className="card bitlife-list">
              <p className="group-header">Descanso y cuidado</p>
              <p style={{ padding: '0.65rem 0.85rem 0.2rem' }}>Tomarte el año con calma también es una decisión.</p>
              <p className="tiny muted" style={{ padding: '0 0.85rem 0.75rem' }}>
                Si no te queda tiempo, avanza el año para ver cómo impacta tu ritmo de vida en tu historia.
              </p>
            </section>
          ) : null}
        </>
      ) : null}

      <section className="bitlife-bottom-nav" data-tour="plan-button">
        {PRIMARY_HUBS.slice(0, 2).map((tab) => (
          <button key={tab.key} className={activeHub === tab.key ? 'active' : ''} onClick={() => setActiveHub(tab.key)}>
            <span>{tab.icon}</span>
            <small>{tab.label}</small>
          </button>
        ))}

        <button className="age-button" data-tour="advance-button" onClick={onAdvanceYear}>
          <span>+</span>
          <strong>Edad</strong>
        </button>

        {PRIMARY_HUBS.slice(2).map((tab) => (
          <button key={tab.key} className={activeHub === tab.key ? 'active' : ''} onClick={() => setActiveHub(tab.key)}>
            <span>{tab.icon}</span>
            <small>{tab.label}</small>
          </button>
        ))}
      </section>

      <section className="card compact">
        <button className="secondary" data-tour="help-settings" onClick={onOpenTutorial}>Abrir ayuda</button>
        <button className="restart" onClick={onRestart}>Reiniciar partida</button>
      </section>

      <RelationshipDetailModal npc={inspectedNpc} onClose={() => setInspectedNpc(null)} />
    </section>
  );
}

export default MainDashboard;
