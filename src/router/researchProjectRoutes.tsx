import React, { ReactNode, PropsWithChildren } from 'react'
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
import CaicIntroduction from 'research-projects/subpages/caic/Introduction'
import CaicSearch from 'research-projects/subpages/caic/Search'
import CaicPublications from 'research-projects/subpages/caic/Publications'
import CaicContact from 'research-projects/subpages/caic/Contact'
import _ from 'lodash'

interface ResearchProjectRouteProps {
  sitemap: boolean
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  wordService: WordService
  bibliographyService: BibliographyService
}

function CaicRoute({
  key,
  sitemap,
  subpath,
  isHome,
  children,
  ...props
}: {
  key: string
  sitemap: boolean
  subpath: string
  isHome?: boolean
} & PropsWithChildren<unknown> &
  React.ComponentProps<typeof Route>): JSX.Element {
  const path = isHome ? [subpath, ''] : [subpath]
  return (
    <Route
      key={key}
      exact
      {...props}
      path={path.map((suffix) =>
        _.compact([
          '/projects',
          ResearchProjects.CAIC.abbreviation,
          suffix,
        ]).join('/')
      )}
      render={(): ReactNode => (
        <HeadTagsService
          title={`${ResearchProjects.CAIC.abbreviation} in eBL`}
          description={ResearchProjects.CAIC.name}
        >
          {children}
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />
  )
}

function CaicRoutes({
  sitemap,
  fragmentService,
  fragmentSearchService,
  wordService,
  bibliographyService,
}: ResearchProjectRouteProps): JSX.Element[] {
  return [
    <CaicRoute
      key="caic-project"
      subpath={'introduction'}
      isHome
      sitemap={sitemap}
    >
      <CaicIntroduction
        fragmentService={fragmentService}
        fragmentSearchService={fragmentSearchService}
        wordService={wordService}
        bibliographyService={bibliographyService}
      />
    </CaicRoute>,
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
            fragmentQuery={{ ...parse(location.search), project: 'CAIC' }}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <CaicRoute
      key="caic-project-publications"
      subpath={'publications'}
      sitemap={sitemap}
    >
      <CaicPublications />
    </CaicRoute>,
    <CaicRoute key="caic-project-contact" subpath={'contact'} sitemap={sitemap}>
      <CaicContact />
    </CaicRoute>,
  ]
}

export default function ResearchProjectRoutes({
  ...props
}: ResearchProjectRouteProps): JSX.Element[] {
  return [
    ...CaicRoutes({ ...props }),
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
      {...(props.sitemap && sitemapDefaults)}
    />,
  ]
}
