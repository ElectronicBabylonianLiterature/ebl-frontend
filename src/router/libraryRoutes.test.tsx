import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Switch } from 'router/compat'
import LibraryRoutes from 'router/libraryRoutes'
import { DictionarySlugs, BibliographySlugs, SignSlugs } from 'router/sitemap'

jest.mock('library/ui/Library', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

jest.mock('bibliography/ui/Bibliography', () => ({
  __esModule: true,
  default: ({ activeTab }: { activeTab: string }) => (
    <div>Bibliography Route {activeTab}</div>
  ),
}))

jest.mock('bibliography/ui/BibliographyViewer', () => ({
  __esModule: true,
  default: () => <div>Bibliography Viewer</div>,
}))

jest.mock('bibliography/ui/BibliographyEditor', () => ({
  __esModule: true,
  default: () => <div>Bibliography Editor</div>,
}))

jest.mock('signs/ui/search/Signs', () => ({
  __esModule: true,
  default: () => <div>Signs Route</div>,
}))

jest.mock('signs/ui/display/SignDisplay', () => ({
  __esModule: true,
  default: () => <div>Sign Display Route</div>,
}))

jest.mock('dictionary/ui/search/Dictionary', () => ({
  __esModule: true,
  default: () => <div>Dictionary Route</div>,
}))

jest.mock('dictionary/ui/display/WordDisplay', () => ({
  __esModule: true,
  default: () => <div>Word Display Route</div>,
}))

jest.mock('dictionary/ui/editor/WordEditor', () => ({
  __esModule: true,
  default: () => <div>Word Editor Route</div>,
}))

jest.mock('NotFoundPage', () => ({
  __esModule: true,
  default: () => <div>Library Not Found</div>,
}))

type RouteProps = Parameters<typeof LibraryRoutes>[0]

function renderRoutes(path: string, sitemap = false) {
  const props: RouteProps = {
    sitemap,
    wordService: {} as RouteProps['wordService'],
    signService: {} as RouteProps['signService'],
    bibliographyService: {} as RouteProps['bibliographyService'],
    afoRegisterService: {} as RouteProps['afoRegisterService'],
    fragmentService: {} as RouteProps['fragmentService'],
    textService: {} as RouteProps['textService'],
    signSlugs: [] as unknown as SignSlugs,
    dictionarySlugs: [] as unknown as DictionarySlugs,
    bibliographySlugs: [] as unknown as BibliographySlugs,
  }

  render(
    <MemoryRouter initialEntries={[path]}>
      <Switch>{LibraryRoutes(props)}</Switch>
    </MemoryRouter>,
  )
}

describe('libraryRoutes bibliography routes', () => {
  it('renders routes when sitemap is enabled', () => {
    renderRoutes('/reference-library/signs', true)
    expect(screen.getByText('Signs Route')).toBeInTheDocument()
  })

  it('renders signs search route', () => {
    renderRoutes('/reference-library/signs')
    expect(screen.getByText('Signs Route')).toBeInTheDocument()
  })

  it('renders sign display route', () => {
    renderRoutes('/reference-library/signs/SIGN.1')
    expect(screen.getByText('Sign Display Route')).toBeInTheDocument()
  })

  it('renders dictionary search route', () => {
    renderRoutes('/reference-library/dictionary')
    expect(screen.getByText('Dictionary Route')).toBeInTheDocument()
  })

  it('renders word display route', () => {
    renderRoutes('/reference-library/dictionary/word-id')
    expect(screen.getByText('Word Display Route')).toBeInTheDocument()
  })

  it('renders word editor route', () => {
    renderRoutes('/reference-library/dictionary/word-id/edit')
    expect(screen.getByText('Word Editor Route')).toBeInTheDocument()
  })

  it('renders bibliography new reference editor route', () => {
    renderRoutes('/reference-library/bibliography/references/new-reference')
    expect(screen.getByText('Bibliography Editor')).toBeInTheDocument()
  })

  it('renders bibliography viewer route', () => {
    renderRoutes('/reference-library/bibliography/references/RN1')
    expect(screen.getByText('Bibliography Viewer')).toBeInTheDocument()
  })

  it('renders bibliography editor route', () => {
    renderRoutes('/reference-library/bibliography/references/RN1/edit')
    expect(screen.getByText('Bibliography Editor')).toBeInTheDocument()
  })

  it('renders bibliography references tab route', () => {
    renderRoutes('/reference-library/bibliography/references')
    expect(
      screen.getByText('Bibliography Route references'),
    ).toBeInTheDocument()
  })

  it('renders bibliography afo-register tab route', () => {
    renderRoutes('/reference-library/bibliography/afo-register')
    expect(
      screen.getByText('Bibliography Route afo-register'),
    ).toBeInTheDocument()
  })

  it('redirects bibliography root to afo-register', () => {
    renderRoutes('/reference-library/bibliography')
    expect(
      screen.getByText('Bibliography Route afo-register'),
    ).toBeInTheDocument()
  })

  it('renders not found for unknown reference-library path', () => {
    renderRoutes('/reference-library/unknown-route')
    expect(screen.getByText('Library Not Found')).toBeInTheDocument()
  })

  it('redirects library root to signs', () => {
    renderRoutes('/reference-library')
    expect(screen.getByText('Signs Route')).toBeInTheDocument()
  })
})
