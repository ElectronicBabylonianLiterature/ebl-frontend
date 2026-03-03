# Backend Copilot Prompt — Proper Noun Create Endpoint Contract

Context:

- Frontend: `ebl-frontend` PR #678 (`create-proper-nouns` branch).
- Endpoint in use: `POST /words/create-proper-noun`.
- Runtime issue observed in frontend after successful request flow:
  - `Cannot read properties of null (reading '_id')`
- This indicates backend occasionally returns an invalid payload (`null` or non-Word shape), while frontend expects a full `Word` document.

Please verify backend implementation in `ebl-api` PR #677 and ensure the endpoint contract is stable and explicit.

## Required backend behavior

1. `POST /words/create-proper-noun` must return HTTP `201` and a **full created Word document** (not `null`, not only ID, not empty body).
2. Response must always include at least:
   - `_id` (string)
   - `lemma` (string array)
   - `pos` (string array)
3. On creation failure or invalid state, return a proper error response (4xx/5xx) rather than `201` with invalid body.
4. Add/adjust tests to guarantee payload shape on success.

## Suggested backend checks

- In web resource handler for `create-proper-noun`:
  - after repository/service create call, fetch the created word by ID,
  - if fetch fails or is `None`, return an error status (e.g. `500` or `404` depending on policy),
  - otherwise return `201` with serialized full word.
- Ensure repository/service methods do not swallow failures and return `None` on successful HTTP status.

## API contract note

Frontend is now guarded against invalid responses, but the expected contract remains: **success => complete Word object**.
Please align backend implementation and tests accordingly.
