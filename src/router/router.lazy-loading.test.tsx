import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Router from 'router/router'
import { getServices } from 'test-support/AppDriver'

const lazyRouteModulePaths = [
  'router/toolsRoutes',
  'router/signRoutes',
  'router/bibliographyRoutes',
  'router/dictionaryRoutes',
  'router/corpusRoutes',
  'router/fragmentariumRoutes',
  'router/researchProjectRoutes',
  'router/footerRoutes',
] as const

type LazyRouteModulePath = (typeof lazyRouteModulePaths)[number]

type LazyRouteTestCase = {
  name: string
  path: string
  modulePath: LazyRouteModulePath
  expectedText: string
}

type MockSwitchRouteProps = {
  text: string
  path?: string
  from?: string
  computedMatch?: unknown
}

function MockSwitchRoute({ text }: MockSwitchRouteProps): JSX.Element {
  return <div>{text}</div>
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

function expectNoLazyRouteModulesLoaded(): void {
  lazyRouteModulePaths.forEach((modulePath) => {
    expect(getDefaultMock(modulePath)).not.toHaveBeenCalled()
  })
}

function expectOnlyLazyRouteModuleLoaded(
  expectedModulePath: LazyRouteModulePath,
): void {
  lazyRouteModulePaths.forEach((modulePath) => {
    if (modulePath === expectedModulePath) {
      expect(getDefaultMock(modulePath)).toHaveBeenCalled()
    } else {
      expect(getDefaultMock(modulePath)).not.toHaveBeenCalled()
    }
  })
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

jest.mock('router/aboutRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/toolsRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/signRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/bibliographyRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/dictionaryRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/corpusRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/fragmentariumRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/researchProjectRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/footerRoutes', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('router/sitemap', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('Router lazy loading', () => {
  const lazyRouteTestCases: readonly LazyRouteTestCase[] = [
    {
      name: 'tools',
      path: '/tools/date-converter',
      modulePath: 'router/toolsRoutes',
      expectedText: 'Tools route loaded',
    },
    {
      name: 'signs',
      path: '/signs/Signs.12345',
      modulePath: 'router/signRoutes',
      expectedText: 'Signs route loaded',
    },
    {
      name: 'bibliography',
      path: '/bibliography/references',
      modulePath: 'router/bibliographyRoutes',
      expectedText: 'Bibliography route loaded',
    },
    {
      name: 'dictionary',
      path: '/dictionary/Dictionary.12345',
      modulePath: 'router/dictionaryRoutes',
      expectedText: 'Dictionary route loaded',
    },
    {
      name: 'corpus',
      path: '/corpus/L/1/1',
      modulePath: 'router/corpusRoutes',
      expectedText: 'Corpus route loaded',
    },
    {
      name: 'library',
      path: '/library/search',
      modulePath: 'router/fragmentariumRoutes',
      expectedText: 'Fragmentarium route loaded',
    },
    {
      name: 'projects',
      path: '/projects/unknown-project',
      modulePath: 'router/researchProjectRoutes',
      expectedText: 'Projects route not found',
    },
    {
      name: 'impressum',
      path: '/impressum',
      modulePath: 'router/footerRoutes',
      expectedText: 'Impressum route loaded',
    },
    {
      name: 'datenschutz',
      path: '/datenschutz',
      modulePath: 'router/footerRoutes',
      expectedText: 'Datenschutz route loaded',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    getDefaultMock('router/FullPageRoutes').mockReturnValue([])

    getDefaultMock('router/aboutRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="AboutLibrary"
        path="/about/library"
        text="About eager route"
      />,
      <MockSwitchRoute key="AboutRoot" path="/about" text="About root route" />,
    ])

    getDefaultMock('router/toolsRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="ToolsRoute"
        path="/tools/date-converter"
        text="Tools route loaded"
      />,
      <MockSwitchRoute
        key="ToolsNotFound"
        path="/tools/*"
        text="Tools route not found"
      />,
    ])

    getDefaultMock('router/signRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="SignRoute"
        path="/signs/*"
        text="Signs route loaded"
      />,
    ])

    getDefaultMock('router/bibliographyRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="BibliographyRoute"
        path="/bibliography/*"
        text="Bibliography route loaded"
      />,
    ])

    getDefaultMock('router/dictionaryRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="DictionaryRoute"
        path="/dictionary/*"
        text="Dictionary route loaded"
      />,
    ])

    getDefaultMock('router/corpusRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="CorpusRoute"
        path="/corpus/*"
        text="Corpus route loaded"
      />,
    ])

    getDefaultMock('router/fragmentariumRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="FragmentariumRoute"
        path="/library/*"
        text="Fragmentarium route loaded"
      />,
    ])

    getDefaultMock('router/researchProjectRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="ResearchProjectsNotFound"
        path="/projects/*"
        text="Projects route not found"
      />,
    ])

    getDefaultMock('router/footerRoutes').mockImplementation(() => [
      <MockSwitchRoute
        key="ImpressumRoute"
        path="/impressum"
        text="Impressum route loaded"
      />,
      <MockSwitchRoute
        key="DatenschutzRoute"
        path="/datenschutz"
        text="Datenschutz route loaded"
      />,
    ])

    getDefaultMock('router/sitemap').mockImplementation(() => (
      <div>Sitemap route loaded</div>
    ))
  })

  test('renders home route eagerly without loading lazy route modules', () => {
    renderRouter('/')

    expect(screen.getByText('Introduction route')).toBeInTheDocument()
    expectNoLazyRouteModulesLoaded()
    expect(getDefaultMock('router/sitemap')).not.toHaveBeenCalled()
  })

  test('renders about routes eagerly without loading lazy route modules', () => {
    renderRouter('/about/library')

    expect(screen.getByText('About eager route')).toBeInTheDocument()
    expect(getDefaultMock('router/aboutRoutes')).toHaveBeenCalled()
    expectNoLazyRouteModulesLoaded()
  })

  test.each(lazyRouteTestCases)(
    'loads only the $name lazy route module for $path',
    async ({ path, modulePath, expectedText }) => {
      renderRouter(path)

      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument()
      })

      expectOnlyLazyRouteModuleLoaded(modulePath)
      expect(getDefaultMock('router/sitemap')).not.toHaveBeenCalled()
    },
  )

  test('renders tools module not-found route for unknown tools path', async () => {
    renderRouter('/tools/unknown-path')

    await waitFor(() => {
      expect(screen.getByText('Tools route not found')).toBeInTheDocument()
    })

    expectOnlyLazyRouteModuleLoaded('router/toolsRoutes')
  })

  test('renders global not-found without loading lazy route modules for unrelated paths', () => {
    renderRouter('/unknown-path')

    expect(screen.getByText('Global not found')).toBeInTheDocument()
    expectNoLazyRouteModulesLoaded()
  })

  test('loads sitemap lazily only for sitemap path', async () => {
    renderRouter('/sitemap')

    await waitFor(() => {
      expect(screen.getByText('Sitemap route loaded')).toBeInTheDocument()
    })

    expect(getDefaultMock('router/sitemap')).toHaveBeenCalled()
    expectNoLazyRouteModulesLoaded()
  })

  test('renders global not-found for unknown legal subpaths without loading footer module', () => {
    renderRouter('/impressum/unknown-path')

    expect(screen.getByText('Global not found')).toBeInTheDocument()
    expectNoLazyRouteModulesLoaded()
  })
})
