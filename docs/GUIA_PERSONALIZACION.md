# Guía: ampliar personalización de personajes

## Archivos clave

- `src/data/appearanceCatalog.js`
- `src/core/characterEngine.js`
- `src/components/CharacterEditor.jsx`
- `src/components/AvatarRenderer.jsx`

## 1) Agregar nuevo corte de pelo

En `HAIR_STYLES`:

```js
{ id: 'trenzas_cortas', label: 'Trenzas cortas', eras: ['moderna'], genders: ['f', 'm'] }
```

## 2) Agregar nuevo accesorio restringido por rol

En `ACCESSORIES`:

```js
{ id: 'medalla_militar', label: 'Medalla militar', eras: ['industrial', 'moderna'], roles: ['rey', 'noble'], unlock: 'legacy_25' }
```

- `unlock: 'base'` => disponible al inicio.
- `unlock: 'legacy_25'` => se desbloquea cuando `legacyScore >= 25`.

## 3) Agregar nueva ropa por clase social

En `CLOTHING`:

```js
{ id: 'uniforme_gala', label: 'Uniforme de gala', tier: 'real', eras: ['moderna'], roles: ['rey'] }
```

## 4) Herencia física

La herencia se calcula en:
- `inheritAppearanceFromParents(...)` en `characterEngine.js`

Puedes cambiar el algoritmo para:
- porcentaje dominante de un progenitor
- mutaciones raras
- herencia por linajes específicos

## 5) Render visual

Si agregas nuevos IDs visuales, mapearlos en `AvatarRenderer.jsx`:
- símbolos de accesorios
- paleta de ropa
- trazos de barba/cabello

## 6) Validación

Ejecutar:

```bash
npm test
```

Y revisar en juego:
- restricciones por rol
- filtros por era
- persistencia en save/carga
