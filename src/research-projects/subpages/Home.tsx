import React from 'react'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import PageContent from 'research-projects/subpages/PageContent'
import {
  ResearchProject,
  ResearchProjects,
} from 'research-projects/researchProject'

export type ProjectHomeProps = Omit<
  SearchFormProps,
  'history' | 'location' | 'match' | 'project'
> & {
  title: string
  children?: React.ReactNode | null
  project: ResearchProject
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
    <PageContent title={title} menuTitle={'Home'} project={project}>
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
            project={project.abbreviation as keyof typeof ResearchProjects}
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
