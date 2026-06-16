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

const lazyModulePaths = [
  'router/toolsRoutes',
  'router/signRoutes',
  'router/bibliographyRoutes',
  'router/dictionaryRoutes',
  'router/corpusRoutes',
  'router/fragmentariumRoutes',
  'router/researchProjectRoutes',
  'router/footerRoutes',
] as const

function mockRouteModule(modulePath: string): void {
  jest.mock(modulePath, () => ({
    __esModule: true,
    default: jest.fn(),
  }))
}

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

mockRouteModule('router/aboutRoutes')
lazyModulePaths.forEach(mockRouteModule)

const routeMockConfigs: Record<string, () => ReactNode[]> = {
  'router/aboutRoutes': () => [
    <MockSwitchRoute
      key="AboutLibrary"
      exact
      path="/about/library"
      text="About eager route"
    />,
    <MockSwitchRoute
      key="AboutRoot"
      exact
      path="/about"
      text="About root route"
    />,
  ],
  'router/toolsRoutes': () => [
    <MockSwitchRoute
      key="ToolsRoute"
      exact
      path="/tools/date-converter"
      text="Tools route loaded"
    />,
    <MockSwitchRoute
      key="ToolsNotFound"
      path="/tools/*"
      text="Tools route not found"
    />,
  ],
  'router/signRoutes': () => [
    <MockSwitchRoute
      key="SignsRoute"
      exact
      path="/signs/sign-id"
      text="Signs route loaded"
    />,
  ],
  'router/bibliographyRoutes': () => [
    <MockSwitchRoute
      key="BibliographyRoute"
      exact
      path="/bibliography"
      text="Bibliography route loaded"
    />,
  ],
  'router/dictionaryRoutes': () => [
    <MockSwitchRoute
      key="DictionaryRoute"
      exact
      path="/dictionary/object-id"
      text="Dictionary route loaded"
    />,
  ],
  'router/corpusRoutes': () => [
    <MockSwitchRoute
      key="CorpusRoute"
      exact
      path="/corpus/L/1/1"
      text="Corpus route loaded"
    />,
  ],
  'router/fragmentariumRoutes': () => [
    <MockSwitchRoute
      key="FragmentariumRoute"
      exact
      path="/library/fragment-id"
      text="Fragmentarium route loaded"
    />,
  ],
  'router/researchProjectRoutes': () => [
    <MockSwitchRoute
      key="ResearchProjectsNotFound"
      path="/projects/*"
      text="Projects route not found"
    />,
  ],
  'router/footerRoutes': () => [
    <MockSwitchRoute
      key="ImpressumRoute"
      exact
      path="/impressum"
      text="Impressum route loaded"
    />,
    <MockSwitchRoute
      key="DatenschutzRoute"
      exact
      path="/datenschutz"
      text="Datenschutz route loaded"
    />,
  ],
  'router/sitemap': () => [<div key="sitemap">Sitemap route loaded</div>],
}

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

  test.each([
    {
      path: '/tools/date-converter',
      modulePath: 'router/toolsRoutes',
      text: 'Tools route loaded',
    },
    {
      path: '/signs/sign-id',
      modulePath: 'router/signRoutes',
      text: 'Signs route loaded',
    },
    {
      path: '/bibliography',
      modulePath: 'router/bibliographyRoutes',
      text: 'Bibliography route loaded',
    },
    {
      path: '/dictionary/object-id',
      modulePath: 'router/dictionaryRoutes',
      text: 'Dictionary route loaded',
    },
    {
      path: '/corpus/L/1/1',
      modulePath: 'router/corpusRoutes',
      text: 'Corpus route loaded',
    },
    {
      path: '/library/fragment-id',
      modulePath: 'router/fragmentariumRoutes',
      text: 'Fragmentarium route loaded',
    },
    {
      path: '/projects/unknown-project',
      modulePath: 'router/researchProjectRoutes',
      text: 'Projects route not found',
    },
    {
      path: '/impressum',
      modulePath: 'router/footerRoutes',
      text: 'Impressum route loaded',
    },
  ])(
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
