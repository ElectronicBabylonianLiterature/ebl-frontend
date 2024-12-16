import React, { ReactNode } from 'react'
import { parse } from 'query-string'
import { Route } from 'react-router-dom'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import { ResearchProjects } from 'research-projects/researchProject'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ResearchProjectsOverview from 'research-projects/ResearchProjectsOverview'
import CaicHome from 'research-projects/subpages/caic/Home'
import CaicSearch from 'research-projects/subpages/caic/Search'
import AmpsHome from 'research-projects/subpages/amps/Home'
import AmpsSearch from 'research-projects/subpages/amps/Search'
import AluGenevaHome from 'research-projects/subpages/aluGeneva/Home'
import AluGenevaSearch from 'research-projects/subpages/aluGeneva/Search'

export default function ResearchProjectRoutes({
  sitemap,
  fragmentService,
  fragmentSearchService,
  wordService,
  bibliographyService,
}: {
  sitemap: boolean
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  wordService: WordService
  bibliographyService: BibliographyService
}): JSX.Element[] {
  const projectRoutes = [
    {
      key: 'caic-project',
      project: ResearchProjects.CAIC,
      HomeComponent: CaicHome,
      SearchComponent: CaicSearch,
    },
    {
      key: 'amps-project',
      project: ResearchProjects.AMPS,
      HomeComponent: AmpsHome,
      SearchComponent: AmpsSearch,
    },
    {
      key: 'aluGeneva-project',
      project: ResearchProjects.aluGeneva,
      HomeComponent: AluGenevaHome,
      SearchComponent: AluGenevaSearch,
    },
  ]

  const routes = projectRoutes.flatMap(
    ({ key, project, HomeComponent, SearchComponent }) => [
      <Route
        key={`${key}-home`}
        exact
        path={[
          `/projects/${project.abbreviation}`,
          `/projects/${project.abbreviation}/home`,
        ]}
        render={(): ReactNode => (
          <HeadTagsService
            title={`${project.abbreviation} in eBL`}
            description={project.name}
          >
            <HomeComponent
              fragmentService={fragmentService}
              fragmentSearchService={fragmentSearchService}
              wordService={wordService}
              bibliographyService={bibliographyService}
            />
          </HeadTagsService>
        )}
        {...(sitemap && sitemapDefaults)}
      />,
      <Route
        key={`${key}-search`}
        exact
        path={`/projects/${project.abbreviation}/search`}
        render={({ location }): ReactNode => (
          <HeadTagsService
            title={`${project.abbreviation} in eBL`}
            description={project.name}
          >
            <SearchComponent
              fragmentService={fragmentService}
              fragmentSearchService={fragmentSearchService}
              wordService={wordService}
              bibliographyService={bibliographyService}
              fragmentQuery={{
                ...parse(location.search),
                project: project.abbreviation,
              }}
            />
          </HeadTagsService>
        )}
        {...(sitemap && sitemapDefaults)}
      />,
    ]
  )

  return [
    ...routes,
    <Route
      key="projects-overview"
      exact
      path={'/projects'}
      render={(): ReactNode => (
        <HeadTagsService
          title={'Projects in eBL'}
          description={'Projects in eBL'}
        >
          <ResearchProjectsOverview />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
