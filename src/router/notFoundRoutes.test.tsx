import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route, Switch } from 'router/compat'
import { getServices } from 'test-support/AppDriver'

import AboutRoutes from './aboutRoutes'
import FragmentariumRoutes from './fragmentariumRoutes'
import BibliographyRoutes from './bibliographyRoutes'
import CorpusRoutes from './corpusRoutes'
import DictionaryRoutes from './dictionaryRoutes'
import SignRoutes from './signRoutes'
import ToolsRoutes from './toolsRoutes'
import ResearchProjectRoutes from './researchProjectRoutes'
import { newsletters } from 'about/ui/news'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

function expectRedirectWithLocationPreserved({
  initialEntry,
  targetPath,
  expectedLocation,
  routes,
}: {
  initialEntry: string
  targetPath: string
  expectedLocation: string
  routes: JSX.Element[]
}): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Switch>
        {routes}
        <Route
          path={targetPath}
          render={({ location }) => (
            <div>{`${location.pathname}${location.search}${location.hash}`}</div>
          )}
        />
      </Switch>
    </MemoryRouter>,
  )
  expect(screen.getByText(expectedLocation)).toBeInTheDocument()
}

function renderRedirect({
  initialEntry,
  routes,
  target,
}: {
  initialEntry: string
  routes: JSX.Element[]
  target: { path: string; label: string }
}): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Switch>
        <Route path={target.path} render={() => <div>{target.label}</div>} />
        {routes}
      </Switch>
    </MemoryRouter>,
  )
  expect(screen.getByText(target.label)).toBeInTheDocument()
}

function assertNotFoundRendered(): void {
  expect(
    screen.getByText(/The page you are looking for does not exist./i),
  ).toBeInTheDocument()
}

const serviceProps = { ...getServices(), sitemap: false }
type RouteFactory = (props: typeof serviceProps) => JSX.Element[]

const notFoundCases: [string, RouteFactory, string[]][] = [
  [
    'FragmentariumRoutes',
    FragmentariumRoutes,
    [
      '/library/search/non-existent',
      '/library/Fragment.12345/match/non-existent',
      '/library/Fragment.12345/annotate/non-existent',
      '/library/Fragment.12345/non-existent',
    ],
  ],
  [
    'AboutRoutes',
    AboutRoutes,
    [
      '/about/non-existent-page',
      '/about/invalid-section',
      '/about/undefined-route',
    ],
  ],
  [
    'BibliographyRoutes',
    BibliographyRoutes,
    [
      '/bibliography/search/non-existent',
      '/bibliography/afo-register/non-existent-page',
      '/bibliography/afo-register/invalid-section',
      '/bibliography/afo-register/undefined-route',
    ],
  ],
  [
    'CorpusRoutes',
    CorpusRoutes,
    [
      '/corpus/Corpus.12345/non-existent-page',
      '/corpus/Corpus.12345/invalid-section',
      '/corpus/Corpus.12345/undefined-route',
    ],
  ],
  [
    'DictionaryRoutes',
    DictionaryRoutes,
    [
      '/dictionary/search/non-existent',
      '/dictionary/Dictionary.12345/non-existent-page',
      '/dictionary/Dictionary.12345/invalid-section',
      '/dictionary/Dictionary.12345/undefined-route',
    ],
  ],
  [
    'SignRoutes',
    SignRoutes,
    [
      '/signs/search/non-existent',
      '/signs/Signs.12345/non-existent-page',
      '/signs/Signs.12345/invalid-section',
      '/signs/Signs.12345/undefined-route',
    ],
  ],
  [
    'ToolsRoutes',
    ToolsRoutes,
    [
      '/tools/date-converter/non-existent-page',
      '/tools/date-converter/invalid-section',
      '/tools/date-converter/undefined-route',
    ],
  ],
  [
    'ResearchProjectRoutes',
    ResearchProjectRoutes,
    [
      '/projects/unknown-project',
      '/projects/CAIC/unknown-path',
      '/projects/RECC/unknown-path/deeper',
    ],
  ],
]

describe.each(notFoundCases)(
  '%s NotFoundPage',
  (_name, routeFactory, paths) => {
    test.each(paths)('renders NotFoundPage for %s', (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Switch>{[...routeFactory(serviceProps)]}</Switch>
        </MemoryRouter>,
      )
      assertNotFoundRendered()
    })
  },
)

