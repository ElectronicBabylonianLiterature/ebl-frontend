import React from 'react'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import PageContent from 'research-projects/subpages/aluGeneva/PageContent'

export default function Search({
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  dossiersService,
  wordService,
  fragmentQuery,
}: Pick<
  SearchFormProps,
  | 'fragmentService'
  | 'fragmentSearchService'
  | 'dossiersService'
  | 'bibliographyService'
  | 'wordService'
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
            project={'aluGeneva'}
          />
        </Container>
      </div>
      {fragmentQuery && (
        <SearchResult
          fragmentService={fragmentService}
          fragmentQuery={fragmentQuery}
          dossiersService={dossiersService}
        />
      )}
    </PageContent>
  )
}
