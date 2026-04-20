(function () {
  var TIMER_TOTAL = 20;
  var ANSWER_MARKERS = ["A", "B", "C", "D", "E", "F"];

  var dom = {
    startScene: document.querySelector('[data-scene="start"]'),
    quizScene: document.querySelector('[data-scene="quiz"]'),
    resultScene: document.querySelector('[data-scene="result"]'),
    startButton: document.getElementById("start-quiz"),
    restartButton: document.getElementById("restart-quiz"),
    questionCard: document.getElementById("question-card"),
    progressValue: document.getElementById("question-counter"),
    progressBar: document.getElementById("progress-bar"),
    scoreValue: document.getElementById("score-value"),
    timerValue: document.getElementById("time-left"),
    resultTitle: document.getElementById("result-title"),
    resultScore: document.getElementById("result-score"),
    resultSummary: document.getElementById("result-summary"),
    resultCorrect: document.getElementById("result-correct"),
    resultAccuracy: document.getElementById("result-accuracy")
  };

  var state = null;
  var timerId = null;
  var timeLeft = TIMER_TOTAL;
  var selectedMap = {};

  function showScene(name) {
    [dom.startScene, dom.quizScene, dom.resultScene].forEach(function (scene) {
      var visible = scene.getAttribute("data-scene") === name;
      scene.hidden = !visible;
      scene.classList.toggle("is-visible", visible);
    });
  }

  function buildSession() {
    var prepared = EcoQuizEngine.prepareQuestions(EcoQuizQuestions, Date.now());
    state = EcoQuizEngine.createSession(prepared);
    timeLeft = TIMER_TOTAL;
    selectedMap = {};
    dom.scoreValue.textContent = "0";
    dom.timerValue.textContent = String(TIMER_TOTAL);
  }

  function getCurrentQuestion() {
    return state.questions[state.currentIndex];
  }

  function getQuestionHelper(question) {
    if (question.type === "multi") {
      return "Тут кілька правильних варіантів. Обери набір відповідей і лише потім підтверди.";
    }
    return "Тут лише одна правильна відповідь. Таймер не зупиняється, поки ти думаєш.";
  }

  function getQuestionBadge(question) {
    return question.type === "multi" ? "Кілька правильних" : "Одна правильна";
  }

  function getVisualBlurb(question) {
    if (question.type === "multi") {
      return "Працюй як аналітик: тут важливий не один варіант, а точний набір відповідей.";
    }
    return "Тут вирішує одна відповідь, але вона має бути не інтуїтивною, а обґрунтованою.";
  }

  function animateQuestionCard(className) {
    dom.questionCard.classList.remove("is-entering", "is-correct-pulse", "is-wrong-shake");
    void dom.questionCard.offsetWidth;
    dom.questionCard.classList.add(className);
  }

  function renderQuestion() {
    var question = getCurrentQuestion();
    var progress = ((state.currentIndex + 1) / state.questions.length) * 100;

    dom.progressValue.textContent = "Питання " + (state.currentIndex + 1) + " з " + state.questions.length;
    dom.progressBar.style.width = progress + "%";
    dom.scoreValue.textContent = state.score;
    dom.timerValue.textContent = String(timeLeft);

    var answersMarkup = question.answers.map(function (answer, index) {
      return (
        '<button class="answer-button" type="button" data-answer-id="' + answer.id + '">' +
          '<span class="answer-bullet">' + (ANSWER_MARKERS[index] || index + 1) + "</span>" +
          '<span class="answer-copy-wrap">' +
            '<span class="answer-kicker">Варіант ' + (ANSWER_MARKERS[index] || index + 1) + "</span>" +
            '<span class="answer-copy">' + answer.text + "</span>" +
          "</span>" +
          '<span class="answer-state" aria-hidden="true"></span>' +
        "</button>"
      );
    }).join("");

    dom.questionCard.innerHTML =
      '<div class="question-visual">' +
        '<img src="' + question.image + '" alt="' + question.alt + '">' +
        '<div class="visual-overlay">' +
          '<span class="visual-label">Контекст</span>' +
          '<strong class="visual-title">' + question.category + "</strong>" +
          '<p class="visual-text">' + getVisualBlurb(question) + "</p>" +
        "</div>" +
      "</div>" +
      '<div class="question-panel">' +
        '<div class="question-meta">' +
          '<span class="question-tag">' + question.category + "</span>" +
          '<span class="question-tag">' + getQuestionBadge(question) + "</span>" +
        "</div>" +
        '<h2 class="question-title">' + question.question + "</h2>" +
        '<div class="question-note">' +
          '<p class="question-subtitle">' + getQuestionHelper(question) + "</p>" +
        "</div>" +
        '<div class="answers-shell">' +
          '<div class="answers-grid">' + answersMarkup + "</div>" +
        "</div>" +
        '<div class="fact-panel" id="fact-panel" aria-live="polite"></div>' +
        '<div class="question-actions">' +
          '<p class="question-helper">Літери й порядок відповідей змінюються щоразу, тож вгадати по шаблону не вийде.</p>' +
          '<div class="question-actions__buttons">' +
            (question.type === "multi"
              ? '<button class="ghost-button" id="submit-answer" type="button" disabled>Підтвердити вибір</button>'
              : "") +
            '<button class="secondary-button" id="next-question" type="button" disabled>Далі</button>' +
          "</div>" +
        "</div>" +
      "</div>";

    animateQuestionCard("is-entering");
  }

  function startTimer() {
    clearInterval(timerId);
    dom.timerValue.textContent = String(timeLeft);

    timerId = setInterval(function () {
      timeLeft -= 1;
      dom.timerValue.textContent = String(Math.max(0, timeLeft));
      if (timeLeft <= 0) {
        handleTimeout();
      }
    }, 1000);
  }

  function getSelectedIds() {
    var ids = [];
    for (var key in selectedMap) {
      if (selectedMap.hasOwnProperty(key) && selectedMap[key]) {
        ids.push(key);
      }
    }
    return ids;
  }

  function updateMultiSelectionState() {
    var buttons = dom.questionCard.querySelectorAll(".answer-button");
    var submitButton = dom.questionCard.querySelector("#submit-answer");
    var selectedIds = getSelectedIds();

    buttons.forEach(function (button) {
      var id = button.getAttribute("data-answer-id");
      button.classList.toggle("is-selected", !!selectedMap[id]);
    });

    if (submitButton) {
      submitButton.disabled = selectedIds.length === 0;
    }
  }

  function revealFact(label, question) {
    var factPanel = dom.questionCard.querySelector("#fact-panel");
    factPanel.innerHTML =
      '<p class="fact-label">' + label + "</p>" +
      "<p>" + question.fact + "</p>";
    factPanel.classList.add("is-visible");
  }

  function lockAnswers(question, selectedIds, result, timeoutLabel) {
    var buttons = dom.questionCard.querySelectorAll(".answer-button");
    var submitButton = dom.questionCard.querySelector("#submit-answer");
    var nextButton = dom.questionCard.querySelector("#next-question");

    buttons.forEach(function (button) {
      var id = button.getAttribute("data-answer-id");
      var answer = null;
      for (var i = 0; i < question.answers.length; i++) {
        if (question.answers[i].id === id) {
          answer = question.answers[i];
        }
      }

      button.disabled = true;
      button.classList.remove("is-selected");
      button.classList.toggle("is-correct", !!answer && answer.correct);
      button.classList.toggle("is-wrong", selectedIds.indexOf(id) !== -1 && !!answer && !answer.correct);
    });

    if (submitButton) {
      submitButton.disabled = true;
    }

    nextButton.disabled = false;

    if (timeoutLabel) {
      revealFact(timeoutLabel, question);
      animateQuestionCard("is-wrong-shake");
    } else {
      revealFact(result.isCorrect ? "Правильно" : "Неправильно", question);
      animateQuestionCard(result.isCorrect ? "is-correct-pulse" : "is-wrong-shake");
    }
  }

  function submitAnswer(selectedIds) {
    if (state.status !== "ready") {
      return;
    }

    var question = getCurrentQuestion();
    clearInterval(timerId);

    var result = EcoQuizEngine.gradeAnswer(question, selectedIds);
    state = EcoQuizEngine.applyAnswer(state, result.isCorrect, timeLeft, question.type);
    dom.scoreValue.textContent = String(state.score);
    lockAnswers(question, selectedIds, result, null);
  }

  function handleTimeout() {
    if (!state || state.status !== "ready") {
      return;
    }

    clearInterval(timerId);
    timeLeft = 0;
    dom.timerValue.textContent = "0";
    state = EcoQuizEngine.applyTimeout(state);
    lockAnswers(getCurrentQuestion(), getSelectedIds(), { isCorrect: false }, "Час вийшов");
  }

  function animateCount(element, target) {
    var start = 0;
    var duration = 900;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }
      var progress = Math.min((timestamp - startTime) / duration, 1);
      element.textContent = String(Math.round(start + (target - start) * progress));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function renderResult() {
    var total = state.questions.length;
    var accuracy = Math.round((state.correctCount / total) * 100);

    dom.resultTitle.textContent = state.resultTitle || EcoQuizEngine.getResultTitle(state.correctCount);
    dom.resultSummary.textContent =
      "Ти дав " + state.correctCount + " правильних відповідей із " + total +
      " у вікторині, де доводилося мислити системно: від клімату й води до швидкої моди та мікропластику.";
    dom.resultCorrect.textContent = state.correctCount + " / " + total;
    dom.resultAccuracy.textContent = accuracy + "%";
    animateCount(dom.resultScore, state.score);
  }

  function goNext() {
    state = EcoQuizEngine.goNext(state);

    if (state.isComplete) {
      renderResult();
      showScene("result");
      return;
    }

    selectedMap = {};
    timeLeft = TIMER_TOTAL;
    renderQuestion();
    startTimer();
  }

  function handleSingle(answerId) {
    submitAnswer([answerId]);
  }

  function toggleMulti(answerId) {
    if (selectedMap[answerId]) {
      delete selectedMap[answerId];
    } else {
      selectedMap[answerId] = true;
    }
    updateMultiSelectionState();
  }

  dom.startButton.addEventListener("click", function () {
    buildSession();
    renderQuestion();
    showScene("quiz");
    startTimer();
  });

  dom.restartButton.addEventListener("click", function () {
    buildSession();
    showScene("start");
  });

  dom.questionCard.addEventListener("click", function (event) {
    var nextButton = event.target.closest("#next-question");
    if (nextButton) {
      goNext();
      return;
    }

    var submitButton = event.target.closest("#submit-answer");
    if (submitButton) {
      submitAnswer(getSelectedIds());
      return;
    }

    var answerButton = event.target.closest(".answer-button");
    if (!answerButton || !state || state.status !== "ready") {
      return;
    }

    var answerId = answerButton.getAttribute("data-answer-id");
    if (getCurrentQuestion().type === "multi") {
      toggleMulti(answerId);
    } else {
      handleSingle(answerId);
    }
  });
})();
