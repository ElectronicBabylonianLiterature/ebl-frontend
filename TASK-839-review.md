# PR #839 scoped code review — 2026-10-23

## Summary
Reviewed the authenticated frontend media gallery PR against current frontend instructions, the uploaded v5 review protocol and the backend PR #786 HTTP/DTO contract. Review unit: initial head b9825eeb21706a1db8b0e7bd91e4257acc34736d, with targeted repair committed on the same existing branch. This is a **scoped source/contract review**, not a fully machine-attested or browser-executed v5 review.

Five review perspectives were maintained: (1) integration/contract planning, (2) UI/lifecycle planning, (3) runtime/auth/security review, (4) regression/test-oracle review and (5) final source/negative audit. The route-planning plugin does not execute agents, so these are analytical roles rather than separately launched agent instances.

## Findings
**F1 — New media thumbnail HTTP 404 discarded a valid legacy fallback.** A fragment search/latest card with legacyHasPhoto=true and a well-formed mediaSummary.primary mounted LoadedThumbnail. If the authenticated new thumbnail endpoint returned 404 (e.g., a missing preview in a partial migration), the catch silently ignored the failure. Since SummaryThumbnail then had neither image bytes nor a fallback URL, it rendered nothing even though the caller had supplied a legacy-photo element. Both affected user journeys use FragmentCardThumbnail -> MediaSummaryThumbnail.

**Disposition:** Fixed by exposing fallback only for 404, not for access-denied or other failures. Direct and composed regression tests added.

**Additional checks:** Verified from source that requests reconstruct fragment-scoped URLs instead of dereferencing response URLs; 401/403 list responses remain errors, search summary URLs are matched against generated routes, SVG is not rendered inline, the binary loader has a four-slot limiter, and thumbnail pagination has a 12-item window. These are scoped source observations, not a proof of complete runtime safety.

## Severity
F1: **P2 / medium** — affects search/latest preview availability for partially migrated fragments with an otherwise usable legacy thumbnail; main fragment gallery and original binary are not directly modified.

## Reproduction Steps
1. With the gallery enabled, render a fragment card carrying legacyHasPhoto=true and a valid mediaSummary.primary.small thumbnail.
2. Supply a legacy thumbnail service returning a raster Blob; make the new binary loader reject with ApiError(404).
3. At the original head, the card mounts LoadedThumbnail and never renders LegacyThumbnail because its catch swallows the rejection. The resulting summary element is empty.
4. After the correction, LoadedThumbnail renders its supplied fallback, and FragmentCardThumbnail retrieves the legacy binary. A separate existing denied-access test checks that 401/403 must not trigger fallback.

These steps are source and Jest-fixture claims; the new Jest cases have not been executed locally.

## Recommendation
Keep the 404-only fallback and regression coverage; require a clean checkout to run lint, type checking and complete Jest CI commands. Independently validate integration and application/browser behavior with backend API enabled before rollout. Do not activate the build flag or run a production migration as part of this PR review.

## Review feedback status
- Existing inline threads: **0 unresolved / 0 resolved** when collected.
- Existing submitted review events: **0** when collected.
- Existing PR conversation: one earlier Codex review status comment at an older head (no findings).
- New review-specific findings: F1 fixed in branch code; no public inline comment posted.
- Final CI on final SHA: not attested by this document.

## What Has To Be Done
1. Run `yarn lint`, `yarn tsc`, and `yarn test:ci` in the correct Node/Yarn environment; repair any failures/noise rather than suppressing them.
2. Check GitHub CI, CodeQL, GitGuardian and reviewer comments on the final pushed SHA; request maintainer review.
3. Test an actual authenticated media/list/blob flow and legacy 404 fallback before enabling the gallery.
4. Complete the v5 clean-checkout evidence record or label its verification scope incomplete.
5. Remove the temporary TASK-839 TODO/log/review files before merge after preserving required evidence elsewhere.
