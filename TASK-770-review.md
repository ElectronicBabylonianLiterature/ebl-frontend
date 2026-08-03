# Summary

Review resolution for PR #770 on branch `fix-n-calls`.

- Repository: `ElectronicBabylonianLiterature/ebl-frontend`
- PR: #770
- URL: `https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/770`
- Current local head: `fa89bbb5`
- GitHub collection used the connector because `gh` is not installed in the workspace.

# Findings

- Latest Additions N+1 optimization does not currently reduce live frontend calls because `/fragments/latest` is reported to return minimal items only. Tests must be aligned with repository-producible shapes and current behavior must be described truthfully.
- Line searches use exact totals but exact mode is reported to return `hasNextPage: null`, disabling ordinary Next navigation.
- Full suite emits an `act(...)` warning in `FragmentariumSearch.test.tsx` from a `withData` state update.
- Diff coverage and affected-code coverage need restoration for changed branches.
- Still-active tests were deleted, including “Did you mean”, Corpus tab rendering, and `#corpus` URL update coverage.
- `src/fragmentarium/ui/search/FragmentariumSearchResult.test.tsx` exceeds 250 lines.
- CDLI image default selection uses a different predicate from the rendered navigation item.
- Canonical domain literals remain in application code.
- Empty-page redirect makes the explicit empty-page UI unreachable in routed behavior.
- Page-size query updates re-encode unrelated query-string values.
- Earlier review findings around lemma examples, image revisit refetching, URL encoding, canonical behavior, and caching need verification and fixing where still applicable.

# Severity

- High: line-search pagination Next disabling.
- High: Latest Additions N+1 claim/test mismatch and current hydration behavior.
- High: full-suite console noise.
- Medium: affected-code coverage gaps.
- Medium: deleted still-relevant tests.
- Medium: 250-line ceiling violation.
- Medium: CDLI default-tab predicate mismatch.
- Low/Info: canonical-domain duplication, empty-page behavior, query-string preservation, and still-applicable older findings.

# Reproduction Steps

- Initial repository inspection completed against `master...HEAD`.
- Previous local full-suite run reproduced `Warning: An update to ComponentWithData inside a test was not wrapped in act(...)` during `src/fragmentarium/ui/search/FragmentariumSearch.test.tsx`.
- Further focused reproduction steps will be updated as fixes are implemented.

# Recommendation

- Implement frontend-only fixes for all valid local issues.
- Record backend-dependent behavior truthfully instead of fabricating missing data.
- Run the required validation gates before final handoff.

# Comment Status

| reviewer/comment                                                                             | type                            | original status   | current status                                          | outdated? | resolution                                                                                 |
| -------------------------------------------------------------------------------------------- | ------------------------------- | ----------------- | ------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `chatgpt-codex-connector` on `FragmentLemmaLines.tsx`: capped lemma sample reported as total | inline automated review comment | resolved          | outdated but still applicable until verified            | yes       | Verify current lemma example wording and line cap, fix if still present.                   |
| `chatgpt-codex-connector` on `LatestTransliterations.tsx`: hydrate before record dates       | inline automated review comment | resolved          | outdated but still applicable conceptually              | yes       | Remove misleading summary optimization unless backend contract supplies record-ready data. |
| `chatgpt-codex-connector` review at commit `974e66869f`                                      | submitted review                | commented         | superseded by later reviews                             | yes       | Earlier two inline comments tracked above.                                                 |
| `khoidt` review on 2026-07-28                                                                | submitted review                | changes requested | mostly outdated but applicable findings carried forward | partially | Re-check all listed findings and resolve those still present.                              |
| `khoidt` review on 2026-07-30                                                                | submitted review                | changes requested | current                                                 | no        | Resolve all blockers and hard gates from this review.                                      |

# What Has To Be Done

1. Resolve current blockers: line-search pagination, Latest Additions truthfulness, and `act(...)` warning.
2. Resolve hard gates: coverage, deleted test coverage, and 250-line file.
3. Resolve still-applicable smaller findings: CDLI predicate mismatch, canonical-domain literals, empty-page routed behavior, page-size query preservation, lemma example consistency, image-tab revisit behavior, fragment URL/canonical handling, and cache audit.
4. Pass lint, TypeScript, full test suite, coverage, console-clean, file-length, local app, and diff-integrity validation.
5. Request reviewer re-review after local changes are ready.
