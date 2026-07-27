# TASK-realia-annotation-candidates — Work Log

Goal: identify short Akkadian texts on ebl.lmu.de suitable for realia
annotation; then narrow to texts that also carry divine, royal and geographical
names. Branch `chore/remove-bluebird`. Research only — no source file changed,
nothing committed.

## Why the API and not the site

`WebFetch` against `https://www.ebl.lmu.de/fragmentarium/search` returns the
bare React shell — the Fragmentarium renders client-side, so there is nothing to
read in the HTML. `api.ebl.lmu.de` does not resolve. The API is mounted on the
same host under `/api`, which `.github/workflows/main.yml:84` pins as
`REACT_APP_DICTIONARY_API_URL=/api`. Every endpoint used here answers
unauthenticated: `/fragments/query`, `/fragments/<number>`, `/words/all`,
`/genres`, `/realia`.

Requests were issued from a throwaway scratchpad script, not from the project.

## Round 1 — "≤ 10 lines, many realia"

### The realia collection cannot drive the query

`/realia?query=vessel` returns entries keyed on German RlA / AfO headwords
(`Gefäß`, `realia_004308`, with `relatedTerms` such as `pot`, `jar`, `Pithos`).
`/realia?query=karpatu` returns `[]`. The realia collection is an
encyclopaedia-side index; it is not joined to Akkadian dictionary lemmas, so it
cannot be used to find _texts_. The corpus-side query has to go through
`/fragments/query?lemmas=…`, which takes dictionary lemma ids.

### Validating lemma ids against `/words/all` was not optional

A first pass hand-wrote 146 Akkadian object lemmas and lost 39 of them. The
cause was orthographic, not lexical: eBL's dictionary normalises `ḫ` to plain
`h`, so `ḫaṣṣinnu` / `ḫurāṣu` / `naḫlaptu` do not exist as ids but
`haṣṣinnu I` / `hurāṣu I` / `nahlaptu I` do. Matching every candidate against
the 20,875 ids from `/words/all` before querying turned that from a silent
recall loss into a corrected list of 174, trimmed to 139 after dropping
homonyms that are not realia (`ellu` "pure", `zēru II` "hate", `šipru` "work",
`arītu II/III` "pregnant woman", `eršu II–IV` "wise", `tāmartu`, `ubānu`,
`qarnu`).

`lemmas` is `+`-joined — from `SearchFormLemma.tsx:99`
(`lemmas.split('+')`), not guessed. Sent in chunks of 25 with
`lemmaOperator=or`; results merged per museum number. 5,948 fragments carry at
least one realia lemma.

### Line counting

`matchingLines` from the query response gives the lines a lemma hit, which
bounds a text from below but cannot prove it is short. So the 2,883 fragments
whose highest matching line was ≤ 12 were fetched individually and counted
properly: only entries with `type === 'TextLine'` count. `SurfaceAtLine`
(`@obverse`), `TranslationLine` (`#tr.en`), `$`-rulings and `@column` headers
are all in `text.lines` and would each have inflated the count.

Fragments were additionally required to have `AKKADIAN`-tagged tokens. That
matters: `BM.69862` scored well on realia (a Ḫḫ X vessel section — water, milk,
beer, oil, ghee, lard) but is `{'SUMERIAN': 30, 'AKKADIAN': 28}`, a bilingual
lexical list rather than an Akkadian text, so it was reported with that noted
rather than ranked at the top.

## Round 2 — adding divine, royal and geographical names

### The annotation layer cannot be a filter

`fragment.namedEntities` was `[]` on every fragment inspected. That is the
point of the request — it is the layer to be populated — so the search had to
recover the same information from the transliteration:

| Entity              | Signal                                     |
| ------------------- | ------------------------------------------ |
| `DIVINE_NAME`       | `{d}`, `{d+}`                              |
| `GEOGRAPHICAL_NAME` | `{ki}`, `{uru}`, `{iri}`, `{kur}`, `{id₂}` |
| `ROYAL_NAME`        | `LUGAL`, `MAN`, `šar-ru`                   |
| `OBJECT_NAME`       | the round-1 realia lemma set               |

The target taxonomy is `fragmentarium/ui/text-annotation/EntityType.ts`, which
also has `BUILDING_NAME`, `WATERCOURSE_NAME`, `MONTH_NAME`, `YEAR_NAME` — worth
knowing, because several candidates turned out to carry those too.

