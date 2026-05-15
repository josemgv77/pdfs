const appState = {
  testData: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  revealed: [],
  modeLabel: 'Test completo'
};

function renderIndex() {
  const grid = document.getElementById('tomos-grid');
  const repoCount = document.getElementById('repo-count');
  if (!grid || !Array.isArray(window.TEST_TOMOS)) return;

  if (repoCount) repoCount.textContent = String(window.TEST_TOMOS.length);
  grid.innerHTML = '';

  window.TEST_TOMOS.forEach((tomo) => {
    const card = document.createElement('article');
    card.className = 'card';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = tomo.badge;

    const title = document.createElement('h2');
    title.textContent = tomo.title;

    const description = document.createElement('p');
    description.textContent = tomo.description;

    const count = document.createElement('p');
    count.innerHTML = `<strong>Preguntas cargadas:</strong> ${tomo.questionCount}`;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const openTest = document.createElement('a');
    openTest.className = 'button primary';
    openTest.href = tomo.htmlFile;
    openTest.textContent = 'Abrir test';

    const openPdf = document.createElement('a');
    openPdf.className = 'button ghost';
    openPdf.href = tomo.pdfHref;
    openPdf.target = '_blank';
    openPdf.rel = 'noreferrer';
    openPdf.textContent = 'Ver PDF';

    actions.append(openTest, openPdf);
    card.append(badge, title, description, count, actions);
    grid.appendChild(card);
  });
}

function updateText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function createOptions(question, selectedAnswer, isRevealed) {
  const container = document.getElementById('options');
  if (!container) return;
  container.innerHTML = '';

  question.options.forEach((optionText, optionIndex) => {
    const label = document.createElement('label');
    label.className = 'option';

    if (isRevealed && optionIndex === question.correctIndex) {
      label.classList.add('correct');
    }
    if (isRevealed && selectedAnswer === optionIndex && selectedAnswer !== question.correctIndex) {
      label.classList.add('incorrect');
    }

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(optionIndex);
    input.checked = selectedAnswer === optionIndex;
    input.addEventListener('change', () => {
      appState.answers[appState.currentQuestionIndex] = optionIndex;
      appState.revealed[appState.currentQuestionIndex] = false;
      renderQuestion();
    });

    const text = document.createElement('span');
    text.textContent = optionText;

    label.append(input, text);
    container.appendChild(label);
  });
}

function renderFeedback(question, selectedAnswer, isRevealed) {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;

  feedback.className = 'feedback';
  feedback.innerHTML = '';

  if (!isRevealed) return;

  if (selectedAnswer === null || selectedAnswer === undefined) {
    feedback.classList.add('visible', 'warning');
    feedback.innerHTML = `<span class="feedback-title">No has seleccionado ninguna opción.</span>La respuesta correcta es <strong>${question.options[question.correctIndex]}</strong>.<br /><br /><strong>Explicación:</strong> ${question.explanation}`;
    return;
  }

  if (selectedAnswer === question.correctIndex) {
    feedback.classList.add('visible', 'correct');
    feedback.innerHTML = `<span class="feedback-title">Respuesta correcta.</span>Has marcado <strong>${question.options[selectedAnswer]}</strong>.<br /><br /><strong>Explicación:</strong> ${question.explanation}`;
    return;
  }

  feedback.classList.add('visible', 'incorrect');
  feedback.innerHTML = `<span class="feedback-title">Respuesta incorrecta.</span>Has marcado <strong>${question.options[selectedAnswer]}</strong>, pero la correcta es <strong>${question.options[question.correctIndex]}</strong>.<br /><br /><strong>Explicación:</strong> ${question.explanation}`;
}

function provisionalCorrectCount() {
  return appState.questions.reduce((total, question, index) => total + (appState.answers[index] === question.correctIndex ? 1 : 0), 0);
}

