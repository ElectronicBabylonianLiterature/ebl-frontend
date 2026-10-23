# Media v5 review

## Scope and findings

Reviewed PR #839 at `fbf78d3deb589bb6a16e31e368efa921e6cdb8b0` with the
user-supplied v5 pipeline.
Six fresh-context discovery passes were followed by separate adjudication,
implementation and fresh verification.

- B-F1: isolate provider tests from the inherited rollout flag and restore its
  original value.
- D-02: select thumbnails from the canonical domain size order.
- U-F1 and U-F2: improve inherited copyright and latest-card secondary text
  contrast.

The four-source-file patch has SHA-256
`ad6d471dbde456dfb4c53cc8e78ffbc7bcfc586db9d534d5669569c6eb7ffdeb`.
No gallery activation, production operation or PR merge is part of this change.

## Verification

Whole-project lint and TypeScript checks pass. Implementation verification ran
three selected suites with
13 passing tests and 100% coverage of the affected executable modules. Fresh
verification repeated the provider
cases with the inherited flag unset and enabled, checked thumbnail ordering, and
ran six consumer suites with
33 passing tests and no console warnings or errors.

Focused coverage-enabled commands retain the repository configuration and exit 1
because unrelated global
coverage thresholds lack full-suite data. These are passing behavioral
assertions, not a full coverage-gate pass.
Fresh verification's six-suite selection alone covers seven of eight thumbnail
branches; its independent
no-thumbnail control is separate from Istanbul coverage. The implementation's
wider affected-module controls
provide the reported 100% coverage. Full suites remain delegated to CI, which
was not polled or awaited.

Chromium measured copyright contrast at 7.4552:1 on white and card text at
7.0725:1 on the inherited card background.
The browser fixture uses actual inherited styles and source-equivalent markup.
Fourteen unchanged consumers and
configuration files establish the selector/inheritance comparison; this is not a
deployed full-app claim.

The source manifest's embedded digest describes the payload before its own field
was inserted. Fresh verification
recorded the actual manifest file hash separately and checked every source-file
hash and the patch hash directly.
The final portable review record and publication receipt are maintained by the
coordinator after this task record.

## What Has To Be Done

1. Let CI complete its full suites and required coverage gates; obtain normal
   maintainer approval.
2. Remove temporary TASK files before merge, retaining rollout guidance in
   README and the PR.
3. Keep the gallery disabled until the compatible backend and separately
   authorized migration are verified.
