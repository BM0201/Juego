# Guía: agregar nuevos eventos históricos

Archivo principal: `src/data/historicalEvents.js`

## 1) Evento aleatorio por era

Agregar objeto a `BASE_RANDOM_EVENTS`:

```js
{
  id: 'hambruna_costera',
  era: ['medieval', 'renacentista'],
  type: 'aleatorio',
  title: 'Hambruna costera',
  description: '...',
  categories: ['economica', 'social'],
  risk: 0.55,
  options: [
    { id: 'comprar', label: 'Comprar suministros', effects: { dinero: -10, salud: 6 } },
    { id: 'racionar', label: 'Racionar', effects: { felicidad: -8, dinero: 2 } },
  ],
}
```

## 2) Evento histórico real

Agregar objeto a `HISTORICAL_EVENTS`:

```js
{
  id: 'tratado_paz_18xx',
  type: 'historico',
  era: ['industrial'],
  startYear: 1815,
  endYear: 1835,
  oncePerGame: true,
  title: 'Tratado de paz continental',
  description: '...',
  categories: ['diplomatica', 'politica'],
  options: [...]
}
```

## 3) Evento encadenado

Agregar objeto en `CHAIN_EVENTS`:

```js
{
  id: 'cadena_reforma_tributaria',
  requiresFlag: 'tax_reform_passed',
  title: 'Reacción a la reforma tributaria',
  description: '...',
  era: ['industrial', 'moderna'],
  options: [...]
}
```

Y en una opción previa, definir `chainFlags`:

```js
{ id: 'aprobar_reforma', label: 'Aprobar reforma', effects: { influencia: 5 }, chainFlags: ['tax_reform_passed'] }
```

## 4) Buenas prácticas

1. Mantener entre 2 y 4 opciones por evento.
2. Balancear `effects` para evitar crecimiento exponencial de stats.
3. Evitar duplicar IDs.
4. Probar con `npm test`.
