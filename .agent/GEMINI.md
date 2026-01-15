# GEMINI - Agentic Knowledge Base & Architectural Brain

> [!IMPORTANT]
> **Project Specifics**: For project-specific rules, philosophy, tech stack details, and directory structure, refer to the living document:
> **[PROJECT_RULES.md](./PROJECT_RULES.md)**

This document serves as the global architectural guide and "brain" for high-level coding standards, senior design patterns, and engineering practices expected in this codebase. It applies to **ALL** projects.

---

## 1. Clean Architecture & Scalability

We follow a strict **Clean Architecture** approach to ensure the system is testable, maintainable, and independent of frameworks/UI details.

### 1.1 The Dependency Rule (Universal)
**Source code dependencies must only point inward.**
-   **Inner Circles (Domain)**: Know nothing about outer circles (Infrastructure/UI).
-   **Data Transfer**: Data crossing boundaries should be simple structures (DTOs), not complex objects (like generic `ORM` entities).

### 1.2 Architectural Layers
1.  **Domain (Entities)**: Core business objects. Pure logic. No dependencies.
2.  **Application (Use Cases/Services)**: Orchestrates data flow. Depends only on Domain.
3.  **Interface Adapters (Controllers/Presenters)**: Converts data formats.
4.  **Infrastructure (Databases/Frameworks)**: The implementation details. The "Glue".

---

## 2. Senior Design Patterns

Apply these patterns to solve repeated design problems. Do not reinvent the wheel.

### 2.1 Creational Patterns
-   **Factory Method**: Use to create objects without exposing the instantiation logic to the client.
    -   *Use Case*: Creating different types of `ReaderTokens` (Word, Phrase, Punctuation) based on text analysis.
-   **Singleton**: Use sparingly. Primarily for stateless infrastructure services.
    -   *Use Case*: `DatabaseConnection`, `LoggerService`.
-   **Builder**: Constructing complex objects step-by-step.
    -   *Use Case*: Building complex AI Prompts or Config objects.

### 2.2 Structural Patterns
-   **Facade**: **CRITICAL**. Provide a unified interface to a set of interfaces in a subsystem.
    -   *Use Case*: The `OllamaService` acts as a facade, hiding the complexity of HTTP requests, streaming, and error handling from the UI.
-   **Adapter**: Convert the interface of a class into another interface clients expect.
    -   *Use Case*: Wrapping a 3rd party library (like a TTS engine) so our app depends on `IAudioProvider`, not the specific library.
-   **Composite**: Compose objects into tree structures to represent part-whole hierarchies.
    -   *Use Case*: Rendering a `Paragraph` which is composed of `Sentences`, which are composed of `Tokens`.

### 2.3 Behavioral Patterns
-   **Strategy**: **CRITICAL**. Define a family of algorithms, encapsulate each one, and make them interchangeable.
    -   *Use Case*: Swapping between `OllamaLLM` and `OpenAILLM` without changing the rest of the app.
    -   *Use Case*: Swapping between `DatabaseStrategy`, `AnkiStrategy`, and `AiStrategy` for Game Content.
-   **Observer**: Define a one-to-many dependency so that when one object changes state, all its dependents are notified.
    -   *Use Case*: React Components "observing" a Zustand store.
-   **Command**: Encapsulate a request as an object.
    -   *Use Case*: Implementing "Undo/Redo" functionality.

---

## 3. Code Rules, Standards & Practices

### 3.1 State Management (Zustand/Context)
-   **Single Source of Truth**: Avoid duplicating state. If it can be derived, derive it.
-   **Atomic Selectors**: Components should select only the *exact* data they need to prevent unnecessary re-renders.
    -   *Bad*: `const { user } = useStore()` (Renders on any user change).
    -   *Good*: `const name = useStore(s => s.user.name)` (Renders only when name changes).
-   **Actions in Store**: State updating logic (business logic) belongs in the store, typically in `actions`. Components just fetch and trigger.
- **Slices**: Split large stores into `slices` (e.g., by feature) and merge them.

### 3.2 Anti-Patterns to AVOID
-   **God Files**: Any file exceeding **200 lines** is a code smell. Split it.
-   **Prop Drilling**: Passing props through more than 2 layers. Use Context or Composition.
-   **Magic Strings/Numbers**: Define them in `constants` or enums.
-   **Hasty Abstractions**: "WET" (Write Everything Twice) is better than a wrong abstraction. Wait for the Rule of Three.
-   **Shotgun Surgery**: If making a change requires editing many small files, your cohesion is low. Refactor to group related logic.
- **Silent Failures**: `catch (e) { console.log(e) }` is forbidden. Handle errors or notify the user through the UI.

### 3.3 Naming Conventions
-   **PascalCase**: Classes, Components, Interfaces, Type Definitions (`UserProfile`, `IUserService`).
-   **camelCase**: Variables, Functions, Methods, Hooks (`getUser`, `isLoading`).
-   **UPPER_CASE**: Constants (`MAX_RETRIES`, `DEFAULT_TIMEOUT`).
-   **Booleans**: Prefix with `is`, `has`, `should` (`isValid`, `hasAccess`).

### 3.4 Best Practices
-   **Early Returns**: Reduce nesting by returning early.
    -   *Bad*: `if (user) { if (active) { ... } }`
    -   *Good*: `if (!user) return; if (!active) return; ...`
-   **Error Handling**: Never swallow errors. Catch, Log, and either Handle or Rethrow.
-   **Comments**: Explain **WHY**, not **WHAT**. The code explains what.

---

## 4. Interaction Protocol: Smart Rubber Duck
The user prefers a 'Smart Rubber Duck' approach to problem-solving.
-   **Analyze First**: Break down the 'What', 'Why', 'Alternatives', 'Optimizations', and 'Architecture'.
-   **Explain**: Teach the concepts and high-level details.
-   **Goal**: Facilitate learning and mental tracking, not just solution delivery.
