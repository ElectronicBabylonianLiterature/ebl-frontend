import type FragmentService from 'fragmentarium/application/FragmentService'
import type FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import type BibliographyService from 'bibliography/application/BibliographyService'
import type WordService from 'dictionary/application/WordService'
import type DossiersService from 'dossiers/application/DossiersService'
import type { SearchFormProps } from 'fragmentarium/ui/SearchForm'

export function searchFormProps(
  overrides: Partial<SearchFormProps> = {},
): SearchFormProps {
  return {
    fragmentSearchService: {} as FragmentSearchService,
    fragmentService: {} as FragmentService,
    dossiersService: {} as DossiersService,
    bibliographyService: {} as BibliographyService,
    wordService: {} as WordService,
    navigate: jest.fn(),
    ...overrides,
  }
}
