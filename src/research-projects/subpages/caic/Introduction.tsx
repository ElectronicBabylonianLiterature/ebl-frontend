import React from 'react'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import PageContent from 'research-projects/subpages/caic/PageContent'

export default function Introduction({
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  wordService,
  fragmentQuery,
}: Pick<
  SearchFormProps,
  | 'fragmentService'
  | 'fragmentSearchService'
  | 'bibliographyService'
  | 'wordService'
  | 'fragmentQuery'
>): JSX.Element {
  return (
    <PageContent title={'Introduction'}>
      <p>
        The cuneiform artifacts of the Iraq Museum in Baghdad are a central part
        of the cultural heritage of Mesopotamia, which is of great importance to
        all of humanity. As an interdisciplinary academic project, the aim of
        CAIC is to document, edit, and analyze approximately 17,000 cuneiform
        tablets both from historical and linguistic perspectives. With the help
        of the latest digital approaches it will also make them available online
        to the general public and experts from various disciplines.
      </p>
      <div className={'project-page__search'}>
        <h3>Search in CAIC</h3>
        <Container>
          <SearchForm
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            fragmentQuery={fragmentQuery}
            project={'CAIC'}
          />
        </Container>
      </div>
      {fragmentQuery && (
        <SearchResult
          fragmentService={fragmentService}
          fragmentQuery={fragmentQuery}
        />
      )}
    </PageContent>
  )
}
