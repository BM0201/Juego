# Rediseño BitLife + Sistema de Aldea, Comercio y Política

## Objetivo
Transformar la experiencia a un UX/UI estilo BitLife y extender el simulador con ubicación dinámica, hub social, comercio e influencia política.

## 1) UI/UX estilo BitLife implementado
- Header nuevo con avatar, bandera, ocupación y balance bancario destacado.
- Navegación inferior con tabs: **Ocupación, Activos, Age (centro), Relaciones, Actividades**.
- Pantallas con patrón de lista: icono izquierdo, título azul, descripción gris y flecha de navegación.
- Dashboard de Age con:
  - Narrativa anual limpia
  - Eventos comunitarios e históricos
  - Métricas visuales con barras: Happiness, Health, Smarts, Looks, Fame, Influence
- Feedback visual mejorado en botones, rows, paneles y navegación móvil.

## 2) Sistema de ubicaciones y mudanza
Se amplió `LOCATION_AREAS` a 4 tipos:
1. Ciudad Grande
2. Ciudad Pequeña
3. Aldea / Pueblo
4. Casa Remota

Cada tipo tiene:
- Descripción
- Costo de mudanza
- Sesgo de eventos (trabajo/comunidad/caos/naturaleza)
- Lista de pueblos/ciudades base

### Consecuencias de mudanza
- Costo descontado del balance
- Reinicio de hub local (lugares y NPCs)
- Ajuste de relaciones (amistades se enfrían ligeramente)
- Reinicio de contador de años en ubicación

## 3) Hub de aldea/ciudad
Se agregó `villageEngine` con:
- Lugares por tipo de ubicación (mercado, ayuntamiento, plaza, taberna, etc.)
- 10 NPCs permanentes por ubicación con:
  - avatar
  - nombre
  - ocupación
  - personalidad
  - relación local
  - inventario (si comerciante/herrero)

## 4) Comercio e inventario
### Inventario de jugador
- Catálogo por categorías: Herramientas, Comida, Objetos de valor, Recuerdos, Documentos.
- Cada item: nombre, descripción, valor base, rareza y efectos.

### Comercio con NPC
- Compra/venta desde tab de Activos.
- Precio dinámico por afinidad con comerciante.
- Soporte de trueque parcial (entrega de item reduce costo efectivo).
- El comercio afecta balance bancario e influencia.

## 5) Eventos comunitarios e históricos
### Eventos comunitarios
- Festival, elecciones, incendio, mercado especial, tormenta.
- Dependientes de tipo de ubicación e influencia.

### Eventos históricos por país
Integrado dataset inicial con ventanas históricas para:
- Alemania
- Francia
- España
- Reino Unido
- Italia

Incluye ejemplo explícito para Alemania en torno al ascenso autoritario (1933).

## 6) Influencia y progresión política
Nueva métrica: **Influence (0–100)**.

Niveles políticos:
1. Ciudadano común
2. Miembro respetado
3. Consejero
4. Alcalde/Líder

Cada nivel desbloquea decisiones políticas (`policy options`) con impacto en:
- influencia
- balance
- stats
- narrativa reciente

## 7) Integración con loop anual
Se integró en `yearlyProgressionEngine`:
- Pago anual según ocupación + bonus por influencia.
- Aplicación de efectos meta: balance, influencia, looks, fame.
- Eventos comunitarios + históricos dentro del cierre anual.
- Evolución automática de ubicación:
  - Aldea → Ciudad Pequeña
  - Ciudad Pequeña → Ciudad Grande
  (según influencia + años acumulados)

## 8) Flujo sugerido de prueba manual
1. Crear personaje
2. Elegir ubicación inicial
3. Ir a Activities → interactuar con NPCs
4. Ir a Assets → comerciar con mercado
5. Cambiar ocupación en Occupation
6. Pulsar Age varios años
7. Observar aumento de influencia y nivel político
8. Aplicar decisiones políticas desde Activities
9. Ver transición de aldea a ciudad cuando cumples condiciones

## 9) Archivos clave agregados/modificados
### Nuevos
- `src/data/economy/itemCatalog.js`
- `src/data/historical/worldEvents.js`
- `src/engine/economyEngine.js`
- `src/engine/villageEngine.js`
- `src/engine/villageGameplayEngine.js`
- `src/engine/politicsEngine.js`
- `src/engine/communityEventEngine.js`
- `BITLIFE_VILLAGE_POLITICA_DOCUMENTACION.md`

### Modificados
- `src/screens/MainDashboard.jsx`
- `src/components/layout/GameHeader.jsx`
- `src/styles/global.css`
- `src/engine/yearlyProgressionEngine.js`
- `src/state/gameState.js`
- `src/screens/GameFlowScreen.jsx`
- `src/data/configs/locationConfig.js`
- `src/data/configs/setupConfig.js`
- `src/components/layout/OnboardingFlow.jsx`
- `src/components/layout/CountrySelection.jsx`
- `src/engine/createCharacter.js`
- `src/engine/npcEngine.js`

## 10) Capturas recomendadas (para agregar luego)
- Header + Dashboard (tab Age)
- Lista de Occupation
- Lista de Relationships con barras
- Tab Assets con inventario + comercio
- Tab Activities con NPCs y política
- Menú de mudanza con tipos de ubicación
