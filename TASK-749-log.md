<!-- markdownlint-disable MD013 -->

# TASK-749 — Work Log

## 2026-09-15

### Context

Implement the `nameBreaks` frontend change described in `TASK-749-frontend-brief.md`.
The work already exists as commit `a9df351`, exported to `TASK-749-frontend.patch`.

**Deviation from the brief, on explicit user instruction:** the brief specifies a
branch cut from `master`. The user asked for the PR to be _based on this one_, so
`add-name-breaks` is cut from `chore/remove-bluebird` (PR #774) instead. The new PR
therefore stacks on #774 and should target `chore/remove-bluebird` as its base.

### Steps

1. **Committed the pre-existing untracked task docs.** Eight `TASK-774-*` /
   `TASK-ts7-*` files were untracked in the working tree. Committed as `7c9b1d01`
   on `chore/remove-bluebird` at the user's explicit request. Not pushed.

2. **Located the source material.** The three files were given as
   `/workspaces/ebl-frontend-nameBreaks-*`; they actually landed in the repo root as
   `TASK-749-frontend-brief.md`, `TASK-749-frontend.patch` and
   `TASK-749-frontend-pr-body.md`.

3. **Node version.** The brief warns that Node 22 breaks both `yarn install` and
   husky's pre-commit hook with `The engine "node" is incompatible`. This
   environment already runs **Node 20.20.2**, matching `.nvmrc` (`20.0.0`), so no
   `PATH` juggling was needed.

4. **Branch.** `git checkout --no-track -b add-name-breaks` from
   `chore/remove-bluebird`. `--no-track` deliberately leaves no upstream configured.

5. **Patch applied.** `git apply --check` passed, then `git apply`. The resulting
   diffstat — 4 files, +110 / -4 — matches the patch header exactly.

6. **250-line gate.** All four touched files are under the ceiling:

   | File                                         | Lines |
   | -------------------------------------------- | ----- |
   | `src/transliteration/domain/accents.test.ts` | 102   |
   | `src/transliteration/domain/accents.ts`      | 137   |
   | `src/transliteration/domain/token.test.ts`   | 86    |
   | `src/transliteration/domain/token.ts`        | 245   |

7. **Verified the applied change against the brief**, section by section: the
   `nameBreaks` field on `NamedSign`, the exported `nameTokens` helper,
   `extractEnclosureTypes` routed through it, the `accents.ts` import, and
   `addAccents` routed through it. `nameParts` keeps its
   `readonly (ValueToken | Enclosure)[]` union type, as the brief requires —
   narrowing it to `ValueToken[]` would break the legacy fallback.

   A grep for `nameParts` across production code (excluding `src/test-support/`
   and `*.test.*`) returns only the type declaration and `nameTokens`' own body,
   confirming the brief's claim that every production read of the name now goes
   through the helper.

### Pre-existing issues found

1. **Browserslist advisory in the test output.** Every test run prints
   `Browserslist: browsers data (caniuse-lite) is 8 months old`. This is a build-tool
   advisory emitted by craco before any test executes — not `console.error`/`console.warn`
   from a test — and it is pre-existing and unrelated to this change. Clearing it means
   `npx update-browserslist-db@latest`, which rewrites `yarn.lock`; that is a dependency
   bump that does not belong in a focused stacked PR. **Raised with the user rather than
   bundled in.**

2. **`accents.ts` branch coverage 85%** (lines 57-61, 132). These are the `?? letter`
   fallbacks in `addGraveAccent`/`addAcuteAccent` and the `|| c` fallback in `addBreves`
   — all pre-existing, untouched by this patch, and in functions this change does not
   call into. `accents.ts` is not in craco's `fullyCoveredPaths`, so no per-file 100%
   threshold applies. The **affected** code is fully covered.

### Gate results

All gates green, on Node 20.20.2.

| Gate             | Command                                         | Result                                                                                                |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Types            | `yarn tsc`                                      | **0 errors**                                                                                          |
| Lint             | `yarn lint`                                     | **clean** (eslint + stylelint)                                                                        |
| Tests            | `CI=true yarn test --watchAll=false`            | **500 suites / 4402 tests passing**, 50 snapshots                                                     |
| Console noise    | grep of the full captured run                   | **zero** — no `console.error`/`warn`/`log`, no `Warning:`, no unhandled rejections, no act() warnings |
| Coverage         | `CI=true yarn test --watchAll=false --coverage` | **exit 0**, all thresholds met; global 94.87 / 87.6 / 94.65 / 95                                      |
| 250-line ceiling | `wc -l` on all four touched files               | **max 245** (`token.ts`)                                                                              |

Coverage of the affected files:

| File         | Stmts | Branch                       | Funcs | Lines |
| ------------ | ----- | ---------------------------- | ----- | ----- |
| `token.ts`   | 100   | **100**                      | 100   | 100   |
| `accents.ts` | 100   | 85 (pre-existing, see above) | 100   | 100   |

`token.ts` is at 100% branch coverage, so both arms of `nameTokens` — the legacy
passthrough and the interleave — are exercised.

**Test count differs from the brief.** The brief expects 435 suites / 4180 tests; this
run shows 500 / 4402. That is expected: the brief assumed a branch cut from `master`,
whereas this one is cut from `chore/remove-bluebird`, which adds suites of its own.

### Commit and PR

The user explicitly authorised committing, pushing and opening the PR. Code and task
docs went in **one commit**, per the project rule that task docs ship with the code
rather than in a separate docs commit.

The commit keeps the message and authorship of `a9df351`
(`Ilya Khait <ilya.khait@lmu.de>`) via `--author`. Its **hash necessarily differs** from
`a9df351`: the parent is `chore/remove-bluebird`, not `master`, so an identical hash was
never achievable on this base. The diff, message and authorship are preserved.

`gh` is not installed in this workspace, so the PR was opened through the GitHub REST
API with the Codespace token.

- Commit: `d506a0de` (10 files, +1119 / -4 — code, tests and task docs)
- Branch pushed: `add-name-breaks`
- PR: [#817](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/817), base `chore/remove-bluebird`

The pre-commit hook (lint-staged + prettier) reformatted the committed markdown tables;
eslint reported nothing to fix on the four source files.

### Note on the brief's push blocker — resolved

Brief section 11 records that the branch could not be pushed from the ebl-api Codespace,
whose token is scoped to `ebl-api` only. That blocker does **not** apply here: this
workspace is the `ebl-frontend` repo itself and its token pushes fine.

### CI failure on PR #817 — fixed at root cause

The `test` check went red on the first push. One suite failed:
`src/fragmentarium/application/FragmentService.queries.test.ts` —
_"Query by traditional references › returns traditional reference to fragment numbers
mapping data"_. It passed locally but failed in CI.

**Pre-existing, and not caused by this change.** Neither commit on this branch touches
that file, and it is byte-identical to the file on `chore/remove-bluebird`.

**Root cause.** The test compared two _Promise objects_ with `toEqual`:

```ts
const expected = Promise.resolve(returnData)
result = fragmentService.queryByTraditionalReferences(['text 1'])
expect(result).toEqual(expected)
```

That assertion was **vacuous** — it compared promise wrappers, never the values they
resolve to. Verified directly: `expect(Promise.resolve({x:1}))
.toEqual(Promise.resolve({completely:'different'}))` passes. The test never checked
anything.

**Why it only broke now — two causes compounding.**

1. On `master` the file did `import Promise from 'bluebird'`. Bluebird promises carry no
   `async_id_symbol`, so two of them always compared equal. PR #774 removed that import,
   making these **native** promises.
2. CI runs jest with **`--detectOpenHandles`** (workflow step _Unit Tests_), which
   enables `async_hooks`. That attaches own `Symbol(async_id_symbol)` /
   `Symbol(trigger_async_id_symbol)` properties, with different ids per promise, to every
   native promise — so `toEqual` now sees two differing objects. Locally, without that
   flag, no symbols are attached and the vacuous assertion still "passed".

So #774 armed it and `--detectOpenHandles` fired it. Reproduced locally with the exact CI
command, which fails on the original file and passes on the fixed one.

**Fix.** Await the promise and compare the resolved value, and type the result rather
than leaving it implicitly `any`:

```ts
let result: FragmentAfoRegisterQueryResult
const pendingResult = fragmentService.queryByTraditionalReferences(['text 1'])
result = await pendingResult
expect(result).toEqual(returnData)
```

Mutation-checked: feeding it `{ items: [] }` now fails the test, so the assertion is real.

The await is bound to a variable rather than applied to the call directly because
`testing-library/no-await-sync-queries` false-positives on the `query*` method name,
thinking it is a Testing Library query. `testDelegation` in `src/test-support/utils.ts`
already awaits via a variable for the same reason — this matches it, and avoids an
`eslint-disable` comment.

**Scope check.** A repo-wide search for the same antipattern found no other test
comparing un-awaited promises; the other `Promise.resolve(...)` bindings are mock return
values. `testDelegation` already awaits correctly.

**Full CI job reproduced locally, all steps green:**

| CI step                                                              | Result                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| No bluebird                                                          | pass — no `bluebird` imports under `src`                                 |
| `yarn lint`                                                          | clean                                                                    |
| `yarn tsc`                                                           | 0 errors                                                                 |
| `yarn test --coverage --forceExit --detectOpenHandles --watch=false` | exit 0, **500 suites / 4402 tests**, zero console noise, no open handles |
| `yarn build`                                                         | exit 0                                                                   |

**Unrelated CI warning, left alone:** the runner reports `actions/checkout@v4` and
`actions/setup-node@v4` target Node 20 but are forced onto Node 24. That is a GitHub
Actions deprecation notice about the _action runtime_, not the project's Node version
(`setup-node` still pins the job to Node 20). It is a warning, not a failure, it affects
every workflow run on the repo, and bumping the actions is a repo-wide change outside
this PR.

### Remaining findings

Tracked in `TASK-749-handoff.md`. In short: the deploy-order tension created by stacking
on #774, retargeting the PR base to `master` after #774 merges, the pre-existing
Browserslist advisory, pre-existing `accents.ts` branch coverage, and deleting the task
docs before merge.
