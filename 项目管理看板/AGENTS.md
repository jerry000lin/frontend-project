# Repository Guidelines

## Project Structure & Module Organization
This repository is a small learning project built to practice the React ecosystem and TypeScript, including routing, state management, component design, and front-end engineering basics. Application code lives in `src/`, with `main.tsx` as the entry point and `App.tsx` as the main page component. Global styles are in `src/index.css`, and static assets belong in `public/`. Tooling and build configuration stays at the root in files such as `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, and `.prettierrc`.

## Build, Test, and Development Commands
- `pnpm dev`: start the Vite dev server with hot reload.
- `pnpm build`: run TypeScript project checks and create a production build in `dist/`.
- `pnpm preview`: preview the production build locally.
- `pnpm lint`: run ESLint across the project.

Install dependencies with `pnpm install`. There is no `test` script yet, so `lint` and `build` are the main safety checks.

## Coding Style & Naming Conventions
Use TypeScript for new logic where possible. Follow 2-space indentation, semicolons, and single quotes as defined in `.prettierrc`. In VS Code, formatting runs on save through `.vscode/settings.json`. Use `PascalCase` for React components such as `TaskBoard.tsx`, `camelCase` for variables and functions, and `kebab-case` for asset filenames when useful.

Keep components small and easy to read. As the project grows, a good next step is to move reusable UI into `src/components/`, feature code into `src/features/`, and shared helpers into `src/utils/`.

## Testing Guidelines
No test framework is configured yet. For now, check your changes with `pnpm lint` and `pnpm build`. If tests are added later, prefer colocated files named `*.test.ts` or `*.test.tsx`, and add a matching `pnpm test` script.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so use a simple and readable commit style such as `feat: add task list layout`, `fix: correct card spacing`, or `docs: update notes`. Keep each commit focused on one idea so it is easy to review later.

If you open a pull request for backup or sharing, include a short summary, the commands you ran to verify the change, and screenshots for visible UI updates.

## Learning Project Notes
Prefer simple, incremental changes over large refactors. The main goal of this repository is to better understand front-end technologies through hands-on work, especially React, TypeScript, TailwindCSS, routing, component design, and front-end engineering basics. Favor solutions that make component boundaries, props, hooks, routing, state flow, styling decisions, and type definitions easier to understand. When updating lint or formatting rules, keep the setup lightweight and make sure the reason is easy for future you to understand.

## Contributor Mindset
When adding features, prefer patterns that help learning: clear component responsibilities, explicit prop types, small reusable hooks, and readable state updates. If a choice exists between a clever abstraction and a straightforward implementation, choose the version that makes React and TypeScript concepts easier to study and revisit later.

## Collaboration Rules For This Learning Project
This repository is first and foremost a learning project for practicing React, TypeScript, TailwindCSS, and related front-end development skills. The assistant should behave like a code reviewer and technical mentor by default, not like an auto-pilot coder.

- Do not directly write, edit, or refactor source code unless the user clearly overrides this rule for a specific request.
- Prefer reviewing the current implementation, identifying non-standard or weak parts, and explaining why they are problematic.
- When code is not standard enough, point out the issue clearly and provide a better written approach, including what to change and why.
- Focus on helping the user learn good front-end practices: component design, prop design, state management, hook usage, styling structure, TypeScript typing, file organization, accessibility, and maintainability.
- Prefer giving small, concrete, educational suggestions over large rewrites.
- When multiple approaches exist, compare them briefly and recommend the one that is easier to learn, maintain, and scale.
- If an implementation is acceptable but not ideal, explain both what is okay and what can be improved.
