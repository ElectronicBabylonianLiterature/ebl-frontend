# TASK-REALIA-BREADCRUMB-TOOLS — Work Log

## 1. Investigation

Realia entry page breadcrumbs are set in `src/realia/ui/RealiaDisplay.tsx`:

```tsx
crumbs={[new SectionCrumb('Realia'), new TextCrumb(entry.id)]}
```

`Breadcrumbs` (`src/common/ui/Breadcrumbs.tsx`) auto-prepends `eBL`, so the entry
page rendered `eBL > Realia > {entry}` — no "Tools".

The Realia search/landing page (`/tools/realia`) renders inside the `Tools`
component, whose crumbs come from `getToolsBreadcrumbs` in
`src/router/toolsConfig.tsx`: `[new SectionCrumb('Tools'), new TextCrumb('Realia')]`
-> `eBL > Tools > Realia`. So the entry page was inconsistent with its own search
page and with the tools hierarchy.

`SectionCrumb.SECTIONS` already maps `Tools -> /tools` and `Realia ->
/tools/realia`, so both crumbs link correctly with no other change.

Note: `SignDisplay` / `WordDisplay` also omit "Tools" (a pre-existing
inconsistency for those tools), but this task is scoped to Realia only.

## 2. Fix

`RealiaDisplay.tsx` — prepend the Tools crumb:

```tsx
crumbs={[
  new SectionCrumb('Tools'),
  new SectionCrumb('Realia'),
  new TextCrumb(entry.id),
]}
```

Result: `eBL > Tools > Realia > {entry.id}`, with Tools linking to `/tools` and
Realia to `/tools/realia`. The same `AppContent` wraps both the normal entry view
and the redirect view, so both get the corrected breadcrumb.

## 3. Tests

Updated the breadcrumb test in `RealiaDisplay.test.tsx` to assert the Tools crumb
links to `/tools`, the Realia crumb links to `/tools/realia`, and the entry id is
the active crumb.

## 4. Gates

- `yarn tsc`: clean.
- `yarn lint`: clean.
- Full `yarn test --watchAll=false`: 333 suites / 3377 passed, 2 pre-existing
  skips, 0 failures, zero console output.
- Line counts: `RealiaDisplay.tsx` (214) and `RealiaDisplay.test.tsx` (241) under
  the 250-line gate.

## 5. Pre-existing issues found

None while working (the SignDisplay/WordDisplay "Tools" omission is noted as
out-of-scope, not a regression introduced here).
