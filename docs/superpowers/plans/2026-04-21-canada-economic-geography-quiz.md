# Canada Economic Geography Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new mobile-first static quiz site about Canada's economic geography in a brand-new folder with 12 engaging fact-based questions, photos, timer, score, and a fresh light design.

**Architecture:** Reuse the lightweight browser-only quiz engine pattern from the existing quiz, but ship a separate data file, copy, and visual system in `canada-geo-quiz`. Keep the DOM structure similar enough for the engine and mobile tests, while fully replacing the theme and wording.

**Tech Stack:** HTML, CSS, vanilla JavaScript, CScript tests, Python mobile layout checks, static images via remote URLs

---

### Task 1: New Project Skeleton

**Files:**
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\index.html`
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\quiz-engine.js`
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\quiz-data.js`
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\script.js`
- Create: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\style.css`

- [ ] Copy the known-good static quiz structure into the new folder.
- [ ] Rename quiz globals and copy strings to the Canada project.
- [ ] Keep the 20-second timer, progress, score, and result flow.

### Task 2: Canada Question Set

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\quiz-data.js`

- [ ] Replace ecological questions with 12 Canada economic geography questions.
- [ ] Make the copy short, interesting, and phone-readable.
- [ ] Add category, fact, image, alt text, and answer sets for each question.
- [ ] Keep a balanced single-select and multi-select mix.

### Task 3: New Atlas-Style UI

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\index.html`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\style.css`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\script.js`

- [ ] Replace the start screen copy and poster content with Canada-specific messaging.
- [ ] Redesign the theme to a light atlas/editorial look using new colors and typography.
- [ ] Tune overlays, answer cards, and top stats for phones first.
- [ ] Keep the UI visually distinct from the ecological quiz.

### Task 4: Verification

**Files:**
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\tests\engine-tests.js`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\tests\mobile-layout-start.html`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\tests\mobile-layout-question.html`
- Modify: `C:\Users\ilyax\OneDrive\Desktop\Нова папка\canada-geo-quiz\tests\mobile-layout-test.py`

- [ ] Repoint tests to the new quiz globals and dataset.
- [ ] Verify question count, image presence, fact copy, and scoring logic.
- [ ] Verify mobile layout with headless browser checks.
- [ ] Render local screenshots for the start and question screens.
