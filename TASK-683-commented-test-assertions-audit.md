# TASK-683 Commented Test Assertions Audit

## Summary

- Date: 2026-03-04
- Scope: repository-wide scan of test files for recently commented-out assertions and placeholder assertions.
- Search patterns: `// expect(`, commented `history.push` expectation blocks, commented test-body checks, and `waitFor(() => expect(true).toBe(true))` placeholders.

## Findings

| ID  | File                                                   | Approx. Lines | Category              | Finding                                                                                               |
| --- | ------------------------------------------------------ | ------------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| C1  | `src/bibliography/ui/BibliographyViewer.test.tsx`      | 70-72         | Commented assertion   | Edit-button navigation assertion to edit route was commented out.                                     |
| C2  | `src/fragmentarium/ui/search/PaginationItems.test.tsx` | 114-116       | Commented assertion   | Pagination navigation query assertion for beginning-range clicks was commented out.                   |
| C3  | `src/fragmentarium/ui/search/PaginationItems.test.tsx` | 132-134       | Commented assertion   | Pagination navigation query assertion for end-range clicks was commented out.                         |
| C4  | `src/fragmentarium/ui/SearchForm.test.tsx`             | 78-81         | Commented assertion   | `expectNavigation` helper had commented navigation assertion block.                                   |
| C5  | `src/fragmentarium/ui/SearchForm.test.tsx`             | 82            | Placeholder assertion | Placeholder `await waitFor(() => expect(true).toBe(true))` used instead of real navigation assertion. |
| C6  | `src/fragmentarium/ui/FragmentButton.test.tsx`         | 58            | Commented test body   | Negative navigation assertion for failed request path was commented out.                              |
| C7  | `src/fragmentarium/ui/images/Images.test.tsx`          | 176-178       | Commented assertion   | `TabController.openTab('1')` navigation assertion was commented out.                                  |
| C8  | `src/fragmentarium/ui/images/Images.test.tsx`          | 184-186       | Commented assertion   | `TabController.openTab('photo')` navigation assertion was commented out.                              |

## Counts

- By category:
  - Commented assertion: 6
  - Placeholder assertion: 1
  - Commented test body: 1
- By file:
  - `src/fragmentarium/ui/SearchForm.test.tsx`: 2
  - `src/fragmentarium/ui/search/PaginationItems.test.tsx`: 2
  - `src/fragmentarium/ui/images/Images.test.tsx`: 2
  - `src/bibliography/ui/BibliographyViewer.test.tsx`: 1
  - `src/fragmentarium/ui/FragmentButton.test.tsx`: 1

## False Positives

- No high-confidence false positives in this set.
- No commented `it/test/describe` blocks were found for this specific pattern scan.

## Status

- C1–C8 have been re-implemented with active assertions in current branch changes.

## Next Step

- Expand the restoration pass to any additional navigation-related tests if new commented assertions are introduced, then include this audit artifact in PR review notes.
