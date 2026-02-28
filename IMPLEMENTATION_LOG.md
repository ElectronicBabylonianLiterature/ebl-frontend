# Proper Noun Creation Endpoint - Implementation Log

**Date:** February 10, 2026  
**Branch:** create-proper-nouns  
**Task:** Implement proper noun creation endpoint to persist newly created proper nouns

## Summary of Changes

This document details the implementation of the proper noun creation feature, which allows users to create and save new proper nouns through the `ProperNounCreationPanel` component.

## Files Modified

### 1. [WordRepository.ts](src/dictionary/infrastructure/WordRepository.ts)

**Change:** Added `createProperNoun()` method to handle API POST requests for creating new proper nouns.

**Implementation:**

```typescript
createProperNoun(lemma: string, posTag: string): Promise<Word> {
  return this.apiClient.postJson(`/words/create-proper-noun`, {
    lemma,
    posTag,
  })
}
```

**Details:**

- Uses existing `apiClient.postJson()` method for HTTP POST requests
- Sends lemma and posTag as request body
- Returns a Promise resolving to Word object
- Follows existing repository patterns (consistent with `update()` method)

### 2. [WordService.ts](src/dictionary/application/WordService.ts)

**Change:** Added `createProperNoun()` method to service layer.

**Implementation:**

```typescript
createProperNoun(lemma: string, posTag: string): Promise<Word> {
  return this.wordRepository.createProperNoun(lemma, posTag)
}
```

**Details:**

- Delegates to WordRepository's createProperNoun method
- Maintains service layer abstraction
- Consistent method signature as specified in requirements
- Returns Promise<Word> for async handling

### 3. [ProperNounCreationPanel.tsx](src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.tsx)

**Changes:**

- Added `Alert` import from react-bootstrap
- Added state management for `loading` and `error`
- Enhanced `createButton` with create logic
- Added error display in modal body
- Added POS tag validation to button disabled state

**Implementation Details:**

a) **State Addition:**

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<Error | null>(null)
```

b) **Button Enhancement:**

- Disabled state now includes: loading state, missing POS tag, empty lemma, or exact match found
- onClick handler implements proper noun creation with error handling
- Sets loading state during API call
- Catches and displays errors

c) **Error Display:**

- Added Alert component to Modal.Body for displaying error messages
- Shows error only when error state is present
- Uses Bootstrap danger variant for consistency

d) **Flow:**

1. User fills in lemma and selects POS tag
2. User clicks "Create & Save" button
3. Loading state is set to true, button is disabled
4. `wordService.createProperNoun()` is called with lemma and posTag
5. On success: Modal closes via `onClose()`
6. On error: Error state is updated, loading state is reset, alert is shown

### 4. [LemmaAnnotationButton.tsx](src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.tsx)

**Change:** Gate the "Create a new proper noun" menu option behind the `create:proper_nouns` scope.

**Details:**

- Uses `SessionContext` to check permissions via `isAllowedToCreateProperNouns()`
- Keeps existing dirty-token requirement
- Hides the menu option entirely when the scope is missing

### 5. [Session.ts](src/auth/Session.ts)

**Change:** Added `isAllowedToCreateProperNouns()` to the `Session` interface and implementations.

**Details:**

- `GuestSession` returns `false`
- `MemorySession` checks the `createProperNouns` application scope

## Validation Rules Implemented

1. **Lemma Input:** Must not be empty (trimmed)
2. **POS Tag:** Must be selected (not empty string)
3. **Duplicate Prevention:** Lemma cannot be exact match of existing word
4. **Loading Prevention:** Button disabled during API call to prevent double submission

## Error Handling

- API errors are caught and displayed to user via Alert component
- Error message is preserved from server response (via ApiClient error handling)
- Error state can be cleared when user submits again or changes inputs
- Loading state is properly reset on error to allow retry

## API Endpoint

**Path:** POST `/words/create-proper-noun`  
**Request Body:**

```json
{
  "lemma": "string",
  "posTag": "string"
}
```

**Response:** Word object

## Architectural Notes

- Implementation follows existing patterns in codebase
- Uses Bluebird promises for consistency with WordRepository
- Maintains separation of concerns (Repository → Service → Component)
- Error handling through ApiError exception thrown by ApiClient
- Bootstrap Alert component used for consistency with existing error displays

## Testing Considerations

Phase 4 has been implemented with comprehensive unit test coverage:

### WordRepository Tests

- Added test for `createProperNoun()` method using testDelegation pattern
- Verifies correct API endpoint (`POST /words/create-proper-noun`)
- Tests correct request body format with lemma and posTag

### WordService Tests

- Added test for `createProperNoun()` method using testDelegation pattern
- Verifies delegation to WordRepository.create()

### ProperNounCreationPanel Tests

Components tests include:

1. **POS Tag Validation**

   - Button is disabled when POS tag is not selected
   - Button is enabled only when both lemma and POS tag are provided

2. **Create Functionality**

   - Calls createProperNoun with correct parameters (lemma, posTag)
   - Modal closes on successful creation
   - Button is disabled during creation (loading state)

3. **Error Handling**

   - Displays error message when creation fails
   - Error alert uses bootstrap danger variant
   - Button is re-enabled after error for retry
   - Error is cleared when attempting creation again

4. **User Interaction**
   - Tests multiple POS tag support
   - Verifies error recovery and retry scenarios
   - Tests component integration with service method

### LemmaAnnotationButton Tests

- Verifies the menu option is visible only with the `create:proper_nouns` scope
- Ensures the option is hidden when the scope is missing, even if the token is dirty
- Keeps existing interaction tests for the proper noun menu item

### Session Tests

- Extended `src/auth/Session.test.ts` to cover the `create:proper_nouns` scope
- Tests use the parameterized `describe.each` pattern
- Verifies that `isAllowedToCreateProperNouns()` returns `true` when session has the scope
- Verifies that `isAllowedToCreateProperNouns()` returns `false` when session does not have the scope
- All 56 tests pass, including the 2 new tests for the proper noun creation scope

## Known Limitations / Future Work

- Phase 3: Additional error handling for specific HTTP status codes (409 Conflict for duplicates, 400 for invalid POS tag)
- Phase 5: Code review and polish pending
- Success feedback: Currently only closes modal; could add toast notification for user confirmation
- Parent state refresh: Dependent on parent component's state management (not implemented in this phase)
- Server-side validation: Backend should validate POS tag values and handle duplicate lemma creation attempts

## Code Quality

- No TODO or FIXME comments in code
- TypeScript types properly applied
- Follows existing codebase conventions
- Consistent with React hooks patterns used in codebase
- Proper use of aria-labels for accessibility
