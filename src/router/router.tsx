import React, { ReactNode, Suspense } from 'react'
import { Route, Switch } from 'router/compat'
import Introduction from 'Introduction'
import AboutRoutes from 'router/aboutRoutes'
import Header from 'Header'
import NotFoundPage from 'NotFoundPage'
import { helmetContext } from 'router/head'
import { HelmetProvider } from 'react-helmet-async'
import Footer from 'Footer'
import './router.sass'
import Services from 'router/Services'
import FullPageRoutes from 'router/FullPageRoutes'
import Spinner from 'common/ui/Spinner'
import {
  runtimeLazyRouteConfigs,
  type LazyWebsiteRouteGroup,
  type RouteModule,
  type RouteModuleProps,
} from 'router/websiteRouteGroups'

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
const lazyRouteModules: Record<
  LazyWebsiteRouteGroup,
  React.LazyExoticComponent<React.ComponentType<RouteModuleProps>>
> = {
  tools: createLazyRouteModule(() => import('router/toolsRoutes')),
  signs: createLazyRouteModule(() => import('router/signRoutes')),
  bibliography: createLazyRouteModule(
    () => import('router/bibliographyRoutes'),
  ),
  dictionary: createLazyRouteModule(() => import('router/dictionaryRoutes')),
  corpus: createLazyRouteModule(() => import('router/corpusRoutes')),
  fragmentarium: createLazyRouteModule(
    () => import('router/fragmentariumRoutes'),
  ),
  researchProjects: createLazyRouteModule(
    () => import('router/researchProjectRoutes'),
  ),
  footer: createLazyRouteModule(() => import('router/footerRoutes')),
}

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
    ...runtimeLazyRouteConfigs.map((routeConfig) => {
      const LazyRouteModule = lazyRouteModules[routeConfig.group]
      return (
        <Route
          key={routeConfig.key}
          path={routeConfig.path}
          exact={routeConfig.exact}
          render={(): ReactNode => <LazyRouteModule {...routeModuleProps} />}
        />
      )
    }),
  ]
}
