# TASK-ts7-migration — Work Log

Implementation of the TS7 deprecated-option migration. Toolchain: CRA
`react-scripts@5.0.1` + CRACO, TypeScript 5.9.3, Jest via CRA. tsc is `noEmit`
(Babel/preset-react-app does the real transpile).

## Correction to an earlier (wrong) blocker claim

An earlier research pass in this workspace concluded that `moduleResolution: bundler`
and `paths` were impossible under CRA because `verifyTypeScriptSetup` would rewrite
`tsconfig.json` on every build. **That was wrong.** Verified root cause:
`verifyTypeScriptSetup` is invoked **only** from `react-scripts/scripts/init.js:334`
(scaffolding/eject) — never from `start`/`build`/`test`. So CRA does not touch
`tsconfig.json` during normal work, and `bundler` + `paths` survive. The separate fact
that CRA reads `baseUrl` (not `paths`) for webpack/jest resolution is real and is
handled by CRACO compensation (below).

## Before / after `tsconfig.json`

| Option               | Before          | After                  |
| -------------------- | --------------- | ---------------------- |
| `target`             | `es5`           | `es2020`               |
| `moduleResolution`   | `node` (node10) | `bundler`              |
| `baseUrl`            | `src`           | removed                |
| `paths`              | —               | `{ "*": ["./src/*"] }` |
| `downlevelIteration` | `true`          | removed                |
| `ignoreDeprecations` | `"5.0"`         | removed                |

`paths` targets must be relative when `baseUrl` is unset (`TS5090`), hence `./src/*`.

## CRACO compensation (`craco.config.js`)

Removing `baseUrl` drops `src` from CRA's webpack `resolve.modules` and jest
`modulePaths` (CRA derives both from `baseUrl` in `config/modules.js`; it never reads
`paths`). Restored explicitly:

- webpack `resolve.modules` now includes `<root>/src`.
- jest `modulePaths` now includes `<root>/src` (new `jest.configure` block).

## Migration breakages fixed (behaviour-preserving)

1. **dotenv typing** (`setupTests.ts`): `bundler` resolves `dotenv` to a `.d.ts` whose
   `parse()` values are `unknown`; `process.env[key] = String(value)` (values are
   strings anyway).
2. **async return types (`TS1064`, 51 across 23 files):** raising `target` off `es5`
   makes TS enforce that an `async` function's return annotation is the **global**
   `Promise`. All 23 files annotated async functions with a shadowed `Promise`
   (`import Promise from 'bluebird'`) or `Bluebird<T>`. Since an `async` function always
   returns a native Promise at runtime, these annotations were type-fictions.
   Grep confirmed **only `setupTests.ts` uses a genuine Bluebird API** (`Promise.config`).
   Fixes:
   - 20 files imported bluebird as `Promise` purely for annotations → dropped the import
     so the annotation binds the global `Promise`. Runtime `Promise.resolve/reject` in
     test mocks (which feed Bluebird-typed service mocks) were converted to explicit
     `Bluebird.resolve/reject` — restoring the exact pre-existing runtime behaviour.
   - 3 files imported `Bluebird` and annotated async fns `Bluebird<T>` → global
     `Promise<T>`; vestigial imports dropped.
3. **Cascades (compiler-driven):**
   - `Content.onDelete` and `DateSelection.updateDate` prop types only use `.then()` →
     widened `Bluebird→Promise` (Bluebird is assignable to Promise, so existing callers
     stay valid).
   - `withData` genuinely uses `.cancel()`/`.isCancelled()` (core infra, 63 consumers) →
     left untouched; `sitemap` getter bridges with `Bluebird.resolve(getAllSlugs(...))`.
   - `DatesInTextSelection.updateDateInArray` flows into the `usePromiseEffect`
     cancellation chain, which genuinely needs `Bluebird`. It had **no `await`**, so it
     never needed `async` — de-asyncing it fixes `TS1064` while keeping the `Bluebird`
     contract intact (and makes the runtime object match its long-declared cancellable
     type). The `DateSelection`/`DateSelectionState` chain was reverted to its original
     Bluebird typing.
   - Test mock stragglers: one `jest.Mock<Promise<…>>` annotation → `Bluebird<…>`; one
     `new Promise<Word>(…)` delayed mock → `new Bluebird<Word>(…)`.

No suppression left in `tsconfig.json`.

## Gates

- `yarn tsc` → **exit 0** (was 52 errors mid-migration; resolved at root cause).
- `yarn lint` → **exit 0** (3 prettier line-wraps from `Bluebird` being 1 char longer,
  auto-fixed).
- Focused: `Signs`, `DatesInTextSelection`, `sitemap`, `LemmatizationForm` →
  4 suites / 20 tests pass, console-clean.
- `CI=true yarn test --watch=false` (full) — broad impact (tsconfig + CRACO jest
  resolution); run recorded here.

## Risk notes for PR

- `target es2020` is type-check-only (`noEmit`); the bundle's transpile target is driven
  by `browserslist` via Babel, unchanged. `browserslist` already excludes IE11 / Safari
  <12 / iOS ≤14.7, well within es2020.
- `bundler` honours `package.json` `exports`; only one dependency (`dotenv`) surfaced a
  typing difference, fixed.
- Absolute-import resolution now has three independent sources kept in sync: tsc
  (`paths`), webpack + jest (CRACO `src`), and eslint-plugin-import
  (`.eslintrc` `moduleDirectory`, already `src/`).
- Bluebird remains a dependency (160+ files, cancellation); this migration only corrected
  async **return-type** annotations, it did not remove Bluebird.
