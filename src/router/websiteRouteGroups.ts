import type { Slugs } from 'router/sitemapConfig'
import Services from 'router/Services'

export type RouteModuleProps = Services & Slugs & { sitemap: boolean }
export type RouteModule = (props: RouteModuleProps) => JSX.Element[]

export const websiteRouteGroups = [
  'about',
  'tools',
  'signs',
  'bibliography',
  'dictionary',
  'corpus',
  'fragmentarium',
  'researchProjects',
  'footer',
] as const

export type WebsiteRouteGroup = (typeof websiteRouteGroups)[number]

export type LazyWebsiteRouteGroup = Exclude<WebsiteRouteGroup, 'about'>

export type RuntimeLazyRouteConfig = {
  key: string
  group: LazyWebsiteRouteGroup
  path: string
  exact: boolean
}

export const runtimeLazyRouteConfigs: readonly RuntimeLazyRouteConfig[] = [
  {
    key: 'ToolsRoutes',
    group: 'tools',
    path: '/tools/*',
    exact: false,
  },
  {
    key: 'SignRoutes',
    group: 'signs',
    path: '/signs/*',
    exact: false,
  },
  {
    key: 'BibliographyRoutes',
    group: 'bibliography',
    path: '/bibliography/*',
    exact: false,
  },
  {
    key: 'DictionaryRoutes',
    group: 'dictionary',
    path: '/dictionary/*',
    exact: false,
  },
  {
    key: 'CorpusRoutes',
    group: 'corpus',
    path: '/corpus/*',
    exact: false,
  },
  {
    key: 'FragmentariumRoutes',
    group: 'fragmentarium',
    path: '/library/*',
    exact: false,
  },
  {
    key: 'ResearchProjectRoutes',
    group: 'researchProjects',
    path: '/projects/*',
    exact: false,
  },
  {
    key: 'FooterRoutesImpressum',
    group: 'footer',
    path: '/impressum',
    exact: true,
  },
  {
    key: 'FooterRoutesDatenschutz',
    group: 'footer',
    path: '/datenschutz',
    exact: true,
  },
]
