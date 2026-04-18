# Diseño del sistema de aldea/pueblo + política (estado verificado)

## Implementado
1. **Hub local de ubicación** con lugares y NPCs persistentes por área.
2. **Comercio compra/venta + trueque parcial** desde la UI (`barterItemId`).
3. **Influencia política** con niveles y decisiones aplicables desde Activities.
4. **Economía anual de acciones** para evitar spam de acciones poderosas en un mismo año.
5. **Restricciones de edad** para acciones sensibles (trabajo, política, mudanza, comercio).
6. **Evolución de ubicación** (`aldea -> ciudad_pequena -> ciudad_grande`) y sincronización narrativa (`hometown` actualizado).
7. **Economía histórica por era** con moneda visible y reescalado interno de salarios/precios.
8. **Naming por sexo** consistente para personaje principal, familia y NPCs.
9. **Aprendizaje por era** con acceso formal según contexto histórico y edad.
10. **Socialización histórica por era** con acciones/espacios sociales distintos y límites anuales.
11. **Relaciones románticas por etapas** con progresión contextual según época.
12. **Modelo laboral de riesgo/salario** que conecta oficio, salud, prestigio y economía.

## Parcial
1. Política por ideologías/facciones completas.
2. Cadena profunda de consecuencias políticas multi-año.
3. Exploración con quests largas por lugar.

## Pendiente
1. IA social avanzada de NPCs con memoria bidireccional por acción.
2. Mercado dinámico por escasez regional.
3. Simulación institucional detallada (partidos, gabinete, legislación).

## Notas de balance actuales
- AP por año dependen de edad (2/3/4/5).
- Acciones críticas tienen coste y tope anual.
- Requisitos mínimos definidos para evitar exploits (edad/influencia/stats en ocupaciones especiales).

> Esta documentación describe solo funcionalidades verificadas en código actual.
