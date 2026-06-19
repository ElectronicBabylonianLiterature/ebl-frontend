# TASK-REALIA-CRUMB — Make the "Realia" breadcrumb a link

## Problem

On a Realia entry page the "Realia" breadcrumb was plain text, not a link.

## Root cause

`SectionCrumb.SECTIONS` had no `Realia` entry, so `SectionCrumb('Realia').link`
returned `null` and the crumb rendered as inactive text.

## Plan

- [x] Add `['Realia', '/tools/realia']` to `SectionCrumb.SECTIONS`.
- [x] Add a Breadcrumbs test asserting the Realia crumb links to /tools/realia.
- [x] yarn lint / yarn tsc clean.
- [x] yarn test --watchAll=false — only pre-existing unrelated failures.
- [ ] Remind to remove TASK-REALIA-CRUMB-\*.md before merge.
