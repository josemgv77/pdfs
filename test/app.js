const state = {
  test: null,
  currentQuestionIndex: 0,
  answers: [],
  revealed: []
};

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];

  return questions.map((question, index) => ({
    id: question.id || `q-${index + 1}`,
    text: question.text || `Pregunta ${index + 1}`,
    options: Array.isArray(question.options) ? question.options : [],
    correctIndex: Number.isInteger(question.correctIndex) ? question.correctIndex : 0,
    explanation: question.explanation || 'Explicación no disponible todavía.'
  }));
}

function getEmbeddedConfig() {
  if (window.TEST_CONFIG) {
    return {
      tomoId: window.TEST_CONFIG.tomoId || 'plantilla',
      title: window.TEST_CONFIG.title || 'Test sin título',
      description: window.TEST_CONFIG.description || 'Sin descripción.',
      questions: normalizeQuestions(window.TEST_CONFIG.questions)
    };
  }

  return null;
}

function getRouteTomoId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('tomo');
}

function getTestFromTomos() {
  if (!Array.isArray(window.TOMOS)) return null;

  const tomoId = getRouteTomoId();
  if (!tomoId) return null;

  return window.TOMOS.find((item) => item.id === tomoId) || null;
}

function buildTestContext() {
  const embedded = getEmbeddedConfig();
  if (embedded) return embedded;

  const tomo = getTestFromTomos();
  if (tomo) {
    return {
      tomoId: tomo.id,
      title: tomo.title,
      description: tomo.description || 'Test del tomo seleccionado.',
      questions: normalizeQuestions(tomo.questions)
    };
  }

  return null;
}

function renderIndex() {
  const grid = document.getElementById('tomos-grid');
  if (!grid || !Array.isArray(window.TOMOS)) return;

  grid.innerHTML = '';

  window.TOMOS.forEach((tomo) => {
    const card = document.createElement('article');
    card.className = 'card';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = tomo.badge || 'Tomo';

    const title = document.createElement('h2');
    title.textContent = tomo.title;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = tomo.description || 'Sin descripción disponible.';

    const total = document.createElement('p');
    total.className = 'meta';
    total.innerHTML = `<strong>Preguntas cargadas:</strong> ${Array.isArray(tomo.questions) ? tomo.questions.length : 0}`;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const openButton = document.createElement('a');
    openButton.className = 'button primary';
    openButton.href = tomo.file || `./template.html?tomo=${encodeURIComponent(tomo.id)}`;
    openButton.textContent = 'Abrir test';

    actions.appendChild(openButton);
    card.append(badge, title, meta, total, actions);
    grid.appendChild(card);
  });
}

function renderQuestion() {
  const question = state.test.questions[state.currentQuestionIndex];
  if (!question) return;

  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options');
  const feedback = document.getElementById('feedback');
  const statusTomo = document.getElementById('status-tomo');
  const statusQuestion = document.getElementById('status-question');
  const statusAnswered = document.getElementById('status-answered');
  const title = document.getElementById('test-title');
  const description = document.getElementById('test-description');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  if (title) title.textContent = state.test.title;
  if (description) description.textContent = state.test.description;
  if (statusTomo) statusTomo.textContent = state.test.tomoId;
  if (statusQuestion) statusQuestion.textContent = `${state.currentQuestionIndex + 1} / ${state.test.questions.length}`;
  if (statusAnswered) statusAnswered.textContent = state.answers.filter((answer) => answer !== null).length;
  if (questionText) questionText.textContent = question.text;

  optionsContainer.innerHTML = '';

  question.options.forEach((optionText, optionIndex) => {
    const label = document.createElement('label');
    label.className = 'option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(optionIndex);
    input.checked = state.answers[state.currentQuestionIndex] === optionIndex;

    input.addEventListener('change', () => {
      state.answers[state.currentQuestionIndex] = optionIndex;
      state.revealed[state.currentQuestionIndex] = false;
      renderQuestion();
    });

    const text = document.createElement('span');
    text.textContent = optionText;

    label.append(input, text);

    if (state.revealed[state.currentQuestionIndex]) {
      if (optionIndex === question.correctIndex) {
        label.classList.add('correct');
      }

      const selected = state.answers[state.currentQuestionIndex];
      if (selected === optionIndex && selected !== question.correctIndex) {
        label.classList.add('incorrect');
      }
    }

    optionsContainer.appendChild(label);
  });

  feedback.className = 'feedback';
  feedback.innerHTML = '';

  if (state.revealed[state.currentQuestionIndex]) {
    const selected = state.answers[state.currentQuestionIndex];

    if (selected === null || selected === undefined) {
      feedback.classList.add('visible', 'warning');
      feedback.innerHTML = `
        <span class="feedback-title">No has seleccionado ninguna respuesta.</span>
        La opción correcta es la <strong>${question.correctIndex + 1}</strong>: ${question.options[question.correctIndex]}.
        <br /><br />
        <strong>Explicación:</strong> ${question.explanation}
      `;
    } else if (selected === question.correctIndex) {
      feedback.classList.add('visible', 'correct');
      feedback.innerHTML = `
        <span class="feedback-title">Respuesta correcta.</span>
        Has marcado la opción correcta: <strong>${question.options[question.correctIndex]}</strong>.
        <br /><br />
        <strong>Explicación:</strong> ${question.explanation}
      `;
    } else {
      feedback.classList.add('visible', 'incorrect');
      feedback.innerHTML = `
        <span class="feedback-title">Respuesta incorrecta.</span>
        Has marcado <strong>${question.options[selected]}</strong>, pero la correcta es <strong>${question.options[question.correctIndex]}</strong>.
        <br /><br />
        <strong>Explicación:</strong> ${question.explanation}
      `;
    }
  }

  if (prevButton) prevButton.disabled = state.currentQuestionIndex === 0;
  if (nextButton) nextButton.disabled = state.currentQuestionIndex === state.test.questions.length - 1;
}

function finishTest() {
  const results = document.getElementById('results');
  const score = document.getElementById('score');
  const hits = document.getElementById('hits');
  const errors = document.getElementById('errors');
  const blank = document.getElementById('blank');

  const total = state.test.questions.length;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  state.test.questions.forEach((question, index) => {
    const answer = state.answers[index];
    if (answer === null || answer === undefined) {
      unanswered += 1;
    } else if (answer === question.correctIndex) {
      correct += 1;
    } else {
      incorrect += 1;
    }
  });

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  score.textContent = `${percentage}%`;
  hits.textContent = `${correct} de ${total}`;
  errors.textContent = String(incorrect);
  blank.textContent = String(unanswered);
  results.classList.add('visible');
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function bindTestEvents() {
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  const revealButton = document.getElementById('reveal-button');
  const finishButton = document.getElementById('finish-button');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
        renderQuestion();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (state.currentQuestionIndex < state.test.questions.length - 1) {
        state.currentQuestionIndex += 1;
        renderQuestion();
      }
    });
  }

  if (revealButton) {
    revealButton.addEventListener('click', () => {
      state.revealed[state.currentQuestionIndex] = true;
      renderQuestion();
    });
  }

  if (finishButton) {
    finishButton.addEventListener('click', finishTest);
  }
}

function initTestPage() {
  const context = buildTestContext();
  if (!context) return;

  state.test = context;
  state.currentQuestionIndex = 0;
  state.answers = context.questions.map(() => null);
  state.revealed = context.questions.map(() => false);

  bindTestEvents();
  renderQuestion();
}

document.addEventListener('DOMContentLoaded', () => {
  renderIndex();
  initTestPage();
});
