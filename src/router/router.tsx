import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Introduction from 'Introduction'

import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import MarkupService, {
  CachedMarkupService,
} from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'

import BibliographyRoutes from 'router/bibliographyRoutes'
import CorpusRoutes from 'router/corpusRoutes'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import DictionaryRoutes from 'router/dictionaryRoutes'
import SignRoutes from 'router/signRoutes'
import AboutRoutes from 'router/aboutRoutes'
import ToolsRoutes from 'router/toolsRoutes'
import ResearchProjectRoutes from 'router/researchProjectRoutes'
import FooterRoutes from 'router/footerRoutes'

import Sitemap, { sitemapDefaults, Slugs } from 'router/sitemap'
import Header from 'Header'
import NotFoundPage from 'NotFoundPage'
import { helmetContext } from 'router/head'
import { HelmetProvider } from 'react-helmet-async'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import Footer from 'Footer'
import './router.sass'
import DossiersService from 'dossiers/application/DossiersService'

export interface Services {
  wordService: WordService
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  textService: TextService
  signService: SignService
  markupService: MarkupService
  cachedMarkupService: CachedMarkupService
  afoRegisterService: AfoRegisterService
  dossiersService: DossiersService
  findspotService: FindspotService
}

export default function Router(services: Services): JSX.Element {
  return (
    <HelmetProvider context={helmetContext}>
      <div className="main-body">
        <Header key="Header" />
        <Switch>
          <Route exact path="/sitemap">
            <Sitemap services={services} />
          </Route>
          <Route exact path="/sitemap/sitemap.xml" />
          {WebsiteRoutes(services, false)}
          <Route component={NotFoundPage} />
        </Switch>
        <Footer />
      </div>
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
    ...AboutRoutes({ sitemap, ...services }),
    ...ToolsRoutes({ sitemap, ...services }),
    ...SignRoutes({ sitemap, ...services, ...slugs }),
    ...BibliographyRoutes({ sitemap, ...services, ...slugs }),
    ...DictionaryRoutes({ sitemap, ...services, ...slugs }),
    ...CorpusRoutes({ sitemap, ...services, ...slugs }),
    ...FragmentariumRoutes({ sitemap, ...services, ...slugs }),
    ...ResearchProjectRoutes({ sitemap, ...services, ...slugs }),
    ...FooterRoutes({ sitemap, ...services, ...slugs }),
  ]
}
