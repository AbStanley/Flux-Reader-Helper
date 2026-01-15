# Project Rules & Standards

> [!TIP]
> This is a **Living Document**. Update it as the project evolves.

## 1. Project Philosophy
-   **Self-Hosted First**: The app must work fully offline or on a local network without relying on external SaaS.
-   **Monorepo**: We keep Frontend and Backend tightly coupled in versioning but loosely coupled in code.

## 2. Technology Stack

### Frontend (`apps/client`)
-   **Framework**: React 19 (Vite)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS (Utility-first) + CSS Modules (for complex layouts)
-   **State**: Zustand (Stores)

### Backend (`apps/server`)
-   **Framework**: NestJS (Express adapter)
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **AI**: Ollama (Local LLM) via `ollama` js library

## 3. Development Guidelines

### 3.1 File Limits
-   > [!IMPORTANT]
    > **Max File Size**: **200 Lines**. If a file exceeds this, you **MUST** refactor it immediately.

### 3.2 Monorepo Etiquette
-   **Never** install dependencies in the root `node_modules` alone. Always use `-w`:
    ```bash
    npm install <package> -w @reader-helper/client
    npm install <package> -w @reader-helper/server
    ```
-   **Cross-App Imports**: **FORBIDDEN**. `client` cannot import from `server`. They talk via HTTP/JSON only.

### 3.3 Git / Version Control
-   **Secrets**: `.env` files are ignored. Use `.env.example`.
-   **Infrastructure**: `docker-compose.yml` is committed.

## 4. Operational Commands
| Action | Command |
| :--- | :--- |
| **Run All** | `npm run dev` (Root) |
| **Run Backend** | `npm run start:dev -w @reader-helper/server` |
| **Run Frontend** | `npm run dev -w @reader-helper/client` |
| **Prisma Studio** | `npm run prisma-studio` |
| **Lint** | `npm run lint` |

## 5. Client Refactoring Standards (React 19 & Modern TS)

### 5.1 React 19 & Future-Proofing
- **Refs**: Eliminate `forwardRef`. Pass `ref` as a standard prop.
- **Hooks**:
    - Prefer `use` for consuming contexts and promises conditionally.
    - Use `useActionState` (or equivalent updated patterns) for form state management.
- **Compiler Optimization**: Write clear, idiomatic code. Avoid premature manual memoization (`useMemo`, `useCallback`) unless profiling indicates a bottleneck, as React Compiler handles this.
- **Context**: Use `<Context>` provider directly instead of `<Context.Provider>`.

### 5.2 TypeScript & Code Quality
- **Strict Typing**: `any` is strictly forbidden. Use `unknown` with narrowing if necessary.
- **Type Imports**: ALWAYS use `import type { ... }` for interfaces and types to ensure `verbatimModuleSyntax` compatibility.
- **Named Imports**: Prefer named imports (e.g., `import { useState } from "react"`) over namespace imports (`import * as React`).
- **Clean Props**: Use `ComponentProps<typeof Element>` instead of generic `HTMLAttributes<...>`.
- **Loose String Types**: Avoid using `string` as a type. Use `string` only when necessary.

### 5.3 Component Architecture
- **Composition over Configuration**: Use `children` or render props for slots instead of passing complex configuration objects.
- **Prop Defaults**: Define default values in the destructuring assignment signature: `function Card({ title = "Untitled" })`.
- **Logic Extraction**: If a component exceeds ~100 lines or has complex effects, extract logic into a custom hook.
- **Direct Primitive Use**: Import library primitives directly (e.g., `import { Root as SeparatorPrimitive }`) to avoid verbose naming/nesting.

### 5.4 Best Practices
- **Modern Syntax**: Prioritize the latest stable features and patterns of the current stack (React 19, TS 5.x) over legacy or deprecated methods.
- **Early Returns**: Reduce nesting levels by guarding early.
- **Semantic HTML**: Use semantic tags (`section`, `article`, `nav`) to improve accessibility and structure.
- **Tailwind Merging**: Always wrap `className` props in `cn(...)` to ensure strict override capability.