# PR #765 Claude Final Adversarial Review Handoff

Review date: 2026-08-19. Investigation-only. No repository state was modified.

## 1. Executive Summary

- **Final assessment:** The mapper/domain core is genuinely good — defensive, well-layered, wire-compatible with backend #738, and free of type escapes. The blockers are _not_ in the mapper. They are (a) a stale-merge contamination that re-adds a file `master` deleted, and (b) the fact that this PR's single most-advertised value — "prevents future security regressions around SVG, external URLs, downloads, and media binary handling" — exists **only** in `frontend-docs/`, which the author has stated will be deleted before merge. Nothing in the types, guards, validators, tests, or the PR description encodes it.
- **Final verdict:** **NOT READY**
- **Findings by severity:** 2 BLOCKER, 4 HIGH, 8 MEDIUM, 3 LOW. 2 prior findings REFUTED against backend evidence.
- **Merge blockers:** B1 (resurrected `docs/flaky-test-fragment-list-duplicate-key.md`), B2 (security/compatibility contract disappears with the docs).
- **Confidence:** High on the frontend tree and on backend wire compatibility (backend read from GitHub raw at PR #738 head `864e3632`). Medium-low on `yarn tsc` state — I was instructed not to run it.
- **Candidate-tree status:** **Unambiguous.** `HEAD == feature-media-architecture == origin/feature-media-architecture == c1fb4540`. Local worktree dirt (`craco.config.js`, untracked `docs/map-*.md`, `PR_750_*`) is unrelated map-MVP work and is **not** part of the candidate.
- **Branch/master status:** **7 commits behind `origin/master`.** Must be updated before merge; doing so also auto-resolves B1.
- **CI-final-SHA status:** Green and correctly attached to `c1fb4540` (test, CodeQL, GitGuardian, qlty check, qlty coverage 94.2%, diff coverage 100%). Note CI runs **no `tsc`**.
- **PR-goal status:** Substantially met for structure; not met for the security-prevention claim.
- **Architecture-only status:** **TRUE.** Verified independently.
- **Runtime-preservation status:** **TRUE.** One pre-existing production file touched (`fragmentServicePorts.ts`), type-only.
- **Isolation status:** Guard is real, AST-based, and non-vacuous. One realistic future gap (naming/directory-scoped discovery).
- **Backend #738 compatibility:** **COMPATIBLE** on every wire field checked. No incompatibility found.
- **DTO/domain separation:** **Correct.** DTO fields are `unknown`; domain values are constructed only after validation.
- **Mapper trust-boundary status:** Sound except for the critical-shell leak (H4).
- **Summary consistency status:** A contradictory summary (`count > 0`, `types: []`) can escape as a trusted `MediaSummary` through **both** public entry points.
- **Legacy compatibility status:** **Correct, and the two prior findings against it are wrong.** See §31–§34.
- **Repository contract status:** Good. Single request, native `Promise`, no Bluebird, no N+1.
- **Binary-loader/IDOR status:** **Weak.** No fragment context; carries an arbitrary `url`.
- **AbortSignal status:** Present and coherent on both contracts.
- **URL-security status:** **No URL validation of any kind.** Trusted domain `url` is any non-empty trimmed string.
- **MIME/SVG status:** **No frontend distinction** between `original` (may be SVG) and display/thumbnail (raster-guaranteed).
- **N+1/API-efficiency status:** **Good.** `findByFragment` returns the full metadata graph.
- **File-limit status:** **PASS.** Largest changed `.ts` is 224 lines.
- **Type/suppression status:** **Clean.** Zero `any`, `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `istanbul ignore`, `console.*`, `TODO`, `.skip`, `.only`.
- **Documentation-removal status:** **Blocking.** See B2.
- **Scope status:** Clean except the resurrected doc.
- **Ready-to-approve status:** No.

## 2. Repository / Candidate State

| Item                                | Value                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HEAD                                | `c1fb454009e5eec33c97423779e0a605a22d1234`                                                                                                                          |
| Local `feature-media-architecture`  | `c1fb4540` (identical)                                                                                                                                              |
| `origin/feature-media-architecture` | `c1fb4540` (identical)                                                                                                                                              |
| GitHub PR #765 head                 | `c1fb4540` (identical)                                                                                                                                              |
| Local `master`                      | `d9312619` (**stale**)                                                                                                                                              |
| `origin/master`                     | `cccacb0e`                                                                                                                                                          |
| Merge base                          | `e8e51cc3` (`Add new manuscript types (#781)`)                                                                                                                      |
| Ahead / behind                      | 14 ahead, **7 behind**                                                                                                                                              |
| Three-dot diff                      | 27 files, **+2,572 / −1** — matches the supplied record exactly                                                                                                     |
| Two-dot diff                        | 58 files, +2,801 / −573                                                                                                                                             |
| Staged                              | none                                                                                                                                                                |
| Unstaged                            | `craco.config.js` only (maplibre jest moduleNameMapper — unrelated map-MVP work)                                                                                    |
| Untracked                           | `.deepcode/`, `.devcontainer/devcontainer-lock.json`, `PR_750_*.md`, `docs/map-*.md`, `docs/handoffs/`, `docs/review-feature-media-architecture.md` — all unrelated |
| Stash                               | empty                                                                                                                                                               |
| `git diff --check`                  | clean                                                                                                                                                               |

**Candidate rule applied:** local HEAD, remote branch, and GitHub PR head all match. I reviewed committed `c1fb4540`. No remediation is staged or unstaged for this PR, so current GitHub checks _do_ cover the reviewed candidate. The dirty worktree belongs to a different feature and does not obstruct reconstruction — **not** `BLOCKED BY WORKTREE STATE`.

**Two-dot vs three-dot differ materially.** The two-dot diff shows the branch "reverting" sitemaps, the Assurbanipal font, `ChapterViewLine.tsx`, `AlignmentPopover.*`, `WordInfo.*`, realia and router files. **None of these is a real revert** — they are simply the 7 master commits the branch has not yet merged. Three-dot is authoritative and shows a clean 27-file media PR _plus one contaminant_.

## 3. Current Master Compatibility

The branch is behind by: `cccacb0e` (Assurbanipal font #789), `4f048a21` (corpus alignment #788), `716c62a4` (revert #786), `3201afa6` (sitemap #783), `6484f518` (exclude test helpers #785), `516d9b24` (Fix n calls #770), `1f5b31c8` (realia sitemap #762).

No overlap with any file this PR owns, so no semantic conflict is expected. But `6484f518` ("exclude test helpers from production build") is worth a second look on rebase: this PR adds `src/test-support/mediaArchitectureIsolationGuard.ts`, which imports `fs`, `path`, and `typescript` at module scope. If that commit's exclusion mechanism is path- or pattern-based, confirm the new guard file falls inside it — a `typescript`/`fs` import reaching the production bundle would be a real regression. It is only imported by `.test.ts` files today, so this is a verification item, not a finding.

## 4. Current Frontend Rules

Source: `.github/copilot-instructions.md` (the only instruction file; no `CLAUDE.md`/`AGENTS.md`).

| Rule                                                              | Source                                 | Applies here? | Final PR status                                                               |
| ----------------------------------------------------------------- | -------------------------------------- | ------------- | ----------------------------------------------------------------------------- |
| 250-line ceiling per `.ts`/`.tsx`, **including tests**, hard gate | copilot-instructions §Coding Standards | Yes           | **PASS** — max 224                                                            |
| No comments unless requested                                      | §Coding Standards                      | Yes           | **PASS** — zero comments in new code                                          |
| Full alias import paths, never relative                           | §Coding Standards                      | Yes           | **PASS** — all `fragmentarium/...`, `test-support/...`                        |
| DRY as a hard gate                                                | §Coding Standards                      | Yes           | **PARTIAL** — F20/F21 duplication remains                                     |
| Avoid `any`/`unknown` unless very necessary                       | §Coding Standards                      | Yes           | **PASS with justification** — `unknown` is the DTO trust boundary; zero `any` |
| Type annotations on all functions                                 | §Coding Standards                      | Yes           | **PASS**                                                                      |
| `yarn tsc` hard gate                                              | §Commands and Tooling                  | Yes           | **AT RISK** — see M8; CI runs no `tsc`                                        |
| `yarn lint` hard gate                                             | §Commands and Tooling                  | Yes           | Reported green                                                                |
| Full test suite + zero console output, hard gate                  | §Testing and Quality                   | Yes           | Reported green (418 suites / 4083 tests)                                      |
| 100% coverage of affected code                                    | §Testing and Quality                   | Yes           | qlty diff coverage 100.0%                                                     |
| Never remove/skip existing tests without approval                 | §Testing and Quality                   | Yes           | **PASS** — `Photo.test.tsx` only gains an assertion                           |
| Fix **pre-existing** issues at root cause, do not defer           | §Pre-existing Issues                   | Yes           | **Contested** — see M8                                                        |
| Backend schema is source of truth for field names                 | §API Schema Alignment                  | Yes           | **PASS** — see §15                                                            |
| `TASK-<id>-todo.md` / `-log.md` must be removed before merge      | §Task Tracking                         | Yes           | **PASS** — none in the diff                                                   |
| Address every finding from every prior review at root cause       | §Review Guidelines                     | Yes           | **FAIL** — F12–F14 and F17 and F19–F24 all still open                         |

No `qlty.toml`, ESLint config override, or coverage config in the PR diff; nothing PR-specific was relaxed.

## 5. Current Review / CI / Security State

- PR #765, open, base `master`, head `c1fb4540`, `mergeable_state: clean`, author `Fabdulla1`.
- **Review decision: CHANGES_REQUESTED**, and it is **not stale**. `khoidt` submitted `4906202873` on **2026-08-11T12:30:44Z**; the final SHA's checks completed **2026-08-10T11:40Z**. The requested-changes review post-dates the final commit and applies to exactly the code I reviewed.
- Three `CHANGES_REQUESTED` reviews total (2026-07-14, 2026-07-28, 2026-08-11). Automated `COMMENTED` reviews from `qltysh[bot]` and `chatgpt-codex-connector[bot]` (the Codex one reviewed `e2719bb8`, now stale).
- Checks on `c1fb4540`: `test` success, `CodeQL` success, `Analyze (javascript)` success, `GitGuardian` ×3 success, `docker`/`docker-test` skipped. Statuses: `qlty check` success ("No blocking issues"), `qlty coverage` 94.2% (+0.1%), `qlty coverage diff` 100.0%.
- **CodeQL green is not evidence of URL/SVG safety here.** No runtime code consumes these values yet, so there is nothing for CodeQL to taint-track. The risk in H2/H3 is a _contract_ risk that materialises in the next PR — precisely the class of risk static analysis cannot see today.
- **No workflow runs `tsc`**, so M8 cannot be caught by CI.

## 6. Commit-History Audit

| Commit                                                        | Purpose                   | Survives? | In scope?                                                                          | Concern |
| ------------------------------------------------------------- | ------------------------- | --------- | ---------------------------------------------------------------------------------- | ------- |
| `844794ab` docs(media): architecture + scope                  | Yes (as `frontend-docs/`) | Process   | Later relocated `docs/` → `frontend-docs/`; still in tree                          |
| `fb024a22` feat(media): domain + DTO types                    | Yes                       | Yes       | —                                                                                  |
| `7d5ee16d` feat(media): compatibility mapping                 | Yes                       | Yes       | —                                                                                  |
| `f46b1288` feat(media): repository + binary-loading contracts | Yes                       | Yes       | `MediaBinaryRequest.url` introduced here (H1/H2)                                   |
| `f4055e51` docs(media): gallery/security/a11y/rollout         | Yes                       | Process   | The only home of the security policy (B2)                                          |
| `39532c67` test(media): contract coverage                     | Yes                       | Yes       | —                                                                                  |
| `aa159104` fix(media): harden compatibility checks            | Yes                       | Yes       | —                                                                                  |
| `e2719bb8` `fix`                                              | Partly                    | Yes       | Vague message; content is the ImageViewer removal era                              |
| `1564393c` `address comments`                                 | Yes                       | Yes       | Vague message                                                                      |
| `7f61d339` fix: address PR comments                           | Yes                       | Yes       | Vague message                                                                      |
| `501c817a` update docs for myself                             | Yes                       | Process   | —                                                                                  |
| **`e7b25fef` Merge `origin/master`**                          | **Yes — harmfully**       | **No**    | **Merged stale master `4ac457d8`, resurrecting a deleted file. Root cause of B1.** |
| `3944b686` fix: addressed pr comments                         | Yes                       | Yes       | Vague message                                                                      |
| `c1fb4540` fix: address bugs                                  | Yes                       | Yes       | Vague message; final SHA                                                           |

**Merge forensics (B1 root cause).** `docs/flaky-test-fragment-list-duplicate-key.md` was added to master by `4ac457d8` (#771) and **deleted** by `8971a666` (#767). `8971a666` is an ancestor of the merge base `e8e51cc3`, so current master does not have the file. But `e7b25fef`'s second parent is `4ac457d8` — the _pre-deletion_ master — and its first parent `501c817a` did not have the file. I verified commit-by-commit: the file is `ABSENT` at every branch commit up to `501c817a` and `PRESENT` from `e7b25fef` onward. The merge reintroduced a file master had already removed.

Earlier runtime media wiring (ImageViewer, Photo integration) is fully reverted — no trace survives in the final tree. Verified by grep across the whole diff (§21).

## 7. Complete Final File Inventory

All 27 files reviewed in full. No sampling.

| File                                                                  | Layer                      | Responsibility                                                                   | Required? | Runtime effect now?     | Security relevant?                                    | Result                                   |
| --------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- | --------- | ----------------------- | ----------------------------------------------------- | ---------------------------------------- |
| `src/fragmentarium/domain/media.ts`                                   | Domain types               | `MediaType`, `ThumbnailSize`, representations, summary, resource + 2 type guards | Yes       | None                    | **Yes** — `url`/`mimeType` are unconstrained `string` | H2, H3                                   |
| `src/fragmentarium/domain/mediaGallery.ts`                            | Gallery helper             | `sortMedia`, `selectInitialMedia`, `selectMediaById`, `MediaGalleryState`        | Mostly    | None                    | No                                                    | M5 (`MediaGalleryState` dead)            |
| `src/fragmentarium/infrastructure/mediaDtos.ts`                       | Raw DTOs                   | All fields `readonly ... ?: unknown`                                             | Yes       | None                    | Yes (boundary)                                        | **Exemplary**                            |
| `src/fragmentarium/infrastructure/mediaMapperValidation.ts`           | Validators                 | `isRecord`, `normalizeNonEmptyString`, non-negative/positive integer             | Yes       | None                    | Yes                                                   | Pass                                     |
| `src/fragmentarium/infrastructure/mediaRepresentationMapper.ts`       | Representation mapper      | original/display/thumbnails                                                      | Yes       | None                    | **Yes**                                               | H2, H3, M6                               |
| `src/fragmentarium/infrastructure/mediaResourceMapper.ts`             | Resource mapper            | resource + references + response                                                 | Yes       | None                    | Yes                                                   | Pass                                     |
| `src/fragmentarium/infrastructure/mediaSummaryMapper.ts`              | Summary + compatibility    | diagnostics, legacy fallback                                                     | Yes       | None                    | Yes                                                   | **H4**                                   |
| `src/fragmentarium/infrastructure/mediaMapper.ts`                     | Public barrel              | 9 re-exports                                                                     | Yes       | None                    | No                                                    | M6 (`normalizeNonEmptyString` test-only) |
| `src/fragmentarium/application/MediaRepository.ts`                    | Repository contract        | `findByFragment(fragmentNumber, signal?)`                                        | Yes       | None                    | Yes                                                   | Pass                                     |
| `src/fragmentarium/application/MediaBinaryLoader.ts`                  | Binary contract            | `fetch(request, signal?)`                                                        | Yes       | None                    | **Yes**                                               | **H1**                                   |
| `src/fragmentarium/application/fragmentServicePorts.ts`               | Existing port              | `ThumbnailSize` now type-imported + re-exported                                  | Yes       | **None (type-erased)**  | No                                                    | Pass                                     |
| `src/test-support/mediaArchitectureIsolationGuard.ts`                 | Isolation guard            | TS AST reference collector                                                       | Yes       | None (test-only import) | Yes                                                   | M2                                       |
| `src/fragmentarium/infrastructure/mediaArchitectureIsolation.test.ts` | Isolation test             | real tree + mutation fixtures                                                    | Yes       | Test                    | Yes                                                   | M4 (F20)                                 |
| `src/test-support/mediaArchitectureIsolationGuard.test.ts`            | Guard unit test            | primitives + inventory                                                           | Yes       | Test                    | No                                                    | M4 (F21)                                 |
| `src/fragmentarium/infrastructure/mediaMapper.boundary.test.ts`       | Boundary test              | proves backend-only fields dropped                                               | Yes       | Test                    | **Yes — valuable**                                    | **Positive**                             |
| `mediaMapper.summary.test.ts`                                         | Mapper test                | summary edge cases                                                               | Yes       | Test                    | Yes                                                   | Pins H4                                  |
| `mediaMapper.compatibility.test.ts`                                   | Mapper test                | legacy matrix                                                                    | Yes       | Test                    | Yes                                                   | Gaps, §30                                |
| `mediaMapper.representations.test.ts`                                 | Mapper test                | representation edge cases                                                        | Yes       | Test                    | Yes                                                   | Pass                                     |
| `mediaMapper.resources.test.ts`                                       | Mapper test                | resource edge cases                                                              | Yes       | Test                    | No                                                    | Pass                                     |
| `domain/media.test.ts`                                                | Domain test                | type guards                                                                      | Yes       | Test                    | No                                                    | Pass                                     |
| `domain/mediaGallery.test.ts`                                         | Gallery test               | ordering/selection                                                               | Yes       | Test                    | No                                                    | Pass                                     |
| `application/MediaRepository.test.ts`                                 | Contract test              | fake implementation                                                              | Marginal  | Test                    | No                                                    | M3 (F19)                                 |
| `application/MediaBinaryLoader.test.ts`                               | Contract test              | fake implementation                                                              | Marginal  | Test                    | No                                                    | **M3 — tautological**                    |
| `src/fragmentarium/ui/images/Photo.test.tsx`                          | Regression test            | asserts toolbar unchanged                                                        | Yes       | Test                    | No                                                    | **Positive**                             |
| `frontend-docs/01-architecture.md`                                    | Documentation              | layering, scope, SVG note                                                        | Cleanup   | None                    | **Yes**                                               | **B2**, M1                               |
| `frontend-docs/02-data-and-api.md`                                    | Documentation              | DTOs, compat rules, **all security policy**                                      | Cleanup   | None                    | **Yes**                                               | **B2**, M1, M7                           |
| `docs/flaky-test-fragment-list-duplicate-key.md`                      | **Resurrected, unrelated** | #771's test-flake writeup                                                        | **No**    | None                    | No                                                    | **B1**                                   |

## 8. PR Description Claim Audit

The published PR body is three sentences. Most of the "explicit claims" listed in the review brief are **not** in the PR description at all — they live only in `frontend-docs/`. That is itself the substance of B2.

| PR claim                                                                                             | Final code evidence                                                                                                    | Fully true?                      | Caveat                                                                            |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| Preserves current runtime image behavior                                                             | Only `fragmentServicePorts.ts` touched, type-only; `Photo.test.tsx` gains a regression assertion for "Open in New Tab" | **Yes**                          | —                                                                                 |
| No production media fetching or rendering                                                            | Zero runtime imports of media modules; isolation test enforces                                                         | **Yes**                          | —                                                                                 |
| Media architecture structurally isolated                                                             | AST guard + real-tree scan                                                                                             | **Yes**                          | Type-only bridge exists and is deliberate but undocumented outside the doomed doc |
| Normalizes future DTOs defensively                                                                   | Mappers reject non-records, non-integers, blank strings; build fresh objects                                           | **Yes**                          | H4 is the exception                                                               |
| Preserves legacy `hasPhoto`/`thumbnailPath` compatibility                                            | `normalizeCompatibleMediaSummary`                                                                                      | **Yes — and correctly**, see §31 | —                                                                                 |
| Supports original/display/thumbnail                                                                  | `MediaRepresentations`                                                                                                 | **Yes**                          | No safety distinction between them (H3)                                           |
| Aligns with backend media architecture                                                               | Verified field-by-field against #738 `864e3632`                                                                        | **Yes**                          | —                                                                                 |
| AbortSignal-compatible contracts                                                                     | `signal?: AbortSignal` on both                                                                                         | **Yes**                          | —                                                                                 |
| No ImageViewer / premature wiring                                                                    | grep: zero hits outside a test label                                                                                   | **Yes**                          | —                                                                                 |
| **Prevents future security regressions around SVG, external URLs, downloads, media binary handling** | **No allowlist, no URL validation, no original/display safety type, no download policy in code**                       | **NO**                           | **The entire policy is prose in a file slated for deletion. This is B2.**         |

## 9. Architecture Boundary

| Stage            | File/function                                 | Input                            | Output                          | Trust level                    | Concern                                       |
| ---------------- | --------------------------------------------- | -------------------------------- | ------------------------------- | ------------------------------ | --------------------------------------------- |
| Wire             | backend #738 `FragmentMediaResponseDtoSchema` | —                                | JSON                            | Untrusted                      | —                                             |
| DTO boundary     | `mediaDtos.ts`                                | JSON                             | all fields `unknown`            | **Untrusted, correctly typed** | None                                          |
| Record gate      | `isRecord`                                    | `unknown`                        | `Record<string, unknown>`       | Narrowing                      | Pass                                          |
| Field validation | `mediaMapperValidation.ts`                    | `unknown`                        | `string`/`number`/`undefined`   | Narrowing                      | `url` gets only non-empty (H2)                |
| Representation   | `normalizeMediaRepresentation`                | `unknown`                        | `MediaRepresentation`           | **Trusted**                    | `url`/`mimeType` unvalidated beyond non-empty |
| Resource         | `normalizeMediaResource`                      | `unknown`                        | `MediaResource`                 | **Trusted**                    | Pass                                          |
| Response         | `normalizeFragmentMediaResponse`              | `FragmentMediaResponseDto`       | `FragmentMedia`                 | **Trusted**                    | Drops malformed items, never throws           |
| Summary          | `normalizeMediaSummaryWithDiagnostics`        | `unknown`                        | summary + `hasCriticalError`    | Internal                       | Correct                                       |
| Public summary   | `normalizeMediaSummary`                       | `unknown`                        | `MediaSummary \| null`          | **Trusted**                    | **H4 — drops the flag**                       |
| Compatibility    | `normalizeCompatibleMediaSummary`             | `MediaSummaryCompatibilityDto`   | summary + `legacyThumbnailPath` | **Trusted**                    | **H4 — leaks shell when `hasPhoto !== true`** |
| Future repo      | `MediaRepository.findByFragment`              | fragment + signal                | `MediaResource[]`               | Trusted                        | Pass                                          |
| Future loader    | `MediaBinaryLoader.fetch`                     | `{mediaId, url, representation}` | `Blob`                          | —                              | **H1 — no fragment context**                  |

DTO and domain layers are cleanly distinct. Domain values cannot be constructed from raw JSON without passing a mapper — the interfaces are structural, so a caller _could_ hand-write an object literal, but nothing in this PR does and there is no cast path (`as MediaSummary` etc. appears nowhere).

## 10. Runtime Import Audit

| Production consumer                                        | Import                                                                                                 | Runtime or type-only?       | Allowed?                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------ |
| `src/fragmentarium/application/fragmentServicePorts.ts:24` | `import type { ThumbnailSize } from 'fragmentarium/domain/media'` then `export type { ThumbnailSize }` | **Type-only**, fully erased | **Yes** — deliberate, and it fixed the duplicate-definition finding (F2) |

That is the **only** production reference in the entire tree. Verified: no production file calls `MediaRepository`, calls `MediaBinaryLoader`, invokes any media mapper, renders media domain data, fetches a media endpoint, replaces `Photo`/`Images`, or imports the architecture through a barrel at runtime. Architecture-only is **true**.

## 11. Isolation Guard

`src/test-support/mediaArchitectureIsolationGuard.ts` uses `ts.createSourceFile` and walks the AST. Detection:

| Form                                                   | Detected?                                         | Line    |
| ------------------------------------------------------ | ------------------------------------------------- | ------- |
| `import { X } from '...'`                              | Yes                                               | 56      |
| `import '...'` (side-effect; `importClause` undefined) | Yes                                               | 56      |
| `import { type X, valueY } from '...'` (mixed)         | **Yes** — declaration-level `isTypeOnly` is false | 56      |
| `import type { X } from '...'`                         | Correctly **skipped**                             | 56      |
| `export { X } from '...'`                              | Yes                                               | 61–65   |
| `export * from '...'`                                  | Yes                                               | 61–65   |
| `export type { X } from '...'`                         | Correctly **skipped**                             | 63      |
| `import('...')`                                        | Yes                                               | 70–73   |
| `require('...')`                                       | Yes                                               | 74–80   |
| Relative specifiers                                    | Yes — resolved via `path.posix`                   | 98–110  |
| Alias specifiers                                       | Yes                                               | 102–103 |
| Comments / plain string literals                       | Correctly **not** flagged                         | —       |

Realistic misses, in descending order of plausibility:

1. **`import x = require('...')`** (`TSImportEqualsDeclaration`) — the `require` there is a `ts.ExternalModuleReference`, not a `CallExpression`, so it is invisible. Unlikely in this ESM/CRA codebase. **LOW.**
2. **`import(\`fragmentarium/domain/media\`)`** with a template literal — `ts.isStringLiteral` is false for `NoSubstitutionTemplateLiteral`. **LOW.**
3. `jest.requireActual('...')` — `node.expression` is a `PropertyAccessExpression`, not the identifier `require`. Test-only, out of the guard's remit. Not a finding.

None of these is a _natural_ way someone would wire media into production, so I do not treat the guard as defeated. The realistic vectors are all covered.

## 12. Isolation Anti-Vacuity

Verified against every vacuity mode named in the brief:

- **Empty architecture list?** No — `mediaArchitectureModules.length > 0` asserted (`mediaArchitectureIsolation.test.ts:21`) and every entry asserted to exist on disk as `.ts`/`.tsx` (lines 23–31).
- **Empty production list?** No — `expect(sourceFiles.length).toBeGreaterThan(0)` (line 46).
- **Barrels filtered away?** No — line 56–62 independently proves barrel files exist in the tree (`reExportPattern` matches > 0), so the barrel assertion at 64–82 is not scanning an empty set.
- **Collector returns nothing?** No — 13 mutation fixtures (lines 88–141) prove positive and negative detection on the same function the real-tree scan uses.
- **Declared == actual?** Yes — line 34–38 asserts `mediaArchitectureModules` equals `findExpectedMediaArchitectureModules(sourceRoot)`, derived from disk.

Adding a new media module and forgetting to declare it **does** fail the suite — but only if it lands in `fragmentarium/{application,domain,infrastructure}` **and** its basename matches `/^media/i` (`mediaArchitectureIsolationGuard.ts:120–129`). A future `fragmentarium/ui/media/MediaGallery.tsx`, or an `ImageViewerService.ts`, satisfies neither condition: the derived list would not find it, the declared list would not contain it, the equality test would still pass green, and production imports of it would go unflagged. That is **M2** — a real limit on the guard's forward guarantee, not a present defect.

## 13. Documentation-Removal Impact

This is the substance of **B2**. Everything below exists **only** in `frontend-docs/` and nowhere in code, types, tests, or the PR description:

| Contract                                                                                            | Only home today               | Encoded in code?                                                                       | In PR description? |
| --------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| "Never `dangerouslySetInnerHTML`, `<object>`, `<embed>`, raw inline SVG"                            | `02-data-and-api.md:170-173`  | **No**                                                                                 | No                 |
| MIME must be validated against an **allowlist**, never from extension                               | `02-data-and-api.md:172-174`  | **No — no allowlist exists**                                                           | No                 |
| SVG `COPY` with raster preview → show preview only, original download-only, **never new-tab**       | `02-data-and-api.md:182-183`  | **No**                                                                                 | No                 |
| SVG `COPY` without preview → unavailable state, never render                                        | `02-data-and-api.md:184-185`  | **No**                                                                                 | No                 |
| `window.open` must use `noopener,noreferrer`                                                        | `02-data-and-api.md:192`      | **No**                                                                                 | No                 |
| Download extensions from a static MIME allowlist; filenames sanitized                               | `02-data-and-api.md:194-195`  | **No**                                                                                 | No                 |
| Caption/attribution render as plain text, never HTML                                                | `02-data-and-api.md:196`      | **No**                                                                                 | No                 |
| Object URLs revoked; not before opened tab loads                                                    | `02-data-and-api.md:165, 197` | **No**                                                                                 | No                 |
| Tokens never in URLs or DOM attributes                                                              | `02-data-and-api.md:160, 198` | **No**                                                                                 | No                 |
| `legacyThumbnailPath` retirement criteria (6 conditions)                                            | `02-data-and-api.md:100-107`  | **No**                                                                                 | No                 |
| Compatibility rules 1–8 (valid summary wins, critical fallback, `count:0` must not retain primary…) | `02-data-and-api.md:85-98`    | Partially — rules 5, 6, 7 are enforced; **1, 2, 8 are not stated anywhere executable** | No                 |
| Architecture-only boundary and the **type-only import allowance**                                   | `01-architecture.md:31-34`    | Guard enforces it; the _rationale_ is undocumented                                     | No                 |
| `findByFragment` returns all fragment media (no per-ID calls)                                       | `02-data-and-api.md`          | Implied by the return type                                                             | No                 |

Delete `frontend-docs/` as planned and the PR ships a media architecture with **no recorded security policy at all** — while its stated purpose includes preventing exactly those regressions. Note this is not solvable by "the reviewer remembers": the next PR is the one that writes `<img src>` and `window.open`, and it will have nothing to check itself against.

Verified: `docs/flaky-test-fragment-list-duplicate-key.md` is the only master-deleted file the branch resurrects (§44). No `TASK-765-*` or `PR_765_*` files are tracked in the diff.

## 14. Backend #738 Candidate State

`/workspaces/ebl-api` **does not exist** on this machine. I read the backend from the public GitHub API instead, pinned to PR #738 head **`864e363200f641bf569fd99ef2e5243b297261cc`** (open, base `master` `a106548a`, `mergeable_state: clean`, last updated 2026-08-19 — i.e. today, the freshest candidate). Files read at that exact SHA: `media_schemas.py`, `media_dtos.py`, `media_summary_dtos.py`, `media_urls.py`, `media_selection.py`, `media_requests.py`, `domain/media.py`, `domain/representations.py`, `domain/mime.py`, `domain/__init__.py`, plus the `fragment_query_summary_schema.py` patch.

**Limitation:** I compared against the latest committed backend PR head. I could not inspect uncommitted backend remediation, and I did not run the backend test suite. The comparison below is from schema and DTO source, which is the authoritative wire definition.

## 15. Backend ↔ Frontend Wire Matrix

| Contract                                | Backend #738 (`864e3632`)                                                                                                | Frontend #765 (`c1fb4540`)                                | Compatible?                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------- |
| `MediaType`                             | `NameEnumField(MediaType)` → member **names**                                                                            | `['PHOTO','COPY']`                                        | **Yes**                                  |
| `ThumbnailSize`                         | `Enum SMALL="small" / MEDIUM="medium" / LARGE="large"`; dict keys are `size.value`                                       | `['small','medium','large']` **lowercase**                | **Yes**                                  |
| Media ID                                | `str(media.id)`, UUID-based `MediaId`                                                                                    | `id: string` non-empty                                    | **Yes**                                  |
| Fragment media response                 | `{media: [...]}`, `required=True`                                                                                        | `{media?: unknown}` → `[]` if absent/non-array            | **Yes** (frontend more lenient)          |
| Summary response                        | `{mediaSummary, hasPhoto, thumbnailPath}` all `required=True`                                                            | all optional `unknown`                                    | **Yes**                                  |
| `original`                              | `required=True`, nested representation                                                                                   | **required**; whole resource dropped if missing/malformed | **Yes**                                  |
| `display`                               | optional; **omitted when `None`**                                                                                        | optional; omitted when malformed                          | **Yes**                                  |
| `thumbnails`                            | `required=True`, **`preserve_empty_collections={'thumbnails'}` → `{}` is emitted**                                       | `normalizeThumbnailMap({})` → `{}`; missing → `{}`        | **Yes**                                  |
| Empty `thumbnails` behavior             | `{}` preserved, never dropped                                                                                            | `{}` preserved                                            | **Yes**                                  |
| Reference shape                         | `MediaReferenceDto(reference.bibliography_id)` → `{"id": ...}`                                                           | `{id: string}`                                            | **Yes**                                  |
| `sortOrder`                             | `fields.Integer`, `data_key="sortOrder"`, from `association.sort_order` (`non_negative_int`)                             | `normalizeNonNegativeInteger`                             | **Yes**                                  |
| `isPrimary`                             | `fields.Boolean`, `data_key="isPrimary"`                                                                                 | `typeof isPrimary !== 'boolean'` → reject                 | **Yes**                                  |
| `count`                                 | `len(ordered_media)`                                                                                                     | non-negative integer                                      | **Yes**                                  |
| `types`                                 | `tuple(dict.fromkeys(...))` deduped, order-preserving; **`preserve_empty_collections={'types'}` → `[]` emitted**         | filter + `Set` dedup; `[]` preserved                      | **Yes**                                  |
| `primary`                               | omitted when `None` (OmitEmptyMixin)                                                                                     | optional                                                  | **Yes**                                  |
| Primary thumbnail                       | **only** the `SMALL` thumbnail (`_small_thumbnail_for`)                                                                  | any valid representation accepted                         | **Yes** (frontend more lenient)          |
| Primary preference                      | `primary_photo_for` → PHOTO first, then any primary, ordered by `(sort_order, str(id))`                                  | `selectInitialMedia`: primary PHOTO → any primary → first | **Yes — matches**                        |
| `hasPhoto`                              | `MediaType.PHOTO in fragment_types`, computed from the **new** media list                                                | `hasPhoto === true` strict                                | **Yes**                                  |
| `thumbnailPath`                         | `legacy_fragment_thumbnail_url(fragment_id, SMALL)`, **`required=True`, unconditional, derived from museum number only** | preserved unconditionally as `legacyThumbnailPath`        | **Yes — see §31**                        |
| URL shapes                              | relative same-origin: `/fragments/{f}/media/{m}/file`, `/display`, `/thumbnail/{size}`; segments `quote(..., safe="")`   | accepts **any** non-empty string                          | **Wire-compatible, security-loose (H2)** |
| MIME values                             | `image/jpeg`, `image/png`, `image/webp`; `image/svg+xml` **only** as a `COPY` original                                   | any non-empty string                                      | **Wire-compatible, policy-loose (H3)**   |
| Optional-field omission                 | `OmitEmptyMixin` drops `None`, `[]`, `{}` except preserved `types`/`thumbnails`                                          | every optional field handled as absent                    | **Yes**                                  |
| `width`/`height`                        | `required=True`, `positive_int`                                                                                          | optional, `normalizePositiveInteger`                      | **Yes**                                  |
| `file_size`, `checksum`, stored handles | **not in any DTO schema**                                                                                                | not modelled                                              | **Yes**                                  |

**No wire incompatibility found.** Every §68 "post-July backend change" was checked and the frontend already matches: `thumbnails: {}` preserved ✅, canonical `MediaId` as string ✅, `OpenRepresentation` backend-internal (absent from the frontend) ✅, `types: []` ✅, display raster-only ✅, primary PHOTO preference ✅, `references` wire key `id` ✅, URL paths ✅, thumbnail size values lowercase ✅.

## 16. DTO / Trusted Domain Boundary

`mediaDtos.ts` is exemplary: every field is `readonly ...?: unknown`. It promises nothing the backend might omit, and cannot be mistaken for a validated type. Mappers accept `unknown` at every public entry (`normalizeMediaRepresentation(representation: unknown)` etc.), narrow through `isRecord`, then cast to the DTO interface **only** for destructuring — the cast never confers trust because every destructured field is still `unknown` and individually validated. Domain values are constructed field-by-field from validated locals; no raw object is ever spread into a domain value. This is the correct shape and it is worth saying so plainly.

## 17. Record / Primitive Validation

`isRecord` (`mediaMapperValidation.ts:1-3`): `typeof value === 'object' && value !== null && !Array.isArray(value)`.

| Attack                                                   | Result                                                                                  | Correct?                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `null`                                                   | rejected (`!== null`)                                                                   | Yes                                                                                         |
| `[]` / `[{...}]`                                         | rejected (`!Array.isArray`)                                                             | **Yes — arrays are not records**                                                            |
| `'string'`, `42`, `true`                                 | rejected (`typeof`)                                                                     | Yes                                                                                         |
| `() => {}`                                               | rejected (`typeof` is `'function'`)                                                     | Yes                                                                                         |
| `undefined`                                              | rejected                                                                                | Yes                                                                                         |
| `new Date()`                                             | accepted as a record; all fields `undefined` → mapper returns `undefined`               | Yes, degrades safely                                                                        |
| `Object.create(null)`                                    | accepted; property reads work                                                           | Yes                                                                                         |
| Hostile prototype (`{__proto__: ...}` from `JSON.parse`) | inert — `JSON.parse` does not set the prototype, and mappers never spread into a target | Yes                                                                                         |
| Throwing `Proxy`                                         | would throw                                                                             | Not defended — but unreachable from `JSON.parse`, and the brief excludes artificial proxies |

**Prototype pollution: not reachable.** No mapper uses object spread on raw input, `Object.assign` onto a shared target, or computed-key assignment from untrusted keys. `normalizeThumbnailMap` iterates the _closed_ `ThumbnailSizes` constant and indexes the input, never the reverse — so unknown/hostile keys in `thumbnails` are ignored entirely rather than copied.

## 18. Numeric Validation

| Field       | Valid range/type                         | Final validator               | Correct?         |
| ----------- | ---------------------------------------- | ----------------------------- | ---------------- |
| `count`     | integer ≥ 0                              | `normalizeNonNegativeInteger` | **Yes**          |
| `sortOrder` | integer ≥ 0 (backend `non_negative_int`) | `normalizeNonNegativeInteger` | **Yes**          |
| `width`     | integer > 0 (backend `positive_int`)     | `normalizePositiveInteger`    | **Yes**          |
| `height`    | integer > 0 (backend `positive_int`)     | `normalizePositiveInteger`    | **Yes**          |
| `fileSize`  | not on the wire                          | n/a                           | Correctly absent |

Both validators are built on `Number.isInteger`, which rejects `NaN`, `Infinity`, `-Infinity`, fractional values, **numeric strings** (`'5'`), booleans, `null`, `undefined`, and `BigInt` without any coercion. `'0'`, `true`, `[]`, `[5]` all correctly fail. Explicitly tested: `count: -1` and `count: 1.5` both → `null` (`mediaMapper.summary.test.ts:124-125`). No JavaScript coercion anywhere. **Pass.**

One nit: the `(value as number)` casts on lines 17/18 and 23/24 are safe only because `Number.isInteger` short-circuits first — correct, but it is the one place where a reader must reason about evaluation order rather than read a narrowed type.

## 19. String Normalization

`normalizeNonEmptyString`: rejects non-strings, **trims**, rejects the empty result. Whitespace-only → `undefined`. **Correct**, and honestly named — it does exactly what "non-empty string" implies and no more.

- **Trimming and identifiers:** `' media-id '` becomes `'media-id'`. The backend emits `str(media.id)` from a UUID, so trimming can never alter a real ID. Safe in practice.
- **Trimming and URLs:** `' /media/file '` → `'/media/file'` is explicitly tested (`mediaMapper.representations.test.ts:124`). Trimming a URL is the right call — leading/trailing whitespace in an `href` is a classic bypass vector.
- **F7 (misleading wrapper names): RESOLVED.** There is no `normalizeUrl`/`normalizeMediaUrl` claiming validation it does not perform. The doc even records the rule that produced this fix (`02-data-and-api.md:124-127`).
- **F23 (`normalizeThumbnailSize`): CONFIRMED still present.** `mediaRepresentationMapper.ts:92-96` is exactly `isThumbnailSize(value) ? value : undefined`. It has **zero production callers** — `normalizeThumbnailMap` iterates `ThumbnailSizes` directly and never calls it. Its only consumers are the barrel and four test assertions. See M6.
- `MediaType` normalization: `isMediaType` used directly as a `filter` predicate and as a guard — no wrapper, no cast. Correct.

## 20. URL Trust Model

| Field                   | Backend actually emits                              | Frontend type    | Frontend validation |
| ----------------------- | --------------------------------------------------- | ---------------- | ------------------- |
| `original.url`          | `/fragments/{f}/media/{m}/file` (relative, encoded) | `string`         | **non-empty only**  |
| `display.url`           | `/fragments/{f}/media/{m}/display`                  | `string`         | **non-empty only**  |
| `thumbnails[size].url`  | `/fragments/{f}/media/{m}/thumbnail/{size}`         | `string`         | **non-empty only**  |
| `primary.thumbnail.url` | same, SMALL only                                    | `string`         | **non-empty only**  |
| `legacyThumbnailPath`   | `/fragments/{museum_number}/thumbnail/small`        | `string \| null` | **non-empty only**  |

**The intended shape is unambiguous: every media URL is a same-origin relative path.** The backend has no code path that emits an absolute URL, an external host, or a non-`/fragments/` prefix. The frontend does not encode that intent anywhere.

Attack values against `normalizeMediaRepresentation`:

| Value                        | Result                        | Consequence if a future `<img src>`/`href`/`fetch` consumes it  |
| ---------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `javascript:alert(1)`        | **accepted as trusted `url`** | Inert in `img src`; **executes** in an `href` click             |
| `data:text/html,<script>…`   | **accepted**                  | Inert in `img src`; **HTML execution** via `window.open`/`href` |
| `https://evil.example/f.png` | **accepted**                  | Cross-origin request; referrer/credential leak surface          |
| `//evil.example/f.png`       | **accepted**                  | Protocol-relative cross-origin fetch                            |
| `../admin`                   | **accepted**                  | Path traversal relative to the current route                    |
| `/path?x=1#frag`             | **accepted**                  | Query/fragment injection into the media route                   |
| `'   '`                      | rejected (trim → empty)       | —                                                               |
| `''`                         | rejected                      | —                                                               |
| `%ZZ` malformed encoding     | **accepted**                  | Request-shape ambiguity                                         |

Every one of these requires a compromised or misbehaving backend to originate, which is why this is HIGH and not BLOCKER. But the _architecture's_ job — its stated job — is to make the unsafe state hard to reach, and today `MediaRepresentation.url: string` is the maximally permissive choice. See **H2**.

## 21. URL / Navigation Security

Verified absent from the final tree (grep over the full `src` diff): `ImageViewer`, `window.open`, `createObjectURL`, `revokeObjectURL`, `download`, `dangerouslySetInnerHTML`, `<object`, `<embed`, `<iframe`. The only `ImageViewer` string in the diff is a **test label** (`mediaArchitectureIsolation.test.ts:143`, "would have caught the earlier Photo/ImageViewer-style integration") — a regression fixture, not code. The earlier viewer removal is complete and clean.

`Photo.test.tsx` adds `it('Keeps the existing photo action toolbar')` asserting the existing "Open in New Tab" button still renders. That is a genuinely good guard: it pins the current behavior against accidental change by future media work.

**No unsafe runtime behavior is introduced by this PR.** The risk is entirely forward-looking.

## 22. MIME / SVG Security

Backend policy, read from `domain/media.py:_validate_mime_policy` and `domain/mime.py`:

| Role            | PHOTO                             | COPY                          |
| --------------- | --------------------------------- | ----------------------------- |
| `original`      | raster only (`jpeg`/`png`/`webp`) | **raster or `image/svg+xml`** |
| `display`       | raster only                       | raster only                   |
| `thumbnails[*]` | raster only                       | raster only                   |

The backend enforces this at construction and raises `"SVG representations are only valid as COPY originals."` So the guarantee "display and thumbnails are always safe raster" is real and enforced upstream.

The frontend models `original`, `display`, and every thumbnail with **the identical `MediaRepresentation` type**, and `mimeType` is any non-empty string. There is no allowlist, no `isRasterMimeType`, no branded "safe to inline" type, and no `MediaType`-conditional narrowing. Worse, `original` is the **only required** representation (`media.ts:21`) while `display` is optional (`:22`) — so the shortest correct-looking implementation a future UI author writes is `<img src={resource.representations.original.url}>`, which renders an SVG for every SVG `COPY`.

The doc says all the right things about this (§13). The types say none of them. See **H3**.

## 23. Representation Mapping

| Role             | Required?      | Allowed missing?                                                  | Validation                                  | Security concern                                       |
| ---------------- | -------------- | ----------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| `original`       | **Yes**        | No — whole representations object → `undefined`, resource dropped | record + non-empty url + non-empty mimeType | May be SVG for COPY (H3)                               |
| `display`        | No             | Yes — omitted                                                     | same                                        | Backend guarantees raster; frontend does not know that |
| `thumbnails`     | Always present | Never — `{}` when absent                                          | per-size, closed iteration                  | Backend guarantees raster                              |
| `width`/`height` | No             | Yes — omitted                                                     | positive integer                            | None                                                   |

Attack matrix, traced by hand through `mediaRepresentationMapper.ts`:

| Input                                       | Result                                                           | Fails closed?                  |
| ------------------------------------------- | ---------------------------------------------------------------- | ------------------------------ |
| missing `original`                          | `normalizeMediaRepresentations` → `undefined` → resource dropped | **Yes**                        |
| `original` with empty `url`                 | `undefined` → resource dropped                                   | **Yes**                        |
| `original` with missing `mimeType`          | `undefined` → resource dropped                                   | **Yes**                        |
| `display` malformed                         | `display` omitted, `original` + thumbnails kept                  | **Yes — degrades predictably** |
| `thumbnails` non-object (string/array/null) | `{}`                                                             | **Yes**                        |
| unknown thumbnail key (`'x-large'`)         | ignored — loop iterates `ThumbnailSizes` only                    | **Yes**                        |
| duplicate size aliases                      | impossible — object keys are unique, loop is over the closed set | **Yes**                        |
| `width: -1` / `1.5` / `'240'` / `NaN`       | field omitted, representation still valid                        | **Yes**                        |
| `mimeType: 'image/svg+xml'` on a display    | **accepted**                                                     | **No — H3**                    |
| `url: 'javascript:alert(1)'`                | **accepted**                                                     | **No — H2**                    |

Mechanically the mapper is excellent: it fails closed on structure and degrades on optional detail, exactly as it should. Its two gaps are both about _meaning_, not structure.

## 24. Empty Thumbnail Contract

Backend `MediaRepresentationsDtoSchema` sets `preserve_empty_collections = frozenset({"thumbnails"})`, so `thumbnails: {}` survives `OmitEmptyMixin` and **is** emitted. Frontend: `normalizeThumbnailMap({})` returns `{}`; a missing field also returns `{}`; a malformed non-object returns `{}`. `MediaRepresentations.thumbnails` is non-optional. All three inputs converge on `{}` and the field never disappears. **Contract matches exactly. Confirmed by `mediaMapper.boundary.test.ts:32`.** No contradiction between the repositories.

## 25. Resource Mapping

`normalizeMediaResource` requires: record, non-empty `id`, valid `MediaType`, non-negative-integer `sortOrder`, **strict boolean** `isPrimary`, and valid `representations`. Any failure → `undefined`, and `normalizeFragmentMediaResponse` filters it out rather than throwing — so one bad item never destroys the collection. `references` accepts only an array, maps each through `normalizeMediaReference`, and drops invalid entries; a non-array becomes `[]`. `caption`/`attribution` are omitted when blank rather than set to `''`. A non-array `media` field yields `{media: []}`. Correct throughout.

`mediaMapper.boundary.test.ts` proves backend-internal fields (`projects`, `fileName`, `checksum`) are dropped rather than passed through — the right test to have written, and it directly evidences §65.

## 26. Duplicate Media Identity

Duplicate IDs are impossible from backend #738 (`MediaId` is a UUID, one document per media). If they appeared anyway:

- `normalizeFragmentMediaResponse` **retains** both — no dedup, no rejection, no diagnostic.
- `selectMediaById` returns the **first** match by array order (`mediaGallery.ts:38`). Array order is the backend's `(sort_order, str(id))` order, which is deterministic, so selection is stable _in practice_.
- `selectInitialMedia` sorts first, so it is stable regardless of input order.

Two resources sharing one ID with conflicting metadata would silently resolve to whichever the backend serialized first. Given the UUID guarantee upstream, I rate this **LOW**, not HIGH — the brief's "nondeterministic selection" HIGH bar is not met because the ordering is deterministic. Worth one line in a future `MediaRepository` implementation, not a merge blocker.

**F8 (sort-to-find): RESOLVED.** `selectMediaById` uses a bare `find`; no sort. Verified at `mediaGallery.ts:34-39`.

## 27. Canonical Ordering

`sortMedia` (`mediaGallery.ts:7-18`) decorates with the original index, sorts by `sortOrder` then index, and undecorates. Properties:

- **Deterministic:** yes — the index tiebreak makes it a total order.
- **Stable:** yes — explicitly, via the index tiebreak, not relying on engine stability.
- **Non-mutating:** yes — `.map()` copies before `.sort()`. The caller's array is untouched.
- **Locale-independent:** yes — numeric subtraction only, no `localeCompare`.

`selectInitialMedia` calls `sortMedia` first, so gallery ordering and primary selection use the **same** canonical order. Matches backend `fragment_media_in_order`'s primary key (`sort_order`). The backend's secondary key is `str(media.id)` where the frontend's is input index — but since the frontend receives the array already in backend order, the two agree. Fine.

## 28. Summary Mapper

Reconstructed from zero. `normalizeMediaSummaryWithDiagnostics` (`mediaSummaryMapper.ts:60-103`):

1. Non-record → `{null, critical: true}`.
2. `count` not a non-negative integer, **or** `types` not an array → `{null, critical: true}`.
3. Normalize `primary` (drops it entirely if `id` blank or `type` unknown; keeps it without `thumbnail` if the thumbnail is malformed).
4. `types` filtered to known values, deduped via `Set`; if a valid `primary.type` is absent from the list, it is appended.
5. `hasCriticalError = (primary was supplied non-null AND count === 0) OR (count > 0 AND no usable types)`.
6. If `count === 0`, return `{count: 0, types: []}` — deliberately discarding both `types` and `primary`.
7. Otherwise return `{count, types, primary?}`.

The internal function is well-designed. The problem is entirely at the two public boundaries — see §29.

## 29. Diagnostics / Critical Errors

**F17: CONFIRMED, and worse than reported.**

`normalizeMediaSummary` (`:120-124`) computes `hasCriticalError` and then discards it:

```
normalizeMediaSummary({ count: 5, types: ['NOPE'] })  →  { count: 5, types: [] }
```

The caller receives a structurally valid `MediaSummary` asserting five media items with no types and no primary, with no way to detect the corruption. `mediaMapper.summary.test.ts:128` pins this and calls it _"keeps a safe shell"_ — the name asserts a safety property the value does not have.

**New, beyond F17: the leak is not confined to the "plain" entry point.** `normalizeCompatibleMediaSummary` only falls back to legacy when a legacy summary actually exists, i.e. when `hasPhoto === true`. When it does not, `:162-167` returns the critical shell as the trusted `mediaSummary`:

```
normalizeCompatibleMediaSummary({
  mediaSummary: { count: 5, types: ['NOPE'] },
  hasPhoto: false,
  thumbnailPath: '/fragments/K.1/thumbnail/small',
})
→ { mediaSummary: { count: 5, types: [] }, legacyThumbnailPath: '/fragments/K.1/thumbnail/small' }
```

The prior review stated that `normalizeCompatibleMediaSummary` "correctly falls back to legacy in that case". It does so only for `hasPhoto: true`. The `hasPhoto: false` branch has **no test** — `mediaMapper.compatibility.test.ts:140` covers only the `hasPhoto: true` variant, and `:172` covers the benign `count: 0` shell. This is **H4** and it is a materially larger hole than F17 as filed.

Critical-error classification itself, assessed against §30:

| Condition                                    | Critical?                            | Right call?                            |
| -------------------------------------------- | ------------------------------------ | -------------------------------------- |
| positive `count`, no usable type             | **Yes**                              | **Yes** — self-contradictory           |
| `count: 0` with any supplied `primary`       | **Yes**                              | **Yes** — matches doc rule 7           |
| `primary` with unknown type                  | No — primary dropped, summary kept   | **Yes** — harmless degradation         |
| `primary.type` not listed in `types`         | No — type appended                   | **Yes** — reconciles rather than fails |
| malformed `primary.thumbnail` only           | No — thumbnail dropped, primary kept | **Yes**                                |
| unknown extra fields                         | No — ignored                         | **Yes**                                |
| missing optional `primary`                   | No                                   | **Yes**                                |
| non-record / bad `count` / non-array `types` | Yes, and summary is `null`           | **Yes**                                |

The taxonomy is genuinely well-judged: nothing harmless is fatal, nothing contradictory is silently blessed — _inside_ the diagnostics function. Only the public wrappers break it.

## 30. Summary Scenario Matrix

| Raw input                                                                        | Normalized output                              | Critical? | Correct?                                            |
| -------------------------------------------------------------------------------- | ---------------------------------------------- | --------- | --------------------------------------------------- |
| `{count: 0, types: []}`                                                          | `{count: 0, types: []}`                        | No        | Yes                                                 |
| `{count: 0, types: ['PHOTO']}`                                                   | `{count: 0, types: []}`                        | No        | Yes — count is authoritative                        |
| `{count: 0, types: [], primary: {...valid}}`                                     | `{count: 0, types: []}`                        | **Yes**   | Yes — doc rule 7                                    |
| `{count: 0, types: [], primary: {}}`                                             | `{count: 0, types: []}`                        | **Yes**   | Yes — conservative                                  |
| `{count: 3, types: []}`                                                          | `{count: 3, types: []}`                        | **Yes**   | **Escapes as trusted — H4**                         |
| `{count: 3, types: ['NOPE','BAD']}`                                              | `{count: 3, types: []}`                        | **Yes**   | **Escapes as trusted — H4**                         |
| `{count: 3, types: ['PHOTO']}`                                                   | `{count: 3, types: ['PHOTO']}`                 | No        | Yes                                                 |
| `{count: 1, types: ['COPY'], primary: {id, type:'PHOTO'}}`                       | `{count: 1, types: ['COPY','PHOTO'], primary}` | No        | Yes — reconciled, not rejected                      |
| `{count: 1, types: ['PHOTO'], primary: {id, type:'PHOTO', thumbnail: {url:''}}}` | primary kept, thumbnail dropped                | No        | Yes (tested `:100-117`)                             |
| `{count: -1, ...}`                                                               | `null`                                         | Yes       | Yes (tested)                                        |
| `{count: 1.5, ...}`                                                              | `null`                                         | Yes       | Yes (tested)                                        |
| `{count: 1, types: ['PHOTO','PHOTO']}`                                           | `{count: 1, types: ['PHOTO']}`                 | No        | Yes — deduped                                       |
| `{count: 2, types: ['PHOTO','NOPE']}`                                            | `{count: 2, types: ['PHOTO']}`                 | No        | Yes                                                 |
| `{count: 1, types: ['PHOTO'], primary: 'x'}`                                     | `{count: 1, types: ['PHOTO']}`                 | No        | Yes — malformed primary discarded, summary survives |
| `[]` / `null` / `'x'` / `42`                                                     | `null`                                         | Yes       | Yes (tested `:120-126`)                             |

**F9 (redundant cast): RESOLVED.** `normalizeMediaTypes` uses `values.filter(isMediaType)` — a real type-guard predicate. No `as MediaType` anywhere in the file. `types` order is input-order-preserving with the primary type appended; deterministic for a given input, which is what the contract needs.

## 31. Legacy Backend Semantics

**This section corrects the prior review.** I derived the semantics from source rather than assumption, as the brief requires.

Backend, **current master** (`fragment_query_summary_schema.py`, pre- and post-#738 — the patch is a pure refactor):

```python
thumbnail_path = fields.Function(
    lambda summary: legacy_fragment_thumbnail_url(summary.museum_number, ThumbnailSize.SMALL),
    dump_only=True, data_key="thumbnailPath")
```

Backend, **#738** (`media_summary_dtos.py:FragmentMediaSummaryDto.of`):

```python
has_photo=has_photo(fragment_id, media),
thumbnail_path=legacy_fragment_thumbnail_url(fragment_id, ThumbnailSize.SMALL),
```

Both are `required=True` in the schema. Therefore, definitively:

1. **`thumbnailPath` is emitted unconditionally.** It is a pure function of the museum number. It is **never** conditioned on `hasPhoto`, and it is **not** proof that any file exists. It is a **route hint**.
2. **`hasPhoto` is independent.** On master it comes from the legacy photo flag; in #738 it is `MediaType.PHOTO in fragment_types`, derived from the **new** media list.

Frontend, **current master** (`FragmentariumSearchResultComponents.tsx:59-82`) — the established, shipped policy:

```tsx
const [isBroken, setIsBroken] = React.useState(false)
if (!thumbnailPath || isBroken) return <></>
return <Image src={thumbnailPath} onError={() => setIsBroken(true)} … />
```

The production UI renders `thumbnailPath` **optimistically, without consulting `hasPhoto`**, and hides the element on 404 via `onError`. That is the existing contract, and it works.

## 32. Compatibility Scenario Matrix

| `mediaSummary`                          | `hasPhoto`        | `thumbnailPath` | Frontend result                                          | Correct?                                      |
| --------------------------------------- | ----------------- | --------------- | -------------------------------------------------------- | --------------------------------------------- |
| absent                                  | `true`            | `/legacy`       | `{summary: {count:1,types:['PHOTO']}, legacy:'/legacy'}` | Yes                                           |
| absent                                  | `false`           | `/legacy`       | `{summary: null, legacy:'/legacy'}`                      | **Yes — see §34**                             |
| absent                                  | `true`            | absent          | `{summary: {count:1,types:['PHOTO']}, legacy:null}`      | Yes                                           |
| absent                                  | `'true'` (string) | `/legacy`       | `{summary: null, legacy:'/legacy'}`                      | Yes — strict `=== true` (tested `:159`)       |
| `{count:0,types:[]}`                    | `true`            | `/legacy`       | `{summary:{count:0,types:[]}, legacy:'/legacy'}`         | **Yes — see §33**                             |
| `{count:0,types:[]}`                    | `false`           | `/legacy`       | `{summary:{count:0,types:[]}, legacy:'/legacy'}`         | Yes                                           |
| valid, primary **with** SMALL thumbnail | `true`            | `/legacy`       | `{summary, legacy:null}`                                 | **Yes** — new thumbnail wins (tested `:7-44`) |
| valid, primary **without** thumbnail    | `true`            | `/legacy`       | `{summary, legacy:'/legacy'}`                            | Yes — legacy fills the gap (tested `:58-83`)  |
| valid `count:1 types:['PHOTO']`         | `false`           | `/legacy`       | `{summary, legacy:'/legacy'}`                            | Yes — §34                                     |
| malformed (`count:-1`)                  | `true`            | `/legacy`       | `{summary:{count:1,types:['PHOTO']}, legacy:'/legacy'}`  | Yes (tested `:121`)                           |
| malformed                               | `false`           | `/legacy`       | `{summary:null, legacy:'/legacy'}`                       | Yes                                           |
| critical `{count:1,types:['BAD']}`      | `true`            | `/legacy`       | legacy summary wins                                      | Yes (tested `:140`)                           |
| **critical `{count:5,types:['NOPE']}`** | **`false`**       | `/legacy`       | **`{summary:{count:5,types:[]}, legacy:'/legacy'}`**     | **NO — H4, untested**                         |
| critical `{count:0,…,primary}`          | `false`           | absent          | `{summary:{count:0,types:[]}, legacy:null}`              | Benign (tested `:172`)                        |

The matrix is coherent in every row but one. The single defect is H4.

## 33. `count: 0` Analysis — F15 DOWNGRADED

Confirmed behavior (`mediaSummaryMapper.ts:148-159`): a valid `count: 0` summary passes the non-critical branch, `hasPrimaryThumbnail` is false, so `legacyThumbnailPath` is passed through.

The prior review called this a bug and proposed returning `null` when `count === 0`. **I disagree, and I think the proposed fix is actively harmful.**

Interpretation B in the brief is the one the code and the rollout support. Under #738, `has_photo` is computed **from the new media list**, so for a fragment that has not yet been backfilled the response is `{count: 0, types: [], hasPhoto: false, thumbnailPath: '/fragments/X/thumbnail/small'}` — while a **legacy photo file still exists** and the legacy route still serves it. Suppressing `legacyThumbnailPath` on `count: 0` would blank the search-result thumbnail for **every un-migrated fragment** for the entire duration of the backfill. That is a visible regression traded for a theoretical tidiness gain.

The existing UI already handles the genuinely-empty case correctly and for free: it requests the legacy route, gets a 404, and hides the image via `onError`. The cost is one speculative request per un-migrated fragment — worth a note under the API-efficiency rule, not a behavior change.

**Reclassified: LOW (documentation/intent), not a defect.** What _is_ missing is any executable statement of this intent — see B2 and L1.

## 34. `hasPhoto: false` Analysis — F16 REFUTED

Confirmed behavior (`:126-134`): `normalizeLegacyMediaSummary` computes `legacyThumbnailPath` independently of `hasPhoto`, so `normalizeLegacyMediaSummary(false, '/legacy')` → `{mediaSummary: null, legacyThumbnailPath: '/legacy'}`, and the test at `mediaMapper.compatibility.test.ts:105-112` locks it in.

The prior review asserted: _"In the legacy backend shape `thumbnailPath` only means anything when `hasPhoto` is true."_ **That is factually incorrect.** Per §31, the backend emits `thumbnailPath` from the museum number alone, unconditionally, `required=True`, on both current master and #738. There is no branch anywhere in the backend that ties it to `hasPhoto`.

Answering the brief's three questions directly:

- **Route hint or proof of existence?** Route hint. Purely derived from the museum number.
- **Can preserving it cause a broken image request?** Yes — a 404 — which the existing UI already absorbs via `onError` → render nothing. Same as today, no regression.
- **Does dropping it lose compatibility data?** Yes. Gating on `hasPhoto === true` would make the new mapper **stricter than the shipped UI**, and would blank thumbnails wherever the legacy photo exists but the new `hasPhoto` (computed from an un-backfilled media collection) says false.

**F16 is refuted. The current behavior is correct and should not be changed.** The one legitimate residue of the finding is that its correctness is invisible: the test name _"keeps thumbnail paths for legacy no-photo input"_ states the behavior without the reason, and the reason lives in a doc that is being deleted. See **L1**.

## 35. Repository Contract

| Method           | Input                    | Output                              | Cancellation           | Security context             |
| ---------------- | ------------------------ | ----------------------------------- | ---------------------- | ---------------------------- |
| `findByFragment` | `fragmentNumber: string` | `Promise<readonly MediaResource[]>` | `signal?: AbortSignal` | Fragment scope **mandatory** |

- Fragment context is a required positional parameter — cannot be omitted. **Good.**
- Returns the complete, already-normalized media list in one call. **No N+1.**
- Returns **native** `Promise`, not Bluebird. No `.cancel()` expectation. Compatible with the Bluebird-removal direction of #774.
- Returns trusted domain objects, not raw DTOs — implementations own the mapping.
- Implementations _may_ ignore `signal` (it is optional and unenforceable in an interface). That is inherent to TypeScript interfaces and acceptable for a deferred contract.
- Error/abort behavior is unspecified. Acceptable at this stage; worth one line whenever the first implementation lands.

This contract is the strongest part of the PR.

## 36. Binary Loader / IDOR

| Field/method                                               | Meaning                           | Security property                      |
| ---------------------------------------------------------- | --------------------------------- | -------------------------------------- |
| `mediaId: string`                                          | which media                       | Identity, **but unscoped**             |
| `url: string`                                              | **backend-supplied URL to fetch** | **Capability-by-possession**           |
| `representation: 'original' \| 'display' \| ThumbnailSize` | which rendition                   | Closed union — **good**                |
| `fetch(request, signal?)`                                  | → `Promise<Blob>`                 | Native promise, cancellable — **good** |
| _(missing)_ `fragmentNumber`                               | —                                 | **Absent — H1**                        |

The backend's route model is fragment-scoped throughout: `/fragments/{fragment}/media/{media}/file`, `/display`, `/thumbnail/{size}`. Authorization is expected to hang off the fragment. The frontend request object collapses `fragment + media + role` down to `media + url + role`, so **the only thing carrying fragment authorization context is the opaque `url` string**.

Consequences a future implementer inherits:

- The natural implementation is `fetch(request.url, {signal})`. Whatever `url` says, goes. If `url` is ever wrong, external, or attacker-influenced (H2), the loader follows it.
- A caller can pair `mediaId` from fragment A with a `url` for fragment B; nothing in the type system objects, and the fetch silently follows the URL.
- Conversely, a loader that wanted to _construct_ the URL safely from identity **cannot** — it has no `fragmentNumber` to build the path from. The type actively forces URL-passing.
- Possession of the URL becomes the capability. §66's requirement — "must not treat possession of the URL as authorization" — is not merely unmet; the contract's shape makes the opposite the path of least resistance.

The `representation` union is well-designed and worth keeping. The fix is to add `fragmentNumber` and drop (or explicitly demote) `url`. See **H1**.

**Blob MIME and object-URL ownership** are unspecified: the contract returns a `Blob` and says nothing about who revokes an object URL created from it, or whether `Blob.type` may be trusted. The docs cover both — and the docs are being deleted (B2).

## 37. AbortSignal / Cancellation

**F1: RESOLVED.** Both contracts carry it:

- `MediaRepository.findByFragment(fragmentNumber: string, signal?: AbortSignal)`
- `MediaBinaryLoader.fetch(request: MediaBinaryRequest, signal?: AbortSignal)`

Positional trailing-optional placement, consistent across both — matches the `fetch` idiom and is trivially forwardable. No other async media contract exists. No Bluebird import, no Bluebird return type, no `.cancel()`, no swallowed-`AbortError` clause. Native `Promise` on both, so nothing here obstructs PR #774's Bluebird removal.

A component can therefore abort in-flight metadata and binary requests on unmount, which is what §67 requires. The `MediaBinaryLoader` signal test (`:20-38`) does verify the parameter is threaded through, even if the assertion is on a fake (M3).

## 38. ThumbnailSize Source of Truth

**F2: RESOLVED.** Exactly one production definition:

- `src/fragmentarium/domain/media.ts:5-7` — `ThumbnailSizes` const + derived `ThumbnailSize` type.

Every other site imports or re-exports it: `fragmentServicePorts.ts:24` (`import type` + `export type`), `mediaDtos.ts:1`, `mediaRepresentationMapper.ts:4-6`, `MediaBinaryLoader.ts:1`. The previous duplicate literal union in `fragmentServicePorts.ts` is gone. Grepped the whole tree — no second declaration exists. This is a genuine single-source design, not a drift-watching test.

## 39. Future URL Builders

**The frontend contains no media URL builder at all.** Grep confirms no `/fragments/` template construction in any media module. All URLs arrive pre-built from the backend DTO.

Consequences: no risk of a frontend builder drifting from the DTO mapper (the §44 concern does not apply), no double-encoding risk, no client-side path construction. The trade-off is total trust in backend-supplied URL strings, which is H2. Because the frontend never builds a route, adding `fragmentNumber` to `MediaBinaryRequest` (H1) would let a future loader _construct_ the path from identity — turning the absence of a builder from a liability into a strength.

## 40. Museum-Number Route Caveat

Backend `media_urls.py` is internally inconsistent:

- New media routes use `_path_segment(value) = quote(str(value), safe="")`, so a museum number containing `/` becomes `%2F`.
- `legacy_fragment_thumbnail_url` uses a **raw f-string**: `f"/fragments/{fragment_id}/thumbnail/{size.value}"` — **no encoding**, so `/` stays a real path separator.

Whether `%2F` survives WSGI/Falcon path decoding is a backend routing question, and the legacy route already ships today in exactly this unencoded form, so existing behavior is unchanged either way.

**Frontend impact: none.** #765 builds no URLs and passes both shapes through as opaque strings. Classified **informational** — worth one sentence to the backend author on #738, not a frontend finding, and explicitly not something to "fix" here.

## 41. Selection / Gallery Helpers

| Check                                                        | Result                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| Primary PHOTO preference matches backend `primary_media_for` | **Yes** — PHOTO-primary, then any primary, then first         |
| Fallback order deterministic                                 | Yes — `sortMedia` first                                       |
| Full sort to find a unique ID                                | **No** — `selectMediaById` uses bare `find` (F8 resolved)     |
| Mutation of caller array                                     | **No** — `.map()` before `.sort()`                            |
| Duplicate IDs                                                | First match; deterministic but silent (§26)                   |
| Empty list                                                   | `selectInitialMedia([])` → `orderedMedia[0] ?? null` → `null` |
| Media not in list cannot be selected                         | Correct — `selectMediaById` returns `null`                    |

`MediaGalleryState` (`mediaGallery.ts:3-5`) is a one-field interface with **zero** references anywhere in `src` — not imported, not tested, not re-exported. Unlike the repository and loader interfaces (which pin a wire/authorization contract that the next PR must honour), a `{selectedMediaId: string | null}` shape constrains nothing and will be written by whoever builds the gallery. **F22 confirmed: M5.**

## 42. API Efficiency / N+1

The architecture is efficiently shaped:

- `findByFragment(fragmentNumber)` → **one** request → the entire `MediaResource[]` with all representations, including every thumbnail URL and the display URL.
- No `findById`, no `findRepresentation`, no per-size method — the type surface makes per-item metadata fetching impossible to express.
- Backend `FragmentMediaResponseDtoSchema` matches: one response, complete graph.
- Binary content is fetched on demand via `MediaBinaryLoader`, which is correct — binaries _should_ be lazy.
- The summary path (`mediaSummary` embedded in the existing fragment query response) needs **zero** extra requests for list views, since `primary.thumbnail` arrives inline.

**No N+1 is possible, and the contract communicates that without documentation** — `Promise<readonly MediaResource[]>` is self-evidently the whole set. §49 is satisfied by the types alone; this is one contract that survives the doc deletion intact.

## 43. Current Runtime Preservation

Diffed the branch against `origin/master` for every current image path:

| Area                                                                      | Change                                                                                                                  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Photo.tsx`, `Images.tsx`, image tabs                                     | **None**                                                                                                                |
| `FragmentService.ts` (incl. `findThumbnail`, `hasPhoto` branch at `:122`) | **None**                                                                                                                |
| `fragmentQueryMapping.ts` (`thumbnailPath` mapping at `:159`)             | **None**                                                                                                                |
| `FragmentariumSearchResultComponents.tsx` (thumbnail rendering)           | **None**                                                                                                                |
| Folio behavior                                                            | **None**                                                                                                                |
| Routes                                                                    | **None** — no route registered                                                                                          |
| Request timing / count                                                    | **None** — zero new API calls                                                                                           |
| `fragmentServicePorts.ts`                                                 | `ThumbnailSize` local union → `import type` + `export type` re-export. **Type-erased; zero emitted JavaScript change.** |
| `Photo.test.tsx`                                                          | **+7 lines, test only** — asserts the "Open in New Tab" toolbar still renders                                           |

The only production file touched compiles to identical output. **Runtime preservation claim: verified true.**

## 44. Master Merge Contamination

| File                                             | Master state              | Branch state            | In scope?   |
| ------------------------------------------------ | ------------------------- | ----------------------- | ----------- |
| `docs/flaky-test-fragment-list-duplicate-key.md` | **Deleted** in `8971a666` | **Present** (129 lines) | **NO — B1** |

I audited the full three-dot `name-status` output for every other file: the remaining 26 entries are `A` for media modules/tests/docs plus `M` for `fragmentServicePorts.ts` and `Photo.test.tsx`. **No other master-deleted file is resurrected and no master content is reverted.** The two-dot "deletions" (`AlignmentPopover.*`, `toolsRoutes.entities.test.tsx`, `sitemap9.xml.gz`) are all _behind-ness_, not reverts — they are master commits the branch has not merged, and merging current master resolves them.

**F12 confirmed as the single contamination. It is a blocker, and merging current `origin/master` fixes it automatically** (the branch is 7 behind; `8971a666` is already an ancestor of the merge base, so a fresh merge will re-delete the file).

## 45. Mapper Module Architecture

The 377-line monolith is now four cohesive modules:

| Module                         | Lines | Depends on                               |
| ------------------------------ | ----- | ---------------------------------------- |
| `mediaMapperValidation.ts`     | 26    | nothing                                  |
| `mediaRepresentationMapper.ts` | 96    | domain, dtos, validation                 |
| `mediaResourceMapper.ts`       | 97    | domain, dtos, representation, validation |
| `mediaSummaryMapper.ts`        | 168   | domain, dtos, representation, validation |
| `mediaMapper.ts` (barrel)      | 17    | the three mappers                        |

- **Circular imports:** none. The graph is a strict DAG: `validation → representation → {resource, summary} → barrel`.
- **Single source of truth per validator:** yes. `isRecord`, `normalizeNonEmptyString`, and both integer validators live only in `mediaMapperValidation.ts` and are imported everywhere else. No duplicated validation logic — **F24's DRY concern is met at the validator level.**
- **Cohesion:** each module owns one layer of the DTO tree. Sensible split, and each file is comfortably under the ceiling.
- **Internal diagnostics leaking:** `normalizeMediaSummaryWithDiagnostics`, `normalizeMediaTypes`, `normalizeMediaSummaryPrimaryInternal`, `createLegacyPhotoSummary`, `hasPrimaryThumbnail`, `normalizeLegacyThumbnailPath`, and `normalizeThumbnailMap` are all correctly module-private. Good discipline — the problem in H4 is that the _right_ function is private and the _lossy_ one is public.

## 46. Public Mapper Exports

| Export                                       | Production consumer | Intended public API?                               | Test-only?       |
| -------------------------------------------- | ------------------- | -------------------------------------------------- | ---------------- |
| `NormalizedMediaSummaryCompatibility` (type) | none yet            | Yes                                                | No               |
| `normalizeCompatibleMediaSummary`            | none yet            | **Yes** — the primary entry point                  | No               |
| `normalizeLegacyMediaSummary`                | none yet            | Yes                                                | No               |
| `normalizeMediaSummary`                      | none yet            | **Should be reconsidered**                         | No — but see H4  |
| `normalizeMediaRepresentation`               | none yet            | Yes                                                | No               |
| `normalizeMediaRepresentations`              | none yet            | Yes                                                | No               |
| `normalizeThumbnailSize`                     | **none**            | **No**                                             | **Yes — F23/M6** |
| `normalizeFragmentMediaResponse`             | none yet            | **Yes** — the main response entry point            | No               |
| `normalizeMediaReference`                    | none yet            | Yes                                                | No               |
| `normalizeMediaResource`                     | none yet            | Yes                                                | No               |
| `normalizeNonEmptyString`                    | **none**            | **No** — a generic string helper, not a mapper API | **Yes — F24/M6** |

Nine of eleven exports describe a real supported surface. Two exist for test convenience; both tests could import from `mediaRepresentationMapper` / `mediaMapperValidation` directly.

## 47. Interface Tests

**F19 confirmed, and `MediaBinaryLoader.test.ts` is worse than "weak" — it is tautological.**

- `:40-48` — constructs `request` with `representation: 'display'`, then asserts `request.representation === 'display'` two lines later. This asserts a property of the JavaScript assignment operator.
- `:6-18` — defines `fetch: async ({url}) => new Blob([url], …)`, then asserts the result `toBeInstanceOf(Blob)`. Asserts that `new Blob()` produces a `Blob`.
- `:50-64` — asserts the fake receives `undefined` when nothing is passed.
- `:20-38` — the only one with content: verifies the signal argument is threaded to the implementation. Still only proves the fake forwards its own parameter, but at least the _shape_ under test (two-arg `fetch`) is the contract.

These violate §58: the expected value is produced by the code under test. The genuine value here is compile-time — these files fail to compile if the interfaces change shape — but that value comes from the files existing at all, not from the runtime assertions inside them. A single type-level fixture per module would carry the same weight in ~5 lines. Since the repo instructions disfavour suppressions, I am **not** recommending `@ts-expect-error`; a `const _check: MediaBinaryLoader = …` assignment fixture is sufficient. And per the repo's own rule, deleting these needs the author's agreement — this is a recommendation, not a demand. **M3.**

## 48. Mapper Test Architecture

Static edge-case matrix against the four mapper test files (682 lines total):

| Area                                                                                                                                                                                  | Covered    | Gap                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| Representation: valid original/display, empty thumbnails, multiple sizes, unknown size, malformed dimensions, malformed URL, malformed MIME, array-instead-of-record                  | **Yes**    | —                                                                                                           |
| Resource: valid, missing ID, unknown type, negative/fractional `sortOrder`, no display, no thumbnails, non-boolean `isPrimary`, backend-only field stripping                          | **Yes**    | **duplicate-ID handling untested**                                                                          |
| Summary: count 0 variants, positive count, unknown types, dedup, primary reconciliation, malformed primary, malformed thumbnail, `null`/string/array input, negative/fractional count | **Yes**    | —                                                                                                           |
| Compatibility: legacy true/false × path/no-path, valid summary with/without primary thumbnail, malformed fallback, critical fallback (`hasPhoto: true`), non-boolean `hasPhoto`       | **Mostly** | **`count: 0` + `hasPhoto: true` + path (§33) untested; critical summary + `hasPhoto: false` (H4) untested** |
| Selection: primary PHOTO, primary COPY, no primary, empty                                                                                                                             | **Yes**    | duplicate IDs untested                                                                                      |
| Isolation: 8 positive + 5 negative import forms                                                                                                                                       | **Yes**    | —                                                                                                           |

**Test independence: clean.** Every expectation in the mapper suites is a hand-written object literal. I found no `expected = normalize(...)` pattern anywhere. The tautology problem is confined to the two interface contract tests (§47).

qlty reports 100% diff coverage. As the brief anticipates, that is line coverage, not semantic coverage: the H4 path is _executed_ by the `hasPhoto: true` test at `:140` while the dangerous `hasPhoto: false` branch of the same behavior goes unasserted. Coverage is green and the bug is real.

## 49. Isolation Test Architecture

- `mediaArchitectureIsolation.test.ts` (160 lines): inventory sanity, derived-equals-declared, real-tree production scan, barrel non-vacuity proof, barrel scan, 13 mutation fixtures, one historical-regression fixture. Strong.
- `mediaArchitectureIsolationGuard.test.ts` (145 lines): unit tests for `collectModuleReferences`, `toModulePath`, `resolveModuleSpecifier`, `isMediaArchitectureModule`, `findExpectedMediaArchitectureModules`.

**F20 confirmed.** `mediaArchitectureIsolation.test.ts:64-82` filters production files to barrels and asserts no `reexport` references. The test at `:42-54` already asserts `findMediaArchitectureReferences(...) === []` for **every** production file across **all four** reference kinds — which strictly includes those barrels and those re-exports. The second test cannot fail unless the first already has. Under the DRY hard gate, redundant. (Note: the _third_ test at `:56-62`, which proves barrels exist at all, is **not** redundant — it is the anti-vacuity proof and must stay.)

**F21 confirmed.** `mediaArchitectureIsolationGuard.test.ts:92-108` hardcodes all ten module paths as the expected output of `findExpectedMediaArchitectureModules`, while `mediaArchitectureIsolation.test.ts:34-38` asserts the declared list equals that same function's output. Adding a media module means editing the list in `mediaArchitectureIsolationGuard.ts:5-16` **and** the copy in the test. Two inventories, one truth. Under the DRY hard gate, this is the more meaningful of the two.

## 50. File-Length Audit

Ceiling: 250 lines, hard gate, tests included. Markdown excluded (repo rule scopes the gate to `.ts`/`.tsx`).

| File                                                                   | Lines | Pass? |
| ---------------------------------------------------------------------- | ----- | ----- |
| `src/fragmentarium/infrastructure/mediaMapper.resources.test.ts`       | 224   | Yes   |
| `src/fragmentarium/infrastructure/mediaMapper.compatibility.test.ts`   | 187   | Yes   |
| `src/test-support/mediaArchitectureIsolationGuard.ts`                  | 180   | Yes   |
| `src/fragmentarium/infrastructure/mediaSummaryMapper.ts`               | 168   | Yes   |
| `src/fragmentarium/infrastructure/mediaArchitectureIsolation.test.ts`  | 160   | Yes   |
| `src/fragmentarium/domain/mediaGallery.test.ts`                        | 156   | Yes   |
| `src/test-support/mediaArchitectureIsolationGuard.test.ts`             | 145   | Yes   |
| `src/fragmentarium/infrastructure/mediaMapper.summary.test.ts`         | 139   | Yes   |
| `src/fragmentarium/application/fragmentServicePorts.ts`                | 133   | Yes   |
| `src/fragmentarium/infrastructure/mediaMapper.representations.test.ts` | 132   | Yes   |
| `src/fragmentarium/infrastructure/mediaResourceMapper.ts`              | 97    | Yes   |
| `src/fragmentarium/infrastructure/mediaRepresentationMapper.ts`        | 96    | Yes   |
| `src/fragmentarium/domain/media.ts`                                    | 67    | Yes   |
| `src/fragmentarium/application/MediaRepository.test.ts`                | 67    | Yes   |
| `src/fragmentarium/application/MediaBinaryLoader.test.ts`              | 65    | Yes   |
| `src/fragmentarium/infrastructure/mediaDtos.ts`                        | 55    | Yes   |
| `src/fragmentarium/ui/images/Photo.test.tsx`                           | 50    | Yes   |
| `src/fragmentarium/infrastructure/mediaMapper.boundary.test.ts`        | 39    | Yes   |
| `src/fragmentarium/domain/mediaGallery.ts`                             | 39    | Yes   |
| `src/fragmentarium/domain/media.test.ts`                               | 28    | Yes   |
| `src/fragmentarium/infrastructure/mediaMapperValidation.ts`            | 26    | Yes   |
| `src/fragmentarium/infrastructure/mediaMapper.ts`                      | 17    | Yes   |
| `src/fragmentarium/application/MediaBinaryLoader.ts`                   | 13    | Yes   |
| `src/fragmentarium/application/MediaRepository.ts`                     | 8     | Yes   |

**24/24 pass. Maximum 224 lines. No grandfathering needed.**

## 51. Type / Cast / Suppression Audit

Grepped every added line in the `src` portion of the three-dot diff for `any`, `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `istanbul ignore`:

**Zero hits.**

Casts that _are_ present, all classified:

| Cast                                                                         | Location                  | Verdict                                                          |
| ---------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------- |
| `value as Record<string, unknown>` via `isRecord` guard                      | validation                | Sound type guard                                                 |
| `representation as MediaRepresentationDto` etc.                              | all three mappers         | **Safe** — destructures into `unknown`; confers no trust         |
| `(value as number)` after `Number.isInteger`                                 | validation `:17,18,23,24` | Safe via short-circuit                                           |
| `(MediaTypes as readonly string[])`, `(ThumbnailSizes as readonly string[])` | `media.ts:58,65`          | Idiomatic widening for `.includes` on a const tuple              |
| `(thumbnails as ThumbnailDtoMap)[size]`                                      | representation `:59`      | Safe — result flows into `normalizeMediaRepresentation(unknown)` |
| `directory as (typeof mediaArchitectureDirectories)[number]`                 | guard `:126`              | Safe — feeding `.includes`                                       |

The pervasive `unknown` in `mediaDtos.ts` is the _correct_ use of `unknown` — a deliberate, narrowed trust boundary — and is exactly the exception the repo rule ("unless very necessary") contemplates. This audit is clean.

## 52. Imports / Comments / Debug Audit

- **Import style (F10): RESOLVED.** Every new module uses full alias paths (`fragmentarium/…`, `test-support/…`). Zero relative imports in PR-owned files. No circular aliases (§45). Matches the repo rule exactly.
- **Comments:** zero in the new TypeScript. Matches the "no comments unless requested" rule. Behavior is instead expressed through names and tests — which is why the two mis-named tests (`"keeps a safe shell"`, `"keeps thumbnail paths for legacy no-photo input"`) carry disproportionate weight.
- **Debug artifacts:** no `console.*`, no `debugger`, no `.skip(`, no `.only(`.
- **Quality-gate bypasses:** none.

## 53. Security Review Summary

| Area                             | Risk                                                                                                                                                      | Evidence                                                            | Blocking? |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------- |
| **URL injection**                | **HIGH** — backend data controls scheme, host, path, query, fragment; only non-empty is enforced                                                          | `mediaRepresentationMapper.ts:28-33`; `media.ts:14`                 | **H2**    |
| **XSS / SVG**                    | **HIGH** — `original` may be `image/svg+xml` (COPY) and is the only _required_ representation; no MIME allowlist                                          | backend `media.py:_validate_mime_policy`; frontend `media.ts:13-26` | **H3**    |
| **Open redirect / new tab**      | MEDIUM — no navigation code exists, but nothing prevents an arbitrary URL reaching `window.open`; `noopener,noreferrer` rule lives only in the doomed doc | §13, §21                                                            | Via B2    |
| **IDOR**                         | **HIGH** — `MediaBinaryRequest` drops fragment scope; `url` is the de facto capability                                                                    | `MediaBinaryLoader.ts:5-9`                                          | **H1**    |
| **Stored-handle leakage**        | **NONE** — expected answer achieved                                                                                                                       | §65                                                                 | No        |
| **MIME trust**                   | **HIGH** — no distinction between `original` and safe display/thumbnail                                                                                   | §22                                                                 | **H3**    |
| **Resource exhaustion**          | **LOW** — single-pass `map`/`filter`, fixed-depth recursion, closed thumbnail iteration; no unbounded nesting                                             | mappers                                                             | No        |
| **Prototype pollution**          | **NONE** — no spread of raw input, no computed-key writes from untrusted keys                                                                             | §17                                                                 | No        |
| **Cache / URL-as-authorization** | **HIGH** — the loader contract makes URL-as-capability the default                                                                                        | §36, §66                                                            | **H1**    |
| **Cancellation**                 | **NONE** — `AbortSignal` on both contracts, native promises                                                                                               | §37                                                                 | No        |
| **Critical-data trust**          | **HIGH** — contradictory summary escapes as trusted                                                                                                       | §29                                                                 | **H4**    |
| **Current runtime**              | **NONE** — no behavior change                                                                                                                             | §43                                                                 | No        |

## 54. Historical Findings Matrix

| Finding                               | Status                                  | Root fixed? | Evidence                                                                                    |
| ------------------------------------- | --------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| F1 cancellation                       | **RESOLVED**                            | Yes         | `MediaRepository.ts:6`, `MediaBinaryLoader.ts:12`                                           |
| F2 duplicate `ThumbnailSize`          | **RESOLVED**                            | Yes         | Single definition `media.ts:5-7`; `fragmentServicePorts.ts:24` imports it                   |
| F3 unreachable condition              | **RESOLVED**                            | Yes         | No dead branch found in any mapper                                                          |
| F4 vacuous barrel list                | **RESOLVED**                            | Yes         | `mediaArchitectureIsolation.test.ts:56-62` proves barrels exist                             |
| F5 stale ImageViewer guard entry      | **RESOLVED**                            | Yes         | Now a regression fixture (`:143-159`), not an inventory entry                               |
| F6 dynamic import / require detection | **RESOLVED**                            | Yes         | AST-based; fixtures at `:107-111`                                                           |
| F7 misleading normalization wrappers  | **RESOLVED**                            | Yes         | No URL-validator misnomer; §19                                                              |
| F8 sort-to-find                       | **RESOLVED**                            | Yes         | `mediaGallery.ts:38` bare `find`                                                            |
| F9 redundant cast                     | **RESOLVED**                            | Yes         | `filter(isMediaType)`, no `as MediaType`                                                    |
| F10 import inconsistency              | **RESOLVED**                            | Yes         | All alias paths                                                                             |
| F11 documentation placement           | **OPEN**                                | No          | `frontend-docs/` still in the diff                                                          |
| F12 resurrected unrelated document    | **OPEN — BLOCKER**                      | No          | `docs/flaky-test-…md` present at HEAD, absent on `origin/master`; §44                       |
| F13 duplicate local frontend-docs     | **OPEN**                                | No          | Filenames collide with the org `generic-documentation` repo; M1                             |
| F14 TypeScript failure                | **OPEN — pre-existing, not introduced** | No          | `realiaOptionLoader.ts` identical on master and branch; **not in the PR diff**; M8          |
| F15 count-zero legacy path            | **DOWNGRADED to LOW**                   | n/a         | Behavior confirmed, but the proposed fix would regress un-migrated fragments; §33           |
| F16 hasPhoto-false legacy path        | **REFUTED**                             | n/a         | Backend emits `thumbnailPath` unconditionally; existing UI does not gate on `hasPhoto`; §34 |
| F17 diagnostics dropped               | **OPEN — and larger than filed**        | No          | `mediaSummaryMapper.ts:120-124` **and** `:162-167`; H4                                      |
| F18 isolation documentation mismatch  | **OPEN, absorbed into B2**              | No          | `01-architecture.md:31-34` vs `fragmentServicePorts.ts:24`                                  |
| F19 interface tests                   | **OPEN**                                | No          | `MediaBinaryLoader.test.ts:40-48` tautological; M3                                          |
| F20 redundant isolation test          | **OPEN**                                | No          | `:64-82` subsumed by `:42-54`; M4                                                           |
| F21 duplicate module inventory        | **OPEN**                                | No          | Guard `:5-16` vs guard test `:92-108`; M4                                                   |
| F22 dead `MediaGalleryState`          | **OPEN**                                | No          | Zero references tree-wide; M5                                                               |
| F23 `normalizeThumbnailSize` wrapper  | **OPEN**                                | No          | `mediaRepresentationMapper.ts:92-96`, no production caller; M6                              |
| F24 test-only barrel export           | **OPEN**                                | No          | `mediaMapper.ts:17`; M6                                                                     |

Ten of twenty-four are genuinely fixed at the root. Two are wrong and should be withdrawn. Twelve remain, of which one is a blocker.

## 55. New Independent Functionality Findings

Reading the tree cold, ignoring all prior comments:

- **A critical summary escapes `normalizeCompatibleMediaSummary` whenever `hasPhoto !== true`** (`:162-167`). Previously believed to be confined to `normalizeMediaSummary`. Untested. → **H4.**
- **What valid backend DTO becomes invalid frontend state?** None found. Every #738-emitted shape — including `types: []`, `thumbnails: {}`, omitted `primary`/`display`/`caption`/`attribution`/`references` — maps cleanly.
- **What malformed DTO is silently accepted as trusted?** `{count: N>0, types: []}` (H4). Also any URL string (H2) and any MIME string (H3).
- **Can the normalized summary contradict itself?** Yes — `{count: 5, types: []}`. That is H4.
- **Can duplicate media IDs produce arbitrary selection?** Deterministic first-match; benign given backend UUIDs. §26, LOW.
- **Can a valid empty thumbnail object disappear?** No — three input shapes all converge on `{}`. §24.
- **Can a future gallery need N+1 for metadata?** No. §42.
- **Can current runtime image behavior change?** No. §43.
- **Can backend and frontend disagree on URL shape or optional fields?** No disagreement found. §15.
- **Doc rule 2 contradicts the code.** `02-data-and-api.md:86-88` says legacy `hasPhoto: true` + `thumbnailPath` yields "a one-item PHOTO summary **whose primary thumbnail URL is the legacy path**". `createLegacyPhotoSummary` (`:105-110`) returns `{count: 1, types: ['PHOTO']}` with **no `primary` at all**; the path is returned as the sibling `legacyThumbnailPath`. Rules 2 and 3 therefore produce identical summaries. **The code is right** (doc rule 8 and §37 both forbid synthesizing an unproven primary) and **the doc is wrong** — but it means the doc cannot be trusted as the spec it is being treated as. → **M7.**

## 56. New Independent Security Findings

- **Can a backend URL become `javascript:`, `data:`, or external in a future viewer?** Yes — nothing in the mapper or the domain type prevents it. **H2.**
- **Can a COPY SVG original be mistaken for a safe display resource?** Yes — identical types for both roles, `original` is the only required one. **H3.**
- **Can an arbitrary URL bypass fragment authorization?** Yes — `MediaBinaryRequest.url` is the fetch target and carries no fragment scope. **H1.**
- **Can the loader fetch by media ID without fragment context?** It has no choice: `fragmentNumber` is not in the request type. **H1.**
- **Can a stored handle leak into the frontend contract?** No. §65.
- **Can a malformed DTO trigger prototype/object spreading into UI state?** No. §17.
- **Can a request continue after unmount?** No — `AbortSignal` is on both contracts. §37.
- **Can a future `window.open`/download be _encouraged_ by these types without a safe policy?** Yes: `MediaBinaryRepresentation` explicitly admits `'original'`, and `MediaRepresentation.url` is a ready-to-use `href`. With the docs deleted there is no counterweight. **B2 + H3.**
- **Can compatibility fallback make the UI request a route known not to exist?** Yes, on `count: 0` — but the existing UI already absorbs this via `onError`, and suppressing it would regress the rollout. §33, LOW.

## 57. Findings

### BLOCKER

### `[BLOCKER] PR resurrects docs/flaky-test-fragment-list-duplicate-key.md, which master deleted`

- **Location:** `docs/flaky-test-fragment-list-duplicate-key.md` (129 lines); introduced by merge `e7b25fef`
- **Architecture/security area:** Scope / merge hygiene
- **Evidence:** File is `ABSENT` on `origin/master` (`cccacb0e`) and `ABSENT` at the merge base `e8e51cc3`, but `PRESENT` at HEAD, so `git diff --name-status origin/master...HEAD` reports it as `A`. Commit-by-commit trace: absent at all nine commits through `501c817a`, present from `e7b25fef` onward. Master added it in `4ac457d8` (#771) and deleted it in `8971a666` (#767); `e7b25fef`'s second parent is `4ac457d8` — the pre-deletion master.
- **PR requirement affected:** Minimal, in-scope architecture-only change
- **Expected contract:** The PR diff contains only media architecture files
- **Actual contract:** The diff carries 129 lines documenting a different PR's already-merged test fix, and re-creates the `docs/` directory that F11 asked to remove
- **Concrete failure scenario:** Merging silently reverts `8971a666`, restoring a file the team deliberately deleted; `docs/` returns holding exactly one unrelated file
- **Current static test coverage:** None applicable
- **Introduced by PR, remediation, or pre-existing?:** Introduced by the PR's own stale merge
- **Merge blocking:** Yes
- **Recommended direction:** Merge current `origin/master` (the branch is 7 behind; `8971a666` is already an ancestor of the merge base, so the file will be re-deleted automatically). Then confirm `git diff --name-status origin/master...HEAD` shows only media files.
- **Pasteable PR comment:** This branch re-adds `docs/flaky-test-fragment-list-duplicate-key.md`, which `master` deleted in `8971a666`. The merge `e7b25fef` merged `4ac457d8` — the pre-deletion master — so the file shows as `A` in the three-dot diff. The branch is 7 commits behind `origin/master`; merging current master resolves this automatically. Please re-check `git diff --name-status origin/master...HEAD` afterwards.

### `[BLOCKER] The entire media security policy is load-bearing only in frontend-docs/, which is slated for deletion`

- **Location:** `frontend-docs/02-data-and-api.md:100-107, 160-198`; `frontend-docs/01-architecture.md:31-34, 125-126`
- **Architecture/security area:** Contract continuity / security policy
- **Evidence:** The SVG/`dangerouslySetInnerHTML`/`<object>`/`<embed>` prohibitions, the MIME allowlist requirement, the four per-MIME rendering rules, the `window.open` `noopener,noreferrer` rule, download-extension allowlist and filename sanitization, plain-text caption/attribution, object-URL revocation ordering, the token rules, and the six `legacyThumbnailPath` retirement criteria exist **only** as prose in these two files. None is encoded in a type, guard, validator, or test, and none appears in the PR description (which is three sentences). §13 tabulates all thirteen.
- **PR requirement affected:** "Prevents future security regressions around SVG, external URLs, downloads, and media binary handling"
- **Expected contract:** After the planned cleanup, the security and compatibility policy remains discoverable in code, tests, the PR description, or a linked accepted external documentation PR
- **Actual contract:** Deleting `frontend-docs/` erases every stated security rule; nothing remains
- **Concrete failure scenario:** The follow-up gallery PR writes `<img src={representations.original.url}>` and a new-tab action on the same URL. Both are permitted by every type and every test in the merged tree, and the rules forbidding them no longer exist anywhere in the repository.
- **Current static test coverage:** None — no test asserts any security property
- **Introduced by PR, remediation, or pre-existing?:** Introduced (the policy was authored here and is scheduled for removal here)
- **Merge blocking:** Yes
- **Recommended direction:** Land the durable content in the org `generic-documentation` repo and **link that PR from #765's description**, and/or encode the minimum in code: a raster MIME allowlist beside `MediaTypes`, and the retirement criteria as a comment-free named constant or a test. At minimum, move the architecture-only boundary, the type-only-import allowance, the URL trust model, the SVG-original-vs-display distinction, the legacy compatibility policy, and the cancellation contract into the PR description before deleting the files.
- **Pasteable PR comment:** Before `frontend-docs/` is deleted, the security and compatibility contract needs somewhere to live. The SVG/MIME rendering rules, the `window.open`/download requirements, and the six `legacyThumbnailPath` retirement criteria are currently in `02-data-and-api.md:160-198` and `:100-107` and **nowhere else** — not in a type, not in a test, not in the PR description. Once the docs go, the next PR has nothing to check itself against. Could the durable rules land in the org `generic-documentation` repo (linked from this description), with the architecture-only boundary and the type-only-import allowance moved into the PR body?

### HIGH

### `[HIGH] MediaBinaryRequest drops fragment authorization context and makes the URL the capability`

- **Location:** `src/fragmentarium/application/MediaBinaryLoader.ts:5-9`
- **Architecture/security area:** IDOR / authorization boundary
- **Evidence:** `MediaBinaryRequest = { mediaId, url, representation }`. No `fragmentNumber`. Backend #738 routes are fragment-scoped throughout (`media_urls.py`: `/fragments/{f}/media/{m}/file`, `/display`, `/thumbnail/{size}`). `MediaBinaryLoader.test.ts:14` already demonstrates the natural implementation: `fetch: async ({ url }) => …`.
- **PR requirement affected:** Alignment with the backend media architecture; prevention of future media-binary security regressions
- **Expected contract:** The request identifies fragment + media + representation, so an implementation can construct the authorized route from identity
- **Actual contract:** The request carries an opaque URL and an unscoped media ID; a loader has no `fragmentNumber` to build a path from, so it _must_ trust `url`
- **Concrete failure scenario:** A gallery component holds media from fragment A, a stale/incorrect `url` points at fragment B, and the loader fetches it — no type-level or runtime check objects. More broadly, possession of a URL becomes the access token, which §66 explicitly prohibits.
- **Current static test coverage:** None — the contract tests assert only that a fake returns what it was written to return
- **Introduced by PR, remediation, or pre-existing?:** Introduced (`f46b1288`)
- **Merge blocking:** Yes — this is a contract the follow-up PRs cannot change without a rewrite
- **Recommended direction:** Add `readonly fragmentNumber: string` to `MediaBinaryRequest` and either remove `url` or rename it to make its untrusted, display-only status explicit. Keep the `representation` union as-is — it is well designed.
- **Pasteable PR comment:** `MediaBinaryRequest` is `{mediaId, url, representation}` with no fragment context, while every backend media route is fragment-scoped (`/fragments/{f}/media/{m}/file`). That means a loader has no `fragmentNumber` to build the authorized path from and must fetch whatever `url` says — making possession of the URL the capability. Could `fragmentNumber` be added to the request, so an implementation can construct the route from identity rather than trusting a string? Worth settling now, while there is no implementation to break.

### `[HIGH] Trusted MediaRepresentation.url accepts any non-empty string, including javascript:, data:, and external origins`

- **Location:** `src/fragmentarium/domain/media.ts:14`; `src/fragmentarium/infrastructure/mediaRepresentationMapper.ts:28-33`
- **Architecture/security area:** URL trust boundary
- **Evidence:** The only validation is `normalizeNonEmptyString`. Backend `media_urls.py` emits exclusively same-origin relative paths (`/fragments/...`, segments `quote(..., safe="")`); there is no backend path producing an absolute or external URL. The frontend does not encode that invariant anywhere, and grep confirms no scheme, host, or prefix check exists in any media module.
- **PR requirement affected:** "Prevents future security regressions around external URLs"
- **Expected contract:** A trusted domain `url` is a same-origin relative path, or is explicitly typed as untrusted
- **Actual contract:** `javascript:alert(1)`, `data:text/html,<script>…`, `https://evil.example/f`, `//evil.example/f`, `../admin`, and `/p?x=1#f` all normalize into a trusted `MediaRepresentation.url`
- **Concrete failure scenario:** A future viewer binds `original.url` to an `<a href>` or `window.open`. A compromised or misconfigured media record yields script execution or an external navigation. In `<img src>` the active schemes are inert, but the external-origin and traversal cases still produce cross-origin requests.
- **Current static test coverage:** `mediaMapper.representations.test.ts` tests empty and whitespace URLs only. No scheme or origin case exists.
- **Introduced by PR, remediation, or pre-existing?:** Introduced (`fb024a22`)
- **Merge blocking:** Yes — this is the trust model, and changing it later changes every consumer
- **Recommended direction:** Either validate in `normalizeMediaRepresentation` that the URL starts with a single `/` and not `//` (matching what the backend actually emits, and rejecting every attack value above), or make the looseness explicit by typing the field as an untrusted raw URL that the UI layer must pass through a sanitizer. Combined with the H1 fix, the strongest outcome is route-identity as the access authority and `url` as display metadata only.
- **Pasteable PR comment:** `MediaRepresentation.url` is a trusted domain field validated only as a non-empty string, so `javascript:alert(1)`, `data:text/html,…`, `https://evil.example/f`, and `//evil.example/f` all pass. The backend only ever emits same-origin relative paths (`media_urls.py` uses `/fragments/…` with `quote(safe="")`), so a check for a leading single `/` would reject every one of those and cost two lines in `normalizeMediaRepresentation`. Given the PR's stated goal of preventing future external-URL regressions, could the mapper enforce the shape the backend already guarantees?

### `[HIGH] No frontend distinction between SVG-capable original and raster-guaranteed display/thumbnail`

- **Location:** `src/fragmentarium/domain/media.ts:13-26`
- **Architecture/security area:** MIME policy / XSS via SVG
- **Evidence:** Backend `domain/media.py:_validate_mime_policy` permits `image/svg+xml` **only** as a `COPY` original and enforces raster-only for `display` and every thumbnail, raising `"SVG representations are only valid as COPY originals."` The frontend models all three roles with the identical `MediaRepresentation` type, validates `mimeType` as any non-empty string, and defines no allowlist. `original` is the only **required** representation (`:21`) while `display` is optional (`:22`).
- **PR requirement affected:** "Prevents future security regressions around SVG"; "supports original, display, and thumbnail representations"
- **Expected contract:** The types preserve the original-vs-safe-preview distinction even though rendering is deferred
- **Actual contract:** The three roles are indistinguishable, and the guaranteed-present one is the unsafe one
- **Concrete failure scenario:** A follow-up gallery writes `<img src={resource.representations.original.url}>` because `original` is the only field guaranteed to exist. For every SVG `COPY` this renders an SVG from the same origin. Route it through `window.open` or an `<object>` instead and it becomes same-origin script execution. Nothing in the merged tree flags any of it.
- **Current static test coverage:** None — no test asserts any MIME property
- **Introduced by PR, remediation, or pre-existing?:** Introduced (`fb024a22`)
- **Merge blocking:** Yes
- **Recommended direction:** Export a raster MIME allowlist alongside `MediaTypes` (`image/jpeg`, `image/png`, `image/webp`) mirroring `ebl/media/domain/mime.py`, plus an `isRasterMimeType` guard, and consider a distinct type (or a branded field) for representations the backend guarantees raster. That keeps the distinction executable after `frontend-docs/` is deleted.
- **Pasteable PR comment:** The backend allows `image/svg+xml` only as a `COPY` original and guarantees raster for `display` and thumbnails (`_validate_mime_policy`). The frontend uses one `MediaRepresentation` type for all three and accepts any `mimeType` string — and `original` is the only _required_ representation, so `<img src={representations.original.url}>` is the shortest thing a gallery author will write, and it renders SVG. Could we mirror `ebl/media/domain/mime.py` as an exported raster allowlist plus an `isRasterMimeType` guard? That keeps the rule executable once `02-data-and-api.md:182-185` is deleted.

### `[HIGH] A self-contradictory summary escapes as trusted through both public entry points`

- **Location:** `src/fragmentarium/infrastructure/mediaSummaryMapper.ts:120-124` and `:162-167`
- **Architecture/security area:** Mapper trust boundary
- **Evidence:** `normalizeMediaSummaryWithDiagnostics` correctly computes `hasCriticalError` at `:79-81`. `normalizeMediaSummary` discards it: `normalizeMediaSummary({count: 5, types: ['NOPE']})` → `{count: 5, types: []}`. `normalizeCompatibleMediaSummary` falls back to legacy **only when a legacy summary exists** (`hasPhoto === true`); at `:162-167` the `hasPhoto !== true` branch returns `normalizedNewSummary.mediaSummary` — the critical shell — as the trusted summary.
- **PR requirement affected:** Defensive normalization of future backend DTOs
- **Expected contract:** A caller never receives `count > 0` with no usable type and no trustworthy primary without an indication of corruption
- **Actual contract:** Both public entry points return exactly that. `mediaMapper.summary.test.ts:128` pins it under the name _"keeps a safe shell"_.
- **Concrete failure scenario:** `normalizeCompatibleMediaSummary({mediaSummary: {count: 5, types: ['NOPE']}, hasPhoto: false, thumbnailPath: '/fragments/K.1/thumbnail/small'})` returns `{mediaSummary: {count: 5, types: []}, legacyThumbnailPath: '/fragments/K.1/thumbnail/small'}`. A list view renders "5 media items" with no types and no primary — a broken gallery — with no signal that the data was rejected internally.
- **Current static test coverage:** **None for the dangerous path.** `mediaMapper.compatibility.test.ts:140` covers only the `hasPhoto: true` variant (which correctly falls back); `:172` covers the benign `count: 0` shell. The `count > 0` + `hasPhoto: false` combination is untested, and qlty still reports 100% diff coverage.
- **Introduced by PR, remediation, or pre-existing?:** Introduced (`7d5ee16d`, hardened in `aa159104` but not closed)
- **Merge blocking:** Yes
- **Recommended direction:** Return `null` from `normalizeMediaSummary` when `hasCriticalError` is true, and in `normalizeCompatibleMediaSummary:162-167` return `mediaSummary: null` when the new summary is critical and no legacy summary exists. Update `mediaMapper.summary.test.ts:128` accordingly and add the `hasPhoto: false` critical case to the compatibility suite. Alternatively export the diagnostics-carrying variant and make the lossy one internal.
- **Pasteable PR comment:** `normalizeMediaSummary` drops the `hasCriticalError` flag it computes: `normalizeMediaSummary({count: 5, types: ['NOPE']})` → `{count: 5, types: []}`. The leak is not confined to that entry point though — `normalizeCompatibleMediaSummary` only falls back to legacy when `hasPhoto === true`, so at `:162-167` the same shell escapes: `normalizeCompatibleMediaSummary({mediaSummary: {count: 5, types: ['NOPE']}, hasPhoto: false, thumbnailPath: '/legacy'})` → `{mediaSummary: {count: 5, types: []}, legacyThumbnailPath: '/legacy'}`. That path has no test — the `hasPhoto: true` variant at `compatibility.test.ts:140` covers the branch that works. Could critical summaries return `null` from both entry points, with `summary.test.ts:128` updated and the `hasPhoto: false` case added?

### MEDIUM

### `[MEDIUM] frontend-docs/ shadows filenames that already exist in the org generic-documentation repo`

- **Location:** `frontend-docs/01-architecture.md`, `frontend-docs/02-data-and-api.md`
- **Architecture/security area:** Documentation placement (F11/F13)
- **Evidence:** Verified independently against the org repo's contents API: `ElectronicBabylonianLiterature/generic-documentation` already contains `frontend-docs/01-architecture.md` (8,773 bytes) and `frontend-docs/02-data-and-api.md` (7,407 bytes), alongside `00-overview.md`, `03-routes-and-features.md`, `04-build-and-operations.md`, `05-contributing.md`. Both filenames collide exactly. `01-architecture.md:16-27` still carries the PR-scoped `Goals` list intended for the PR description.
- **PR requirement affected:** Documentation cleanup
- **Expected contract:** Durable content in the org repo; PR-scoped content in the PR description; neither directory on this branch
- **Actual contract:** `docs/` was renamed to a new local `frontend-docs/` with colliding filenames
- **Concrete failure scenario:** A reader landing on either `01-architecture.md` has no way to know the other exists or which is authoritative
- **Current static test coverage:** n/a
- **Introduced by PR, remediation, or pre-existing?:** Introduced
- **Merge blocking:** No — but it is the mechanism by which B2 becomes irreversible
- **Recommended direction:** Fold the durable content into the org repo's existing files, move `Goals` into the PR description, then delete both `frontend-docs/` and `docs/`.
- **Pasteable PR comment:** `frontend-docs/01-architecture.md` and `02-data-and-api.md` use the same filenames as the org `generic-documentation` repo, where both already exist with broader, non-media content. Folding the durable rules into the org copies (and moving `Goals` at `01-architecture.md:16-27` into the PR description) would avoid two same-named docs in two repos.

### `[MEDIUM] Isolation guard's module discovery is scoped to media* filenames in three directories`

- **Location:** `src/test-support/mediaArchitectureIsolationGuard.ts:18-22, 120-129`
- **Architecture/security area:** Isolation anti-vacuity
- **Evidence:** `isMediaArchitectureFile` requires the directory to be one of `fragmentarium/{application,domain,infrastructure}` **and** the basename to match `/^media/i`. `findExpectedMediaArchitectureModules` derives the inventory from that predicate, and `mediaArchitectureIsolation.test.ts:34-38` asserts the declared list matches it.
- **PR requirement affected:** Isolation enforcement for modules added after this PR
- **Expected contract:** Any newly added media architecture module is either declared or fails the suite
- **Actual contract:** `fragmentarium/ui/media/MediaGallery.tsx` or `fragmentarium/application/ImageViewerService.ts` satisfies neither condition — the derived list misses it, the declared list omits it, the equality test stays green, and production imports of it go unflagged
- **Concrete failure scenario:** The follow-up gallery PR adds `fragmentarium/ui/MediaGalleryView.tsx`, wires it into `FragmentView`, and the isolation suite passes
- **Current static test coverage:** The guard test hardcodes today's ten modules, which cannot detect the gap
- **Introduced by PR, remediation, or pre-existing?:** Introduced
- **Merge blocking:** No — today's inventory is complete and correct
- **Recommended direction:** Widen the directory set, or match on a content signal (a module importing `fragmentarium/domain/media`) rather than the filename prefix.

### `[MEDIUM] MediaBinaryLoader/MediaRepository contract tests are tautological`

- **Location:** `src/fragmentarium/application/MediaBinaryLoader.test.ts:40-48, 6-18, 50-64`; `src/fragmentarium/application/MediaRepository.test.ts`
- **Architecture/security area:** Test quality (F19)
- **Evidence:** `:40-48` asserts `request.representation === 'display'` two lines after assigning it. `:6-18` asserts `new Blob(...)` is a `Blob`. Both modules are interfaces with no runtime code; the expected value is produced by the code under test, violating §58.
- **PR requirement affected:** Meaningful coverage of new contracts
- **Expected contract:** Tests prove interface shape, signal propagation, and rejection of bad implementations
- **Actual contract:** Four of five assertions restate literals; only the signal test (`:20-38`) has semantic content, and only against a fake
- **Introduced by PR, remediation, or pre-existing?:** Introduced (`39532c67`)
- **Merge blocking:** No
- **Recommended direction:** Replace with one compile-time fixture per module (`const _check: MediaBinaryLoader = …`). Note the repo rule requires the author's agreement before removing tests — this is a proposal, not a demand, and no `@ts-expect-error` is being suggested.

### `[MEDIUM] Duplicated module inventory and a subsumed isolation test violate the DRY hard gate`

- **Location:** `src/test-support/mediaArchitectureIsolationGuard.ts:5-16` vs `mediaArchitectureIsolationGuard.test.ts:92-108`; `mediaArchitectureIsolation.test.ts:64-82` vs `:42-54`
- **Architecture/security area:** DRY (F20, F21)
- **Evidence:** The ten module paths are written out twice, so adding a media module requires editing both. Separately, the barrel test at `:64-82` filters production files to barrels and asserts no `reexport` references, while `:42-54` already asserts an empty result for **every** production file across **all four** reference kinds — a strict superset.
- **PR requirement affected:** DRY hard gate
- **Actual contract:** Two inventories with drift risk; one test that cannot fail unless another already has
- **Merge blocking:** No
- **Recommended direction:** Drop the hardcoded copy at `:92-108` (assert shape/count instead) and delete `:64-82`. **Keep `:56-62`** — that one is the anti-vacuity proof, not a duplicate.

### `[MEDIUM] MediaGalleryState is declared but never used`

- **Location:** `src/fragmentarium/domain/mediaGallery.ts:3-5`
- **Architecture/security area:** Dead speculative type (F22)
- **Evidence:** Grep across `src`: the only occurrence is the declaration. Not imported, not tested, not re-exported.
- **Expected contract:** Future-facing types earn their place by pinning a contract the next PR must honour
- **Actual contract:** `{selectedMediaId: string | null}` constrains nothing — unlike `MediaRepository`/`MediaBinaryLoader`, which pin a wire and authorization contract
- **Merge blocking:** No
- **Recommended direction:** Move it to the runtime gallery PR that will actually hold state.

### `[MEDIUM] normalizeThumbnailSize and the normalizeNonEmptyString barrel export exist only for tests`

- **Location:** `src/fragmentarium/infrastructure/mediaRepresentationMapper.ts:92-96`; `src/fragmentarium/infrastructure/mediaMapper.ts:10, 17`
- **Architecture/security area:** Public API surface (F23, F24)
- **Evidence:** `normalizeThumbnailSize` is `isThumbnailSize(value) ? value : undefined` with **zero** production callers — `normalizeThumbnailMap` iterates `ThumbnailSizes` directly and never calls it; its only consumers are the barrel and `mediaMapper.representations.test.ts:127-130`. `normalizeNonEmptyString` is re-exported from the barrel solely for `representations.test.ts:124-125`.
- **Expected contract:** The barrel describes the mapper's supported API
- **Actual contract:** Two of eleven exports serve test import convenience; `normalizeThumbnailSize` adds no validation over `isThumbnailSize`
- **Merge blocking:** No
- **Recommended direction:** Drop `normalizeThumbnailSize` and use the type guard directly; import `normalizeNonEmptyString` from `mediaMapperValidation` in the test and remove it from the barrel. Note `02-data-and-api.md:124-127` cites `normalizeThumbnailSize` as the example of a wrapper that earns its name — which makes it the one case the rule should not be illustrated with.

### `[MEDIUM] Documentation rule 2 contradicts createLegacyPhotoSummary`

- **Location:** `frontend-docs/02-data-and-api.md:86-88` vs `src/fragmentarium/infrastructure/mediaSummaryMapper.ts:105-110`
- **Architecture/security area:** Spec/code mismatch
- **Evidence:** The doc says legacy `hasPhoto: true` with `thumbnailPath` normalizes to a one-item PHOTO summary "whose primary thumbnail URL is the legacy path". The code returns `{count: 1, types: ['PHOTO']}` with **no `primary`**; the path is the sibling `legacyThumbnailPath`. Rules 2 and 3 therefore produce identical summaries.
- **Expected contract:** The doc describes the code
- **Actual contract:** It describes a synthesized primary the code deliberately does not create
- **Merge blocking:** No — **the code is correct** (doc rule 8 and §37 both forbid synthesizing an unproven primary); the doc is wrong
- **Recommended direction:** Fix the rule wherever the durable content lands. It also shows the doc cannot be relied on as the spec while it is being treated as one (B2).

### `[MEDIUM] Pre-existing yarn tsc failure in realiaOptionLoader.ts under the repo's hard-gate rule`

- **Location:** `src/fragmentarium/ui/text-annotation/realiaOptionLoader.ts:17, 30` (**not in this PR's diff**)
- **Architecture/security area:** Repository policy (F14)
- **Evidence:** The file is byte-identical on `origin/master` and on this branch and does not appear in `git diff --name-only origin/master...HEAD`. `RealiaService.search` returns a Bluebird `Promise<readonly RealiaEntry[]>` (`RealiaService.ts:1, 44`) and `toNativePromise<T>(promise: PromiseLike<T>)` cannot infer `T` from Bluebird's overloaded `then`. No workflow runs `tsc`, so CI is green regardless. I did not run `tsc` — the review constraints forbid it — so this rests on source inspection and the prior reviewer's reproduction on clean `master`.
- **PR requirement affected:** `yarn tsc` hard gate + "fix all pre-existing issues immediately upon detection"
- **Merge blocking:** **No, for this PR.** It is genuinely pre-existing, arrived with #767, and is not in the diff. Fixing it here would add an unrelated branch-only compiler fix to an architecture-only PR — the exact scope contamination §59 warns against, and a sibling of the B1 problem. The repo rule is real, but the right home is a one-line PR against `master` that unblocks every open branch at once.
- **Recommended direction:** Open a separate PR binding the type argument: `toNativePromise<readonly RealiaEntry[]>(realiaService.search(query))`. Also worth adding `tsc` to CI, since nothing currently catches this class of failure.

### LOW

### `[LOW] count: 0 with a legacy thumbnail path is correct but its intent is unrecorded`

- **Location:** `src/fragmentarium/infrastructure/mediaSummaryMapper.ts:148-159`
- **Evidence:** A valid `{count: 0}` summary is non-critical, `hasPrimaryThumbnail` is false, so `legacyThumbnailPath` passes through. Under #738 `has_photo` is derived from the **new** media list, so an un-backfilled fragment yields `count: 0` + `hasPhoto: false` while a legacy photo still exists and the legacy route still serves it.
- **Merge blocking:** No. **The prior F15 fix (suppress the path when `count === 0`) would blank the search-result thumbnail for every un-migrated fragment for the whole backfill** and should not be applied.
- **Recommended direction:** Keep the behavior. Add a test named for the reason — e.g. _"keeps the legacy route when a count:0 summary predates backfill"_ — so the intent survives the doc deletion. The one real cost is a speculative request per un-migrated fragment, absorbed today by `FragmentariumSearchResultComponents.tsx:68` (`onError` → hide).

### `[LOW] Two test names assert properties the values do not have`

- **Location:** `mediaMapper.summary.test.ts:128` ("keeps a safe shell…"); `mediaMapper.compatibility.test.ts:105` ("keeps thumbnail paths for legacy no-photo input")
- **Evidence:** The first names a value that is not safe (H4). The second states a behavior without its justification — and that justification (the backend emits `thumbnailPath` unconditionally) is exactly what led a reviewer to file F16 against correct code.
- **Merge blocking:** No
- **Recommended direction:** With no comments allowed by repo policy, test names are the only place intent can live. Rename the second to something like _"keeps the unconditional legacy thumbnail route when hasPhoto is false"_. Fix the first alongside H4.

### `[LOW] Duplicate media IDs are retained and resolved by first match`

- **Location:** `src/fragmentarium/domain/mediaGallery.ts:38`; `src/fragmentarium/infrastructure/mediaResourceMapper.ts:87-97`
- **Evidence:** No dedup, no rejection, no diagnostic. `selectMediaById` returns the first match in backend order.
- **Merge blocking:** No — backend `MediaId` is a UUID, so duplicates are a contract violation that cannot occur today, and array order is deterministic so selection is stable
- **Recommended direction:** Worth one line in the first `MediaRepository` implementation; not worth changing the mapper now.

## 58. Positive Findings

Credit where it is due — several things here are better than the codebase average:

1. **`mediaDtos.ts` is a textbook DTO boundary.** Every field `readonly ...?: unknown`. It promises nothing and cannot be mistaken for validated data.
2. **Zero type escapes across 2,572 added lines.** No `any`, no `as any`, no `as unknown as`, no `@ts-ignore`, no `@ts-expect-error`, no `eslint-disable`, no `istanbul ignore`.
3. **Numeric validation is genuinely strict.** `Number.isInteger` rejects `NaN`, `Infinity`, numeric strings, and booleans with no coercion anywhere.
4. **Prototype pollution is structurally impossible.** No raw spread, no computed-key writes; `normalizeThumbnailMap` iterates the closed `ThumbnailSizes` set and indexes the input, never the reverse.
5. **`mediaMapper.boundary.test.ts` is the right test.** It proves `projects`, `fileName`, and `checksum` are dropped — direct evidence that backend internals cannot leak into frontend state.
6. **`Photo.test.tsx` adds a regression guard for existing behavior.** Pinning "Open in New Tab" against future media work is exactly the right instinct.
7. **The isolation guard is a real AST analysis, not a regex.** It correctly flags mixed type/value imports, side-effect imports, wildcard re-exports, dynamic imports, and `require`, while correctly ignoring type-only forms, comments, and plain string literals.
8. **The isolation suite is provably non-vacuous** — module list non-empty, files exist on disk, production set non-empty, barrels proven to exist, 13 mutation fixtures.
9. **`sortMedia` is correct on every axis** — deterministic, explicitly stable via index tiebreak, non-mutating, locale-independent — and gallery ordering shares the canonical order with primary selection.
10. **`MediaRepository.findByFragment` makes N+1 unrepresentable**, and does it through the type rather than through documentation.
11. **The critical-error taxonomy inside `normalizeMediaSummaryWithDiagnostics` is well judged** — nothing harmless is fatal, nothing contradictory is blessed. The bug is that the public wrappers discard its verdict, not that the verdict is wrong.
12. **Legacy compatibility is more correct than two prior findings claimed.** It faithfully mirrors both the backend wire and the shipped UI's optimistic-with-`onError` policy.
13. **Runtime preservation is exact** — the single production edit compiles to identical JavaScript.
14. **Every file is comfortably under the 250-line ceiling**, and the four-module mapper split is a clean DAG with one source of truth per validator.

## 59. Scope Audit

| Addition                                             | Necessary?  | Scope creep?                                     |
| ---------------------------------------------------- | ----------- | ------------------------------------------------ |
| Media domain types, DTOs, four mappers, barrel       | Yes         | No                                               |
| `MediaRepository`, `MediaBinaryLoader`               | Yes         | No                                               |
| `mediaGallery.ts` helpers                            | Yes         | No — except `MediaGalleryState` (M5)             |
| Isolation guard + tests                              | Yes         | No — directly serves the architecture-only claim |
| `fragmentServicePorts.ts` type-only import           | Yes         | No — resolves the duplicate `ThumbnailSize` (F2) |
| `Photo.test.tsx` regression assertion                | Yes         | No                                               |
| `frontend-docs/` (325 lines)                         | Cleanup     | Planned removal — but see B2                     |
| **`docs/flaky-test-fragment-list-duplicate-key.md`** | **No**      | **Yes — B1**                                     |
| `realiaOptionLoader.ts` fix                          | Not present | Correctly absent (M8)                            |

Scope is clean apart from B1. The author correctly resisted adding an unrelated compiler fix.

## 60. Reviewer Handoff

**1. Blocking issues**

- **B1** — `docs/flaky-test-fragment-list-duplicate-key.md` resurrected via the stale merge `e7b25fef`
- **B2** — the whole security/compatibility policy is load-bearing only in `frontend-docs/`, which is scheduled for deletion
- **H1** — `MediaBinaryRequest` drops fragment authorization context
- **H2** — trusted `url` accepts any non-empty string
- **H3** — no SVG-original vs raster-display distinction
- **H4** — self-contradictory summary escapes as trusted through both public entry points

**2. Important non-blocking issues**
M1 doc placement/collision · M2 guard discovery scope · M3 tautological contract tests · M4 DRY duplication · M5 dead `MediaGalleryState` · M6 test-only exports · M7 doc rule 2 vs code · M8 pre-existing `tsc` failure

**3. Files/lines to inspect first**

1. `src/fragmentarium/application/MediaBinaryLoader.ts:5-9` (H1)
2. `src/fragmentarium/infrastructure/mediaSummaryMapper.ts:120-124, 162-167` (H4)
3. `src/fragmentarium/domain/media.ts:13-26` (H2, H3)
4. `src/fragmentarium/infrastructure/mediaRepresentationMapper.ts:28-33` (H2)
5. `frontend-docs/02-data-and-api.md:100-107, 160-198` (B2)
6. `git diff --name-status origin/master...HEAD | grep docs/` (B1)

**4. Architecture-only conclusion** — **True and well enforced.** Exactly one production reference, type-only and erased. No fetching, no rendering, no route, no ImageViewer, no new API call.

**5. Isolation conclusion** — The guard is real, AST-based, non-vacuous, and catches every realistic runtime import form. One forward-looking gap: discovery is scoped to `media*` filenames in three directories (M2).

**6. Backend compatibility conclusion** — **Compatible on every field checked** against #738 head `864e3632`: `ThumbnailSize` lowercase, `types: []` and `thumbnails: {}` preserved on both sides, omitted-when-empty optionals all handled, `references` wire key `id`, relative URL shapes, no storage handles. No wire change is needed on either side. **Verified against GitHub raw, not a local checkout — `/workspaces/ebl-api` does not exist here.**

**7. Mapper trust conclusion** — Structurally excellent and fails closed on shape. Two semantic gaps: URL (H2) and MIME (H3). One correctness gap: the critical shell (H4).

**8. Summary/compatibility conclusion** — The legacy layer is **correct**, and two prior findings against it should be withdrawn. F16 is refuted outright (the backend emits `thumbnailPath` unconditionally from the museum number; the shipped UI never gates on `hasPhoto`). F15's proposed fix would regress every un-migrated fragment during backfill. What is genuinely missing is a recorded rationale (L1, L2).

**9. Repository/cancellation conclusion** — Strong. Mandatory fragment scope, one request, native `Promise`, no Bluebird, `AbortSignal` on both contracts. Compatible with #774.

**10. Binary-loader/IDOR conclusion** — **The weakest contract in the PR.** No fragment scope, and an arbitrary `url` that makes possession the capability. Fix now, while there is no implementation to break.

**11. URL/MIME/SVG conclusion** — No unsafe runtime behavior exists today, but the types make the unsafe implementation the natural one, and the rules forbidding it are in a file being deleted.

**12. N+1 conclusion** — Clean, and self-evident from the types alone. This contract survives the doc deletion intact.

**13. Documentation cleanup conclusion** — Delete `docs/` (B1, mandatory) and `frontend-docs/` — **but not before the durable content lands somewhere linked** (B2). No `TASK-765-*` files are tracked.

**14. Hard-gate conclusion** — 250-line ceiling **PASS** (max 224). Comments **PASS**. Alias imports **PASS**. Type escapes **PASS**. DRY **PARTIAL** (M4). `tsc` **AT RISK, pre-existing** (M8). Lint/tests/coverage reported green and CI-confirmed on the final SHA.

**15. Scope conclusion** — Clean except B1.

**16. Pasteable PR comments** — one per finding in §57.

## 61. Final Verdict

**NOT READY**

Two blockers, four HIGH findings. The mapper core is genuinely strong and the backend contract matches field-for-field — this is not far from mergeable. But B1 silently reverts a master deletion, and B2 would ship a media architecture whose entire security policy evaporates on cleanup, while H1–H3 leave the next PR's most natural implementation the unsafe one. All six are cheap to fix now and expensive to fix after the contracts have consumers.

Two prior findings (F15, F16) should be withdrawn: they are contradicted by the backend source and by the shipped frontend behavior, and acting on F15 would cause a visible regression.

## 62. Verification Checklist

| #   | Check                                                   | Result                                           |
| --- | ------------------------------------------------------- | ------------------------------------------------ |
| 1   | Candidate unambiguous (HEAD = local = remote = PR head) | **Yes** — `c1fb4540`                             |
| 2   | Latest `origin/master` integrated                       | **No** — 7 behind                                |
| 3   | CI corresponds to final committed SHA                   | **Yes** — all green on `c1fb4540`                |
| 4   | Review decision current                                 | **CHANGES_REQUESTED**, dated after the final SHA |
| 5   | Every changed `.ts`/`.tsx` ≤ 250 lines                  | **Yes** — 24/24, max 224                         |
| 6   | Architecture-only boundary true                         | **Yes**                                          |
| 7   | No current media runtime behavior change                | **Yes**                                          |
| 8   | No runtime media import escapes isolation               | **Yes** — one type-only import                   |
| 9   | Guard catches static/dynamic/barrel imports             | **Yes**                                          |
| 10  | Type-only production imports intentional                | **Yes** — rationale undocumented (B2)            |
| 11  | Backend #738 wire contract matches                      | **Yes** — all 24 fields                          |
| 12  | DTO/domain separation maintained                        | **Yes**                                          |
| 13  | Numeric validation strict                               | **Yes**                                          |
| 14  | `isRecord` rejects arrays/null/primitives/functions     | **Yes**                                          |
| 15  | URL trust model safe                                    | **No — H2**                                      |
| 16  | MIME/SVG distinction preserved                          | **No — H3**                                      |
| 17  | Binary loader preserves fragment context                | **No — H1**                                      |
| 18  | Critical summaries cannot escape as trusted             | **No — H4**                                      |
| 19  | Legacy compatibility correct                            | **Yes** — F15/F16 refuted                        |
| 20  | `AbortSignal` on all async contracts                    | **Yes**                                          |
| 21  | Single `ThumbnailSize` source                           | **Yes**                                          |
| 22  | No N+1 possible                                         | **Yes**                                          |
| 23  | No stored handles in frontend contract                  | **Yes**                                          |
| 24  | No `any`/suppressions/debug artifacts                   | **Yes**                                          |
| 25  | No master-deleted file resurrected                      | **No — B1**                                      |
| 26  | Security contracts survive doc removal                  | **No — B2**                                      |
| 27  | Alias imports throughout                                | **Yes**                                          |
| 28  | Tests non-tautological                                  | **Mappers yes; interface tests no (M3)**         |
| 29  | DRY hard gate                                           | **Partial — M4**                                 |
| 30  | Scope free of unrelated changes                         | **No — B1**                                      |
