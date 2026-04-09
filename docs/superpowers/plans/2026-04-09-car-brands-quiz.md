# Car Brands Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium-looking Ukrainian car-brands quiz website with 12 hard questions, 20-second timer, 4 answers per question, animated transitions, scoring, and a final results screen.

**Architecture:** Use a static browser app with focused files: HTML for structure, CSS for the visual system and animations, a browser controller for rendering and interaction, a small environment-agnostic quiz engine for scoring/state rules, and a separate data file for the 12 questions. Test the engine and question dataset first with Windows Script Host (`cscript`) so the project stays dependency-free.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Windows Script Host JScript for automated logic tests, Python `http.server` for local preview

---

## File Map

- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\index.html`
  Responsibility: App shell, scene containers, score/timer/progress UI hooks, script loading order.
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\style.css`
  Responsibility: `Midnight Track` visual system, responsive layout, answer states, timer ring styling, transitions, and animations.
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\quiz-engine.js`
  Responsibility: Pure quiz rules for initial state, answer scoring, speed bonus, question progression, timeout handling, and result title mapping.
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\quiz-data.js`
  Responsibility: The 12 hard quiz questions, answer options, explanations, and image metadata.
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\script.js`
  Responsibility: DOM rendering, timer updates, user interactions, scene transitions, and replay flow.
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`
  Responsibility: Dependency-free test harness that loads browser JS files and verifies quiz rules plus question integrity.

## Notes

- Git is not initialized in this workspace, so commit steps are intentionally omitted from this plan.
- Remote images may be used from stable public URLs so the site can stay lightweight and dependency-free.
- The production app should still open directly from `index.html`, but previewing via `python -m http.server 8000` is preferred.

### Task 1: Create the quiz engine test harness

**Files:**
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`
- Test: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`

- [ ] **Step 1: Write the failing test harness**

```javascript
var fso = new ActiveXObject("Scripting.FileSystemObject");

function loadScript(path) {
  var file = fso.OpenTextFile(path, 1);
  var source = file.ReadAll();
  file.Close();
  eval(source);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

var root = fso.GetAbsolutePathName(".");
loadScript(root + "\\quiz-engine.js");

assert(typeof CarQuizEngine === "object", "CarQuizEngine should be defined");
assert(typeof CarQuizEngine.createInitialState === "function", "createInitialState should exist");

WScript.Echo("All engine bootstrap tests passed.");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: FAIL with an error such as `CarQuizEngine should be defined` because `quiz-engine.js` does not exist yet.

- [ ] **Step 3: Write the minimal engine export**

```javascript
(function (root) {
  root.CarQuizEngine = {
    createInitialState: function (totalQuestions) {
      return {
        totalQuestions: totalQuestions,
        currentQuestionIndex: 0,
        score: 0,
        correctAnswers: 0,
        status: "ready"
      };
    }
  };
})(this);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: PASS with `All engine bootstrap tests passed.`

### Task 2: Drive scoring, timeout, and rank logic with tests first

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\quiz-engine.js`
- Test: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`

- [ ] **Step 1: Extend the failing tests for scoring and status transitions**

```javascript
var initial = CarQuizEngine.createInitialState(12);
assert(initial.currentQuestionIndex === 0, "Initial question index should start at 0");
assert(initial.score === 0, "Initial score should start at 0");
assert(initial.correctAnswers === 0, "Initial correct answers should start at 0");

var scored = CarQuizEngine.resolveAnswer(initial, true, 12);
assert(scored.wasCorrect === true, "Correct answer should be marked true");
assert(scored.correctAnswers === 1, "Correct answer count should increment");
assert(scored.score === 130, "Score should include base points and speed bonus");
assert(scored.status === "answered", "Status should move to answered after answer");

var wrong = CarQuizEngine.resolveAnswer(initial, false, 9);
assert(wrong.wasCorrect === false, "Wrong answer should be marked false");
assert(wrong.score === 0, "Wrong answer should not add points");
assert(wrong.correctAnswers === 0, "Wrong answer should not increment correct count");

var timedOut = CarQuizEngine.resolveTimeout(initial);
assert(timedOut.status === "timeout", "Timeout should set timeout status");
assert(timedOut.score === 0, "Timeout should not add points");

assert(CarQuizEngine.getSpeedBonus(0) === 0, "No time left should mean no speed bonus");
assert(CarQuizEngine.getSpeedBonus(20) === 50, "Full time left should mean max speed bonus");
assert(CarQuizEngine.getResultTitle(11) === "Енциклопедист брендів", "High score title should map correctly");
assert(CarQuizEngine.getResultTitle(2) === "Новачок автобрендів", "Low score title should map correctly");
```

