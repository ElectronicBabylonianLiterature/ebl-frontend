# TASK-realia-annotation-candidates — TODO

Task: find Akkadian texts on ebl.lmu.de that are (1) ≤ 10 lines and (2) rich in
realia to annotate. Follow-up requirement: ideally also carrying divine names,
royal names, and geographical names.

Research-only task. No source file changed. See
`TASK-realia-annotation-candidates-log.md` for the reasoning and the caveats.

## Access

- [x] Establish how to query eBL without the SPA. `WebFetch` on
      `www.ebl.lmu.de/fragmentarium/*` returns the empty React shell, and
      `api.ebl.lmu.de` does not resolve (`ENOTFOUND`). → the API is served at
      `https://www.ebl.lmu.de/api`, per `REACT_APP_DICTIONARY_API_URL=/api` in
      `.github/workflows/main.yml`.
- [x] Confirm the endpoints used here are readable unauthenticated:
      `/fragments/query`, `/fragments/<number>`, `/words/all`, `/genres`,
      `/realia`. → all 200.

## Round 1 — realia density

- [x] Build the realia vocabulary. `/realia?query=…` is keyed on German RlA /
      AfO headwords (`Gefäß`, `Keramik`), not Akkadian lemmas, so it cannot
      drive a corpus query. → hand-built ~140 Akkadian object lemmas instead.
- [x] Validate every lemma against `/words/all` (20,875 ids) rather than
      guessing id spelling. → caught that eBL normalises `ḫ` → `h`
      (`haṣṣinnu I`, `hurāṣu I`), which silently dropped 39 candidates.
- [x] Drop homonyms that are not realia (`ellu` "pure", `zēru II` "hate",
      `šipru` "work", `arītu` "pregnant woman", …) so they do not inflate the
      score.
- [x] Query `/fragments/query?lemmas=<a>+<b>+…&lemmaOperator=or` in chunks of
      25 (the param is `+`-joined, per `SearchFormLemma.tsx:99`). → 5,948
      fragments with at least one realia hit.
- [x] Shortlist on `matchingLines` (≤ 12) and fetch the fragments to get the
      true line count. `matchingLines` alone cannot prove a text is short.
- [x] Count only `type === 'TextLine'` entries — `SurfaceAtLine`,
      `TranslationLine`, rulings and `$`-lines are not text lines.
- [x] Require `AKKADIAN`-tagged tokens so Sumerian and lexical Sumerian columns
      do not pass as "Akkadian text".

## Round 2 — DN + RN + GN as well

- [x] Check whether the annotation layer can be queried directly.
      → `fragment.namedEntities` is `[]` on every fragment inspected; that is
      exactly the layer the user is about to populate, so it cannot be a filter.
- [x] Confirm the target entity taxonomy from
      `fragmentarium/ui/text-annotation/EntityType.ts`: `DIVINE_NAME`,
      `ROYAL_NAME`, `GEOGRAPHICAL_NAME`, `OBJECT_NAME`, plus `BUILDING_NAME`,
      `WATERCOURSE_NAME`, `MONTH_NAME`, `YEAR_NAME`, `PERSONAL_NAME`.
- [x] Detect the three name classes from the transliteration instead:
      `{d}` / `{d+}` → DN, `{ki}` `{uru}` `{iri}` `{kur}` `{id₂}` → GN,
      `LUGAL` / `MAN` / `šar-ru` → RN.
- [x] Pick a pool that is fetchable. `ARCHIVAL` alone is 108,885 fragments, so
      a full sweep was out. → all MONUMENTAL dedications / bricks / seals /
      kudurrus (1,942) + the ≤ 12-line realia hits from round 1 (2,716 more),
      giving a 4,851-fragment pool.
- [x] Fix the first scoring pass, which returned 0 matches. Two causes, both
      real: `line.displayValue` is `null` on these fragments (the fragment-level
      `atf` field carries the text), and short MONUMENTAL texts are
      overwhelmingly Sumerian (`%sux`). → score off `atf`, skip `%sux`-only.
- [x] Verify every reported museum number resolves (`/fragments/<n>` → 200).
- [x] Read the transliteration of every reported candidate rather than trusting
      the score.

## Reporting caveats — stated, not suppressed

- [x] Flag that in Neo-Babylonian archival texts most `{d}` occurrences sit
      inside personal names (`{m}{d}+AG-NIG₂.DU-URU₃`), which annotate as
      `PERSONAL_NAME`, not `DIVINE_NAME`. Only BM.38770, NCBT.1121, BM.55655,
      BM.33550 and K.7852 carry free-standing divine names.
- [x] Flag that `NZK.set.10` — the densest hit of all — has museum
      `HYPERURANION`, i.e. an eBL virtual colophon-type record, not a physical
      tablet. Excluded from the table.
- [x] Flag that all round-1 picks except BM.75363 are broken fragments, so the
      line counts are preserved lines, not original tablet length.
- [x] Flag that the realia vocabulary is hand-built, so recall is bounded by it.

## Gates (per `.github/copilot-instructions.md`)

- [x] No codebase change → `yarn lint` / `yarn tsc` / `yarn test` gates not
      triggered. Nothing was edited, so nothing can regress.
- [x] Pre-existing issues surfaced while working: one candidate, resolved as a
      non-issue — see the log.
- [x] Task TODO + log `.md` files created (this file and the log).
- [ ] Remove both `.md` files before any PR that carries them is merged.
