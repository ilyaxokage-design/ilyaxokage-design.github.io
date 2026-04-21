# Canada Economic Geography Quiz Design

## Goal

Build a new standalone static quiz site in a new folder for a Ukrainian-speaking audience. The topic is Canada's economic geography. The quiz keeps the familiar mechanics from earlier projects: 12 questions, 20 seconds per question, score with speed bonus, one-question-at-a-time flow, photos, result screen, and a mobile-first experience.

## Content Direction

The tone is not exam-like. Questions should feel like interesting facts and discoveries about Canada rather than traps. The copy should sound human, short, and lively in Ukrainian.

Topics should cover a balanced mix of:

- ports and trade gateways
- farming regions and exports
- hydroelectricity and energy
- mining and critical minerals
- fisheries and food geography
- industrial corridors and transport routes

Questions can mix single-select and multi-select, but they should stay readable on a phone and avoid overloaded wording.

## Visual Direction

The design must be fully different from the previous ecological quiz while staying light. Use an atlas/editorial travel feel:

- cream and glacier-blue backgrounds
- warm wheat and maple accents
- gentle map-grid or contour-style texture
- postcard or field-note style panels
- large imagery and clear typography

The layout should feel like a premium mobile story about Canada rather than a generic quiz app.

## Interaction

- Start screen with title, short premise, 12-question badge, 20-second badge, and CTA.
- One question at a time.
- Each question includes a photo, category label, the question text, answers, explanation, score, timer, and progress.
- Order of questions and answers is shuffled on each run.
- Result screen shows score, correct answers, accuracy, and a themed result title.

## Technical Approach

- Create a new folder `canada-geo-quiz`.
- Reuse the small static quiz architecture from the existing quiz as a baseline.
- Keep a separate engine/data/script/style set inside the new folder.
- Add tests for engine integrity and mobile layout.

## Mobile Priorities

- Phone-first spacing and font sizes
- No cramped or overly long question text
- Large thumb-friendly answer buttons
- Compact visual overlays that do not hide the photo
- Strong readability without looking AI-generated
