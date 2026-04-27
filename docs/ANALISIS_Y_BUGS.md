# Análisis profundo, bugs y problemas detectados

## Fase 1: comparación de fuentes

### Procedimiento
1. Extracción de ZIP en entorno local.
2. Clonado de repo remoto rama `codex/task-title`.
3. Comparación recursiva de contenido con `diff -qr` (sin `.git`, sin `node_modules`).
4. Verificación de commit más reciente en repo clonado.

### Hallazgo
- La versión del repositorio clonado (`repo_version`) estaba más actualizada y se tomó como base.

## Mapa de arquitectura original (antes de la reescritura)

- `src/engine/*`: muchos módulos de dominio con responsabilidades cruzadas.
- `src/screens/*` y `src/components/*`: UI funcional pero acoplada al estado interno.
- `src/state/*`: persistencia básica y estado principal.
- `src/data/*`: datasets y plantillas.

## Problemas detectados en arquitectura original

1. **Demasiada fragmentación en engines**
   - Mucha lógica distribuida en numerosos archivos con puntos de integración complejos.
   - Difícil extender sin romper comportamientos existentes.

2. **Personalización incompleta como sistema de juego**
   - No existía un motor visual integral por época/rol, ni herencia robusta.

3. **Guardado funcional pero limitado**
   - Sin una capa clara para slots múltiples + checkpoints estructurados.

4. **Eventos sin pipeline unificado de cadenas de consecuencias**
   - Existían eventos, pero no un flujo compacto y claro para encadenamiento persistente.

## Bugs (críticos y estables) identificados

### Críticos
1. **Desalineación entre fuentes de trabajo**
   - Riesgo de editar la fuente equivocada al coexistir ZIP y repo con diferencias.
   - Solución: consolidación en `repo_version` y reescritura única.

2. **Riesgo de inconsistencias al evolucionar features core**
   - Arquitectura previa hacía costoso mantener coherencia en cambios grandes.
   - Solución: nueva arquitectura modular y más pequeña con motores centralizados.

### Estables (calidad/UX/mantenibilidad)
3. **Falta de restricciones visuales completas por clase social**
   - Solución: filtros por rol/era + desbloqueos por legado.

4. **Escasa expresividad de la progresión dinástica**
   - Solución: herederos, continuidad al morir, score de legado y momentos dinásticos.

5. **Sistema de guardado sin experiencia explícita de gestión**
   - Solución: autosave + save manual + checkpoint + carga/eliminación en UI.

6. **Peso y complejidad de mantenimiento de interfaz original**
   - Solución: UI más compacta, consistente y responsive.

## Problemas de rendimiento (antes)

- Bundle JS mayor y más difícil de optimizar por dispersión funcional.
- Coste cognitivo alto para depurar por múltiples módulos interdependientes.

## Resultado tras reescritura

- Módulos claros por responsabilidad (`core/data/state/components`).
- Menor tamaño de build JS.
- Pipeline estable: evento -> decisión -> consecuencias -> año -> autosave.