function renderQuestion() {
  const question = appState.questions[appState.currentQuestionIndex];
  if (!question) return;

  const selectedAnswer = appState.answers[appState.currentQuestionIndex];
  const isRevealed = appState.revealed[appState.currentQuestionIndex];

  updateText('test-title', appState.testData.title);
  updateText('test-description', appState.testData.description);
  updateText('test-badge', appState.testData.badge || 'Tomo');
  updateText('status-total', String(appState.questions.length));
  updateText('status-mode', appState.modeLabel);
  updateText('seed-note', appState.testData.seedNote || 'Preguntas semilla disponibles.');
  updateText('status-question', `${appState.currentQuestionIndex + 1} / ${appState.questions.length}`);
  updateText('status-answered', String(appState.answers.filter((answer) => answer !== null && answer !== undefined).length));
  updateText('status-correct', String(provisionalCorrectCount()));
  updateText('question-text', question.text);

  const sourceLink = document.getElementById('source-pdf-link');
  if (sourceLink) {
    sourceLink.href = appState.testData.sourcePdf;
    sourceLink.textContent = appState.testData.sourcePdfLabel;
  }

  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  if (prevButton) prevButton.disabled = appState.currentQuestionIndex === 0;
  if (nextButton) nextButton.disabled = appState.currentQuestionIndex === appState.questions.length - 1;

  createOptions(question, selectedAnswer, isRevealed);
  renderFeedback(question, selectedAnswer, isRevealed);
}

function computeResults() {
  return appState.questions.reduce((summary, question, index) => {
    const answer = appState.answers[index];
    if (answer === null || answer === undefined) {
      summary.unanswered += 1;
      summary.failedIndexes.push(index);
    } else if (answer === question.correctIndex) {
      summary.correct += 1;
    } else {
      summary.incorrect += 1;
      summary.failedIndexes.push(index);
    }
    return summary;
  }, { correct: 0, incorrect: 0, unanswered: 0, failedIndexes: [] });
}

function finishTest() {
  const results = document.getElementById('results');
  if (!results) return;

  const summary = computeResults();
  const total = appState.questions.length;
  const percentage = total > 0 ? Math.round((summary.correct / total) * 100) : 0;

  updateText('hits', String(summary.correct));
  updateText('errors', String(summary.incorrect));
  updateText('blank', String(summary.unanswered));
  updateText('score', `${percentage}%`);

  const note = document.getElementById('results-note');
  if (note) {
    if (summary.failedIndexes.length > 0) {
      note.textContent = 'Puedes repetir solo las preguntas falladas o pendientes con el botón inferior. La selección se mantiene únicamente en memoria durante esta sesión.';
    } else {
      note.textContent = 'Has acertado todas las preguntas cargadas en este tomo.';
    }
  }

  const repeatButton = document.getElementById('repeat-failed-button');
  if (repeatButton) {
    repeatButton.hidden = summary.failedIndexes.length === 0;
    repeatButton.onclick = () => repeatFailed(summary.failedIndexes);
  }

  results.hidden = false;
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function repeatFailed(failedIndexes) {
  const uniqueIndexes = Array.from(new Set(failedIndexes)).filter((index) => appState.questions[index]);
  if (uniqueIndexes.length === 0) return;

  appState.questions = uniqueIndexes.map((index) => appState.questions[index]);
  appState.answers = appState.questions.map(() => null);
  appState.revealed = appState.questions.map(() => false);
  appState.currentQuestionIndex = 0;
  appState.modeLabel = 'Repaso de falladas';

  const results = document.getElementById('results');
  if (results) results.hidden = true;
  renderQuestion();
}

function bindTestEvents() {
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  const revealButton = document.getElementById('reveal-button');
  const finishButton = document.getElementById('finish-button');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (appState.currentQuestionIndex > 0) {
        appState.currentQuestionIndex -= 1;
        renderQuestion();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (appState.currentQuestionIndex < appState.questions.length - 1) {
        appState.currentQuestionIndex += 1;
        renderQuestion();
      }
    });
  }

  if (revealButton) {
    revealButton.addEventListener('click', () => {
      appState.revealed[appState.currentQuestionIndex] = true;
      renderQuestion();
    });
  }

  if (finishButton) {
    finishButton.addEventListener('click', finishTest);
  }
}

function initTestPage() {
  if (!window.TEST_DATA || !document.getElementById('test-app')) return;

  appState.testData = window.TEST_DATA;
  appState.questions = Array.isArray(window.TEST_DATA.questions) ? window.TEST_DATA.questions.slice(0, 350) : [];
  appState.answers = appState.questions.map(() => null);
  appState.revealed = appState.questions.map(() => false);
  appState.currentQuestionIndex = 0;
  appState.modeLabel = 'Test completo';

  bindTestEvents();
  renderQuestion();
}

document.addEventListener('DOMContentLoaded', () => {
  renderIndex();
  initTestPage();
});
