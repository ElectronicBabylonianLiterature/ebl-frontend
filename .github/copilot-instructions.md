---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

## Scope and Project Context

- This is a frontend React + TypeScript project. Use frontend-appropriate patterns and tooling.
- Do not make any changes to the codebase unless explicitly requested.

## Pre-existing Issues

- Always fix all pre-existing issues immediately upon detection as part of the same task. This applies to any failing test, lint error, type error, console noise, broken build, or other defect surfaced while working — regardless of whether the current task introduced it.
- Do not defer, set aside, or merely report a pre-existing failure for later. Treat it as part of the current task's hard gates and resolve it at its root cause before finalizing.
- Identify the root cause first. If a failure stems from external state (for example a leaked environment variable, machine-specific config, or non-deterministic ordering), fix it so the affected code or tests are isolated and deterministic, rather than masking the symptom.
- Briefly note in the task log which pre-existing issues were found, their root cause, and how they were fixed.

## API Schema Alignment

- The backend API schema is the source of truth for request and response field names.
- When a client/backend field naming mismatch exists, align the client to the backend schema by default.
- Do not introduce backend aliases for alternate client field names unless explicitly requested as a backward-compatibility requirement.

## Data Architecture — Distinct Kinds Are Held Structurally Apart

**Treat structural separation of data as a hard gate.** Different kinds of data — different kinds of tag, id, entity, annotation, reference — must never be intermixed in one array, map, or field. Each kind lives in its own collection, from the API boundary through state, props, and lookups, all the way to the point of rendering. If two things obey different rules (different required fields, different validation, a different collection their ids resolve against), they are different kinds. Do not finalize a change that puts two kinds in one collection.

- **A heterogeneous array is the defect, not the type that describes it.** `Array<Tag | Realia>` is still intermixed data even when a discriminant makes it type-safe. Keep `tags: Tag[]` and `realia: Realia[]` as separate fields and iterate them separately; render one after the other rather than merging, filtering, and re-splitting. A discriminated union is for the rare single value whose kind is genuinely dynamic — it is not a licence to pool the collections.
- **Separation is end-to-end.** If the API returns two lists, they stay two lists in the DTO, in reducer state, in component props, and in every lookup. Splitting a mixed list at the last moment (in the final `map`, or at serialization) keeps the illegal state alive through the whole codebase; partition where the data is first collected.
- **One lookup per kind. Never resolve an id of one kind against the collection of another.** Ids from different kinds share a namespace only by accident; a shared or fallback map will silently resolve a foreign id and appear to work. Cover it with an explicit negative test.
- **Never discriminate by the presence or absence of an optional field.** `{ id, type?, realiaId? }` lets a value carry _both_ or _neither_, forces every reader to probe for a field to learn what it holds, and lets one kind be constructed where the other is expected. Give each kind its own type with its own required fields.
- Where a union is unavoidable for a single value, write guards so **both** branches narrow (`span is Extract<Span, { layer: 'realia' }>`, not `span is Span & { … }`). A cast used to escape a guard means the model is wrong — fix the model, not the call site.
- **Derived, client-only fields must never reach the API.** Fields computed for display (tiers, labels, kind tags, sort keys) are stripped at the serialization boundary by exactly one shared helper. Backends that reject unknown keys `422` if one leaks, so exactly one place builds the outbound payload and one test pins its shape.
- Do not add a field to an existing type "just for this one case" when the case is really a second kind. Splitting the type is cheaper than every future reader having to ask which case it is holding.

Verify before finalizing, and state the result in the task log:

- No array, map, or field in the change holds more than one kind — including reducer state and component props, not just the API payload.
- No type carries mutually exclusive optional fields as a de facto discriminant.
- Each kind's ids resolve only against that kind's own collection.
- No `as` cast converts between the kinds, and no guard leaves its else-branch unnarrowed.
- The outbound payload is built in one place, carries no derived field, and is pinned by a test.

## API Call Efficiency — Audit Queries as a Hard Gate

**Treat query efficiency as a hard gate on every change and every review.** Before finalizing, audit the data-fetching paths the change touches and confirm the architecture is as efficient as possible, with no redundant or inefficient API calls. Do not finalize a change that adds an avoidable request pattern.

- **No N+1 fetching.** Never fetch a list of entities by issuing one request per id in a loop or `Promise.all(ids.map(fetch))`. Use a bulk endpoint (one request for many ids) or have the parent resource embed the data. If a bulk path does not exist, treat adding one (or embedding the data server-side) as part of the task, and align the client to that contract.
- **Fetch once per page load.** Data needed to render a page is fetched a single time on load, then read from state — not re-fetched on every toggle, tab switch, re-render, hover, or remount. A UI control that only shows/hides already-available data must not trigger a network request.
- **Prefer embedding over a second round-trip.** When a view needs display data (labels, titles, types) for ids already present in a primary response, prefer injecting that data into the primary response over a separate follow-up request. Embedded display data is inbound-only: it is read for rendering and never echoed back in an outbound payload.
- **Debounce and bound search-as-you-type.** Any query that fires from user typing (autocomplete, async select, live search) must be debounced so a single keystroke does not equal a request; do not fire on an empty query. Cache only when the result set does not depend on per-context state.
- **Cancel in-flight work.** Requests that can be superseded (debounced searches, effect fetches) are cancelled on unmount / re-issue so stale results and post-unmount state updates cannot occur.

