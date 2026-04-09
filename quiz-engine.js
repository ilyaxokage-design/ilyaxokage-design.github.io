(function (root) {
  function cloneState(state) {
    return {
      totalQuestions: state.totalQuestions,
      currentQuestionIndex: state.currentQuestionIndex,
      score: state.score,
      correctAnswers: state.correctAnswers,
      status: state.status
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getSpeedBonus(secondsLeft) {
    return Math.round((clamp(secondsLeft, 0, 20) / 20) * 50);
  }

  function resolveAnswer(state, isCorrect, secondsLeft) {
    var next = cloneState(state);
    next.status = "answered";
    next.wasCorrect = isCorrect;

    if (isCorrect) {
      next.correctAnswers += 1;
      next.score += 100 + getSpeedBonus(secondsLeft);
    }

    return next;
  }

  function resolveTimeout(state) {
    var next = cloneState(state);
    next.status = "timeout";
    next.wasCorrect = false;
    return next;
  }

  function getResultTitle(correctAnswers) {
    if (correctAnswers >= 10) {
      return "Енциклопедист брендів";
    }

    if (correctAnswers >= 7) {
      return "Автоісторик";
    }

    if (correctAnswers >= 4) {
      return "Колекціонер фактів";
    }

    return "Новачок автобрендів";
  }

  function goToNextQuestion(state) {
    var next = cloneState(state);

    if (state.currentQuestionIndex >= state.totalQuestions - 1) {
      next.isComplete = true;
      next.resultTitle = getResultTitle(state.correctAnswers);
      next.status = "complete";
      return next;
    }

    next.currentQuestionIndex += 1;
    next.status = "ready";
    next.wasCorrect = null;
    next.selectedIndex = null;
    return next;
  }

  root.CarQuizEngine = {
    createInitialState: function (totalQuestions) {
      return {
        totalQuestions: totalQuestions,
        currentQuestionIndex: 0,
        score: 0,
        correctAnswers: 0,
        status: "ready"
      };
    },
    getSpeedBonus: getSpeedBonus,
    resolveAnswer: resolveAnswer,
    resolveTimeout: resolveTimeout,
    getResultTitle: getResultTitle,
    goToNextQuestion: goToNextQuestion
  };
})(this);
