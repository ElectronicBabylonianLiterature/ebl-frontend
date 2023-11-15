import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Introduction from 'Introduction'

import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import MarkupService from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'

import BibliographyRoutes from 'router/bibliographyRoutes'
import CorpusRoutes from 'router/corpusRoutes'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import DictionaryRoutes from 'router/dictionaryRoutes'
import SignRoutes from 'router/signRoutes'
import AboutRoutes from 'router/aboutRoutes'

import Sitemap, { sitemapDefaults, Slugs } from 'router/sitemap'
import Header from 'Header'
import { helmetContext } from 'router/head'
import { HelmetProvider } from 'react-helmet-async'
import { FindspotService } from 'fragmentarium/application/FindspotService'

export interface Services {
  wordService: WordService
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  textService: TextService
  signService: SignService
  markupService: MarkupService
  afoRegisterService: AfoRegisterService
  findspotService: FindspotService
}

export default function Router(services: Services): JSX.Element {
  return (
    <HelmetProvider context={helmetContext}>
      <Header key="Header" />
      <Switch>
        <Route exact path="/sitemap">
          <Sitemap services={services} />
        </Route>
        <Route exact path="/sitemap/sitemap.xml" />
        {WebsiteRoutes(services, false)}
      </Switch>
    </HelmetProvider>
  )
}

export function WebsiteRoutes(
  services: Services,
  sitemap: boolean,
  slugs?: Slugs
): JSX.Element[] {
  return [
    <Route
      key="Introduction"
      component={Introduction}
      exact
      path="/"
      {...(sitemap && sitemapDefaults)}
    />,
    ...AboutRoutes({ sitemap: sitemap, ...services }),
    ...SignRoutes({ sitemap: sitemap, ...services, ...slugs }),
    ...BibliographyRoutes({ sitemap: sitemap, ...services, ...slugs }),
    ...DictionaryRoutes({ sitemap: sitemap, ...services, ...slugs }),
    ...CorpusRoutes({ sitemap: sitemap, ...services, ...slugs }),
    ...FragmentariumRoutes({ sitemap: sitemap, ...services, ...slugs }),
  ]
}
