# Juego Histórico Expandido (BitLife + Victoria 3)

Versión reescrita y modular del simulador histórico. Incluye motor de eventos por época, consecuencias encadenadas, dinastías, dificultad realista, sistema robusto de guardado y editor visual de personajes con restricciones históricas/por rol.

## 1) Resultado del análisis inicial (ZIP vs GitHub)

- ZIP: `/home/ubuntu/Uploads/Juego-codex-task-title.zip`
- Repo: `https://github.com/BM0201/Juego` rama `codex/task-title`
- Comparación ejecutada con `diff -qr` (excluyendo `.git` y `node_modules`)
- Resultado: `repo_version` era más actualizada (incluía archivos adicionales y cambios no presentes en ZIP)
- Base elegida para la reescritura: `/home/ubuntu/juego-historico/repo_version`

## 2) Arquitectura actual (nueva)

```text
src/
  App.jsx                        # Orquestación principal (onboarding, loop, saves)
  main.jsx
  components/
    AvatarRenderer.jsx           # Render SVG de personaje/NPC
    CharacterEditor.jsx          # Editor visual en tiempo real
    EventCard.jsx                # UI de evento y decisiones
    GameScreen.jsx               # HUD principal + estadísticas + log + saves
    NewGameSetup.jsx             # Creación de personaje/época/rol/dificultad
  core/
    random.js                    # Utilidades RNG, weighted pick, clamp
    characterEngine.js           # Apariencia, restricciones, herencia, NPCs
    eventEngine.js               # Selección de eventos aleatorios/históricos/encadenados
    decisionEngine.js            # Aplicación de consecuencias + riesgo/recompensa
    simulationEngine.js          # Progresión anual, muerte, dinastía, checkpoints
  data/
    roles.js                     # Roles, dificultad, presets de dinastía
    appearanceCatalog.js         # Pelo, barba, accesorios, ropa por época y rol
    historicalEvents.js          # Eventos base + históricos + encadenados
  state/
    saveEngine.js                # localStorage, autosave, múltiples slots, checkpoint
  styles/
    global.css                   # UI responsive y animaciones básicas
scripts/
  validateAnnualLoop.mjs
  validateCoreSystems.mjs
```

## 3) Sistemas implementados

### Motor de simulación
- Progresión año a año.
- Envejecimiento y presión de mortalidad por salud + dificultad.
- Continuidad dinástica con herederos (si muere el líder y hay heredero, la partida continúa).
- Legado dinástico (`legacyScore`) que crece/decrece según desempeño.

### Sistema de eventos históricos
- Eventos **aleatorios** por era.
- Eventos **históricos reales inspirados** (imprenta, revolución industrial, crisis financiera, globalización digital).
- Eventos **encadenados** por banderas (`chainFlags`) disparadas por decisiones previas.
- Sesgo de selección por rol + dificultad (weighted pick).

### Sistema de decisiones
- Múltiples opciones por evento.
- Consecuencias en stats clave: salud, dinero, influencia, felicidad, prestigio, energía.
- Riesgo/recompensa con posibilidad de castigo adicional en decisiones arriesgadas.
- Modificadores por rol social y dificultad.

### Sistema de personalización (nuevo)
- Editor visual completo con preview en tiempo real.
- Catálogo por época/rol:
  - Pelo
  - Barba
  - Accesorios
  - Ropa
  - Colores (pelo, ojos, piel)
- Restricciones de rol (ej. plebeyo no usa corona).
- NPCs con apariencia coherente por contexto histórico.
- Envejecimiento visual (canas/rasgo facial).
- Herencia de rasgos físicos en dinastía.

### Guardado
- `localStorage` con múltiples slots.
- Autoguardado anual en slot fijo `autosave`.
- Checkpoint manual + checkpoint cada 10 años.
- Cargar/eliminar saves desde UI.

## 4) UI/UX
- Interfaz responsive para móvil/desktop.
- Feedback visual claro de stats y barras.
- Header con contexto de rol, dificultad, año, era y estado de autoguardado.
- Onboarding con tutorial corto.
- Animaciones suaves (`fade-in`) y paneles legibles.

## 5) Bugs detectados y corregidos

Detalle completo en `docs/ANALISIS_Y_BUGS.md`. Resumen:
- Bug de fuentes desincronizadas ZIP/repo.
- Riesgo de inconsistencias por arquitectura previa fragmentada en muchos engines no cohesionados.
- Personalización visual no integrada con gameplay/save.
- Guardado sin estrategia robusta de múltiples slots/checkpoints.
- Eventos con baja capacidad de encadenamiento.

## 6) Cómo ejecutar

```bash
npm ci
npm run dev
```

## 7) Tests

```bash
npm test
```

- `validateAnnualLoop.mjs`: valida loop anual, resolución de eventos y envejecimiento.
- `validateCoreSystems.mjs`: valida restricciones de personalización, NPCs y sistema de guardado.

## 8) Build

```bash
npm run build
```

## 9) Extender el juego

- Guía de eventos: `docs/GUIA_EVENTOS.md`
- Guía de personalización: `docs/GUIA_PERSONALIZACION.md`

## 10) Próximos pasos sugeridos

1. IA social profunda de NPCs (memoria persistente intergeneracional).
2. Sistema militar con frentes, logística y tratados multi-año.
3. Política institucional (parlamento, vetos, coaliciones y crisis constitucionales).
4. Log de telemetría para balance fino de dificultad y retención.
5. Migración de saves versionada (v2 -> v3).
