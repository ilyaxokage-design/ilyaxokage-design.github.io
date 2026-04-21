(function (root) {
  function makeRng(seed) {
    var value = seed || 1;
    return function () {
      value = (value * 1664525 + 1013904223) % 4294967296;
      return value / 4294967296;
    };
  }

  function shuffle(list, rng) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function prepareQuestions(questions, seed) {
    var rng = makeRng(seed || 1);
    var prepared = [];

    for (var i = 0; i < questions.length; i++) {
      var source = questions[i];
      var answers = [];

      for (var j = 0; j < source.answers.length; j++) {
        answers.push({
          id: "q" + i + "-a" + j,
          text: source.answers[j].text,
          correct: source.answers[j].correct
        });
      }

      prepared.push({
        id: "q" + i,
        type: source.type,
        category: source.category,
        question: source.question,
        fact: source.fact,
        image: source.image,
        alt: source.alt,
        answers: shuffle(answers, rng)
      });
    }

    return shuffle(prepared, rng);
  }

  function gradeAnswer(question, selectedIds) {
    var chosen = {};
    var correctCount = 0;
    var chosenCorrectCount = 0;

    for (var i = 0; i < selectedIds.length; i++) {
      chosen[selectedIds[i]] = true;
    }

    for (var j = 0; j < question.answers.length; j++) {
      var answer = question.answers[j];

      if (answer.correct) {
        correctCount += 1;
      }

      if (!answer.correct && chosen[answer.id]) {
        return { isCorrect: false };
      }

      if (answer.correct && chosen[answer.id]) {
        chosenCorrectCount += 1;
      }
    }

    return {
      isCorrect: chosenCorrectCount === correctCount && selectedIds.length === correctCount
    };
  }

  function cloneSession(session) {
    return {
      questions: session.questions,
      currentIndex: session.currentIndex,
      score: session.score,
      correctCount: session.correctCount,
      status: session.status
    };
  }

  function getSpeedBonus(secondsLeft) {
    return Math.round((Math.max(0, Math.min(20, secondsLeft)) / 20) * 50);
  }

  function getBasePoints(type) {
    return type === "multi" ? 140 : 100;
  }

  function applyAnswer(session, isCorrect, secondsLeft, type) {
    var next = cloneSession(session);
    next.status = "answered";

    if (isCorrect) {
      next.correctCount += 1;
      next.score += getBasePoints(type) + getSpeedBonus(secondsLeft);
    }

    return next;
  }

  function applyTimeout(session) {
    var next = cloneSession(session);
    next.status = "timeout";
    return next;
  }

  function getResultTitle(correctCount) {
    if (correctCount >= 11) {
      return "Мапознавець Канади";
    }

    if (correctCount >= 8) {
      return "Навігатор провінцій";
    }

    if (correctCount >= 5) {
      return "Ловець канадських фактів";
    }

    return "Початківець атласу";
  }

  function goNext(session) {
    var next = cloneSession(session);

    if (session.currentIndex >= session.questions.length - 1) {
      next.isComplete = true;
      next.resultTitle = getResultTitle(session.correctCount);
      next.status = "complete";
      return next;
    }

    next.currentIndex += 1;
    next.status = "ready";
    return next;
  }

  root.CanadaGeoQuizEngine = {
    createSession: function (questions) {
      return {
        questions: questions,
        currentIndex: 0,
        score: 0,
        correctCount: 0,
        status: "ready"
      };
    },
    prepareQuestions: prepareQuestions,
    gradeAnswer: gradeAnswer,
    getSpeedBonus: getSpeedBonus,
    applyAnswer: applyAnswer,
    applyTimeout: applyTimeout,
    getResultTitle: getResultTitle,
    goNext: goNext
  };
})(this);
