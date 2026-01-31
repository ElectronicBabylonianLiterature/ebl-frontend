import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Introduction from 'Introduction'
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
import Footer from 'Footer'
import './router.sass'
import Services from 'router/Services'
import FullPageRoutes from 'router/FullPageRoutes'

export default function Router(services: Services): JSX.Element {
  return (
    <Switch>
      {FullPageRoutes(services)}
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
    </Switch>
  )
}

export function WebsiteRoutes(
  services: Services,
  sitemap: boolean,
  slugs?: Slugs,
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
