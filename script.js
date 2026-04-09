(function () {
  var TIMER_TOTAL = 20;
  var TIMER_RADIUS = 54;
  var TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;
  var ANSWER_LABELS = ["A", "B", "C", "D"];

  var dom = {
    startScene: document.querySelector('[data-scene="start"]'),
    quizScene: document.querySelector('[data-scene="quiz"]'),
    resultScene: document.querySelector('[data-scene="result"]'),
    startButton: document.getElementById("start-quiz"),
    restartButton: document.getElementById("restart-quiz"),
    questionCounter: document.getElementById("question-counter"),
    progressBar: document.getElementById("progress-bar"),
    scoreValue: document.getElementById("score-value"),
    timeLeft: document.getElementById("time-left"),
    timerRing: document.getElementById("timer-ring"),
    questionCard: document.getElementById("question-card"),
    resultRank: document.getElementById("result-rank"),
    resultScore: document.getElementById("result-score"),
    resultSummary: document.getElementById("result-summary"),
    resultCorrect: document.getElementById("result-correct"),
    resultAccuracy: document.getElementById("result-accuracy")
  };

  var state = CarQuizEngine.createInitialState(CarQuizQuestions.length);
  var timeLeft = TIMER_TOTAL;
  var timerId = null;

  function showScene(name) {
    [dom.startScene, dom.quizScene, dom.resultScene].forEach(function (scene) {
      var visible = scene.getAttribute("data-scene") === name;
      scene.hidden = !visible;
      scene.classList.toggle("is-visible", visible);
    });
  }

  function resetQuiz() {
    clearInterval(timerId);
    state = CarQuizEngine.createInitialState(CarQuizQuestions.length);
    timeLeft = TIMER_TOTAL;
    dom.scoreValue.textContent = state.score;
    updateTimerRing();
  }

  function getCurrentQuestion() {
    return CarQuizQuestions[state.currentQuestionIndex];
  }

  function animateQuestionCard(className) {
    dom.questionCard.classList.remove("is-entering", "is-pulse", "is-shake");
    void dom.questionCard.offsetWidth;
    if (className) {
      dom.questionCard.classList.add(className);
    }
  }

  function getAnswerMarkup(item) {
    return item.answers.map(function (answer, index) {
      return (
        '<button class="answer-button" type="button" data-answer-index="' + index + '" style="--stagger:' + (index + 1) + '">' +
          '<span class="answer-index">' + ANSWER_LABELS[index] + "</span>" +
          '<span class="answer-text">' + answer + "</span>" +
        "</button>"
      );
    }).join("");
  }

  function getHelperText(item) {
    if (item.questionType === "logo") {
      return "Уважно роздивись знак: у складних брендів емблеми часто плутають.";
    }

    if (item.questionType === "photo") {
      return "Впізнай рідкісний бренд по фото моделі, а не по очевидному масмаркету.";
    }

    return "Оберіть відповідь до завершення зворотного відліку.";
  }

  function renderQuestion() {
    var item = getCurrentQuestion();
    var progress = ((state.currentQuestionIndex + 1) / state.totalQuestions) * 100;

    dom.questionCounter.textContent = "Питання " + (state.currentQuestionIndex + 1) + " з " + state.totalQuestions;
    dom.progressBar.style.width = progress + "%";
    dom.scoreValue.textContent = state.score;
    dom.timeLeft.textContent = timeLeft;

    dom.questionCard.innerHTML =
      '<div class="question-media">' +
        '<img src="' + item.image + '" alt="' + item.alt + '">' +
      "</div>" +
      '<div class="question-copy">' +
        '<span class="question-category">' + item.category + "</span>" +
        '<h2 class="question-title">' + item.question + "</h2>" +
        '<div class="answers-grid">' + getAnswerMarkup(item) + "</div>" +
        '<div class="fact-panel" id="fact-panel" aria-live="polite"></div>' +
        '<div class="question-footer">' +
          '<p class="helper-text">' + getHelperText(item) + "</p>" +
          '<button class="secondary-button" id="next-question" type="button" disabled>Далі</button>' +
        "</div>" +
      "</div>";

    animateQuestionCard("is-entering");
  }

  function updateTimerRing() {
    var safeTime = Math.max(0, timeLeft);
    var progress = safeTime / TIMER_TOTAL;
    var offset = TIMER_CIRCUMFERENCE * (1 - progress);

    dom.timeLeft.textContent = safeTime;
    dom.timerRing.style.strokeDasharray = String(TIMER_CIRCUMFERENCE);
    dom.timerRing.style.strokeDashoffset = String(offset);
    dom.timerRing.style.stroke = safeTime <= 5 ? "#ff6c88" : "#ff6a3d";
  }

  function startTimer() {
    clearInterval(timerId);
    updateTimerRing();

    timerId = setInterval(function () {
      timeLeft -= 1;
      updateTimerRing();

      if (timeLeft <= 0) {
        handleTimeout();
      }
    }, 1000);
  }

  function revealFact(result, question) {
    var factPanel = dom.questionCard.querySelector("#fact-panel");
    var nextButton = dom.questionCard.querySelector("#next-question");
    var label = "Неправильно";

    if (result.status === "timeout") {
      label = "Час вийшов";
    } else if (result.wasCorrect) {
      label = "Правильно";
    }

    factPanel.innerHTML =
      '<p class="fact-label">' + label + "</p>" +
      "<p>" + question.fact + "</p>";
    factPanel.classList.add("is-visible");
    nextButton.disabled = false;
  }

  function lockQuestion(result, question) {
    var buttons = dom.questionCard.querySelectorAll(".answer-button");

    buttons.forEach(function (button, index) {
      button.disabled = true;
      button.classList.toggle("is-correct", index === question.correctIndex);
      button.classList.toggle(
        "is-wrong",
        result.status !== "timeout" &&
          index === result.selectedIndex &&
          index !== question.correctIndex
      );
    });

    revealFact(result, question);
    animateQuestionCard(result.wasCorrect ? "is-pulse" : "is-shake");
  }

  function handleAnswer(selectedIndex) {
    if (state.status !== "ready") {
      return;
    }

    var question = getCurrentQuestion();
    clearInterval(timerId);
    state = CarQuizEngine.resolveAnswer(state, selectedIndex === question.correctIndex, timeLeft);
    state.selectedIndex = selectedIndex;
    dom.scoreValue.textContent = state.score;
    lockQuestion(state, question);
  }

  function handleTimeout() {
    if (state.status !== "ready") {
      return;
    }

    clearInterval(timerId);
    timeLeft = 0;
    updateTimerRing();
    state = CarQuizEngine.resolveTimeout(state);
    state.selectedIndex = -1;
    lockQuestion(state, getCurrentQuestion());
  }

  function animateCount(element, start, end, suffix) {
    var duration = 900;
    var startTime = null;

    function tick(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var current = Math.round(start + (end - start) * progress);

      element.textContent = suffix ? current + suffix : String(current);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    }

    window.requestAnimationFrame(tick);
  }

  function renderResult() {
    var accuracy = Math.round((state.correctAnswers / state.totalQuestions) * 100);

    dom.resultRank.textContent = state.resultTitle || CarQuizEngine.getResultTitle(state.correctAnswers);
    dom.resultSummary.textContent =
      "Ти дав " + state.correctAnswers + " правильних відповідей із " + state.totalQuestions +
      ". Тут уже треба було знати не лише історію, а й впізнавати логотипи та складні бренди по фото.";
    dom.resultCorrect.textContent = state.correctAnswers + " / " + state.totalQuestions;
    dom.resultAccuracy.textContent = accuracy + "%";
    animateCount(dom.resultScore, 0, state.score, "");
  }

  function moveForward() {
    state = CarQuizEngine.goToNextQuestion(state);

    if (state.isComplete) {
      renderResult();
      showScene("result");
      return;
    }

    timeLeft = TIMER_TOTAL;
    renderQuestion();
    startTimer();
  }

  dom.startButton.addEventListener("click", function () {
    resetQuiz();
    renderQuestion();
    showScene("quiz");
    startTimer();
  });

  dom.restartButton.addEventListener("click", function () {
    resetQuiz();
    showScene("start");
  });

  dom.questionCard.addEventListener("click", function (event) {
    if (event.target.matches("#next-question")) {
      moveForward();
      return;
    }

    var answerButton = event.target.closest(".answer-button");
    if (answerButton) {
      handleAnswer(Number(answerButton.getAttribute("data-answer-index")));
    }
  });

  updateTimerRing();
})();
