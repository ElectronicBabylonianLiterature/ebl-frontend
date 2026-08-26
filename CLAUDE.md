# eBL frontend — agent routing

React 18 + TypeScript SPA for the electronic Babylonian Library. Create React App 5
driven through craco, `react-router-dom` v6, react-bootstrap, Sass, Bluebird promises,
Auth0, Sentry, Jest + React Testing Library. **No Next.js, no SSR, no React Server
Components** — reject any advice that assumes them.

## Instruction precedence

1. `.github/copilot-instructions.md` — **authoritative**. Read it before any code change.
   It owns the hard gates (250-line ceiling, no comments, `yarn lint`, `yarn tsc`, full
   test suite, console-clean, DRY, task TODO/log files, review format).
2. `.claude/skills/**` — how to work. Never weakens rule 1; where they disagree, rule 1 wins.
3. This file — routing only.

## Repository map

| Layer            | Path                                             | Rule                                        |
| ---------------- | ------------------------------------------------ | ------------------------------------------- |
| domain           | `src/<feature>/domain/`                          | pure; no DTOs, no I/O                       |
| application      | `src/<feature>/application/`                     | services, ports, caches                     |
| infrastructure   | `src/<feature>/infrastructure/`                  | repositories, DTO mappers                   |
| ui               | `src/<feature>/ui/`                              | components; never sees a DTO or `ApiClient` |
| composition root | `src/InjectedApp.tsx` + `src/router/Services.ts` | the only place repositories are constructed |

HTTP `src/http/ApiClient.ts` · loading HOC `src/http/withData.tsx` · caching
`src/common/utils/getOrFetchCachedValue.ts` + `src/fragmentarium/application/scopedCache.ts` ·
session/scopes `src/auth/Session.ts` · error reporting `src/ErrorReporterContext.ts` ·
design tokens `src/_design-tokens.sass` · test fixtures `src/test-support/`.

Imports are always alias paths from `src` (`common/hooks/useObjectUrl`), never `./relative`.

## Routing

| Request                                          | Skills, in order                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| "how does X work", "why does X happen", audit    | `ebl-investigation`                                                                                                       |
| feature / non-trivial change                     | `ebl-investigation` → `ebl-planning` → `ebl-architecture` (if a new boundary) → `ebl-implementation` → `ebl-verification` |
| bug, test failure, unexpected behaviour          | `ebl-debugging` → `ebl-implementation` → `ebl-verification`                                                               |
| visual / UI work                                 | `ebl-frontend-design` → `ebl-implementation` → `ebl-visual-verification` → `ebl-verification`                             |
| "slow", "janky", too many requests               | `ebl-investigation` → `ebl-frontend-performance` and/or `ebl-api-performance` → `ebl-verification`                        |
| review a PR or a diff                            | `ebl-pr-review` (dispatches `ebl-test-review`, `ebl-security-review`, the performance skills)                             |
| touches auth, scopes, HTML, URLs, external media | `ebl-security-review`                                                                                                     |
| "is it done?", before claiming success           | `ebl-verification`                                                                                                        |

Trivial changes skip planning and architecture. Nothing skips `ebl-verification`.
Provenance for adapted external material: `.claude/skills/PROVENANCE.md`.
