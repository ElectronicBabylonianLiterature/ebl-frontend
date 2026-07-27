# API prompt — fetch NCBT.1121's annotation data to settle the realia-preview report

Paste the **Prompt** section into an agent working in the **`ebl-api`** repo
(`ElectronicBabylonianLiterature/ebl-api`), on branch
**`add-realia-annotation-api`** (the branch that adds the realia annotation
layer and `realiaInfo`). It is self-contained.

Its job is only to **fetch and report** the fragment's data, not to change code.
The frontend side is already proven: the read-only display preview
(`Display` → `NamedEntityPreviewProvider` → `createFragmentAnnotationSpans` →
`NamedEntityPreviewToken`) renders **both** named-entity and realia tags, and a
faithful render of NCBT.1121's exact payload with realia attached shows 9 entity
tags **and** the realia tags. So if the browser shows only named-entity tags on
`http://localhost:3000/library/NCBT.1121`, the question is entirely **what the
fragment payload contains** — which this prompt answers.

---

## Prompt

### Context

- Frontend PR: the read-only fragment **display** rebuilds annotation tags
  client-side from the fragment payload. It builds realia spans by matching each
  word token's `realia` id array against the fragment's `realia` annotation list
  (`word.realia[]` → `fragment.realia[].id`), exactly as it builds named-entity
  spans from `word.namedEntities[]` → `fragment.namedEntities[].id`.
- Symptom: on `library/NCBT.1121` the preview toggle shows named-entity tags but
  **no realia tags**.
- The frontend renders realia whenever the payload carries them, so this is a
  question about the **data** for NCBT.1121, not the client.

There are exactly three possible data states, and they need different fixes:

1. **No realia at all** — `fragment.realia` empty and no token carries `realia`.
   → nothing to render; expected, not a bug. (The public `ebl` DB is in this
   state: NCBT.1121 there has 9 named entities and 0 realia.)
2. **Annotations present but tokens un-stamped** — `fragment.realia` is
   non-empty, but the word tokens in `fragment.text` have empty/absent `realia`
   arrays. → the client joins on `word.realia`, so it renders nothing. This is a
   real, display-visible failure caused by stale data (spans stored before the
   token-stamping path existed, or a stamping bug).
3. **Both present** — `fragment.realia` non-empty **and** the referenced tokens
   carry matching `realia` ids. → the payload is correct; the fault is elsewhere
   (client CSS/visual), and this prompt should say so.

### Step 1 — identify the database

The local frontend fetches from `REACT_APP_DICTIONARY_API_URL=http://localhost:8001`,
and the local API's `MONGODB_URI` points at the shared `ebldev` database on the
BAdW cluster. Confirm which DB name the running API is bound to
(`MONGODB_DB` / the connection string), and run every query below against **that**
database. The bug can only be diagnosed against the DB the frontend actually reads,
which is very likely `ebldev`, **not** the public `ebl` DB.

### Step 2 — fetch the fragment over HTTP (the exact bytes the client sees)

Run the API on `add-realia-annotation-api` and hit the two routes the frontend
uses, with a valid bearer token:

```sh
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/fragments/NCBT.1121 > ncbt1121.json

# A) fragment-level annotation lists + derived display info
jq '{namedEntities, realia, realiaInfo}' ncbt1121.json

# B) every text-line word token that carries either annotation kind
jq '[.text.lines[] | select(.type=="TextLine") | .content[]?
     | .. | objects | select(has("id") and (.namedEntities or .realia))
     | {value, id, namedEntities, realia}]' ncbt1121.json

# C) the editor's span endpoint, which computes spans server-side from the tokens
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/fragments/NCBT.1121/named-entities | jq .
```

Report the full output of A, B and C verbatim. (B walks nested `parts`/`tokens`
so it also catches determinatives and inner tokens.)

Classify the result against the three states above and say which one it is:

- `realia` empty in A **and** no realia in B → **State 1** (expected; no bug).
- `realia` non-empty in A but B shows those tokens with `realia: null`/absent, and
  C returns realia spans with **empty `span` arrays** → **State 2** (real bug).
- `realia` non-empty in A and B shows tokens carrying the matching ids, and C's
  realia spans have non-empty `span` arrays → **State 3** (payload correct; the
  problem is client-side).

### Step 3 — read the stored document directly (bypass serialization)

To distinguish "the data is wrong in Mongo" from "serialization drops it", read
the raw document:

```js
db.fragments.findOne(
  {
    'museumNumber.prefix': 'NCBT',
    'museumNumber.number': '1121',
    'museumNumber.suffix': '',
  },
  {
    namedEntities: 1,
    realia: 1,
    'text.lines.content.id': 1,
    'text.lines.content.namedEntities': 1,
    'text.lines.content.realia': 1,
  },
)
```

Compare the stored `realia` on tokens against the stored top-level `realia`
annotation list. In a healthy document, for every `RealiaEntity` in the top-level
`realia`, at least one word token's `realia` array contains that entry's `id`
(e.g. `"Realia-1"`) — this is the invariant the token stamping in
`ebl.transliteration.domain.text.set_named_entities` /
`_map_spans_by_token` (`token_map[token_id].append(span.id)`) is supposed to hold.

### Step 4 — if State 2 (annotations present, tokens un-stamped)

Confirm the cause and repair the data, do not mask it:

1. Check whether re-running the save re-stamps the tokens. The write path is
   `NamedEntityResource.on_post` → `FragmentUpdater.update_named_entities` →
   `Fragment.set_named_entities(entity_spans, realia_spans)` →
   `Text.set_named_entities(...)`, persisted by
   `update_field("named_entities", ("text", "named_entities", "realia"))`. POST the
   current spans back (they are returned by `GET …/named-entities`) and re-fetch;
   the tokens should now carry `realia`.
2. If a re-save does **not** stamp the tokens, the bug is in
   `set_named_entities` / `_map_spans_by_token` for the realia branch — fix it so
   realia spans stamp `token.realia` exactly as entity spans stamp
   `token.named_entities`, add a test that asserts the token-vs-list invariant for
   realia, and provide a one-off migration that re-stamps existing fragments whose
   top-level `realia` is non-empty but whose tokens are un-stamped.

### Step 5 — report

State which of the three cases holds for NCBT.1121 in the DB the frontend reads,
paste the A/B/C outputs and the raw `findOne`, and — only if State 2 — the root
cause and the fix/migration. If State 1, say plainly that the fragment has no
realia annotations and the preview is behaving correctly. If State 3, say the
payload is correct and hand the investigation back to the client (CSS cascade).