Verify before finalizing, and state the result in the task log:

- Every list of entities is fetched in one bulk request (or embedded), never one-per-id.
- No toggle, tab, hover, or re-render re-issues a request for data already in state.
- Search-as-you-type is debounced and skips empty queries; superseded requests are cancelled.
- No display-only data embedded from a primary response is included in any outbound payload.

## Coding Standards

- Follow the existing coding style and conventions used in the project.
- Always use full import paths (for example `common/useObjectUrl`) instead of local relative paths like `./useObjectUrl` whenever module aliases are available.
- Always use full variable and function names for clarity.
- Ensure that all functions and methods in TypeScript have appropriate type annotations. Avoid using `any` or `unknown` unless very necessary.
- Functions should be small and focused on a single task.
- Refactor long and complex code automatically.
- Treat a 250-line ceiling per script file (`.ts`/`.tsx`, including tests) as a hard gate: no script file may exceed 250 lines. When a change would push a file over the limit, split it into focused modules (extract components, hooks, helpers, or group test suites into sibling files) before finalizing. Verify with a line count and keep behaviour identical.
- Treat DRY as a hard gate: if the same domain logic or mapping appears in more than one place, extract and reuse a shared helper before finalizing.
- Do not add comments to the code unless explicitly requested.

## Commands and Tooling

- When running shell commands for project tasks, always use `yarn` instead of `npm`.
- After any code change, always run `yarn lint` before finalizing work.
- Treat lint as a hard gate: do not stop after changes until `yarn lint` reports no lint errors.
- After any code change, always run `yarn tsc` before finalizing work.
- Treat TypeScript compilation as a hard gate: do not stop after changes until `yarn tsc` reports no errors.
- Treat a lockfile-consistent install as a hard gate **before** any local gate result is reported. A local `yarn lint` / `yarn tsc` / test run proves nothing if `node_modules` does not match `yarn.lock` — a missing `@types/*` package silently degrades the types it declares to `any`, so real type errors disappear locally and surface only in CI. Run `yarn install --frozen-lockfile` (or `yarn install --check-files`) first, and never report a green local gate from an environment you have not verified.

## CI — The Remote Result Is the Gate

**Treat the pull request's remote checks as a hard gate, in every task and every review.** A green local run is evidence, not proof: CI installs from the lockfile in a clean environment and builds the **merge of the branch with `master`**, neither of which a local run reproduces. Never call work finished, and never approve or sign off a review, while any check on the PR is failing — including checks that were already red before the change.

- **Always fetch the checks before starting and before finalizing.** For the PR head SHA, list every check run and commit status, with its conclusion:

  ```sh
  gh pr checks <number>                                     # or, without gh:
  curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
    "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/commits/<sha>/check-runs?per_page=100"
  curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
    "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/commits/<sha>/status"
  ```

- **Read the failing job's log and annotations — never infer the cause from the check name.** The annotations name the file and line; the log names the step and the exact command that failed:

  ```sh
  curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
    "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/check-runs/<check_run_id>/annotations"
  curl -s -L -H "Authorization: Bearer $GITHUB_TOKEN" \
    "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/actions/jobs/<job_id>/logs"
  ```

- **A red check is a blocking finding, whoever made it red.** Fix it at its root cause under the Pre-existing Issues rule; do not defer it, do not describe it as someone else's, and do not report a task or review as complete while it is red.
- **Reproduce every CI failure locally before fixing it.** If it does not reproduce, the environment is the bug: check `node_modules` against `yarn.lock` first, then the merge with `master`. Fixing a failure you cannot reproduce is guessing.
- **Verify against the merge, not the branch.** CI checks out `Merge <head> into <base>`. `master` moves. Before finalizing, run the gates on the merge result in a scratch `git worktree` (never `git stash` on a working tree that is not yours):

  ```sh
  git worktree add --detach <path> origin/master
  git -C <path> merge --no-ff --no-edit <branch>   # then run yarn tsc / yarn build / the suite there
  git worktree remove <path>
  ```

- **Run every gate CI runs, not just the ones that are convenient.** For this repository that is `yarn lint`, `yarn tsc`, the full test suite, and `yarn build` — `yarn build` type-checks through a different path and has failed here when `yarn tsc` alone was thought to be enough.
- **After pushing, wait for the checks and confirm they are green.** A push is not the end of the task; the run it triggers is. Re-fetch the checks for the new head and report the conclusion.

Verify before finalizing, and state the result in the task log:

- Every check on the PR head is listed with its conclusion, and none is failing.
- Every failure was reproduced locally, fixed at its root cause, and re-verified.
- The gates were run on the merge with `master`, from a lockfile-consistent install.

## Git Branching and Pushing

