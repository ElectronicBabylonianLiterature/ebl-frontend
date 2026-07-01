# TASK-REALIA-QUERY-ENCODE — Encode Realia search query (review comment by Fabdulla1)

## Scope

PR #743. Reviewer **Fabdulla1** noted that `RealiaRepository.search` builds
`/realia?query=${query}` with the raw query. Reserved characters (`&`, `#`, `+`,
`=`, `/`), spaces, and Unicode are not encoded, so e.g. `pig & cow` is sent as
`query=pig ` plus a stray `cow` parameter. Fix: encode like the rest of the
codebase and add tests to harden behavior.

## TODO

- [x] Read `.github/copilot-instructions.md` and follow it.
- [x] Investigate: confirm `search()` interpolates the raw query; find the
      codebase encoding convention.
- [x] Confirm convention: `WordRepository` uses
      `/words?query=${encodeURIComponent(query)}` (same pattern to reuse).
- [x] Fix `RealiaRepository.search` to `encodeURIComponent(query)`.
- [x] Add hardening tests (reserved chars, spaces, Unicode) asserting the exact
      encoded URL passed to `fetchJson`.
- [x] Confirm the existing simple-query delegation test still passes unchanged.
- [x] Gates: `yarn tsc`, `yarn lint`, full `yarn test --watchAll=false`.
- [x] Keep files under the 250-line gate.
- [ ] Create/maintain these TASK `.md` files (corrected: initially missed).
- [ ] Remove `TASK-REALIA-QUERY-ENCODE-*.md` before the PR is merged.
