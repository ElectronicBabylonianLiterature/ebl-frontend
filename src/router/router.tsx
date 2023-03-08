import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Introduction from '../Introduction'

import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import MarkupService from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import BibliographyRoutes from './bibliographyRoutes'
import CorpusRoutes from './corpusRoutes'
import FragmentariumRoutes from './fragmentariumRoutes'
import DictionaryRoutes from './dictionaryRoutes'
import SignRoutes from './signRoutes'
import AboutRoutes from './aboutRoutes'
import { sitemapDefaults } from 'router/sitemap'
import Header from 'Header'

export interface Services {
  wordService: WordService
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  textService: TextService
  signService: SignService
  markupService: MarkupService
}

export default function Router(services: Services): JSX.Element {
  return (
    <>
      <Header key="Header" />
      <Switch>{WebsiteRoutes(services, false)}</Switch>
    </>
  )
}

export function WebsiteRoutes(
  {
    wordService,
    fragmentService,
    fragmentSearchService,
    bibliographyService,
    textService,
    signService,
    markupService,
  }: Services,
  sitemap: boolean
): JSX.Element[] {
  return [
    <Route
      key="Introduction"
      component={Introduction}
      exact
      path="/"
      {...(sitemap && sitemapDefaults)}
    />,
    ...AboutRoutes({ sitemap: sitemap, markupService: markupService }),
    ...SignRoutes({
      sitemap: sitemap,
      wordService: wordService,
      signService: signService,
    }),
    ...BibliographyRoutes({
      sitemap: sitemap,
      bibliographyService: bibliographyService,
    }),
    ...DictionaryRoutes({
      sitemap: sitemap,
      fragmentService: fragmentService,
      textService: textService,
      wordService: wordService,
      signService: signService,
    }),
    ...CorpusRoutes({
      sitemap: sitemap,
      fragmentService: fragmentService,
      textService: textService,
      wordService: wordService,
      bibliographyService: bibliographyService,
    }),
    ...FragmentariumRoutes({
      sitemap: sitemap,
      textService: textService,
      fragmentService: fragmentService,
      wordService: wordService,
      fragmentSearchService: fragmentSearchService,
      signService: signService,
    }),
  ]
}
