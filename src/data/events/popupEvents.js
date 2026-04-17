export const POPUP_EVENTS = [
  {
    id: 'lost_while_playing',
    weight: 7,
    cooldown: 3,
    conditions: { ageMin: 4, ageMax: 10 },
    text: 'Saliste a jugar con tu hermano y se perdieron camino a casa. Un extraño dice que puede llevarlos.',
    choices: [
      {
        id: 'go_with_stranger',
        label: 'Ir con el extraño',
        hint: 'Puede resolver rápido o empeorar el riesgo.',
        outcomes: [
          { weight: 2, text: 'El adulto resultó fiable y volvieron a casa.', effects: { bond: 1, emotional: -1 } },
          { weight: 5, text: 'La situación fue confusa y terminó en miedo y regaño.', effects: { emotional: -5, bond: -2 } },
        ],
      },
      {
        id: 'say_no_wait',
        label: 'Decir que no y esperar',
        hint: 'Más prudente, pero genera tensión por la demora.',
        outcomes: [
          { weight: 6, text: 'Un vecino los encontró y evitó un problema mayor.', effects: { emotional: 2, bond: 2 } },
          { weight: 3, text: 'Llegaron tarde y hubo castigo en casa.', effects: { bond: -2, emotional: -1 } },
        ],
      },
      {
        id: 'run',
        label: 'Correr',
        hint: 'Puede funcionar o causar accidente.',
        outcomes: [
          { weight: 4, text: 'Lograron volver, aunque muy alterados.', effects: { health: 1, emotional: -2 } },
          { weight: 4, text: 'Tropezaste corriendo y te golpeaste.', effects: { health: -3, emotional: -2, sleep: -1 } },
        ],
      },
    ],
  },
  {
    id: 'minor_accident_popup',
    weight: 8,
    cooldown: 2,
    conditions: { ageMin: 3, ageMax: 11 },
    text: 'Sufriste un accidente leve jugando cerca de herramientas.',
    choices: [
      {
        id: 'hide_pain',
        label: 'Ocultar dolor',
        hint: 'Evita reto inicial pero puede empeorar.',
        outcomes: [
          { weight: 5, text: 'El dolor aumentó y dormiste mal varios días.', effects: { health: -4, sleep: -3, emotional: -2 } },
          { weight: 3, text: 'No fue grave y seguiste con cuidado.', effects: { health: -1, emotional: -1 } },
        ],
      },
      {
        id: 'ask_for_help',
        label: 'Pedir ayuda',
        hint: 'Más seguro, con posible regaño.',
        outcomes: [
          { weight: 6, text: 'Recibiste cuidado rápido y evitaste complicaciones.', effects: { health: 2, bond: 2 } },
          { weight: 2, text: 'Te cuidaron, pero hubo tensión por el susto.', effects: { health: 1, bond: -1, emotional: -1 } },
        ],
      },
    ],
  },
  {
    id: 'dangerous_object_found',
    weight: 5,
    cooldown: 4,
    conditions: { ageMin: 5, ageMax: 12 },
    text: 'Encontraste un objeto peligroso mientras jugabas.',
    choices: [
      {
        id: 'touch_it',
        label: 'Manipularlo',
        hint: 'Curiosidad alta, riesgo alto.',
        outcomes: [
          { weight: 6, text: 'Te lastimaste de forma leve por manipularlo.', effects: { health: -4, emotional: -2 } },
          { weight: 2, text: 'No pasó nada grave, pero hubo gran susto.', effects: { emotional: -3 } },
        ],
      },
      {
        id: 'call_adult',
        label: 'Llamar a un adulto',
        hint: 'Más prudente.',
        outcomes: [
          { weight: 7, text: 'El adulto retiró el objeto y elogió tu prudencia.', effects: { emotional: 2, bond: 2 } },
          { weight: 2, text: 'Te retaron por acercarte demasiado antes de avisar.', effects: { bond: -1, emotional: -1 } },
        ],
      },
    ],
  },
  {
    id: 'stranger_offers_help',
    weight: 4,
    cooldown: 5,
    conditions: { ageMin: 6, ageMax: 12 },
    text: 'Un desconocido te ofrece ayuda en una situación incómoda.',
    choices: [
      { id: 'accept_help', label: 'Aceptar ayuda', hint: 'Puede ser útil o inseguro.', outcomes: [
        { weight: 3, text: 'La ayuda fue real y saliste del problema.', effects: { emotional: 1 } },
        { weight: 5, text: 'Te sentiste inseguro y llegaste con miedo a casa.', effects: { emotional: -4, bond: -1 } },
      ] },
      { id: 'decline_help', label: 'Rechazar y buscar casa', hint: 'Más seguro, más esfuerzo.', outcomes: [
        { weight: 6, text: 'Tomaste una decisión prudente y evitaste riesgo.', effects: { emotional: 2, development: 1 } },
        { weight: 3, text: 'Te desorientaste más y terminaste agotado.', effects: { sleep: -2, emotional: -1 } },
      ] },
    ],
  },
  {
    id: 'fight_with_child', weight: 6, cooldown: 2, conditions: { ageMin: 4, ageMax: 12 },
    text: 'Tuviste una pelea con otro niño del barrio.',
    choices: [
      { id: 'fight_back', label: 'Responder con pelea', hint: 'Defensa rápida, tensión posterior.', outcomes: [
        { weight: 4, text: 'Te defendiste, pero quedó conflicto abierto.', effects: { health: -1, emotional: -2, bond: -1 } },
        { weight: 3, text: 'Recibiste un golpe y quedaste alterado.', effects: { health: -3, emotional: -3 } },
      ] },
      { id: 'ask_mediation', label: 'Buscar mediación adulta', hint: 'Menos violencia, posible vergüenza.', outcomes: [
        { weight: 6, text: 'Se resolvió el conflicto sin daño mayor.', effects: { emotional: 2, bond: 1 } },
        { weight: 2, text: 'Se burlaron un poco, pero evitaste golpes.', effects: { emotional: -1, health: 1 } },
      ] },
    ],
  },
  {
    id: 'unexpected_punishment', weight: 5, cooldown: 3, conditions: { ageMin: 4, ageMax: 11 },
    text: 'Recibiste un castigo inesperado por algo que ocurrió en casa.',
    choices: [
      { id: 'obey_quiet', label: 'Aceptar en silencio', hint: 'Menos conflicto, más carga emocional.', outcomes: [
        { weight: 5, text: 'Se calmó la situación, pero te afectó por dentro.', effects: { bond: 1, emotional: -2 } },
        { weight: 3, text: 'El castigo fue más breve por tu conducta.', effects: { bond: 2, emotional: -1 } },
      ] },
      { id: 'protest', label: 'Protestar', hint: 'Descarga inmediata, riesgo de escalada.', outcomes: [
        { weight: 5, text: 'Escaló el conflicto y hubo más tensión.', effects: { bond: -4, emotional: -3 } },
        { weight: 2, text: 'Te escucharon parcialmente y redujeron el castigo.', effects: { bond: -1, emotional: 1 } },
      ] },
    ],
  },
  {
    id: 'sudden_illness_popup', weight: 7, cooldown: 3, conditions: { ageMin: 0, ageMax: 12 },
    text: 'Apareció una enfermedad repentina durante la semana.',
    choices: [
      { id: 'rest', label: 'Guardar reposo', hint: 'Recupera salud, frena ritmo.', outcomes: [
        { weight: 7, text: 'Descansaste y mejoraste en pocos días.', effects: { health: 3, development: -1, sleep: 2 } },
        { weight: 2, text: 'Mejoraste lento y quedaste débil.', effects: { health: -1, sleep: -1 } },
      ] },
      { id: 'push_through', label: 'Seguir como si nada', hint: 'Mantiene actividad, empeora riesgo.', outcomes: [
        { weight: 6, text: 'La enfermedad empeoró por sobreesfuerzo.', effects: { health: -5, sleep: -3, emotional: -2 } },
        { weight: 2, text: 'No pasó a mayores, pero acabaste agotado.', effects: { sleep: -2, health: -1 } },
      ] },
    ],
  },
  {
    id: 'sibling_in_trouble', weight: 5, cooldown: 3, conditions: { ageMin: 5, ageMax: 12 },
    text: 'Tu hermano se metió en problemas y te pidió cubrirlo.',
    choices: [
      { id: 'cover_sibling', label: 'Cubrir a tu hermano', hint: 'Proteges vínculo, riesgo de castigo.', outcomes: [
        { weight: 5, text: 'Protegiste a tu hermano pero te castigaron al descubrirlo.', effects: { bond: 3, emotional: -2 } },
        { weight: 3, text: 'Nadie lo notó y el vínculo mejoró.', effects: { bond: 4, emotional: 1 } },
      ] },
      { id: 'tell_truth', label: 'Decir la verdad', hint: 'Más justo, posible tensión entre hermanos.', outcomes: [
        { weight: 6, text: 'Evitaron un problema mayor, pero hubo enojo contigo.', effects: { emotional: 1, bond: -2 } },
        { weight: 2, text: 'A la larga mejoró la confianza familiar.', effects: { bond: 2, emotional: 1 } },
      ] },
    ],
  },
  {
    id: 'adult_asks_for_help', weight: 4, cooldown: 2, conditions: { ageMin: 6, ageMax: 12 },
    text: 'Un adulto del entorno te pidió ayuda en una tarea urgente.',
    choices: [
      { id: 'help_now', label: 'Ayudar de inmediato', hint: 'Ganas reconocimiento, con cansancio.', outcomes: [
        { weight: 6, text: 'Ayudaste bien y te valoraron en casa.', effects: { bond: 2, development: 1, sleep: -1 } },
        { weight: 2, text: 'La tarea fue pesada y quedaste exhausto.', effects: { health: -2, sleep: -2 } },
      ] },
      { id: 'decline_politely', label: 'Negarte con respeto', hint: 'Cuida energía, posible tensión social.', outcomes: [
        { weight: 4, text: 'Respetaron tu límite sin problema.', effects: { emotional: 1 } },
        { weight: 4, text: 'Lo tomaron mal y quedó tensión.', effects: { emotional: -2, bond: -1 } },
      ] },
    ],
  },
  {
    id: 'aggressive_animal', weight: 4, cooldown: 4, conditions: { ageMin: 4, ageMax: 12 },
    text: 'Un animal agresivo apareció mientras jugabas fuera.',
    choices: [
      { id: 'freeze', label: 'Quedarte quieto', hint: 'Puede evitar ataque o aumentar miedo.', outcomes: [
        { weight: 5, text: 'El animal se fue y evitaste daño.', effects: { emotional: 1 } },
        { weight: 3, text: 'Pasaste mucho miedo aunque sin heridas.', effects: { emotional: -3, sleep: -1 } },
      ] },
      { id: 'run_away', label: 'Correr', hint: 'Escapas rápido, riesgo de caída.', outcomes: [
        { weight: 4, text: 'Escapaste sin lesiones.', effects: { health: 1, emotional: -1 } },
        { weight: 4, text: 'Caíste al correr y te golpeaste.', effects: { health: -3, sleep: -1 } },
      ] },
    ],
  },
  {
    id: 'small_fire', weight: 2, cooldown: 6, conditions: { ageMin: 6, ageMax: 12, family: { householdResourcesMax: 65 } },
    text: 'Se inició un incendio pequeño en una zona cercana de la casa.',
    choices: [
      { id: 'call_help', label: 'Pedir ayuda de inmediato', hint: 'Respuesta segura.', outcomes: [
        { weight: 6, text: 'Controlaron el fuego rápido y evitaron daños mayores.', effects: { emotional: -1, bond: 2 } },
        { weight: 2, text: 'Hubo daños menores, pero todos quedaron a salvo.', effects: { emotional: -2, bond: 1 } },
      ] },
      { id: 'try_alone', label: 'Intentar apagarlo solo', hint: 'Muy riesgoso.', outcomes: [
        { weight: 6, text: 'Te quemaste levemente por actuar solo.', effects: { health: -5, emotional: -2 } },
        { weight: 1, text: 'Lograste contenerlo, pero con gran susto.', effects: { development: 1, emotional: -2 } },
      ] },
    ],
  },
  {
    id: 'spoiled_food', weight: 5, cooldown: 4, conditions: { ageMin: 2, ageMax: 12, family: { foodAccessMax: 55 } },
    text: 'Comiste algo en mal estado y empezaste a sentirte mal.',
    choices: [
      { id: 'stop_eating', label: 'Dejar de comer y avisar', hint: 'Reduce impacto.', outcomes: [
        { weight: 7, text: 'Evitaste una intoxicación mayor.', effects: { health: 1, development: 1 } },
        { weight: 2, text: 'Aun así pasaste una noche difícil.', effects: { health: -2, sleep: -2 } },
      ] },
      { id: 'ignore_symptoms', label: 'Ignorar síntomas', hint: 'Alta probabilidad de empeorar.', outcomes: [
        { weight: 7, text: 'Terminaste con malestar fuerte.', effects: { health: -5, sleep: -3, emotional: -2 } },
        { weight: 1, text: 'El malestar cedió rápidamente.', effects: { health: -1 } },
      ] },
    ],
  },
  {
    id: 'severe_storm_outside', weight: 4, cooldown: 3, conditions: { ageMin: 4, ageMax: 12 },
    text: 'Se desató una tormenta fuerte mientras jugabas fuera de casa.',
    choices: [
      { id: 'seek_shelter', label: 'Buscar refugio', hint: 'Más seguro, puede asustar.', outcomes: [
        { weight: 6, text: 'Encontraste refugio y evitaste problemas.', effects: { emotional: 1 } },
        { weight: 2, text: 'Te asustaste mucho, pero llegaste bien.', effects: { emotional: -2, sleep: -1 } },
      ] },
      { id: 'keep_running', label: 'Seguir corriendo hacia casa', hint: 'Rápido pero riesgoso.', outcomes: [
        { weight: 5, text: 'Llegaste rápido pero empapado y agotado.', effects: { sleep: -2, health: -1 } },
        { weight: 3, text: 'Te caíste en el barro y te golpeaste.', effects: { health: -3, emotional: -1 } },
      ] },
    ],
  },
  {
    id: 'fall_or_hit', weight: 7, cooldown: 2, conditions: { ageMin: 1, ageMax: 12 },
    text: 'Tuviste una caída o golpe inesperado durante el día.',
    choices: [
      { id: 'rest_and_report', label: 'Descansar y avisar', hint: 'Recuperación más segura.', outcomes: [
        { weight: 6, text: 'Te recuperaste sin complicaciones.', effects: { health: 2, sleep: 1 } },
        { weight: 2, text: 'Dolió más de lo esperado y te frenó varios días.', effects: { health: -2, development: -1 } },
      ] },
      { id: 'continue_playing', label: 'Seguir jugando', hint: 'Puede agravar lesión.', outcomes: [
        { weight: 6, text: 'El golpe empeoró por no parar.', effects: { health: -4, sleep: -2 } },
        { weight: 2, text: 'No pasó a mayores, pero quedaste adolorido.', effects: { health: -1 } },
      ] },
    ],
  },
  {
    id: 'risky_invitation', weight: 5, cooldown: 3, conditions: { ageMin: 6, ageMax: 12 },
    text: 'Otro niño te invitó a hacer algo riesgoso lejos de adultos.',
    choices: [
      { id: 'accept_invite', label: 'Aceptar invitación', hint: 'Puede ser emocionante o peligroso.', outcomes: [
        { weight: 4, text: 'La aventura salió bien y ganaste confianza.', effects: { emotional: 2, development: 1 } },
        { weight: 5, text: 'Terminó mal y volviste con susto.', effects: { health: -2, emotional: -3, bond: -1 } },
      ] },
      { id: 'reject_invite', label: 'Rechazar invitación', hint: 'Más prudente, posible presión social.', outcomes: [
        { weight: 6, text: 'Evitaste un riesgo innecesario.', effects: { emotional: 1, development: 1 } },
        { weight: 3, text: 'Te aislaron por un tiempo del grupo.', effects: { emotional: -2 } },
      ] },
    ],
  },
];
