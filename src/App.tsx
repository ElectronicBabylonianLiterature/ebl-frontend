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
import ChapterEditView from 'corpus/ui/ChapterEditView'
import TextView from 'corpus/ui/TextView'
import { Location } from 'history'

import { useAuthentication } from 'auth/Auth'
import FragmentLineToVecRanking from 'fragmentarium/ui/line-to-vec/FragmentLineToVecRanking'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import MarkupService from 'markup/application/MarkupService'
import WordDisplay from 'dictionary/ui/display/WordDisplay'
import Signs from 'signs/ui/search/Signs'
import SignDisplay from 'signs/ui/display/SignDisplay'
import SignService from 'signs/application/SignService'
import TagSignsView from 'fragmentarium/ui/image-annotation/TagSignsView'
import ChapterView from 'corpus/ui/ChapterView'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { TextId } from 'transliteration/domain/text-id'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { stageFromAbbreviation } from 'common/period'
import { FragmentQuery } from 'query/FragmentQuery'
import About from 'about/ui/about'

function parseStringParam(location: Location, param: string): string | null {
  const value = parse(location.search)[param]
  return _.isArray(value) ? value.join('') : value
}

function parseTextId(params): TextId {
  return {
    genre: decodeURIComponent(params.genre),
    category: parseInt(decodeURIComponent(params.category)),
    index: parseInt(decodeURIComponent(params.index)),
  }
}

function parseChapterId(params): ChapterId {
  return {
    textId: parseTextId(params),
    stage: decodeURIComponent(stageFromAbbreviation(params.stage)),
    name: decodeURIComponent(params.chapter),
  }
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

function App({
  wordService,
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  textService,
  signService,
  markupService,
}: {
  wordService: WordService
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  textService: TextService
  signService: SignService
  markupService: MarkupService
}): JSX.Element {
  const authenticationService = useAuthentication()
  return (
    <SessionContext.Provider value={authenticationService.getSession()}>
      <DictionaryContext.Provider value={wordService}>
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
              path="/signs/:id"
              render={(props): ReactNode => (
                <SignDisplay
                  signService={signService}
                  wordService={wordService}
                  {...props}
                />
              )}
            />
            <Route
              path="/signs"
              render={(props): ReactNode => (
                <Signs {...props} signService={signService} />
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
                <WordDisplay
                  textService={textService}
                  wordService={wordService}
                  fragmentService={fragmentService}
                  signService={signService}
                  {...props}
                />
              )}
            />
            <Route
              path="/dictionary"
              render={(props): ReactNode => (
                <Dictionary wordService={wordService} {...props} />
              )}
            />
            <Route
              path="/corpus/:genre/:category/:index/:stage/:chapter/edit"
              render={({ match }): ReactNode => (
                <ChapterEditView
                  textService={textService}
                  bibliographyService={bibliographyService}
                  fragmentService={fragmentService}
                  wordService={wordService}
                  id={parseChapterId(match.params)}
                />
              )}
            />
            <Route
              path="/corpus/:genre/:category/:index/:stage/:chapter"
              render={({ match, location }): ReactNode => (
                <ChapterView
                  textService={textService}
                  wordService={wordService}
                  id={parseChapterId(match.params)}
                  activeLine={decodeURIComponent(
                    location.hash.replace(/^#/, '')
                  )}
                />
              )}
            />
            <Route
              path="/corpus/:genre/:category/:index"
              render={({ match }): ReactNode => (
                <TextView
                  textService={textService}
                  fragmentService={fragmentService}
                  id={parseTextId(match.params)}
                />
              )}
            />
            <Route
              path="/corpus/:genre"
              render={({ match, ...props }): ReactNode => (
                <Corpus
                  textService={textService}
                  genre={match.params.genre}
                  {...props}
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
                  fragmentSearchService={fragmentSearchService}
                  fragmentService={fragmentService}
                  fragmentQuery={parseFragmentSearchParams(location)}
                  wordService={wordService}
                  textService={textService}
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
                  signService={signService}
                  fragmentService={fragmentService}
                  number={decodeURIComponent(match.params.id)}
                />
              )}
            />
            <Route
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
            />
            <Route
              path="/fragmentarium"
              render={(): ReactNode => (
                <Fragmentarium
                  wordService={wordService}
                  fragmentService={fragmentService}
                  fragmentSearchService={fragmentSearchService}
                />
              )}
            />
            <Route
              path="/about"
              render={(): ReactNode => <About markupService={markupService} />}
            />
            <Route component={Introduction} />
          </Switch>
        </ErrorBoundary>
      </DictionaryContext.Provider>
    </SessionContext.Provider>
  )
}

export default App
