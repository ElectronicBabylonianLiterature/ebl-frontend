import React, { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route } from 'router/compat'
import Router from 'router/router'
import { getServices } from 'test-support/AppDriver'

type MockSwitchRouteProps = {
  text: string
  path: string
  exact?: boolean
}

function MockSwitchRoute({
  text,
  path,
  exact = false,
}: MockSwitchRouteProps): JSX.Element {
  return <Route exact={exact} path={path} render={() => <div>{text}</div>} />
}

function getDefaultMock(modulePath: string): jest.Mock {
  return (jest.requireMock(modulePath) as { default: jest.Mock }).default
}

function renderRouter(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Router {...getServices()} />
    </MemoryRouter>,
  )
}

function mockRouteModule(modulePath: string): void {
  jest.mock(modulePath, () => ({
    __esModule: true,
    default: jest.fn(),
  }))
}

interface RouteDef {
  key: string
  path: string
  text: string
  exact?: boolean
}

interface RouteMockEntry {
  modulePath: string
  routes: RouteDef[]
}

const routeMockEntries: RouteMockEntry[] = [
  {
    modulePath: 'router/aboutRoutes',
    routes: [
      {
        key: 'AboutLibrary',
        exact: true,
        path: '/about/library',
        text: 'About eager route',
      },
      {
        key: 'AboutRoot',
        exact: true,
        path: '/about',
        text: 'About root route',
      },
    ],
  },
  {
    modulePath: 'router/toolsRoutes',
    routes: [
      {
        key: 'ToolsRoute',
        exact: true,
        path: '/tools/date-converter',
        text: 'Tools route loaded',
      },
      {
        key: 'ToolsNotFound',
        path: '/tools/*',
        text: 'Tools route not found',
      },
    ],
  },
  {
    modulePath: 'router/signRoutes',
    routes: [
      {
        key: 'SignsRoute',
        exact: true,
        path: '/signs/sign-id',
        text: 'Signs route loaded',
      },
    ],
  },
  {
    modulePath: 'router/bibliographyRoutes',
    routes: [
      {
        key: 'BibliographyRoute',
        exact: true,
        path: '/bibliography',
        text: 'Bibliography route loaded',
      },
    ],
  },
  {
    modulePath: 'router/dictionaryRoutes',
    routes: [
      {
        key: 'DictionaryRoute',
        exact: true,
        path: '/dictionary/object-id',
        text: 'Dictionary route loaded',
      },
    ],
  },
  {
    modulePath: 'router/corpusRoutes',
    routes: [
      {
        key: 'CorpusRoute',
        exact: true,
        path: '/corpus/L/1/1',
        text: 'Corpus route loaded',
      },
    ],
  },
  {
    modulePath: 'router/fragmentariumRoutes',
    routes: [
      {
        key: 'FragmentariumRoute',
        exact: true,
        path: '/library/fragment-id',
        text: 'Fragmentarium route loaded',
      },
    ],
  },
  {
    modulePath: 'router/researchProjectRoutes',
    routes: [
      {
        key: 'ResearchProjectsNotFound',
        path: '/projects/*',
        text: 'Projects route not found',
      },
    ],
  },
  {
    modulePath: 'router/footerRoutes',
    routes: [
      {
        key: 'ImpressumRoute',
        exact: true,
        path: '/impressum',
        text: 'Impressum route loaded',
      },
      {
        key: 'DatenschutzRoute',
        exact: true,
        path: '/datenschutz',
        text: 'Datenschutz route loaded',
      },
    ],
  },
]

function createRouteElements(routes: RouteDef[]): ReactNode[] {
  return routes.map(({ key, exact, path, text }) => (
    <MockSwitchRoute key={key} exact={exact} path={path} text={text} />
  ))
}

const lazyModulePaths = routeMockEntries
  .filter(({ modulePath }) => modulePath !== 'router/aboutRoutes')
  .map(({ modulePath }) => modulePath)

jest.mock('Header', () => {
  function HeaderMock(): JSX.Element {
    return <div>Header</div>
  }
  return HeaderMock
})

jest.mock('Footer', () => {
  function FooterMock(): JSX.Element {
    return <div>Footer</div>
  }
  return FooterMock
})

