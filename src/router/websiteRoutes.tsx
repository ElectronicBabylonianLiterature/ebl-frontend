import React from 'react'
import { Route } from 'router/compat'
import Introduction from 'Introduction'
import AboutRoutes from 'router/aboutRoutes'
import BibliographyRoutes from 'router/bibliographyRoutes'
import CorpusRoutes from 'router/corpusRoutes'
import DictionaryRoutes from 'router/dictionaryRoutes'
import FooterRoutes from 'router/footerRoutes'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import ResearchProjectRoutes from 'router/researchProjectRoutes'
import Services from 'router/Services'
import SignRoutes from 'router/signRoutes'
import { sitemapDefaults, type Slugs } from 'router/sitemapConfig'
import ToolsRoutes from 'router/toolsRoutes'
import {
  websiteRouteGroups,
  type RouteModule,
  type RouteModuleProps,
  type WebsiteRouteGroup,
} from 'router/websiteRouteGroups'

export const websiteRouteModules: Readonly<
  Record<WebsiteRouteGroup, RouteModule>
> = {
  about: AboutRoutes,
  tools: ToolsRoutes,
  signs: SignRoutes,
  bibliography: BibliographyRoutes,
  dictionary: DictionaryRoutes,
  corpus: CorpusRoutes,
  fragmentarium: FragmentariumRoutes,
  researchProjects: ResearchProjectRoutes,
  footer: FooterRoutes,
}

export function createRouteModuleProps(
  services: Services,
  sitemap: boolean,
  slugs?: Slugs,
): RouteModuleProps {
  return {
    sitemap,
    ...services,
    ...slugs,
  }
}

export function renderIntroductionRoute(
  services: Services,
  sitemap: boolean,
): JSX.Element {
  return (
    <Route key="Introduction" exact path="/" {...(sitemap && sitemapDefaults)}>
      <Introduction
        fragmentService={services.fragmentService}
        dossiersService={services.dossiersService}
      />
    </Route>
  )
}

export function WebsiteRoutes(
  services: Services,
  sitemap: boolean,
  slugs?: Slugs,
  routeModules: Readonly<
    Record<WebsiteRouteGroup, RouteModule>
  > = websiteRouteModules,
): JSX.Element[] {
  const routeModuleProps = createRouteModuleProps(services, sitemap, slugs)

  return [
    renderIntroductionRoute(services, sitemap),
    ...websiteRouteGroups.flatMap((routeGroup) =>
      routeModules[routeGroup](routeModuleProps),
    ),
  ]
}
