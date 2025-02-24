import React from 'react'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import PageContent from 'research-projects/subpages/caic/PageContent'

export type ProjectHomeProps = Omit<
  SearchFormProps,
  'history' | 'location' | 'match'
> & {
  title: string
  children?: React.ReactNode | null
}

export default function ProjectHome({
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  wordService,
  dossiersService,
  fragmentQuery,
  project,
  title,
  children,
}: ProjectHomeProps): JSX.Element {
  return (
    <PageContent title={title} menuTitle={'Home'}>
      {children}
      <div className={'project-page__search'}>
        <h3>Search in {project}</h3>
        <Container>
          <SearchForm
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            bibliographyService={bibliographyService}
            wordService={wordService}
            dossiersService={dossiersService}
            fragmentQuery={fragmentQuery}
            project={project}
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