- [ ] **Step 2: Run the tests to verify they fail for the expected reason**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: FAIL with errors about `resolveAnswer`, `resolveTimeout`, `getSpeedBonus`, or `getResultTitle` not existing yet.

- [ ] **Step 3: Write the minimal engine implementation**

```javascript
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
    if (correctAnswers >= 10) return "Енциклопедист брендів";
    if (correctAnswers >= 7) return "Автоісторик";
    if (correctAnswers >= 4) return "Колекціонер фактів";
    return "Новачок автобрендів";
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
    getResultTitle: getResultTitle
  };
})(this);
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: PASS with `All engine bootstrap tests passed.`

### Task 3: Drive question integrity with tests first

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\quiz-data.js`
- Test: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`

- [ ] **Step 1: Add failing tests for the question dataset**

```javascript
loadScript(root + "\\quiz-data.js");

assert(typeof CarQuizQuestions !== "undefined", "CarQuizQuestions should be defined");
assert(CarQuizQuestions.length === 12, "There should be exactly 12 questions");

for (var i = 0; i < CarQuizQuestions.length; i++) {
  var item = CarQuizQuestions[i];
  assert(typeof item.question === "string" && item.question.length > 20, "Question text should be descriptive");
  assert(item.answers.length === 4, "Each question should have 4 answers");
  assert(item.correctIndex >= 0 && item.correctIndex < 4, "Correct index should point to one of the 4 answers");
  assert(typeof item.fact === "string" && item.fact.length > 20, "Each question should include a fact");
  assert(typeof item.image === "string" && item.image.length > 10, "Each question should include an image URL");
  assert(typeof item.alt === "string" && item.alt.length > 5, "Each question should include alt text");
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: FAIL with an error such as `CarQuizQuestions should be defined`.

- [ ] **Step 3: Write the minimal question dataset**

```javascript
(function (root) {
  root.CarQuizQuestions = [
    {
      category: "Географія",
      question: "У якому місті була заснована компанія FIAT у 1899 році?",
      answers: ["Мілан", "Турин", "Генуя", "Болонья"],
      correctIndex: 1,
      fact: "Назва FIAT розшифровується як Fabbrica Italiana Automobili Torino, тож правильне місто — Турин.",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
      alt: "Історична будівля FIAT у Турині"
    }
  ];
})(this);
```

Complete the same array with these exact additional topics before re-running the tests:

- Lamborghini headquarters in Sant'Agata Bolognese
- Ettore Bugatti founding the marque in Molsheim
- Saab beginning as an aircraft manufacturer
- Laurin & Klement becoming Skoda Auto
- Volkswagen Group winning Bentley in 1998
- Maserati's trident coming from Bologna's Fountain of Neptune
- Koenigsegg operating from Angelholm
- Abarth choosing the scorpion from Carlo Abarth's zodiac sign
- Giorgetto Giugiaro and Italdesign shaping the BMW M1
- Ferrari's headquarters being in Maranello
- Cupra being spun out from SEAT

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: PASS with the same success message after the dataset reaches exactly 12 valid questions.

### Task 4: Add question progression rules to the engine

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\quiz-engine.js`
- Test: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`

- [ ] **Step 1: Add failing tests for moving to the next question and finishing the quiz**

```javascript
var progressed = CarQuizEngine.goToNextQuestion({
  totalQuestions: 12,
  currentQuestionIndex: 0,
  score: 130,
  correctAnswers: 1,
  status: "answered"
});

assert(progressed.currentQuestionIndex === 1, "Next question should increment the index");
assert(progressed.status === "ready", "Next question should return to ready status");

var finished = CarQuizEngine.goToNextQuestion({
  totalQuestions: 12,
  currentQuestionIndex: 11,
  score: 980,
  correctAnswers: 8,
  status: "answered"
});

assert(finished.isComplete === true, "Quiz should be marked complete after the last question");
assert(finished.resultTitle === "Автоісторик", "Finished state should include a result title");
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: FAIL with an error about `goToNextQuestion` not existing.

- [ ] **Step 3: Write the minimal progression logic**

```javascript
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
  return next;
}
```

Then export it in `CarQuizEngine`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: PASS with the success message and no uncaught errors.

### Task 5: Build the HTML structure for the start, question, and result scenes

**Files:**
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\index.html`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\script.js`

- [ ] **Step 1: Create the HTML shell**

```html
<main class="app-shell">
  <section class="scene scene--start is-visible" data-scene="start">
    <div class="hero-copy">
      <p class="eyebrow">Преміальна автомобільна вікторина</p>
      <h1>Car Brands Quiz</h1>
      <p class="hero-text">12 складних питань про історію, географію та легенди автобрендів.</p>
      <div class="hero-meta">
        <span>12 питань</span>
        <span>20 секунд</span>
        <span>4 варіанти</span>
        <span>Фото та факти</span>
      </div>
      <button id="start-quiz" class="primary-button">Почати</button>
    </div>
  </section>

  <section class="scene scene--quiz" data-scene="quiz" hidden>
    <header class="quiz-topbar">
      <div class="progress-copy">
        <span id="question-counter"></span>
        <div class="progress-track"><div id="progress-bar"></div></div>
      </div>
      <div class="scoreboard">
        <span id="score-value">0</span>
        <div class="timer-ring"><svg id="timer-ring"></svg><strong id="time-left">20</strong></div>
      </div>
    </header>
    <article class="question-card" id="question-card"></article>
  </section>

  <section class="scene scene--result" data-scene="result" hidden>
    <div class="result-card">
      <p id="result-title"></p>
      <h2 id="result-score"></h2>
      <p id="result-summary"></p>
      <button id="restart-quiz" class="primary-button">Спробувати ще раз</button>
    </div>
  </section>
