import type Services from 'router/Services'
import type { Slugs } from 'router/sitemapConfig'

export type RouteModuleProps = Services & Slugs & { sitemap: boolean }
export type RouteModule = (props: RouteModuleProps) => JSX.Element[]

type RuntimeRouteConfig = {
  key: string
  path: string
  exact: boolean
}

type LazyRouteGroupDefinition = {
  runtimeRoutes: readonly RuntimeRouteConfig[]
  loadModule: () => Promise<{ default: RouteModule }>
}

export const lazyRouteGroupDefinitions = {
  tools: {
    runtimeRoutes: [
      {
        key: 'ToolsRoutes',
        path: '/tools/*',
        exact: false,
      },
    ],
    loadModule: () => import('router/toolsRoutes'),
  },
  signs: {
    runtimeRoutes: [
      {
        key: 'SignRoutes',
        path: '/signs/*',
        exact: false,
      },
    ],
    loadModule: () => import('router/signRoutes'),
  },
  bibliography: {
    runtimeRoutes: [
      {
        key: 'BibliographyRoutes',
        path: '/bibliography/*',
        exact: false,
      },
    ],
    loadModule: () => import('router/bibliographyRoutes'),
  },
  dictionary: {
    runtimeRoutes: [
      {
        key: 'DictionaryRoutes',
        path: '/dictionary/*',
        exact: false,
      },
    ],
    loadModule: () => import('router/dictionaryRoutes'),
  },
  corpus: {
    runtimeRoutes: [
      {
        key: 'CorpusRoutes',
        path: '/corpus/*',
        exact: false,
      },
    ],
    loadModule: () => import('router/corpusRoutes'),
  },
  fragmentarium: {
    runtimeRoutes: [
      {
        key: 'FragmentariumRoutes',
        path: '/library/*',
        exact: false,
      },
    ],
    loadModule: () => import('router/fragmentariumRoutes'),
  },
  researchProjects: {
    runtimeRoutes: [
      {
        key: 'ResearchProjectRoutes',
        path: '/projects/*',
        exact: false,
      },
    ],
    loadModule: () => import('router/researchProjectRoutes'),
  },
  footer: {
    // Footer legal pages use exact paths so unknown subpaths fall through to the global not-found route.
    runtimeRoutes: [
      {
        key: 'FooterRoutesImpressum',
        path: '/impressum',
        exact: true,
      },
      {
        key: 'FooterRoutesDatenschutz',
        path: '/datenschutz',
        exact: true,
      },
    ],
    loadModule: () => import('router/footerRoutes'),
  },
} as const satisfies Record<string, LazyRouteGroupDefinition>

export type LazyWebsiteRouteGroup = keyof typeof lazyRouteGroupDefinitions
// About stays eager so its many tab routes and redirects remain in the main bundle.
export type WebsiteRouteGroup = 'about' | LazyWebsiteRouteGroup

export type RuntimeLazyRouteConfig = RuntimeRouteConfig & {
  group: LazyWebsiteRouteGroup
}

export const lazyWebsiteRouteGroups = Object.keys(
  lazyRouteGroupDefinitions,
) as LazyWebsiteRouteGroup[]

export const runtimeLazyRouteConfigsByGroup: Readonly<
  Record<LazyWebsiteRouteGroup, readonly RuntimeRouteConfig[]>
> = lazyWebsiteRouteGroups.reduce(
  (configByGroup, group) => ({
    ...configByGroup,
    [group]: lazyRouteGroupDefinitions[group].runtimeRoutes,
  }),
  {} as Record<LazyWebsiteRouteGroup, readonly RuntimeRouteConfig[]>,
)

export const runtimeLazyRouteConfigs: readonly RuntimeLazyRouteConfig[] =
  lazyWebsiteRouteGroups.flatMap((group) =>
    runtimeLazyRouteConfigsByGroup[group].map((route) => ({
      ...route,
      group,
    })),
  )

export function loadLazyRouteGroupModule(
  group: LazyWebsiteRouteGroup,
): Promise<{ default: RouteModule }> {
  return lazyRouteGroupDefinitions[group].loadModule()
}

export function composeWebsiteRoutes({
  introductionRoute,
  aboutRoutes,
  getRoutesForLazyGroup,
}: {
  introductionRoute: JSX.Element
  aboutRoutes: JSX.Element[]
  getRoutesForLazyGroup: (group: LazyWebsiteRouteGroup) => JSX.Element[]
}): JSX.Element[] {
  return [
    introductionRoute,
    ...aboutRoutes,
    ...lazyWebsiteRouteGroups.flatMap((group) => getRoutesForLazyGroup(group)),
  ]
}
