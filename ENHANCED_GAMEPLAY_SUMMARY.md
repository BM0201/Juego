# Estado real del producto (abril 2026)

## Implementado
- **Economía anual de acciones (AP)** con costos por acción, límites por tipo y reinicio por año.
- **Gating por edad/requisitos** para ocupación, política, comercio, interacción social, mudanza y exploración.
- **Contrato motor↔UI para avance anual** con `success`, `reason`, `message`, resumen y delta de estado.
- **Persistencia real de partida** (snapshot de `character + simulation`) en `localStorage` con schema versionado `v1`.
- **Exploración funcional de lugares** con resultado sistémico (riesgo/costo/recompensa) integrado a AP.
- **Trueque parcial en UI** conectado al motor (`barterItemId`) con selección de item de intercambio.
- **Upgrade de ubicación consistente** (incluye recalcular `hometown` al subir de nivel de zona).
- **Perfiles históricos ampliados** y fallback más inteligente por país para evitar abuso de default global.
- **Suite de tests ampliada** para anti-spam, gating, persistencia, contrato anual, trueque y upgrade de ubicación.
- **Sistema monetario por era** (preindustrial/industrial/moderna/contemporánea) con moneda visible, escalado interno de salarios/precios y representación coherente en HUD.
- **Naming coherente por sexo** para personaje principal, familia y NPCs de aldea.
- **Educación contextual por era** con acceso formal por edad/época y multiplicador de aprendizaje.
- **Sistema social por era** con espacios/acciones de socialización distintos según contexto histórico.
- **Romance progresivo** (interés → cortejo → vínculo) condicionado por exposición social y edad de la era.
- **Sistema laboral de riesgo** con perfiles por oficio (hazard, mortalidad, desgaste, prestigio, escasez) y salario calculado por fórmula balanceable.

## Parcialmente implementado
- Balance fino de costos AP por era/país/clase social (base lista, tuning pendiente).
- Exploración con cadenas de eventos largos (actualmente resolución de una visita por acción).
- Política con requisitos de stats más detallados por decisión (actualmente edad/influencia/AP).
- Economía por región detallada dentro de cada país (hoy es por país + era).

## Pendiente / roadmap
- Migraciones automáticas de saves entre schemas futuros (`v2+`).
- Eventos históricos por región dentro del mismo país (hoy es nivel país).
- Simulación económica avanzada de oferta/demanda en comercio local.
- Trayectorias educativas complejas (universidad, abandono, reconversión laboral).

## Contrato anual del motor (referencia)
`runAnnualProgression` devuelve:
- `success: boolean`
- `reason: string`
- `message: string`
- `annualSummary`, `triggeredEvents`, `statChanges`
- estado derivado (`updatedCharacter`, `area`, `village`, `actionEconomy`, etc.)

La UI debe mostrar feedback positivo **solo cuando** `success === true`.

## Persistencia
- Key: `cronicas_save_v1`
- Schema: `version: 1`
- Payload: `{ character, simulation }`
- Fallback seguro: datos inválidos/corruptos retornan `null`
- Reset limpio: eliminación completa del snapshot actual
