import React from 'react'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import PageContent from 'research-projects/subpages/caic/PageContent'

export default function Search({
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  wordService,
  dossiersService,
  fragmentQuery,
}: Pick<
  SearchFormProps,
  | 'fragmentService'
  | 'fragmentSearchService'
  | 'bibliographyService'
  | 'wordService'
  | 'dossiersService'
  | 'fragmentQuery'
>): JSX.Element {
  return (
    <PageContent title={'Search'}>
      <div className={'project-page__search'}>
        <Container>
          <SearchForm
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            dossiersService={dossiersService}
            fragmentQuery={fragmentQuery}
            project={'CAIC'}
          />
        </Container>
      </div>
      {fragmentQuery && (
        <SearchResult
          fragmentService={fragmentService}
          dossiersService={dossiersService}
          fragmentQuery={fragmentQuery}
        />
      )}
    </PageContent>
  )
}
