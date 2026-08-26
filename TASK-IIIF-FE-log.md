# TASK-IIIF-FE — Work Log

## Constraints honoured

- Read-only investigation. **No production code modified.**
- No branch switch, no fetch/pull/merge/rebase/cherry-pick/reset/clean/stash, no commit/push.
- No package install/remove/upgrade. No deployment or production access.
- **No full test suite run.** One narrowly scoped test path executed as targeted verification.
- Only files created: `docs/IIIF_FRONTEND_ARCHITECTURE_HANDOFF.md` plus the two task files
  mandated by `.github/copilot-instructions.md`.

## Commands executed

The authoritative, complete list is section 4 of the handoff
(`docs/IIIF_FRONTEND_ARCHITECTURE_HANDOFF.md`, "Investigation commands executed").

## Pre-existing issues found (reported, not fixed — no-code-change task)

Per the instructions' pre-existing-issues rule, these were surfaced during investigation.
Because this task changes no code, they are recorded as findings in handoff section 11
rather than fixed here; each is assigned to a phase in section 28.

1. `ImageButtonGroup.tsx:47-51` — `window.open(url, '_blank')` omits `noopener,noreferrer`.
   Root cause: no centralised safe-open helper (unlike `ExternalLink` for anchors).
   Assigned: Phase 7.
2. `ImageButtonGroup.tsx:39-40` — download extension from `blob.type.split('/')[1]`
   yields `svg+xml` for SVG. Root cause: no MIME->extension allowlist. Assigned: Phase 7.
3. `ImageRepository.ts:45-51` — `error.data.title` read unguarded in the 404 branch;
   a non-ApiError rejection throws a TypeError masking the original error. Assigned: Phase 2.
4. `Photo.tsx` / `FolioImage.tsx` — duplicated viewer block violates the DRY hard gate.
   Assigned: Phase 4 (consolidate into a shared `ImageViewer` before adding a third viewer).
5. `eslint.config.js` — `eslint-plugin-jsx-a11y` is a dependency but is not extended;
   only the `react-app` preset subset applies. Assigned: Phase 9.
6. No Content-Security-Policy anywhere in the app. Assigned: Phase 7.
7. `Photo.tsx` / `FolioImage.tsx` use relative imports (`./ImageButtonGroup`) contrary to the
   full-import-path convention. Assigned: opportunistic, Phase 4.

## Findings timeline

- Confirmed `/workspaces/ebl-frontend`, branch `feature-media-architecture`, HEAD `7e5583d7`,
  no upstream, base `cccacb0e` (origin/master), 16 branch-unique commits.
- Branch = 26 new files + 2 modified; +2,835 / -1. Source ~1,036 lines, tests ~1,799 lines.
- No repo `CLAUDE.md`/`AGENTS.md`; instructions live only in `.github/copilot-instructions.md`.
- Importer graph plus an executed isolation test (2 suites / 47 tests, all passing) prove the
  new media architecture has **no production caller**; the isolation is deliberate and enforced.
- The only production change on the branch is a **type-only** re-export of `ThumbnailSize`
  in `fragmentServicePorts.ts`, which intentionally emits no runtime edge.
- Recovered the branch's deleted design docs via `git show` (`docs/media-architecture.md`,
  `docs/media-rollout-contract.md`) — they contain the authoritative statement of intent,
  including the "authenticated fetch -> Blob -> object URL" binary contract that IIIF must
  reconcile with. Recommend restoring them as tracked files (open decision #19).
- Central architectural finding: the entire image pipeline is Blob-based behind an Auth0
  **bearer header**, which cannot be attached to IIIF tile requests. Backend contract item
  #18 is the gating decision for the whole programme.
- `SummaryThumbnail` (`FragmentariumSearchResultComponents.tsx:59-82`) already renders a
  direct, unauthenticated `<img src>` — the precedent that makes tiled IIIF feasible.
- Verified IIIF spec versions and viewer library metadata against primary sources (iiif.io,
  npm registry, GitHub release APIs) on 2026-08-24. Lockfile contains zero IIIF/OSD/Mirador
  entries — greenfield.
- Recommendation: hybrid — OpenSeadragon 6.x as the rendering engine inside eBL-owned React
  components; reject Mirador (MUI 7 + Redux/saga + no TS types); fallback `@samvera/clover-iiif`.

## Verification performed

- `npx craco test --watchAll=false --runInBand --no-coverage --testPathPattern="mediaArchitectureIsolation"`
  -> 2 suites, 47 tests, all passed (~35 s). Sole test execution; not the full suite.
- `yarn lint` / `yarn tsc` not run: no code was changed, so those gates are not triggered.

## Deliverable

`docs/IIIF_FRONTEND_ARCHITECTURE_HANDOFF.md` — 33 sections, 2 Mermaid diagrams,
CONFIRMED/INFERRED/PROPOSED/UNKNOWN evidence labels throughout, ~2,070 lines.
