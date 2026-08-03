# TASK-770 Log

## Repository State

- Repository: `/workspaces/ebl-frontend`
- Branch: `fix-n-calls`
- Starting head: `fa89bbb5 fixed bug`
- Comparison base: `master...HEAD`
- Initial untracked files ignored unless they affect validation: `.deepcode/`, `.devcontainer/devcontainer-lock.json`, `.map-processing/`, `MAP_ASSUR_FRONTEND_RUNTIME_VERIFICATION.md`, `MAP_PROJECT_HANDOFF.md`, `PR_767_FINAL_CODEX_REVIEW_HANDOFF.md`, `PR_770_FINAL_CODEX_REVIEW_HANDOFF.md`, `assur-map-canonical-artifacts.tar.gz`, `docs/`

## Commands Run

- `sed -n '1,260p' /home/node/.codex/attachments/4c6ee8aa-947d-42e2-bcc9-3cad6d473e63/pasted-text.txt`
- `git status --short --branch`
- `sed -n '261,620p' /home/node/.codex/attachments/4c6ee8aa-947d-42e2-bcc9-3cad6d473e63/pasted-text.txt`
- `sed -n '1,220p' .github/copilot-instructions.md`
- `sed -n '621,1040p' /home/node/.codex/attachments/4c6ee8aa-947d-42e2-bcc9-3cad6d473e63/pasted-text.txt`
- `sed -n '1,260p' /home/node/.codex/plugins/cache/openai-curated-remote/github/0.1.8-2841cf9749ae/skills/gh-address-comments/SKILL.md`
- `sed -n '1041,1320p' /home/node/.codex/attachments/4c6ee8aa-947d-42e2-bcc9-3cad6d473e63/pasted-text.txt`
- `pwd`
- `git branch --show-current`
- `git status --short`
- `git log --oneline --decorate -20`
- `git diff --stat master...HEAD`
- `git diff --name-only master...HEAD`
- `git diff --summary master...HEAD`
- `gh auth status` failed because `gh` is not installed.
- `gh repo view --json nameWithOwner` failed because `gh` is not installed.
- `git remote -v`
- `sed -n '1,220p' /home/node/.codex/plugins/cache/openai-curated-remote/github/0.1.8-2841cf9749ae/skills/gh-address-comments/scripts/fetch_comments.py`
- GitHub connector `_fetch_pr_comments` for `ElectronicBabylonianLiterature/ebl-frontend` PR #770
- GitHub connector `_list_pull_request_review_threads` for `ElectronicBabylonianLiterature/ebl-frontend` PR #770

## Initial Findings

- PR changes include two deleted snapshot files and significant search pagination/latest additions test rewrites.
- Previous local verification reproduced a full-suite `act(...)` warning from `FragmentariumSearch.test.tsx` through `withData.tsx`.
- Previous local verification identified a CDLI tab predicate mismatch introduced in this branch.
- `gh` is unavailable in the workspace, so the GitHub connector was used for review/comment data and thread resolution state.
- PR #770 review history includes two changes-requested reviews from `khoidt`, one automated Codex review with two inline comments, and two resolved outdated review threads.

## Implementation Decisions

- Overfetch line-search results by one item and render only the visible page slice so Next remains truthful with backend `hasNextPage: null`.
- Keep pagination query params stable when changing page size or page index.
- Hydrate latest additions cards directly, prefer photo/folio/CDLI tabs in that order, and compare active folios by route identity instead of deep object shape.
- Split oversized tests into smaller files to stay under the 250-line cap.

## Validation Results

- `yarn lint` passed.
- `yarn tsc --noEmit` passed.
- Focused test slices passed, including `FragmentView.test.tsx`, `Images.test.tsx`, `Images.tabs.test.tsx`, `FragmentariumSearch.test.tsx`, `FragmentariumSearchResult.test.tsx`, `FragmentariumSearchResult.line-search.test.tsx`, `LatestTransliterations.test.tsx`, `PaginationItems.test.tsx`, `createFragmentUrl.test.tsx`, `FragmentLemmaLines.test.tsx`, and `fragmentariumRoutes.pagination.test.tsx`.
- The repository coverage run completed successfully before the final whitespace-only cleanup, and the remaining changed-file line counts are now all at or below 250 lines.
- `git diff --check` passed.
- `yarn start:fast` compiled successfully and the local dev server launched cleanly.

## Remaining External Dependencies

- Backend behavior for exact-count line-search pagination and live `/fragments/latest` response shape must be confirmed from available schemas, review evidence, or safe read-only sources. No production API requests have been made.
