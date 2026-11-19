# TASK chapter-edit-lite: TODO

Goal: make the corpus chapter edit page load in seconds for large chapters.
This repository holds the page; the new endpoints are in ebl-api.

## Done

- [x] Route `/corpus/:genre/:category/:index/:stage/:chapter/edit-lite`
- [x] Data sources: legacy (existing endpoints, read-only) and api (new)
- [x] Shared blocks: lazy ATF editor, line panel, per-line state
- [x] Version A: accordion
- [x] Version B: pages
- [x] Version C: split view
- [x] Version D: inline score
- [x] Manuscripts tab (dry run)
- [x] `yarn lint`
- [x] `yarn tsc`
- [x] `yarn test:ci` with zero console output
- [x] Production build against the live API
- [x] Measurements and screenshots against production

## Open

- [ ] Pick one version
- [ ] Permission to commit and push

## Later tasks

- [ ] Remove the three versions that are not chosen and the switcher
- [ ] Add and delete for lines, variants and manuscript lines
- [ ] Import tab and real saving in the Manuscripts tab
- [ ] Alignment and lemmatization per open line
- [ ] Replace the classic edit page and remove the legacy source

## Before merge

- [ ] Remove `TASK-chapter-edit-lite-todo.md`
- [ ] Remove `TASK-chapter-edit-lite-log.md`