jest.mock('NotFoundPage', () => {
  function NotFoundPageMock(): JSX.Element {
    return <div>Global not found</div>
  }
  return NotFoundPageMock
})

jest.mock('Introduction', () => {
  function IntroductionMock(): JSX.Element {
    return <div>Introduction route</div>
  }
  return IntroductionMock
})

jest.mock('router/FullPageRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/sitemap', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/aboutRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

lazyModulePaths.forEach(mockRouteModule)

const routeMockConfigs: Record<string, () => ReactNode[]> = Object.assign(
  Object.fromEntries(
    routeMockEntries.map(({ modulePath, routes }) => [
      modulePath,
      () => createRouteElements(routes),
    ]),
  ),
  {
    'router/sitemap': () => [<div key="sitemap">Sitemap route loaded</div>],
  },
)

const lazyRouteTestCases = routeMockEntries
  .filter(({ modulePath }) => modulePath !== 'router/aboutRoutes')
  .map(({ modulePath, routes }) => ({
    path: routes[0].path,
    modulePath,
    text: routes[0].text,
  }))

describe('Router lazy loading', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getDefaultMock('router/FullPageRoutes').mockReturnValue([])
    for (const [modulePath, createRoutes] of Object.entries(routeMockConfigs)) {
      getDefaultMock(modulePath).mockImplementation(
        modulePath === 'router/sitemap' ? () => createRoutes() : createRoutes,
      )
    }
  })

  test('renders home route eagerly without loading lazy route modules', () => {
    renderRouter('/')
    expect(screen.getByText('Introduction route')).toBeInTheDocument()
    lazyModulePaths.forEach((modulePath) => {
      expect(getDefaultMock(modulePath)).not.toHaveBeenCalled()
    })
    expect(getDefaultMock('router/sitemap')).not.toHaveBeenCalled()
  })

  test('renders about routes eagerly without loading lazy route modules', () => {
    renderRouter('/about/library')
    expect(screen.getByText('About eager route')).toBeInTheDocument()
    expect(getDefaultMock('router/aboutRoutes')).toHaveBeenCalled()
    lazyModulePaths.forEach((modulePath) => {
      expect(getDefaultMock(modulePath)).not.toHaveBeenCalled()
    })
  })

  test.each(lazyRouteTestCases)(
    'loads only the matching lazy route module for $path',
    async ({ path, modulePath, text }) => {
      renderRouter(path)
      await waitFor(() => {
        expect(screen.getByText(text)).toBeInTheDocument()
      })
      lazyModulePaths.forEach((candidateModulePath) => {
        if (candidateModulePath === modulePath) {
          expect(getDefaultMock(candidateModulePath)).toHaveBeenCalled()
        } else {
          expect(getDefaultMock(candidateModulePath)).not.toHaveBeenCalled()
        }
      })
    },
  )

  test('renders tools module not-found route for unknown tools path', async () => {
    renderRouter('/tools/unknown-path')
    await waitFor(() => {
      expect(screen.getByText('Tools route not found')).toBeInTheDocument()
    })
    expect(getDefaultMock('router/toolsRoutes')).toHaveBeenCalled()
  })

  test('renders global not-found without loading lazy route modules for unrelated paths', () => {
    renderRouter('/unknown-path')
    expect(screen.getByText('Global not found')).toBeInTheDocument()
    lazyModulePaths.forEach((modulePath) => {
      expect(getDefaultMock(modulePath)).not.toHaveBeenCalled()
    })
  })

  test('loads sitemap lazily only for sitemap path', async () => {
    renderRouter('/sitemap')
    await waitFor(() => {
      expect(screen.getByText('Sitemap route loaded')).toBeInTheDocument()
    })
    expect(getDefaultMock('router/sitemap')).toHaveBeenCalled()
    lazyModulePaths.forEach((modulePath) => {
      expect(getDefaultMock(modulePath)).not.toHaveBeenCalled()
    })
  })

  test('renders global not-found for unknown legal subpaths without loading footer module', () => {
    renderRouter('/impressum/unknown-path')
    expect(screen.getByText('Global not found')).toBeInTheDocument()
    expect(getDefaultMock('router/footerRoutes')).not.toHaveBeenCalled()
  })
})
