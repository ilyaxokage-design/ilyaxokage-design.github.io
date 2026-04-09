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

var root = fso.GetAbsolutePathName("..");
loadScript(root + "\\quiz-engine.js");
loadScript(root + "\\quiz-data.js");

assert(typeof CarQuizEngine === "object", "CarQuizEngine should be defined");
assert(typeof CarQuizEngine.createInitialState === "function", "createInitialState should exist");
assert(typeof CarQuizQuestions !== "undefined", "CarQuizQuestions should be defined");
assert(CarQuizQuestions.length === 12, "There should be exactly 12 questions");

var typeCounts = {
  history: 0,
  logo: 0,
  photo: 0
};

for (var i = 0; i < CarQuizQuestions.length; i++) {
  var item = CarQuizQuestions[i];
  assert(typeof item.questionType === "string", "Each question should include a question type");
  assert(typeCounts.hasOwnProperty(item.questionType), "Question type should be history, logo, or photo");
  typeCounts[item.questionType] += 1;
  assert(typeof item.category === "string" && item.category.length > 2, "Each question should have a category");
  assert(typeof item.question === "string" && item.question.length > 20, "Question text should be descriptive");
  assert(item.answers.length === 4, "Each question should have 4 answers");
  assert(item.correctIndex >= 0 && item.correctIndex < 4, "Correct index should point to one of the 4 answers");
  assert(typeof item.fact === "string" && item.fact.length > 20, "Each question should include a fact");
  assert(typeof item.image === "string" && item.image.length > 10, "Each question should include an image URL");
  assert(typeof item.alt === "string" && item.alt.length > 5, "Each question should include alt text");
}

assert(typeCounts.history === 4, "There should be 4 history/geography questions");
assert(typeCounts.logo === 4, "There should be 4 logo questions");
assert(typeCounts.photo === 4, "There should be 4 photo questions");

var initial = CarQuizEngine.createInitialState(12);
assert(initial.currentQuestionIndex === 0, "Initial question index should start at 0");
assert(initial.score === 0, "Initial score should start at 0");
assert(initial.correctAnswers === 0, "Initial correct answers should start at 0");
assert(initial.status === "ready", "Initial status should be ready");

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

var progressed = CarQuizEngine.goToNextQuestion({
  totalQuestions: 12,
  currentQuestionIndex: 0,
  score: 130,
  correctAnswers: 1,
  status: "answered"
});
assert(progressed.currentQuestionIndex === 1, "Next question should increment the index");
assert(progressed.status === "ready", "Next question should return to ready status");
assert(progressed.isComplete !== true, "Mid-quiz state should not be complete");

var finished = CarQuizEngine.goToNextQuestion({
  totalQuestions: 12,
  currentQuestionIndex: 11,
  score: 980,
  correctAnswers: 8,
  status: "answered"
});
assert(finished.isComplete === true, "Quiz should be marked complete after the last question");
assert(finished.resultTitle === "Автоісторик", "Finished state should include a result title");
assert(finished.status === "complete", "Final status should be complete");

WScript.Echo("All engine bootstrap tests passed.");
