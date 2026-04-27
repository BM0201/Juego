# Juego Histórico — Versión Mejorada (BitLife + Victoria-like)

## 1) Análisis completo realizado

### Comparación ZIP vs GitHub (`codex/task-title`)
- **ZIP analizado:** `/home/ubuntu/Uploads/Juego-codex-task-title.zip`
- **Repo analizado:** `https://github.com/BM0201/Juego` rama `codex/task-title`
- Resultado técnico:
  - `diff -rq` encontró diferencias **solo en `.git`**
  - Comparación por `sha256` de todos los archivos (excluyendo `.git`) => **100% idénticos**
- Conclusión: **ambas fuentes están sincronizadas** (misma versión funcional).

### Arquitectura original mapeada
- `src/components`: UI (onboarding, HUD, hubs, modales, tabs)
- `src/screens`: flujo principal (`GameFlowScreen`, `MainDashboard`, `TabDetailScreen`)
- `src/engine`: motor de simulación (progresión anual, eventos, economía, relaciones, política, skills)
- `src/data`: catálogos y datasets (eventos, perfiles históricos, configuración)
- `src/state`: hooks y persistencia (`gameState`, `planningState`, `persistence`)
- `scripts`: validaciones de contrato del loop anual y sistemas core

### Flujo de juego original
1. Onboarding -> selección de siglo + generación de personaje
2. Dashboard -> acciones (explorar, socializar, trabajo, política, comercio)
3. Planificación anual (cuando aplica por edad)
4. Avance de año -> motor anual aplica eventos + consecuencias
5. Snapshot en `localStorage` para recuperación

---

## 2) Bugs y problemas detectados

## Bugs críticos (rompen loop o coherencia principal)
1. **Ausencia de sistema formal de dificultad**
   - Impacto: balance inconsistente; misma curva para todos los jugadores.
2. **Falta de estado explícito de dinastía/rol en la simulación anual**
   - Impacto: limitaba progresión tipo “linaje histórico” y consecuencias por perfil.

## Bugs estables / UX (afectan experiencia)
1. **Trueque parcial en UI no se aplicaba realmente**
   - Causa: `selectedBarterItemId` no se enviaba a `onTrade(...)`.
   - Estado: **corregido**.
2. **Onboarding con personalización limitada**
   - Faltaba elegir rol inicial, dificultad y dinastía.
   - Estado: **mejorado**.
3. **HUD sin visibilidad de contexto estratégico**
   - No mostraba rol/dificultad/dinastía/autoguardado.
   - Estado: **mejorado**.

## Problemas de arquitectura/diseño (antes de mejoras)
- Eventos históricos útiles pero acotados por país/año sin sesgo por rol/dificultad.
- Decisiones anuales sin una capa explícita de “motor de consecuencias” configurable.
- Estado de jugador orientado a stats, pero sin componente de “legado dinástico” integrado.

## Rendimiento
- Bundle principal relativamente alto para móvil (~318-329KB gzip JS principal no minificado por chunks finos de dominio).
- Listados/derivaciones en UI dependen de `useMemo`, correcto; sin bloqueos críticos observados.
- Tests y build estables.

---

## 3) Reescritura/mejoras implementadas

## Nueva arquitectura modular (añadida)

### Nuevos módulos
- `src/data/configs/playerConfig.js`
  - Roles (`plebeyo`, `comerciante`, `diplomatico`, `militar`, `erudito`, `noble`)
  - Dificultades (`cronista`, `estadista`, `hierro`)
  - Pool de nombres de dinastía

- `src/data/historical/eraHistoricalEvents.js`
  - Eventos históricos robustos por era (`preindustrial`, `industrial`, `moderna`, `contemporanea`)
  - `tags`, `roleBias`, `cooldown`, pesos y efectos

- `src/engine/difficultyEngine.js`
  - Resolución de presets de dificultad y rol
  - Modificadores de efectos por dificultad/rol

- `src/engine/decisionConsequenceEngine.js`
  - Capa explícita de consecuencias realistas para decisiones
  - Ajuste por rol + dificultad + contexto histórico activo

- `src/engine/historicalEventEngine.js`
  - Resolver histórico V2 con cooldown, pesos, sesgos por rol y dificultad

### Sistemas integrados al loop anual
- `src/engine/yearlyProgressionEngine.js`
  - Nuevo `difficultyId`, `roleId`, `dynastyState` dentro de `simulation`
  - Historial dedicado: `historicalEventHistory`
  - Salario anual afectado por dificultad
  - Resumen anual enriquecido con descriptor de perfil activo
  - Evolución de prestigio dinástico por resultados del año

### UI/UX mejorada para móvil y claridad
- `BirthSetup`: ahora permite elegir
  - Siglo
  - Rol inicial
  - Dificultad
  - Nombre de dinastía
- `FamilyPreview`: muestra rol/dificultad/dinastía confirmados
- `GameHeader`: muestra rol, dificultad, dinastía y aviso de autoguardado anual
- CSS: soporte de `input` consistente con estilo táctil existente

### Corrección funcional directa
- `MainDashboard`: trueque parcial ahora sí envía `barterItemId` al motor de comercio

---

## 4) Sistema de eventos históricos (estado actual)
- Resolver V2 por:
  - país
  - ventana temporal
  - cooldown por evento
  - sesgo según rol
  - presión adicional según dificultad
- Se integra al cierre anual y actualiza `historicalEventHistory`.

---

## 5) Sistema de decisiones y consecuencias
- La planificación anual pasa por `resolveDecisionConsequences(...)`:
  - aplica sesgo por rol
  - aplica multiplicadores por dificultad
  - añade ajuste contextual por evento histórico activo
- El resultado alimenta stats, tono anual y prestigio dinástico.

---

## 6) Sistema de progresión año/vida
- Se mantiene la progresión anual existente y se amplía con:
  - descriptor de perfil estratégico
  - dificultad persistente
  - legado dinástico acumulativo

---

## 7) Sistema de guardado
- `localStorage` con snapshot versionado existente (`cronicas_save_v1`)
- Autoguardado sigue ejecutándose tras acciones y cierre anual
- En UI se refleja explícitamente “autoguardado anual activo”

---

## 8) Estado de jugador y dinastía
- Nuevo estado persistente:
  - `roleId`
  - `difficultyId`
  - `dynastyState` `{ name, prestige, generations, legacyMoments }`
- El prestigio dinástico evoluciona por recompensas, influencia y calidad de decisiones.

---

## 9) Cómo ejecutar y probar

## Desarrollo
```bash
npm ci
npm run dev
```

## Tests
```bash
npm test
```

## Build
```bash
npm run build
```

Validado en esta entrega:
- ✅ `npm test`
- ✅ `npm run build`

---

## 10) Mejoras implementadas (resumen rápido)
- ✅ Arquitectura más modular (dificultad, consecuencias, histórico V2)
- ✅ Rol + dinastía + dificultad seleccionables desde onboarding
- ✅ Progresión anual enriquecida con legado dinástico
- ✅ Sistema histórico más robusto por era
- ✅ Corrección de bug de trueque parcial
- ✅ UI más clara para móvil y contexto de partida

---

## 11) Próximos pasos sugeridos
1. Migraciones de save (`v2`) con backward compatibility automática.
2. Eventos históricos por región/ciudad (no solo país).
3. IA social de NPCs con memoria bidireccional de acciones.
4. Cadena legislativa multi-año (parlamento, facciones, veto, crisis).
5. Balance de dificultad por telemetría (retención, mortalidad, progreso económico).