describe('AboutRoutes redirects', () => {
  test('redirects "/about" to "/about/library"', () => {
    renderRedirect({
      initialEntry: '/about',
      routes: [...AboutRoutes(serviceProps)],
      target: { path: '/about/library', label: 'About Redirect Target' },
    })
  })

  test('redirects "/news" to latest newsletter', () => {
    const path = `/about/news/${newsletters[0].number}`
    renderRedirect({
      initialEntry: '/news',
      routes: [...AboutRoutes(serviceProps)],
      target: { path, label: 'News Redirect Target' },
    })
  })

  test('redirects "/about/news" to latest newsletter', () => {
    const path = `/about/news/${newsletters[0].number}`
    renderRedirect({
      initialEntry: '/about/news',
      routes: [...AboutRoutes(serviceProps)],
      target: { path, label: 'About News Redirect Target' },
    })
  })

  test('redirects "/about/dictionary" to "/about/akkadian-dictionary"', () => {
    renderRedirect({
      initialEntry: '/about/dictionary',
      routes: [...AboutRoutes(serviceProps)],
      target: {
        path: '/about/akkadian-dictionary',
        label: 'Akkadian Dictionary Redirect Target',
      },
    })
  })
})

describe('BibliographyRoutes redirects', () => {
  test('redirects "/bibliography" to "/tools/references"', () => {
    renderRedirect({
      initialEntry: '/bibliography',
      routes: [...BibliographyRoutes(serviceProps)],
      target: {
        path: '/tools/references',
        label: 'Bibliography Redirect Target',
      },
    })
  })

  test('preserves query and hash for "/bibliography/afo-register" redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/bibliography/afo-register?text=EN&textNumber=1#results',
      targetPath: '/tools/afo-register',
      expectedLocation: '/tools/afo-register?text=EN&textNumber=1#results',
      routes: [...BibliographyRoutes(serviceProps)],
    })
  })

  test('preserves query and hash for bibliography new reference redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/bibliography/references/new-reference?mode=quick#create',
      targetPath: '/tools/references/new-reference',
      expectedLocation: '/tools/references/new-reference?mode=quick#create',
      routes: [...BibliographyRoutes(serviceProps)],
    })
  })

  test('preserves query and hash for bibliography reference detail redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/bibliography/references/Reference.123?tab=meta#entry',
      targetPath: '/tools/references/:id',
      expectedLocation: '/tools/references/Reference.123?tab=meta#entry',
      routes: [...BibliographyRoutes(serviceProps)],
    })
  })

  test('preserves query and hash for bibliography reference edit redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry:
        '/bibliography/references/Reference.123/edit?tab=history#editor',
      targetPath: '/tools/references/:id/edit',
      expectedLocation:
        '/tools/references/Reference.123/edit?tab=history#editor',
      routes: [...BibliographyRoutes(serviceProps)],
    })
  })
})

describe('DictionaryRoutes redirects', () => {
  test('redirects "/dictionary" to tools dictionary', () => {
    renderRedirect({
      initialEntry: '/dictionary',
      routes: [...DictionaryRoutes(serviceProps)],
      target: {
        path: '/tools/dictionary',
        label: 'Dictionary Redirect Target',
      },
    })
  })

  test('redirects "/dictionary/:id" to tools dictionary detail', () => {
    renderRedirect({
      initialEntry: '/dictionary/Dictionary.12345',
      routes: [...DictionaryRoutes(serviceProps)],
      target: {
        path: '/tools/dictionary/:id',
        label: 'Dictionary Detail Redirect Target',
      },
    })
  })

  test('redirects "/dictionary/:id/edit" to tools dictionary editor', () => {
    renderRedirect({
      initialEntry: '/dictionary/Dictionary.12345/edit',
      routes: [...DictionaryRoutes(serviceProps)],
      target: {
        path: '/tools/dictionary/:id/edit',
        label: 'Dictionary Edit Redirect Target',
      },
    })
  })

  test('preserves query and hash for "/dictionary/:id" redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/dictionary/Dictionary.12345?tab=forms#entry',
      targetPath: '/tools/dictionary/:id',
      expectedLocation: '/tools/dictionary/Dictionary.12345?tab=forms#entry',
      routes: [...DictionaryRoutes(serviceProps)],
    })
  })
})

describe('SignRoutes redirects', () => {
  test('redirects "/signs" to tools signs', () => {
    renderRedirect({
      initialEntry: '/signs',
      routes: [...SignRoutes(serviceProps)],
      target: { path: '/tools/signs', label: 'Signs Redirect Target' },
    })
  })

  test('redirects "/signs/:id" to tools signs detail', () => {
    renderRedirect({
      initialEntry: '/signs/Signs.12345',
      routes: [...SignRoutes(serviceProps)],
      target: {
        path: '/tools/signs/:id',
        label: 'Signs Detail Redirect Target',
      },
    })
  })

  test('preserves query and hash for "/signs/:id" redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/signs/Signs.12345?view=variants#glyph',
      targetPath: '/tools/signs/:id',
      expectedLocation: '/tools/signs/Signs.12345?view=variants#glyph',
      routes: [...SignRoutes(serviceProps)],
    })
  })
})

describe('ToolsRoutes redirects', () => {
  test('redirects "/tools" to "/tools/introduction"', () => {
    renderRedirect({
      initialEntry: '/tools',
      routes: [...ToolsRoutes(serviceProps)],
      target: { path: '/tools/introduction', label: 'Tools Redirect Target' },
    })
  })
})