- `master` is protected in intent: never commit to it, never push to it, never force-push it. All work lands on a feature branch via a pull request.
- Treat this as a hard gate: **never create a branch with `git checkout -b <name> origin/master`**. That sets `branch.<name>.merge = refs/heads/master`, which makes the branch's upstream `master` itself. A later `git push` — including the VS Code Sync/Publish button — then writes the branch's commits straight onto `master`. Use `--no-track` instead:

  ```sh
  git checkout -b <name> --no-track origin/master   # or: git switch -c <name> --no-track origin/master
  ```

- Publish the branch with `git push -u origin <name>` immediately after the first commit, so it tracks a remote branch of the same name. Leaving a branch unpublished is what makes a stray `git push` land on `master`, and a PR cannot be opened without a remote head ref.
- Before finalizing any branch, verify its upstream. Both checks are mandatory and must not name `master`:

  ```sh
  git config --get branch.<name>.merge   # must be refs/heads/<name>
  git rev-parse --abbrev-ref '@{push}'   # must be origin/<name>
  ```

- Never pass a bare `git push` when the current branch's upstream has not been verified. When in doubt, push explicitly: `git push origin <name>:refs/heads/<name>`.
- A push to `master` triggers the `docker` and `docker-test` jobs in `.github/workflows/main.yml`, which build and publish a Docker image to the registry. An accidental push therefore has effects beyond git history and must be reported to the user, not silently repaired.
- Recovering from an accidental push to `master` (requires explicit user confirmation, since it rewrites a shared branch):

  ```sh
  git push -u origin <name>                      # 1. preserve the commit on its own ref first
  git push --force-with-lease=refs/heads/master:<bad-sha> \
      origin <good-sha>:refs/heads/master        # 2. rewind master
  git ls-remote origin refs/heads/master         # 3. verify against the remote, not local refs
  ```

- Never verify remote state from local refs such as `origin/master`; they are only as fresh as the last fetch. Always confirm with `git ls-remote`.

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
- After any code change, always run the full test suite (`yarn test --watchAll=false`) before finalizing work.
- Treat the full test suite as a hard gate: do not stop after changes until `yarn test --watchAll=false` reports zero failures and zero console output. Snapshot failures caused by legitimate UI changes must be fixed by updating snapshots with `--updateSnapshot` on the affected test files; never update snapshots globally without inspecting the diff first.
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

- Treat fetching all pre-existing GitHub reviews and comments as a hard gate before any review: never start a review without first gathering every existing review (timeline review events) and every comment (inline review comments and general/issue comments) from GitHub for the PR. Include their resolution status (resolved vs unresolved) and whether each is outdated against the current head.
- Treat addressing every finding as a hard gate: resolve all findings surfaced in the review, including pre-existing ones and those raised by automated review bots, at their root cause before finalizing. Do not defer or merely report them. "Addressing" means changing the code, not describing the change and offering to make it — the only exceptions are actions outside the repository (deployment order, another repository's PR) and actions the user has explicitly withheld.
- Treat the remote CI result as a hard gate on every review, on equal footing with gathering the reviews and comments: **never start a review without also fetching every check run and commit status for the PR head**, per the **CI — The Remote Result Is the Gate** section above. The review file must state each check and its conclusion, and every failing check must be raised as a **blocking finding** and fixed at its root cause — a red check is a defect in the PR whether or not the change under review caused it. Never state that "gates pass" on the strength of a local run alone; a local run does not build the merge with `master` and does not prove the CI environment.
- Keep review comments short, specific, and actionable.
- Prioritize correctness, regressions, security, and test coverage in every review.
- Treat an API-call-efficiency audit as a hard gate in every review: always audit the data-fetching paths the change touches against the **API Call Efficiency** section above, and raise a finding for any redundant or inefficient call — N+1 per-id fetching, re-fetching on toggle/tab/re-render, un-debounced search-as-you-type, a second round-trip for data that could be embedded, or an uncancelled superseded request. Resolving every such finding is a blocker for approval.
- All instances of console errors, warnings, or unhandled rejections found in the test output must be noted as findings in the review. They are never acceptable noise — every such instance must be fixed at its root cause. Resolving every such finding is a hard gate: a PR may not be approved while any console-noise finding remains.
- Verify changed behavior locally while running the modified application before finalizing review conclusions.
- Export every detailed review to a `.md` file using the same convention: `TASK-<id>-review.md`.
- Use a consistent review template with these sections: `Summary`, `CI Status`, `Findings`, `Severity`, `Reproduction Steps`, and `Recommendation`. `CI Status` lists every check on the PR head with its conclusion, the head SHA it was measured on, and — for any failure — the failing step, the root cause, and its finding id.
- When asked to check PR reviews, always gather both inline comments and timeline review events (for example `CHANGES_REQUESTED`, `APPROVED`, `COMMENTED`).
- In the review file, explicitly include comment status tracking: unresolved vs resolved comments.
- In the review file, add a mandatory final section named `What Has To Be Done` with a numbered list of concrete required actions.
- In `What Has To Be Done`, include all unresolved review threads, required code changes, required test updates, and re-review/requested-reviewer follow-up.
- If a reviewer requested changes, clearly mark those items as blockers before approval.
- Keep the review file updated as findings change, and remind to remove it before a PR is merged.