</main>
```

- [ ] **Step 2: Wire the DOM references in `script.js`**

```javascript
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
  resultTitle: document.getElementById("result-title"),
  resultScore: document.getElementById("result-score"),
  resultSummary: document.getElementById("result-summary")
};
```

- [ ] **Step 3: Add a minimal scene switcher and render entry point**

```javascript
function showScene(name) {
  [dom.startScene, dom.quizScene, dom.resultScene].forEach(function (scene) {
    var visible = scene.getAttribute("data-scene") === name;
    scene.hidden = !visible;
    scene.classList.toggle("is-visible", visible);
  });
}

dom.startButton.addEventListener("click", function () {
  showScene("quiz");
});
```

- [ ] **Step 4: Verify the page structure parses correctly**

Run: `python -m http.server 8000`  
Expected: A local server starts at `http://localhost:8000/` without Python errors.

### Task 6: Connect the engine and render one-question-at-a-time gameplay

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\script.js`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\index.html`

- [ ] **Step 1: Render the current question into the quiz card**

```javascript
var state = CarQuizEngine.createInitialState(CarQuizQuestions.length);
var timeLeft = 20;
var timerId = null;

function getCurrentQuestion() {
  return CarQuizQuestions[state.currentQuestionIndex];
}

function renderQuestion() {
  var item = getCurrentQuestion();
  dom.questionCounter.textContent = "Питання " + (state.currentQuestionIndex + 1) + " з " + state.totalQuestions;
  dom.progressBar.style.width = (((state.currentQuestionIndex + 1) / state.totalQuestions) * 100) + "%";
  dom.scoreValue.textContent = state.score;
  dom.timeLeft.textContent = timeLeft;

  dom.questionCard.innerHTML = [
    '<div class="question-media"><img src="' + item.image + '" alt="' + item.alt + '"></div>',
    '<div class="question-copy">',
    '<span class="question-category">' + item.category + '</span>',
    '<h2>' + item.question + '</h2>',
    '<div class="answers-grid">' + item.answers.map(function (answer, index) {',
    '  return \'<button class="answer-button" data-answer-index="\' + index + \'">\' + answer + \'</button>\';',
    '}).join("") + "</div>",
    '<div class="fact-panel" id="fact-panel"></div>',
    '<button class="secondary-button" id="next-question" disabled>Далі</button>',
    '</div>'
  ].join("");
}
```

- [ ] **Step 2: Add answer handling and timeout resolution**

```javascript
function lockQuestion(result, question) {
  var buttons = dom.questionCard.querySelectorAll(".answer-button");
  buttons.forEach(function (button, index) {
    button.disabled = true;
    button.classList.toggle("is-correct", index === question.correctIndex);
    button.classList.toggle("is-wrong", result.status !== "timeout" && index === result.selectedIndex && index !== question.correctIndex);
  });

  dom.questionCard.querySelector("#fact-panel").innerHTML =
    '<p class="fact-label">' + (result.status === "timeout" ? "Час вийшов" : result.wasCorrect ? "Правильно" : "Неправильно") + '</p>' +
    '<p>' + question.fact + '</p>';

  dom.questionCard.querySelector("#next-question").disabled = false;
}

dom.questionCard.addEventListener("click", function (event) {
  if (!event.target.matches(".answer-button") || state.status !== "ready") {
    return;
  }

  var question = getCurrentQuestion();
  var selectedIndex = Number(event.target.getAttribute("data-answer-index"));
  clearInterval(timerId);

  state = CarQuizEngine.resolveAnswer(state, selectedIndex === question.correctIndex, timeLeft);
  state.selectedIndex = selectedIndex;
  dom.scoreValue.textContent = state.score;
  lockQuestion(state, question);
});

function handleTimeout() {
  clearInterval(timerId);
  state = CarQuizEngine.resolveTimeout(state);
  state.selectedIndex = -1;
  lockQuestion(state, getCurrentQuestion());
}
```

