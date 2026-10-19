import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import {
  expectNoLazyRouteModulesLoaded,
  expectOnlyLazyRouteModuleLoaded,
  getDefaultMock,
  lazyRouteTestCases,
  renderRouter,
  setupLazyRouteMocks,
} from 'router/router.lazy-loading.testSupport'

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
  beforeEach(() => {
    setupLazyRouteMocks()
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
