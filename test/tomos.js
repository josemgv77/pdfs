window.TOMOS = [
  {
    id: 'tomo-1',
    badge: 'Tomo 1',
    title: 'Tomo 1 — Test de ejemplo',
    description: 'Plantilla inicial para sustituir con las preguntas reales del PDF del tomo 1.',
    file: './template.html?tomo=tomo-1',
    questions: [
      {
        text: '¿Qué debes hacer primero para convertir este tomo en un test real?',
        options: [
          'Cambiar solo el nombre del archivo',
          'Extraer las preguntas reales del PDF y cargarlas en este array',
          'Eliminar los botones de navegación',
          'Ocultar la explicación de cada respuesta'
        ],
        correctIndex: 1,
        explanation: 'La plantilla ya contiene la estructura visual y la lógica. Lo primero es reemplazar las preguntas de ejemplo por las preguntas reales del PDF correspondiente.'
      },
      {
        text: '¿Qué ocurre al pulsar “Ver respuesta” en esta plantilla?',
        options: [
          'Se muestra si la opción elegida es correcta o incorrecta y su explicación',
          'Se salta automáticamente al final del examen',
          'Se reinicia el test completo',
          'Se elimina la respuesta seleccionada'
        ],
        correctIndex: 0,
        explanation: 'El botón “Ver respuesta” está pensado para corregir la pregunta actual, indicar la solución correcta y explicar el motivo.'
      },
      {
        text: '¿Qué botón permite obtener el resumen global del test?',
        options: [
          'Anterior',
          'Siguiente',
          'Finalizar',
          'Ver respuesta'
        ],
        correctIndex: 2,
        explanation: 'El botón “Finalizar” calcula aciertos, errores, preguntas en blanco y muestra la puntuación total del test.'
      }
    ]
  },
  {
    id: 'tomo-2',
    badge: 'Tomo 2',
    title: 'Tomo 2 — Test de ejemplo',
    description: 'Segundo ejemplo de tomo para reutilizar la misma base HTML y JavaScript.',
    file: './template.html?tomo=tomo-2',
    questions: [
      {
        text: '¿Dónde se define el conjunto de preguntas de cada tomo?',
        options: [
          'Solo dentro del navegador cuando se abre la página',
          'En el array de objetos definido en tomos.js',
          'Exclusivamente en el archivo index.html',
          'En una hoja de estilos CSS'
        ],
        correctIndex: 1,
        explanation: 'Cada tomo puede definirse como un objeto dentro de tomos.js, con su identificador, título, descripción y listado de preguntas.'
      },
      {
        text: '¿Qué estructura mínima necesita una pregunta para funcionar?',
        options: [
          'Texto, opciones, índice correcto y explicación',
          'Solo el enunciado',
          'Una imagen obligatoria y dos audios',
          'Únicamente una explicación final'
        ],
        correctIndex: 0,
        explanation: 'La lógica del test usa un texto de pregunta, una lista de opciones, la posición de la respuesta correcta y una explicación para justificarla.'
      },
      {
        text: '¿Para qué sirve reutilizar la misma plantilla en todos los tomos?',
        options: [
          'Para evitar tener preguntas distintas',
          'Para mantener un formato y comportamiento consistentes entre tests',
          'Para impedir que el usuario vea resultados',
          'Para usar un único PDF para todos los tomos'
        ],
        correctIndex: 1,
        explanation: 'Una plantilla común facilita el mantenimiento, asegura una experiencia homogénea y permite cargar después las preguntas reales de cada tomo.'
      }
    ]
  }
];
