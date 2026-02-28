# TODO: Implement Proper Noun Creation Endpoint

## Overview

Implement a `createProperNoun()` endpoint in `WordService` to persist newly created proper nouns. The feature is triggered by the `createButton` in `ProperNounCreationPanel.tsx`.

## Implementation Steps

### Phase 1: Service Layer (`WordService`)

- [x] Review existing endpoint patterns in `WordService` (e.g., `searchLemma`, other CRUD operations)
- [x] Identify HTTP client configuration and base API URL
- [x] Determine API endpoint path for proper noun creation (likely `POST /api/words` or similar)
- [x] Add `createProperNoun(lemma: string, posTag: string): Promise<WordDto>` method to `WordService`
- [x] Follow existing service method structure and error handling patterns
- [x] Ensure proper TypeScript typing for request/response payloads

### Phase 2: Component Integration (`ProperNounCreationPanel.tsx`)

- [x] Replace TODO comment at line 133 in the `createButton` onClick handler
- [x] Call `wordService.createProperNoun(properNounInputValue, properNounPosTag)`
- [x] Add loading state to disable button during API call
- [x] Implement success callback (toast notification, close modal, refresh parent state)
- [x] Implement error callback (display error toast with message)
- [x] Validate that POS tag is selected before allowing submission
- [x] Gate the menu option behind the `create:proper_nouns` scope
- [x] Add unit tests covering the scope-gated menu option

### Phase 3: Error Handling & Validation

- [ ] Handle duplicate lemma errors from server (409 Conflict)
- [ ] Handle network/connection errors
- [ ] Handle invalid POS tag errors
- [ ] Display user-friendly error messages via toast notifications
- [ ] Log errors appropriately for debugging

### Phase 4: Testing

- [x] Write unit tests for `wordService.createProperNoun()` method
- [x] Mock HTTP client and test success/error scenarios
- [x] Test component integration with service method
- [x] Verify button disabled states during async operation
- [x] Test form validation (prevent submission without POS tag)

### Phase 5: Code Review & Polish

- [ ] Ensure no TODO or FIXME comments remain in code
- [ ] Verify proper error messages and user feedback
- [ ] Check accessibility attributes (aria-labels) are appropriate
- [ ] Performance review (no unnecessary re-renders)
- [ ] Update this document with implementation details and mark tasks complete

## Important Guidelines

- **Keep this file updated** as implementation progresses
- **Remove TODO comments from code** - use this document instead
- Replace completed checklist items with ✅ status
- Document any deviations from the plan in a "Notes" section below

## Notes

Implementation completed for Phase 1, Phase 2, and Phase 4. The feature is now fully functional with comprehensive unit tests:

### Completed Features

- WordRepository.createProperNoun() method for API POST requests
- WordService.createProperNoun() method for service layer
- ProperNounCreationPanel component integration with loading state, POS tag validation, and error handling
- Error messages displayed via Alert component
- Full test coverage for repository, service, and component layers:
  - WordRepository.createProperNoun() test with testDelegation pattern
  - WordService.createProperNoun() test with testDelegation pattern
  - ProperNounCreationPanel tests including:
    - POS tag validation (required before submission)
    - createProperNoun method invocation with correct parameters
    - Loading state management (button disabled during creation)
    - Error handling and display
    - Success callback (modal closes after creation)
    - Error recovery and retry scenarios
    - Multiple POS tag support verification

Remaining phases (3, 5) need to be completed for full feature coverage including additional server-side error handling and final code review.
The proper noun creation menu option is gated by the `create:proper_nouns` scope and covered by unit tests.

## API Contract

- **Endpoint**: `POST /words/create-proper-noun`
- **Request Body**: `{ lemma: string, posTag: string }`
- **Response**: `Word` object
- **Error Codes**:
  - 409: Duplicate lemma
  - 400: Invalid POS tag
  - 401: Unauthorized
