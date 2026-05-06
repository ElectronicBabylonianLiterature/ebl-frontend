import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Router from 'router/router'
import { getServices } from 'test-support/AppDriver'

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
    expect(getDefaultMock('router/toolsRoutes')).not.toHaveBeenCalled()
    expect(getDefaultMock('router/fragmentariumRoutes')).not.toHaveBeenCalled()
    expect(getDefaultMock('router/sitemap')).not.toHaveBeenCalled()
  })

  test('renders about routes eagerly without loading lazy route modules', () => {
    renderRouter('/about/library')

    expect(screen.getByText('About eager route')).toBeInTheDocument()
    expect(getDefaultMock('router/aboutRoutes')).toHaveBeenCalled()
    expect(getDefaultMock('router/toolsRoutes')).not.toHaveBeenCalled()
    expect(getDefaultMock('router/fragmentariumRoutes')).not.toHaveBeenCalled()
  })

  test('loads tools route module only for tools path', async () => {
    renderRouter('/tools/date-converter')

    await waitFor(() => {
      expect(screen.getByText('Tools route loaded')).toBeInTheDocument()
    })

    expect(getDefaultMock('router/toolsRoutes')).toHaveBeenCalled()
    expect(getDefaultMock('router/fragmentariumRoutes')).not.toHaveBeenCalled()
  })

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
    expect(getDefaultMock('router/toolsRoutes')).not.toHaveBeenCalled()
    expect(getDefaultMock('router/fragmentariumRoutes')).not.toHaveBeenCalled()
  })

  test('loads sitemap lazily only for sitemap path', async () => {
    renderRouter('/sitemap')

    await waitFor(() => {
      expect(screen.getByText('Sitemap route loaded')).toBeInTheDocument()
    })

    expect(getDefaultMock('router/sitemap')).toHaveBeenCalled()
    expect(getDefaultMock('router/toolsRoutes')).not.toHaveBeenCalled()
  })

  test('renders projects not-found view for unknown project path', async () => {
    renderRouter('/projects/unknown-project')

    await waitFor(() => {
      expect(screen.getByText('Projects route not found')).toBeInTheDocument()
    })

    expect(getDefaultMock('router/researchProjectRoutes')).toHaveBeenCalled()
  })

  test('renders global not-found for unknown legal subpaths without loading footer module', () => {
    renderRouter('/impressum/unknown-path')

    expect(screen.getByText('Global not found')).toBeInTheDocument()
    expect(getDefaultMock('router/footerRoutes')).not.toHaveBeenCalled()
  })
})
