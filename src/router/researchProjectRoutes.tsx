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
import DossiersService from 'dossiers/application/DossiersService'

export default function ResearchProjectRoutes({
  sitemap,
  fragmentService,
  fragmentSearchService,
  wordService,
  bibliographyService,
  dossiersService,
}: {
  sitemap: boolean
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  wordService: WordService
  bibliographyService: BibliographyService
  dossiersService: DossiersService
}): JSX.Element[] {
  return [
    <Route
      key="caic-project"
      exact
      path={[
        `/projects/${ResearchProjects.CAIC.abbreviation}`,
        `/projects/${ResearchProjects.CAIC.abbreviation}/home`,
      ]}
      render={(): ReactNode => (
        <HeadTagsService
          title={`${ResearchProjects.CAIC.abbreviation} in eBL`}
          description={ResearchProjects.CAIC.name}
        >
          <CaicHome
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            dossiersService={dossiersService}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="caic-project-search"
      exact
      path={`/projects/${ResearchProjects.CAIC.abbreviation}/search`}
      render={({ location }): ReactNode => (
        <HeadTagsService
          title={`${ResearchProjects.CAIC.abbreviation} in eBL`}
          description={ResearchProjects.CAIC.name}
        >
          <CaicSearch
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            dossiersService={dossiersService}
            fragmentQuery={{ ...parse(location.search), project: 'CAIC' }}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="projects"
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
