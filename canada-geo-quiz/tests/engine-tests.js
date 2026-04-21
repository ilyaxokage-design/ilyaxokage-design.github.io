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

assert(typeof CanadaGeoQuizEngine === "object", "CanadaGeoQuizEngine should be defined");
assert(typeof CanadaGeoQuizEngine.createSession === "function", "createSession should exist");
assert(typeof CanadaGeoQuizQuestions !== "undefined", "CanadaGeoQuizQuestions should be defined");
assert(CanadaGeoQuizQuestions.length === 12, "There should be 12 Canada economic geography questions");

var singleCount = 0;
var multiCount = 0;

for (var q = 0; q < CanadaGeoQuizQuestions.length; q++) {
  var item = CanadaGeoQuizQuestions[q];
  assert(item.answers.length >= 4, "Each question should have at least 4 answers");
  assert(typeof item.image === "string" && item.image.length > 10, "Each question should include an image");
  assert(typeof item.fact === "string" && item.fact.length > 25, "Each question should include an explanation");
  assert(item.type === "single" || item.type === "multi", "Question type should be single or multi");
  if (item.type === "single") {
    singleCount += 1;
  }
  if (item.type === "multi") {
    multiCount += 1;
  }
}

assert(singleCount >= 7, "There should be a strong single-select set");
assert(multiCount >= 3, "There should be multiple multi-select questions");

var sampleQuestions = [
  {
    type: "single",
    category: "Тест",
    question: "Яке тестове single-select питання має зберегти текст після shuffle?",
    fact: "Це пояснення також має зберегтися після підготовки питання.",
    image: "https://example.com/one.jpg",
    alt: "Тестове зображення 1",
    answers: [
      { text: "Перший варіант", correct: false },
      { text: "Другий варіант", correct: true },
      { text: "Третій варіант", correct: false },
      { text: "Четвертий варіант", correct: false }
    ]
  },
  {
    type: "multi",
    category: "Тест",
    question: "Яке тестове multi-select питання має зберегти метадані?",
    fact: "Із shuffle не повинні зникати ні тексти, ні фото, ні пояснення.",
    image: "https://example.com/two.jpg",
    alt: "Тестове зображення 2",
    answers: [
      { text: "Варіант A", correct: true },
      { text: "Варіант B", correct: false },
      { text: "Варіант C", correct: true },
      { text: "Варіант D", correct: false }
    ]
  }
];

var prepared = CanadaGeoQuizEngine.prepareQuestions(sampleQuestions, 7);
assert(prepared.length === 2, "Prepared questions should keep all items");
assert(prepared[0].answers.length === 4, "Prepared questions should keep answers");
assert(typeof prepared[0].answers[0].id === "string", "Prepared answers should have stable ids");
assert(typeof prepared[0].question === "string", "Prepared questions should preserve question text");
assert(typeof prepared[0].category === "string", "Prepared questions should preserve category");
assert(typeof prepared[0].image === "string", "Prepared questions should preserve image");
assert(typeof prepared[0].fact === "string", "Prepared questions should preserve fact text");
assert(typeof prepared[0].alt === "string", "Prepared questions should preserve alt text");

var singlePrepared;
var multiPrepared;

if (prepared[0].type === "single") {
  singlePrepared = prepared[0];
  multiPrepared = prepared[1];
} else {
  singlePrepared = prepared[1];
  multiPrepared = prepared[0];
}

var correctSingleId = null;
for (var i = 0; i < singlePrepared.answers.length; i++) {
  if (singlePrepared.answers[i].correct) {
    correctSingleId = singlePrepared.answers[i].id;
  }
}
assert(correctSingleId !== null, "Single-select prepared question should preserve the correct answer");
assert(CanadaGeoQuizEngine.gradeAnswer(singlePrepared, [correctSingleId]).isCorrect === true, "Correct single-select choice should pass");

var correctIds = [];
for (var j = 0; j < multiPrepared.answers.length; j++) {
  if (multiPrepared.answers[j].correct) {
    correctIds.push(multiPrepared.answers[j].id);
  }
}
assert(correctIds.length === 2, "Multi-select question should preserve 2 correct answers");
assert(CanadaGeoQuizEngine.gradeAnswer(multiPrepared, correctIds).isCorrect === true, "Exact multi-select match should be correct");
assert(CanadaGeoQuizEngine.gradeAnswer(multiPrepared, [correctIds[0]]).isCorrect === false, "Partial multi-select answer should be wrong");

var session = CanadaGeoQuizEngine.createSession(sampleQuestions);
var scoredSingle = CanadaGeoQuizEngine.applyAnswer(session, true, 16, "single");
assert(scoredSingle.score === 140, "Single correct answer should include base score and speed bonus");
assert(scoredSingle.correctCount === 1, "Correct single answer should increment correctCount");

var scoredMulti = CanadaGeoQuizEngine.applyAnswer(session, true, 12, "multi");
assert(scoredMulti.score === 170, "Multi correct answer should score higher than single");

var timedOut = CanadaGeoQuizEngine.applyTimeout(session);
assert(timedOut.status === "timeout", "Timeout should set timeout status");
assert(timedOut.score === 0, "Timeout should not add score");

var nextSession = CanadaGeoQuizEngine.goNext({
  questions: sampleQuestions,
  currentIndex: 1,
  score: 210,
  correctCount: 2,
  status: "answered"
});
assert(nextSession.isComplete === true, "Last question should mark the quiz complete");
assert(typeof nextSession.resultTitle === "string", "Completed session should include a result title");
assert(CanadaGeoQuizEngine.getResultTitle(11) === "Мапознавець Канади", "Top result title should map correctly");

WScript.Echo("Canada engine tests passed.");
