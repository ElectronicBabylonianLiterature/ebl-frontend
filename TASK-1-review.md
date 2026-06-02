# TASK-1 Review: Dictionary of Realia — Security & Code Audit

**Branch:** `add-realia`  
**Reviewer:** GitHub Copilot  
**Date:** 2026-06-02  
**Round:** 1

---

## Summary

Adds a "Dictionary of Realia" feature: auth scope (`read:realia`), domain model, repository, service, four UI components, routing, and full test coverage. The architecture follows established patterns in this codebase (AfoRegister, Signs). Two security/correctness issues and one code-quality issue were found.

---

## Findings

### S-01 — URL Parameter Injection in `RealiaRepository.search` [HIGH]

**File:** `src/realia/infrastructure/RealiaRepository.ts`, line 83  
**Reproduction Steps:**

1. User types `pig & boar` in the search form.
2. `RealiaSearchForm` correctly encodes to `?query=pig%20%26%20boar` in the URL.
3. `RealiaSearchPage` calls `parse(location.search)` (from `query-string`), which URL-_decodes_ the value back to `pig & boar`.
4. This decoded string is passed to `RealiaService.search('pig & boar')`.
5. `RealiaRepository.search` inserts it raw: `` `/realia?query=${query}` `` → `/realia?query=pig & boar`.
6. The `&` is interpreted by the HTTP client as a query string separator, breaking the request. Any character with URL significance (`#`, `=`, `+`, etc.) produces a malformed or silently wrong URL.

**Code (current):**

```ts
search(query: string): Promise<readonly RealiaEntry[]> {
  return this.apiClient
    .fetchJson<RealiaEntryDto[]>(`/realia?query=${query}`, false)
```

**Recommendation:** Apply `encodeURIComponent`:

```ts
.fetchJson<RealiaEntryDto[]>(`/realia?query=${encodeURIComponent(query)}`, false)
```

Note: `find` already uses `encodeURIComponent` correctly. `AfoRegisterRepository` avoids this because its `query` parameter is a pre-built query string produced by `stringify`, not a decoded user string.

**Test gap:** `RealiaRepository.test.ts` only tests with `'pig'` (plain ASCII). A test case with special characters (e.g., `'pig & boar'`) should be added to catch regressions.

---

### S-02 — API Call Made Before Authorization Check in `RealiaDisplay` [MEDIUM]

**File:** `src/realia/ui/RealiaDisplay.tsx`  
**Reproduction Steps:**

1. A user without the `read:realia` scope navigates directly to `/tools/realia/Pig`.
2. `withData` immediately calls `realiaService.find('Pig')` — the API request is sent before any session check.
3. Only after the response returns (or a 403 is received) does `RealiaEntryDisplay` run the `session.isAllowedToReadRealia()` check and show the login message.

**Contrast with `RealiaSearchPage`:** The search page correctly gates `<RealiaSearch>` (and therefore the API call) inside the `session.isAllowedToReadRealia()` block. Unauthorized users never trigger a search API call. `RealiaDisplay` is inconsistent with this pattern.

**Severity context:** The backend must enforce authorization independently (401/403), so this is not a full bypass. However:

- Unauthorized users generate spurious API requests.
- The client-side "please log in" message is not shown — instead the user sees an error spinner (because the backend returns 403).
- It is inconsistent with the search page's defensive design.

**Recommendation:** Guard the route in `toolsRoutes.tsx` or in a wrapper, so `RealiaDisplay` is only mounted when the user is authorized. The `withData` `filter` option could also be used if the session is passed as a prop.

---

### Q-01 — Array Index Used as React Key for `afoRegister` Entries [LOW]

**File:** `src/realia/ui/RealiaDisplay.tsx`, line 68

```tsx
{entry.afoRegister.map((afoEntry, index) => (
  <div key={index}>
```

Using array index as a key is a React anti-pattern that can cause incorrect reconciliation if the list is ever reordered or filtered. `AfoRegisterEntry` has no `id` field, but a stable composite key is available: `${afoEntry.mainWord}-${afoEntry.AfO}`. If `mainWord + AfO` is not guaranteed unique, `${afoEntry.mainWord}-${afoEntry.AfO}-${index}` provides stability while being better than index alone.

---

## Severity Table

| ID   | Severity | File                                        | Status  |
| ---- | -------- | ------------------------------------------- | ------- |
| S-01 | HIGH     | `realia/infrastructure/RealiaRepository.ts` | ❌ Open |
| S-02 | MEDIUM   | `realia/ui/RealiaDisplay.tsx`               | ❌ Open |
| Q-01 | LOW      | `realia/ui/RealiaDisplay.tsx`               | ❌ Open |

---

## What Has To Be Done

1. **[BLOCKER — S-01]** Fix `RealiaRepository.search`: wrap `query` in `encodeURIComponent`.
2. **[BLOCKER — S-01]** Add a `RealiaRepository.test.ts` test case for `search` with a query containing special characters (e.g. `'pig & boar'`) to assert the encoded URL.
3. **[REQUIRED — S-02]** Move the authorization gate for `/tools/realia/:id` so the `withData` fetch is not triggered for unauthorized users. Preferred approach: session-guard wrapper in `toolsRoutes.tsx` or a `filter` prop on the `withData` call.
4. **[LOW — Q-01]** Replace `key={index}` with a stable composite key for `afoRegister` entries.
5. **[BEFORE MERGE]** Remove `TASK-1-todo.md`, `TASK-1-log.md`, and `TASK-1-review.md` from the repository.
