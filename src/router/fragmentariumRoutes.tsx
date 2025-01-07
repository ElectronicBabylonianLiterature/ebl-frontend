import React, { ReactNode } from 'react'

import _ from 'lodash'
import { parse } from 'query-string'
import { Route } from 'react-router-dom'
import { match as Match } from 'react-router-dom'
import { Location } from 'history'
import SessionContext from 'auth/SessionContext'
import FragmentView from 'fragmentarium/ui/fragment/FragmentView'
import Fragmentarium from 'fragmentarium/ui/front-page/Fragmentarium'
import FragmentariumSearch from 'fragmentarium/ui/search/FragmentariumSearch'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentLineToVecRanking from 'fragmentarium/ui/line-to-vec/FragmentLineToVecRanking'
import TagSignsView from 'fragmentarium/ui/image-annotation/TagSignsView'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import SignService from 'signs/application/SignService'
import { FragmentSlugs, sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import BibliographyService from 'bibliography/application/BibliographyService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import NotFoundPage from 'NotFoundPage'
import DossiersService from 'dossiers/application/DossiersService'
function parseStringParam(location: Location, param: string): string | null {
  const value = parse(location.search)[param]
  return _.isArray(value) ? value.join('') : value
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
  afoRegisterService,
  dossiersService,
  textService,
  wordService,
  findspotService,
  signService,
  bibliographyService,
  fragmentSlugs,
}: {
  sitemap: boolean
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  textService: TextService
  wordService: WordService
  findspotService: FindspotService
  afoRegisterService: AfoRegisterService
  dossiersService: DossiersService
  signService: SignService
  bibliographyService: BibliographyService
  fragmentSlugs?: FragmentSlugs
}): JSX.Element[] {
  return [
    <Route
      key="FragmentariumSearch"
      path="/fragmentarium/search"
      exact
      render={({ location }): ReactNode => (
        <HeadTagsService
          title="Fragmentarium search: eBL"
          description="Search for cuneiform manuscripts in the Fragmentarium, electronic Babylonian Library (eBL)."
        >
          <FragmentariumSearch
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            fragmentQuery={parse(location.search)}
            bibliographyService={bibliographyService}
            wordService={wordService}
            textService={textService}
            activeTab={_.trimStart(location.hash, '#')}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="FragmentLineToVecRanking"
      path="/fragmentarium/:id/match"
      exact
      render={({ match }): ReactNode => (
        <HeadTagsService
          title="Fragmentarium line to vector ranking: eBL"
          description="Fragmentarium line to vector ranking in the electronic Babylonian Library (eBL)."
        >
          <FragmentLineToVecRanking
            fragmentService={fragmentService}
            number={decodeURIComponent(match.params.id)}
          />
        </HeadTagsService>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: fragmentSlugs,
      })}
    />,
    <Route
      key="TagSignsView"
      path="/fragmentarium/:id/annotate"
      exact
      render={({ match }): ReactNode => (
        <TagSignsView
          signService={signService}
          fragmentService={fragmentService}
          number={decodeURIComponent(match.params.id)}
        />
      )}
    />,
    <Route
      key="FragmentView"
      path="/fragmentarium/:id"
      exact
      render={({ match, location }): ReactNode => (
        <SessionContext.Consumer>
          {(session) => (
            <HeadTagsService
              title="Fragment display: eBL"
              description="Fragment display in the electronic Babylonian Library (eBL)."
            >
              <FragmentView
                fragmentService={fragmentService}
                fragmentSearchService={fragmentSearchService}
                wordService={wordService}
                findspotService={findspotService}
                afoRegisterService={afoRegisterService}
                dossiersService={dossiersService}
                session={session}
                {...parseFragmentParams(match, location)}
              />
            </HeadTagsService>
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
      exact
      render={(): ReactNode => (
        <HeadTagsService
          title="Fragmentarium: eBL"
          description={`The Fragmentarium is an electronic Babylonian Library (eBL) project dedicated to reconstructing Babylonian
         literature, using the thousands of fragmented clay tablets discovered in Nineveh in 1850.
          The initiative compiles and makes searchable transliterations of all fragments, helping scholars identify and utilize these pieces.
          The Fragmentarium, an ongoing effort involving numerous scholars and institutions,
          aims to save Ancient Mesopotamian literature from obscurity.`}
        >
          <Fragmentarium
            wordService={wordService}
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            bibliographyService={bibliographyService}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="FragmentariumNotFound"
      path="/Fragmentarium/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
