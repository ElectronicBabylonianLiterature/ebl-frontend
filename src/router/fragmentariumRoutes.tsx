import React, { ReactNode } from 'react'

import _ from 'lodash'
import { parse } from 'query-string'
import { match as Match, Route } from 'react-router-dom'
import { Location } from 'history'
import SessionContext from 'auth/SessionContext'
import FragmentView from 'fragmentarium/ui/fragment/FragmentView'
import Fragmentarium from 'fragmentarium/ui/front-page/Fragmentarium'
import FragmentariumSearch from 'fragmentarium/ui/search/FragmentariumSearch'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentLineToVecRanking from 'fragmentarium/ui/line-to-vec/FragmentLineToVecRanking'
import TagSignsView from 'fragmentarium/ui/image-annotation/TagSignsView'
import { FragmentQuery } from 'query/FragmentQuery'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import SignService from 'signs/application/SignService'
import { FragmentSlugs, sitemapDefaults } from 'router/sitemap'

function parseStringParam(location: Location, param: string): string | null {
  const value = parse(location.search)[param]
  return _.isArray(value) ? value.join('') : value
}

function parseFragmentSearchParams(location: Location): FragmentQuery {
  return parse(location.search)
}

function parseFragmentParams(
  match: Match,
  location: Location
): {
  number: string
  folioName: string | null
  folioNumber: string | null
  tab: string | null
  activeLine: string
} {
  return {
    number: decodeURIComponent(match.params['id']),
    folioName: parseStringParam(location, 'folioName'),
    folioNumber: parseStringParam(location, 'folioNumber'),
    tab: parseStringParam(location, 'tab'),
    activeLine: decodeURIComponent(location.hash.replace(/^#/, '')),
  }
}

export default function FragmentariumRoutes({
  sitemap,
  fragmentService,
  fragmentSearchService,
  textService,
  wordService,
  signService,
  fragmentSlugs,
}: {
  sitemap: boolean
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  textService: TextService
  wordService: WordService
  signService: SignService
  fragmentSlugs?: FragmentSlugs
}): JSX.Element[] {
  return [
    <Route
      key="FragmentariumSearch"
      path="/fragmentarium/search"
      render={({ location }): ReactNode => (
        <FragmentariumSearch
          fragmentSearchService={fragmentSearchService}
          fragmentService={fragmentService}
          fragmentQuery={parseFragmentSearchParams(location)}
          wordService={wordService}
          textService={textService}
          activeTab={_.trimStart(location.hash, '#')}
        />
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="FragmentLineToVecRanking"
      path="/fragmentarium/:id/match"
      render={({ match }: { match: Match<{ id: string }> }): ReactNode => (
        <FragmentLineToVecRanking
          fragmentService={fragmentService}
          number={decodeURIComponent(match.params.id)}
        />
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="TagSignsView"
      path="/fragmentarium/:id/annotate"
      render={({ match }: { match: Match<{ id: string }> }): ReactNode => (
        <TagSignsView
          signService={signService}
          fragmentService={fragmentService}
          number={decodeURIComponent(match.params.id)}
        />
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="FragmentView"
      path="/fragmentarium/:id"
      render={({ match, location }): ReactNode => (
        <SessionContext.Consumer>
          {(session) => (
            <FragmentView
              fragmentService={fragmentService}
              fragmentSearchService={fragmentSearchService}
              wordService={wordService}
              session={session}
              {...parseFragmentParams(match, location)}
            />
          )}
        </SessionContext.Consumer>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: fragmentSlugs,
      })}
    />,
    <Route
      key="Fragmentarium"
      path="/fragmentarium"
      render={(): ReactNode => (
        <Fragmentarium
          wordService={wordService}
          fragmentService={fragmentService}
          fragmentSearchService={fragmentSearchService}
        />
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
