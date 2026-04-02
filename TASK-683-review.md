# TASK-683 PR Review — PR #692

**PR:** [Comprehensive health check and stabilization pass](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/692)  
**Branch:** `update-eslint` → `master`  
**Author:** khoidt (Ilya Khait)  
**Review date:** 2026-04-02

---

## Summary

PR #692 is a broad stabilization pass targeting build reliability, test quality, and code health
after the bulk PR #661 changes. The primary blocker (OOM-killed CI build) is confirmed fixed and
validated on GitHub Actions ubuntu-latest. Key structural improvements include: `Spinner` defaultProps
deprecation fix, `ErrorBoundary` logging cleanup, `useObjectUrl` error resilience, `LemmaInput`
controlId conflict fix, React DOM nesting violations, `common/` subdivision, and import path
realignment. 243 test files were modernized (async queries, memory-router, act() removal).

The suite is green: `289/289` suites pass, `22239/22241` tests pass, `2` skipped.  
Lint and TypeScript both pass cleanly.

Despite these strong outcomes, **two hard-gate violations remain open** that must be resolved
before approval under the current instructions.

---

## Findings

### F1 — `ErrorBoundary.comprehensive.test.tsx`: Blanket `console.error` / `console.log` suppression

**File:** `src/common/errors/ErrorBoundary.comprehensive.test.tsx`, lines 19–20

```ts
beforeEach(() => {
  …
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'log').mockImplementation(() => {})
})
```

The `beforeEach` block silences **all** `console.error` and `console.log` output for the
entire describe block (50+ tests). This is unconditional, blanket suppression — not a targeted
assertion spy on a specific call. Any unrelated console noise produced by these tests is
made invisible to CI.

The instruction is unambiguous: "Suppressing console output … is **never** an acceptable
solution. Fix the source of the warning instead."

The underlying trigger is React's own error-boundary logging (React emits `console.error`
whenever a component throws). The correct fix is to use a `console.error` spy in each
specific test that expects an error to be thrown, assert on the expected call, and restore
immediately after — rather than suppressing globally.

---

### F2 — `DossiersRepository.ts`: Production code silences warnings in the test environment

**File:** `src/dossiers/infrastructure/DossiersRepository.ts`, line 11

```ts
private readonly shouldLogWarnings = process.env.NODE_ENV !== 'test'
```

This makes production behavior differ from test behavior: `console.warn` calls that fire in
production are silently swallowed when tests run. This is a more severe form of suppression
than a test-level spy because it is embedded in shipping production code and removes the
ability to detect the warnings at any point during test runs — including future tests that
might rely on those warnings for debugging.

The correct fix is to resolve the underlying warning cause (e.g. mock the network call so
the fallback path is not triggered, or verify the fallback is no longer a warning in updated
test fixtures).

---

### F3 — `react-auth0-spa.test.tsx` / `react-auth0-spa.security.test.tsx`: Suppression without assertion

**Files:**

- `src/auth/react-auth0-spa.test.tsx`, lines 520, 596
- `src/auth/react-auth0-spa.security.test.tsx`, lines 168, 263

Several tests spy on `console.warn` / `console.error` with `mockImplementation()` but never
assert on the spy and never verify what was (or was not) emitted:

```ts
// line 520 — no assertion, restores via cast at end
jest.spyOn(console, 'warn').mockImplementation()

// line 596 — no assertion, no spy capture
jest.spyOn(console, 'error').mockImplementation()
;(console.error as jest.Mock).mockRestore()
```

These suppress output to prevent test noise without verifying the behavior. Contrast with lines
496 and 542, which correctly capture the spy and assert `.toHaveBeenCalledWith(…)` before
restoring — those are acceptable.

The suppressions at 520 / 596 / 168 / 263 should either be converted to assertions (`expect(spy).toHaveBeenCalledWith(…)`) or removed entirely if the underlying source of the warning can be eliminated.

---

### F4 — `package.json` `build` script permanently disables ESLint webpack plugin

**File:** `package.json`

```json
"build": "DISABLE_ESLINT_PLUGIN=true NODE_OPTIONS=--max_old_space_size=1536 craco build"
```

`DISABLE_ESLINT_PLUGIN=true` is now a permanent fixture in the default `build` script. The
Docker production image and any local `yarn build` invocation will never run the webpack ESLint
plugin. While `yarn lint` still runs as a separate CI step (and catches the same rules), this
weakens the local developer feedback loop: `yarn build` silently skips lint.

Additionally, `GENERATE_SOURCEMAP=false` is in the CI workflow build step but not in `package.json`,
so local `yarn build` still generates source maps (which can OOM-kill in the current Codespace).
This is by design (the PR documentation is explicit), but it means local builds remain fragile.

This is a **low-severity** finding — the CI pipeline remains correct — but worth tracking to
either align `DISABLE_ESLINT_PLUGIN` with the lint-gate intent or document the deliberate
divergence.

---

### F5 — Task-tracking artifact files not removed before merge

**Files:** `TASK-683-*.md`, `TASK-683-*.txt`, `PR-661-test-changes-analysis.md` (root-level)

The instructions require these files to be removed before a PR is merged:

> "Before a PR is merged, check for these task TODO/log .md files and remind to remove them."

These files are still present:

- `TASK-683-build-investigation.md`
- `TASK-683-commented-test-assertions-audit.md`
- `TASK-683-crush-debugging-review.md`
- `TASK-683-issues-summary.md`
- `TASK-683-log.md`
- `TASK-683-remaining-todos-2026-04-01.md`
- `TASK-683-src-comments-audit.md`
- `TASK-683-test-diag-hotspots-2026-03-25.md`
- `TASK-683-test-issues-detailed.md`
- `TASK-683-test-issues-rerun-2026-03-10-2.md`
- `TASK-683-test-output-2026-04-02-all.txt`
- `TASK-683-todo.md`
- `PR-661-test-changes-analysis.md`
- Several `TASK-683-test-diag-*.txt` / `TASK-683-test-output-*.txt` artifacts

