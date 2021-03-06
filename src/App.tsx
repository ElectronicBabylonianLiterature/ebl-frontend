import React, { ReactNode } from 'react'
import { match as Match, Route, Switch } from 'react-router-dom'
import { parse } from 'query-string'
import _ from 'lodash'

import Header from './Header'
import SessionContext from 'auth/SessionContext'
import Introduction from './Introduction'
import Dictionary from 'dictionary/ui/search/Dictionary'
import WordEditor from 'dictionary/ui/editor/WordEditor'
import FragmentView from 'fragmentarium/ui/fragment/FragmentView'
import Fragmentarium from 'fragmentarium/ui/front-page/Fragmentarium'
import ErrorBoundary from 'common/ErrorBoundary'
import FragmentariumSearch from 'fragmentarium/ui/search/FragmentariumSearch'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import Bibliography from 'bibliography/ui/Bibliography'
import Corpus from 'corpus/ui/Corpus'
import ChapterView from 'corpus/ui/ChapterView'
import TextView from 'corpus/ui/TextView'
import { Location } from 'history'
import TagSignsView from 'fragmentarium/ui/image-annotation/TagSignsView'
import { useAuthentication } from 'auth/Auth'
import FragmentLineToVecRanking from 'fragmentarium/ui/line-to-vec/FragmentLineToVecRanking'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import WordDisplay from 'dictionary/ui/display/WordDisplay'

function parseStringParam(
  location: Location,
  param: string
): string | null | undefined {
  const value = parse(location.search)[param]
  return _.isArray(value) ? value.join('') : value
}

interface TextParams {
  category: string
  index: string
}

function parseTextParams(params): TextParams {
  return {
    category: decodeURIComponent(params.category),
    index: decodeURIComponent(params.index),
  }
}

function parseChapterParams(
  params
): TextParams & { stage: string; name: string } {
  return {
    ...parseTextParams(params),
    stage: decodeURIComponent(params.stage),
    name: decodeURIComponent(params.chapter),
  }
}

function parseFragmentSearchParams(
  location: Location
): {
  number: string | null | undefined
  id: string | null | undefined
  primaryAuthor: string | null | undefined
  year: string | null | undefined
  title: string | null | undefined
  pages: string | null | undefined
  transliteration: string | null | undefined
} {
  return {
    number: parseStringParam(location, 'number'),
    id: parseStringParam(location, 'id'),
    primaryAuthor: parseStringParam(location, 'primaryAuthor'),
    year: parseStringParam(location, 'year'),
    title: parseStringParam(location, 'title'),
    pages: parseStringParam(location, 'pages'),
    transliteration: parseStringParam(location, 'transliteration'),
  }
}

function parseFargmentParams(
  match: Match,
  location: Location
): {
  number: string
  folioName: string | undefined | null
  folioNumber: string | undefined | null
  tab: string | undefined | null
} {
  return {
    number: decodeURIComponent(match.params['id']),
    folioName: parseStringParam(location, 'folioName'),
    folioNumber: parseStringParam(location, 'folioNumber'),
    tab: parseStringParam(location, 'tab'),
  }
}

function App({
  wordService,
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  textService,
}: {
  wordService: WordService
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  textService: TextService
}): JSX.Element {
  const authenticationService = useAuthentication()
  return (
    <SessionContext.Provider value={authenticationService.getSession()}>
      <Header />
      <ErrorBoundary>
        <Switch>
          <Route
            path="/bibliography/:id"
            render={(props): ReactNode => (
              <BibliographyEditor
                bibliographyService={bibliographyService}
                {...props}
              />
            )}
          />
          <Route
            path="/bibliography_new"
            render={(props): ReactNode => (
              <BibliographyEditor
                bibliographyService={bibliographyService}
                {...props}
                create
              />
            )}
          />
          <Route
            path="/bibliography"
            render={(props): ReactNode => (
              <Bibliography
                bibliographyService={bibliographyService}
                {...props}
              />
            )}
          />
          <Route
            path="/dictionary/:id/edit"
            render={(props): ReactNode => (
              <WordEditor wordService={wordService} {...props} />
            )}
          />
          <Route
            path="/dictionary/:id"
            render={(props): ReactNode => (
              <WordDisplay wordService={wordService} {...props} />
            )}
          />
          <Route
            path="/dictionary"
            render={(props): ReactNode => (
              <Dictionary wordService={wordService} {...props} />
            )}
          />
          <Route
            path="/corpus/:category/:index/:stage/:chapter"
            render={({ match }): ReactNode => (
              <ChapterView
                textService={textService}
                bibliographyService={bibliographyService}
                fragmentService={fragmentService}
                wordService={wordService}
                {...parseChapterParams(match.params)}
              />
            )}
          />
          <Route
            path="/corpus/:category/:index"
            render={({ match }): ReactNode => (
              <TextView
                textService={textService}
                {...parseTextParams(match.params)}
              />
            )}
          />
          <Route
            path="/corpus"
            render={(props): ReactNode => (
              <Corpus textService={textService} {...props} />
            )}
          />
          <Route
            path="/fragmentarium/search"
            render={({ location }): ReactNode => (
              <FragmentariumSearch
                fragmentService={fragmentService}
                fragmentSearchService={fragmentSearchService}
                {...parseFragmentSearchParams(location)}
              />
            )}
          />
          <Route
            path="/fragmentarium/:id/match"
            render={({
              match,
            }: {
              match: Match<{ id: string }>
            }): ReactNode => (
              <FragmentLineToVecRanking
                fragmentService={fragmentService}
                number={decodeURIComponent(match.params.id)}
              />
            )}
          />
          <Route
            path="/fragmentarium/:id/annotate"
            render={({
              match,
            }: {
              match: Match<{ id: string }>
            }): ReactNode => (
              <TagSignsView
                fragmentService={fragmentService}
                number={decodeURIComponent(match.params.id)}
              />
            )}
          />
          <Route
            path="/fragmentarium/:id"
            render={({ match, location }): ReactNode => (
              <FragmentView
                fragmentService={fragmentService}
                fragmentSearchService={fragmentSearchService}
                wordService={wordService}
                {...parseFargmentParams(match, location)}
              />
            )}
          />
          <Route
            path="/fragmentarium"
            render={({ location }): ReactNode => (
              <Fragmentarium
                fragmentService={fragmentService}
                fragmentSearchService={fragmentSearchService}
                {...parseFragmentSearchParams(location)}
              />
            )}
          />
          <Route component={Introduction} />
        </Switch>
      </ErrorBoundary>
    </SessionContext.Provider>
  )
}

export default App
