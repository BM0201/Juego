# Reporte técnico de correcciones sistémicas

Fecha: 2026-04-18

## Alcance
Se cerraron exploits y inconsistencias del loop principal para pasar de demo funcional a base escalable.

## Bugs resueltos
1. **Spam de acciones en el mismo año**
   - Solución: economía anual de acciones (AP) + límites por acción.
2. **Acciones fuera de etapa de vida**
   - Solución: gating por edad, influencia y requisitos de ocupación.
3. **UI mostraba cierre anual exitoso cuando el motor lo bloqueaba**
   - Solución: contrato explícito `success/reason/message` respetado por GameFlowScreen.
4. **Persistencia frágil**
   - Solución: snapshot versionado en localStorage con fallback por corrupción y reset limpio.
5. **Exploración decorativa**
   - Solución: acción de exploración real con costo AP y outcomes sistémicos.
6. **Trueque parcial no expuesto**
   - Solución: selector de item de trueque + compra con barter en la UI.
7. **Upgrade de ubicación incoherente con hometown**
   - Solución: recalcular hometown al subir de nivel de localización.
8. **Cobertura de tests insuficiente**
   - Solución: nueva suite `validateCoreSystems` con escenarios críticos.
9. **Sistema monetario plano por época**
   - Solución: motor de eras económicas con moneda y escalado de salarios/precios.
10. **Nombres incoherentes por sexo**
    - Solución: generación de nombres con pool separado por sexo y aplicación en personaje/NPCs.
11. **Educación idéntica entre eras**
    - Solución: contexto educativo histórico que afecta acceso formal y presupuesto de aprendizaje.
12. **Socialización plana entre épocas**
    - Solución: reglas sociales por era con espacios/acciones/riesgo reputacional diferenciados.
13. **Romance instantáneo y sin contexto**
    - Solución: progresión romántica por etapas y exposición social.
14. **Oficios sin lógica de riesgo/salario**
    - Solución: perfiles laborales con hazard/mortalidad/prestigio/escasez y fórmula salarial.

## Estado de build
- El proyecto mantiene scripts de test y build operativos tras las correcciones.