These should be removed in a final commit before merge.

---

## Severity

| ID  | Finding                                                                                | Severity                |
| --- | -------------------------------------------------------------------------------------- | ----------------------- |
| F1  | `ErrorBoundary.comprehensive.test.tsx` — global `beforeEach` console suppression       | **BLOCKER**             |
| F2  | `DossiersRepository.ts` — `shouldLogWarnings = NODE_ENV !== 'test'` in production code | **BLOCKER**             |
| F3  | Auth tests — suppression without assertion at lines 520, 596, 168, 263                 | **HIGH**                |
| F4  | `build` script has permanent `DISABLE_ESLINT_PLUGIN=true`                              | LOW                     |
| F5  | Task-tracking `.md` / `.txt` artifacts present in root                                 | LOW (pre-merge cleanup) |

---

## Reproduction Steps

**F1:**

1. Run the test file in isolation:
   `CI=true yarn test --watch=false --runTestsByPath src/common/errors/ErrorBoundary.comprehensive.test.tsx`
2. Add `console.error('unexpected noise')` inside any test in the file.
3. Observe: the output is swallowed and does not appear in the test run.  
   Expected: the noise should appear (and fail the console-clean hard gate).

**F2:**

1. Open `src/dossiers/infrastructure/DossiersRepository.ts`, line 11.
2. Observe `process.env.NODE_ENV !== 'test'` used as a runtime guard on `console.warn`.
3. Run `CI=true yarn test --watch=false --runTestsByPath src/dossiers/infrastructure/DossiersRepository.test.ts`.
4. Observe: the fallback-path `console.warn` calls are swallowed in the test run.  
   Expected: either the mock should prevent the warning from firing, or the warning should be
   visible and asserted upon.

**F3:**

1. Open `src/auth/react-auth0-spa.test.tsx`, test `provides guest access when session validation throws error` (line ~518).
2. Notice no assertion on the `console.warn` spy.
3. Add a typo to the logged message in `Auth0Provider`.
4. Observe: the test still passes even though the log message was wrong — the spy was there to suppress, not to verify.

---

## Recommendation

1. **F1 — Resolve before merge.** Replace the `beforeEach` global spy with per-test targeted spies in the specific tests that need to interact with `console.error`. For tests that exercise React's built-in error-boundary output, use `jest.spyOn(console, 'error')` in a narrow scope, assert the expected React error call, and restore immediately.

2. **F2 — Resolve before merge.** Remove the `shouldLogWarnings` guard from `DossiersRepository.ts`. Update the repository's test fixtures or mocks so the fallback path does not fire a `console.warn` during tests (e.g. make the mock respond successfully).

3. **F3 — Resolve before merge.** For each suppression-only spy identified (lines 520, 596 of `react-auth0-spa.test.tsx`; lines 168, 263 of `react-auth0-spa.security.test.tsx`): either add a clear `.toHaveBeenCalledWith(…)` assertion or remove the spy and fix the underlying warning source.

4. **F4 — Track as follow-up.** Consider documenting explicitly in `package.json` or the README that `DISABLE_ESLINT_PLUGIN=true` is intentional in the build script (OOM mitigation). Optionally restore it only in the Dockerfile/workflow and remove from `package.json` to preserve local lint-in-build feedback.

5. **F5 — Remove task artifacts before merge.** Delete all `TASK-683-*.md`, `TASK-683-*.txt`, and `PR-661-test-changes-analysis.md` root-level files prior to squash/merge.

---

## Comment Status Tracking

| Thread                                                                | Author | Status   |
| --------------------------------------------------------------------- | ------ | -------- |
| `qltysh`: overly broad permissions (`.github/workflows/main.yml`) × 2 | qltysh | Resolved |
| `qltysh`: overly broad permissions (`.github/workflows/main.yml`) × 1 | qltysh | Resolved |

No reviewer `CHANGES_REQUESTED` or `APPROVED` events on record at review time.

---

## What Has To Be Done

1. **BLOCKER** Fix `src/common/errors/ErrorBoundary.comprehensive.test.tsx`: remove the `beforeEach` global `jest.spyOn(console, 'error').mockImplementation(() => {})` and `jest.spyOn(console, 'log').mockImplementation(() => {})`. Replace with per-test targeted spies only where needed; assert on the expected calls; restore after.

2. **BLOCKER** Fix `src/dossiers/infrastructure/DossiersRepository.ts`: remove `private readonly shouldLogWarnings = process.env.NODE_ENV !== 'test'` and the associated guards. Update test setup/mocks to prevent the fallback-path `console.warn` from firing in tests.

3. **HIGH** Fix `src/auth/react-auth0-spa.test.tsx` lines 520 and 596, and `src/auth/react-auth0-spa.security.test.tsx` lines 168 and 263: convert suppression-only spies to asserting spies with `.toHaveBeenCalledWith(…)` or remove the spy and eliminate the source of the warning.

4. Run a full test suite after items 1–3 and confirm `grep -c '● Console' <output>` returns `0` with no warnings suppressed in `beforeEach`/global scope or via production-code `NODE_ENV` guards.

5. Remove all `TASK-683-*.md`, `TASK-683-*.txt`, and `PR-661-test-changes-analysis.md` root-level task artifacts (including this review file) before the final merge commit.

6. Re-request review after items 1–5 are complete.