- [ ] **Step 3: Add next-question and restart behavior**

```javascript
function moveForward() {
  state = CarQuizEngine.goToNextQuestion(state);

  if (state.isComplete) {
    renderResult();
    showScene("result");
    return;
  }

  timeLeft = 20;
  renderQuestion();
  startTimer();
}

document.addEventListener("click", function (event) {
  if (event.target.matches("#next-question")) {
    moveForward();
  }
});

dom.restartButton.addEventListener("click", function () {
  state = CarQuizEngine.createInitialState(CarQuizQuestions.length);
  timeLeft = 20;
  renderQuestion();
  showScene("start");
});
```

- [ ] **Step 4: Verify the main interaction path manually**

Run: `python -m http.server 8000`  
Expected: Start screen loads, the quiz starts on click, one answer can be chosen, `Далі` unlocks, and restart returns to the beginning.

### Task 7: Implement the timer ring, transitions, and premium responsive styling

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\style.css`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\script.js`

- [ ] **Step 1: Create the base `Midnight Track` theme in CSS**

```css
:root {
  --bg-900: #06080d;
  --bg-800: #0d1420;
  --panel: rgba(10, 18, 31, 0.72);
  --panel-border: rgba(255, 255, 255, 0.08);
  --text-main: #f5f7fb;
  --text-muted: #9ba8bf;
  --accent: #ff6a3d;
  --accent-soft: rgba(255, 106, 61, 0.18);
  --success: #6bffb0;
  --danger: #ff6b7f;
  --shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: "Segoe UI", sans-serif;
  color: var(--text-main);
  background:
    radial-gradient(circle at top left, rgba(255, 106, 61, 0.2), transparent 28%),
    radial-gradient(circle at right center, rgba(255, 180, 76, 0.12), transparent 22%),
    linear-gradient(135deg, var(--bg-900), var(--bg-800));
}
```

- [ ] **Step 2: Style the quiz card, answers, and result states**

```css
.question-card,
.result-card,
.hero-copy {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 28px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.answer-button.is-correct {
  border-color: rgba(107, 255, 176, 0.8);
  background: rgba(107, 255, 176, 0.14);
}

.answer-button.is-wrong {
  border-color: rgba(255, 107, 127, 0.75);
  background: rgba(255, 107, 127, 0.12);
}
```

- [ ] **Step 3: Add motion and mobile layout rules**

```css
.scene {
  opacity: 0;
  transform: translateY(18px) scale(0.985);
  transition: opacity 420ms ease, transform 420ms ease;
}

.scene.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.answer-button {
  animation: riseIn 420ms ease both;
}

@media (max-width: 768px) {
  .answers-grid {
    grid-template-columns: 1fr;
  }

  .question-media img {
    max-height: 220px;
  }
}
```

Add the matching timer code in `script.js`:

```javascript
function updateTimerRing() {
  var progress = timeLeft / 20;
  dom.timeLeft.textContent = timeLeft;
  dom.timerRing.style.setProperty("--timer-progress", progress);
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
```

- [ ] **Step 4: Verify styling and motion manually**

Run: `python -m http.server 8000`  
Expected: Dark premium theme, smooth transitions, visible timer, responsive answer layout, and clear correct/wrong feedback.

### Task 8: Final verification and run instructions

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\tests\engine-tests.js`
- Review: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\index.html`
- Review: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\style.css`
- Review: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\quiz-engine.js`
- Review: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\quiz-data.js`
- Review: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\script.js`

- [ ] **Step 1: Run the JS rule tests**

Run: `cscript //nologo tests\engine-tests.js`  
Expected: PASS with all assertions completed successfully.

- [ ] **Step 2: Start a local preview server**

Run: `python -m http.server 8000`  
Expected: Python serves the project without errors at `http://localhost:8000/`.

- [ ] **Step 3: Verify the acceptance checklist**

```text
- Start screen explains 12 questions / 20 seconds / 4 answers / photos and facts
- Quiz runs one question at a time
- Every question has 4 answers
- Timer starts at 20 seconds
- Correct answers add score and speed bonus
- Wrong answers and timeout reveal the fact panel
- "Далі" moves to the next question
- Final result shows score, correct count, and title
- Replay works
- Layout adapts cleanly on narrow screens
```

- [ ] **Step 4: Share run instructions with the user**

```text
1. Open PowerShell in C:\Users\ilyax\OneDrive\Desktop\Нова папка
2. Run: python -m http.server 8000
3. Open: http://localhost:8000/
```