### Choosing a pool

A full sweep was not possible: `/fragments/query?genre=ARCHIVAL` alone reports
108,885 items, and `ARCHIVAL:Administrative` 48,853. (The corpus is well past
the ~25,000 figure in the published descriptions.) The pool was therefore:

- every MONUMENTAL Dedication / Building / Seal inscription / Kudurru /
  Representative fragment — 1,942, fetched in full, on the reasoning that a
  votive or brick inscription is _structurally_ DN + RN + GN + dedicated object;
- plus the 2,716 remaining ≤ 12-line realia hits from round 1.

4,851 fragments total.

### The first scoring pass returned 0 — two real bugs

1. **Scoring off the wrong field.** `line.displayValue` is `null` on these
   fragments; the text lives in the fragment-level `atf` string. Every regex
   was matching against empty strings.
2. **Short MONUMENTAL texts are Sumerian.** Only 61 of 1,942 monumental
   fragments are ≤ 10 lines at all, and the ones that are read `%sux
{d}nin-urta / i₃+bi₂-la kalag-ga {d}en-lil₂` — Ur III and Sargonic royal
   inscriptions. Requiring Akkadian removes nearly all of them.

Fixed by scoring the `atf` body lines (`^\d+'?\. `), skipping `%sux`-only texts,
and requiring ≥ 5 Akkadian tokens. 290 fragments then matched ≤ 10 Akkadian
lines with all three of DN, GN and RN present.

### Verification

Every reported museum number was re-requested (`/fragments/<n>` → 200) and its
transliteration read, rather than trusting the score. That is what surfaced the
two caveats that matter:

- In Neo-Babylonian archival texts the `{d}` count is inflated by theophoric
  personal names — `{m}{d}+AG-NIG₂.DU-URU₃` is one `PERSONAL_NAME` span, not a
  divine name. Only `BM.38770`, `NCBT.1121`, `BM.55655`, `BM.33550` and
  `K.7852` carry free-standing divine names.
- `NZK.set.10` scored highest of anything found (5 lines: Sennacherib, Kalḫu,
  Til-Barsip, Assyria, a cypress writing-board, a limmu-eponym) but its museum
  is `HYPERURANION` — an eBL virtual colophon-type record, not a physical
  tablet. Excluded from the recommendation rather than quietly reported.

### Result

`BM.38770` — Nabonidus' dedication of a _paššūru_ table to Ištar — is the best
single answer: DN (Ištar/Bēlet), RN (Nabû-naʾid), GN (Babylon), BN (Esagil,
Ezida) and four realia (`paššūru`, `musukkannu` wood, silver, gold) in ten
lines, with the realia as the subject of the text. Runners-up, all verified:
`NCBT.1121`, `BM.55655`, `GCBC.146`, `YBC.9274`, `BM.62602`, `BM.33550`,
`K.7852`.

## Pre-existing issues

One candidate surfaced and was investigated to root cause:

- **`.env.local` contains live secrets** (a MongoDB connection string with
  credentials for `badwcai-ebl01.srv.mwn.de`, and a GitGuardian PAT). Read
  incidentally while locating the API base URL.
  **Root cause / resolution: not a defect.** `.gitignore:14` lists `.env.local`,
  `git check-ignore -v .env.local` confirms the rule matches, and
  `git ls-files --error-unmatch .env.local` confirms the file is untracked. The
  secrets are local-only and have never been committed. No change made.
  (Rotation is still the user's call, but nothing in the repo is wrong.)

No other failing test, lint error, type error, console noise or broken build was
surfaced by this task.

## Gates

- **No codebase change.** The `yarn lint`, `yarn tsc` and
  `yarn test --watchAll=false` gates are conditioned on a code change; none was
  made, so none was triggered. The two files added by this task are `.md` task
  documents mandated by the _Task Tracking and Cleanup_ section, not scripts —
  the 250-line `.ts`/`.tsx` ceiling does not apply to them.
- **Nothing committed, no branch created, no push.** Not requested.
- **Cleanup owed:** remove `TASK-realia-annotation-candidates-todo.md` and
  `TASK-realia-annotation-candidates-log.md` before any PR carrying them is
  merged.
