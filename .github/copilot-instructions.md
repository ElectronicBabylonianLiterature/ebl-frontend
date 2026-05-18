---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

## Scope and Project Context

- This is a frontend React + TypeScript project. Use frontend-appropriate patterns and tooling.
- Do not make any changes to the codebase unless explicitly requested.

## API Schema Alignment

- The backend API schema is the source of truth for request and response field names.
- When a client/backend field naming mismatch exists, align the client to the backend schema by default.
- Do not introduce backend aliases for alternate client field names unless explicitly requested as a backward-compatibility requirement.

## Coding Standards

- Follow the existing coding style and conventions used in the project.
- Always use full import paths (for example `common/useObjectUrl`) instead of local relative paths like `./useObjectUrl` whenever module aliases are available.
- Always use full variable and function names for clarity.
- Ensure that all functions and methods in TypeScript have appropriate type annotations. Avoid using `any` or `unknown` unless very necessary.
- Functions should be small and focused on a single task.
- Refactor long and complex code automatically.
- Treat DRY as a hard gate: if the same domain logic or mapping appears in more than one place, extract and reuse a shared helper before finalizing.
- Do not add comments to the code unless explicitly requested.

## Commands and Tooling

- When running shell commands for project tasks, always use `yarn` instead of `npm`.
- After any code change, always run `yarn lint` before finalizing work.
- Treat lint as a hard gate: do not stop after changes until `yarn lint` reports no lint errors.
- After any code change, always run `yarn tsc` before finalizing work.
- Treat TypeScript compilation as a hard gate: do not stop after changes until `yarn tsc` reports no errors.

## File Restore Rules

- When asked to restore a file to its previous state, always restore it from the `master` branch reference.
- After restoring, always verify the file exactly matches `master` (for example via a direct git diff check) and report the confirmation.

## Testing and Quality

- Add / update tests for any new functionality or significant changes.
- When writing tests, ensure they are isolated and do not depend on external state (Jest + React Testing Library conventions).
- Ensure that coverage is 100% after changes in affected code.
- Tests must run without any console errors, warnings, or other noise. Any `console.error`, `console.warn`, or unhandled-rejection output is a defect that must be fixed at its root cause.
- Suppressing console output (e.g. mocking `console.error`/`console.warn` to silence warnings or similar) is **never** an acceptable solution. Fix the source of the warning instead.
- Treat console-clean runs as a hard gate: do not stop after changes until a full test run produces zero console output.
- Never remove, disable, skip, or comment out existing tests without explicit user confirmation.
- Only propose removing a test when the underlying code path was removed or changed such that the assertion is no longer meaningful.
- If test removal is proposed, provide detailed justification first and wait for explicit user approval before making that change.

## Task Tracking and Cleanup

- For every task, create a mandatory detailed TODO list in a `.md` file.
- For every task, create and maintain a detailed work log in a `.md` file.
- Use a consistent naming convention for these files: `TASK-<id>-todo.md` and `TASK-<id>-log.md`.
- Keep both the task TODO list and task log constantly updated while working.
- Before a PR is merged, check for these task TODO/log `.md` files and remind to remove them.

## Review Guidelines

- Keep review comments short, specific, and actionable.
- Prioritize correctness, regressions, security, and test coverage in every review.
- All instances of console errors, warnings, or unhandled rejections found in the test output must be noted as findings in the review. They are never acceptable noise — every such instance must be fixed at its root cause. Resolving every such finding is a hard gate: a PR may not be approved while any console-noise finding remains.
- Verify changed behavior locally while running the modified application before finalizing review conclusions.
- Export every detailed review to a `.md` file using the same convention: `TASK-<id>-review.md`.
- Use a consistent review template with these sections: `Summary`, `Findings`, `Severity`, `Reproduction Steps`, and `Recommendation`.
- When asked to check PR reviews, always gather both inline comments and timeline review events (for example `CHANGES_REQUESTED`, `APPROVED`, `COMMENTED`).
- In the review file, explicitly include comment status tracking: unresolved vs resolved comments.
- In the review file, add a mandatory final section named `What Has To Be Done` with a numbered list of concrete required actions.
- In `What Has To Be Done`, include all unresolved review threads, required code changes, required test updates, and re-review/requested-reviewer follow-up.
- If a reviewer requested changes, clearly mark those items as blockers before approval.
- Keep the review file updated as findings change, and remind to remove it before a PR is merged.
