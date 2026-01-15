# Roadmap: Learning/Play Mode (Anki Arena Integration)

## Objective
Integrate "Anki Arena" style language games into the Reader Helper app.
**Key Feature**: The user can choose the SOURCE of the vocabulary for the games.

## Core Pillars (Data Sources)
1.  **Database**: Words/Phrases saved by the user within Reader Helper.
2.  **Anki Connect**: Fetch cards directly from user's local Anki decks (Generic integration via AnkiConnect).
3.  **AI Gen**: Generate vocabulary lists, sentences, or stories on the fly using LLMs (Gemini).

## Principles
-   **Clean Code & SOLID**: Refactor spaghetti code into clean, composable React components.
-   **Abstraction**: The Game Engine must be agnostic to the data source. Use a `ContentProvider` adapter pattern.
-   **UI**: Shadcn UI + Radix primitives for a premium feel.
-   **Testing**: Full unit test coverage.

## Phases

### Phase 1: Foundation & Architecture (✅ COMPLETED)
-   [x] **Domain Modeling**: Define `GameItem` interface (unified format).
-   [x] **Service Layer**: Create `GameContentService` with Strategy pattern.
    -   [x] `DatabaseContentStrategy` (Bidirectional Source/Target filtering implemented).
    -   [ ] `AnkiContentStrategy`
    -   [ ] `AiContentStrategy`
-   [x] **State Management**: `useGameStore` (Zustand) with `isTimerPaused` logic.
-   [x] **UI Layout**: `GameShell` component (Sticky header, progress bar, timer, lives).
-   [x] **Configuration**: `GameConfigDialog` for selecting language, mode, and source.

### Phase 2: Game Types Implementation (✅ COMPLETED)
-   [x] **Game 1: Multiple Choice**:
    -   [x] Standard 4-option quiz.
    -   [x] **Audio System**: `useGameAudio` hook with TTS/File fallback and Promise-based playback.
    -   [x] **Bidirectional Learning**: Swap Source/Target languages easily.
    -   [x] **Timer Logic**: Reset on new word, pause on answer.
-   [x] **Game 2: Word Builder**: Spelling / typing with keyboard support and immediate feedback.
-   [x] **Game 3: Sentence Scramble**: Reordering words (great for AI/DB phrases).
-   [x] **Game 4: Audio Dictation**: Typing what is heard (requires strong TTS).

### Phase 3: Anki Integration (Deep Dive)
-   [x] **AnkiConnect Client**: Robust client with error handling.
-   [x] **Deck Selector**: UI to list and select Anki decks.
-   [x] **Field selection**: UI to select which fields to use from Anki cards as source/translation. 
-   [ ] **Feedback Loop**: Option to update Anki card ease/interval after game.

### Phase 4: AI & Story Mode
-   [ ] **Story Generator**: UI to select topic/level.
-   [ ] **Interactive Story**: `StoryMode` game type integration.

### Phase 5: Polish & Gamification (🚧 IN PROGRESS)
-   [ ] **XP & Leveling**: Persist user progress.
-   [x] **Streak System**: Basic in-session streak implemented.
-   [x] **Sound Effects**: Basic Correct/Wrong SFX.
-   [ ] **Advanced Animations**: Transition effects between cards.

## Technical Architecture
-   **Store**: `apps/client/src/presentation/features/learning-mode/store/useGameStore.ts`
-   **Strategies**: `apps/client/src/core/services/game/strategies/`
-   **Games**: `apps/client/src/presentation/features/learning-mode/games/`
-   **Hooks**: `apps/client/src/presentation/features/learning-mode/games/hooks/`
