import React from 'react'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import {
  ResearchProject,
  ResearchProjects,
} from 'research-projects/researchProject'
import PageContent from 'research-projects/subpages/PageContent'
import { FragmentSearchCriteria } from 'query/FragmentQuery'
import { SearchPagination } from 'fragmentarium/ui/search/pagination'

export default function Search({
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  wordService,
  dossiersService,
  fragmentQuery,
  pagination,
  project,
}: Pick<
  SearchFormProps,
  | 'fragmentService'
  | 'fragmentSearchService'
  | 'bibliographyService'
  | 'wordService'
  | 'dossiersService'
> & {
  fragmentQuery: FragmentSearchCriteria
  pagination: SearchPagination
  project: ResearchProject
}): JSX.Element {
  return (
    <PageContent title={'Search'} project={project}>
      <div className={'project-page__search'}>
        <Container>
          <SearchForm
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            dossiersService={dossiersService}
            fragmentQuery={fragmentQuery}
            project={project.abbreviation as keyof typeof ResearchProjects}
            showAdvancedSearch={true}
          />
        </Container>
      </div>
      <SearchResult
        fragmentService={fragmentService}
        dossiersService={dossiersService}
        fragmentQuery={fragmentQuery}
        pagination={pagination}
      />
    </PageContent>
  )
}
