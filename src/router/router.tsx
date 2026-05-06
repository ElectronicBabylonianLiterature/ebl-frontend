import React, { ReactNode, Suspense } from 'react'
import { Route, Switch } from 'router/compat'
import Introduction from 'Introduction'
import AboutRoutes from 'router/aboutRoutes'
import type { Slugs } from 'router/sitemapConfig'
import Header from 'Header'
import NotFoundPage from 'NotFoundPage'
import { helmetContext } from 'router/head'
import { HelmetProvider } from 'react-helmet-async'
import Footer from 'Footer'
import './router.sass'
import Services from 'router/Services'
import FullPageRoutes from 'router/FullPageRoutes'
import Spinner from 'common/ui/Spinner'

type RouteModuleProps = Services & Slugs & { sitemap: boolean }
type RouteModule = (props: RouteModuleProps) => JSX.Element[]

function createLazyRouteModule(
  loadModule: () => Promise<{ default: RouteModule }>,
): React.LazyExoticComponent<React.ComponentType<RouteModuleProps>> {
  return React.lazy(async () => {
    const module = await loadModule()
    const LazyRouteModule = (props: RouteModuleProps): JSX.Element => (
      <Switch>{module.default(props)}</Switch>
    )
    return {
      default: LazyRouteModule,
    }
  })
}

const LazySitemap = React.lazy(() => import('router/sitemap'))
const LazyToolsRoutes = createLazyRouteModule(
  () => import('router/toolsRoutes'),
)
const LazySignRoutes = createLazyRouteModule(() => import('router/signRoutes'))
const LazyBibliographyRoutes = createLazyRouteModule(
  () => import('router/bibliographyRoutes'),
)
const LazyDictionaryRoutes = createLazyRouteModule(
  () => import('router/dictionaryRoutes'),
)
const LazyCorpusRoutes = createLazyRouteModule(
  () => import('router/corpusRoutes'),
)
const LazyFragmentariumRoutes = createLazyRouteModule(
  () => import('router/fragmentariumRoutes'),
)
const LazyResearchProjectRoutes = createLazyRouteModule(
  () => import('router/researchProjectRoutes'),
)
const LazyFooterRoutes = createLazyRouteModule(
  () => import('router/footerRoutes'),
)

function RouteLoading(): JSX.Element {
  return (
    <div className="text-center my-5 withData-spinner">
      <Spinner>Route loading...</Spinner>
    </div>
  )
}

export default function Router(services: Services): JSX.Element {
  return (
    <Switch>
      {FullPageRoutes(services)}
      <HelmetProvider context={helmetContext}>
        <div className="main-body">
          <Header key="Header" />
          <Suspense fallback={<RouteLoading />}>
            <Switch>
              <Route
                exact
                path="/sitemap"
                render={(): ReactNode => <LazySitemap services={services} />}
              />
              <Route exact path="/sitemap/sitemap.xml" />
              {RuntimeWebsiteRoutes(services)}
              <Route component={NotFoundPage} />
            </Switch>
          </Suspense>
          <Footer />
        </div>
      </HelmetProvider>
    </Switch>
  )
}

function RuntimeWebsiteRoutes(services: Services): JSX.Element[] {
  const routeModuleProps: RouteModuleProps = {
    sitemap: false,
    ...services,
  }
  return [
    <Route key="Introduction" component={Introduction} exact path="/" />,
    ...AboutRoutes(routeModuleProps),
    <Route
      key="ToolsRoutes"
      path="/tools/*"
      exact={false}
      render={(): ReactNode => <LazyToolsRoutes {...routeModuleProps} />}
    />,
    <Route
      key="SignRoutes"
      path="/signs/*"
      exact={false}
      render={(): ReactNode => <LazySignRoutes {...routeModuleProps} />}
    />,
    <Route
      key="BibliographyRoutes"
      path="/bibliography/*"
      exact={false}
      render={(): ReactNode => <LazyBibliographyRoutes {...routeModuleProps} />}
    />,
    <Route
      key="DictionaryRoutes"
      path="/dictionary/*"
      exact={false}
      render={(): ReactNode => <LazyDictionaryRoutes {...routeModuleProps} />}
    />,
    <Route
      key="CorpusRoutes"
      path="/corpus/*"
      exact={false}
      render={(): ReactNode => <LazyCorpusRoutes {...routeModuleProps} />}
    />,
    <Route
      key="FragmentariumRoutes"
      path="/library/*"
      exact={false}
      render={(): ReactNode => (
        <LazyFragmentariumRoutes {...routeModuleProps} />
      )}
    />,
    <Route
      key="ResearchProjectRoutes"
      path="/projects/*"
      exact={false}
      render={(): ReactNode => (
        <LazyResearchProjectRoutes {...routeModuleProps} />
      )}
    />,
    <Route
      key="FooterRoutesImpressum"
      path="/impressum"
      exact={false}
      render={(): ReactNode => <LazyFooterRoutes {...routeModuleProps} />}
    />,
    <Route
      key="FooterRoutesDatenschutz"
      path="/datenschutz"
      exact={false}
      render={(): ReactNode => <LazyFooterRoutes {...routeModuleProps} />}
    />,
  ]
}
