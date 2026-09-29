import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route, Switch } from 'router/compat'
import { getServices } from 'test-support/AppDriver'
import BibliographyRoutes from 'router/bibliographyRoutes'
import CorpusRoutes from 'router/corpusRoutes'
import ToolsRoutes from 'router/toolsRoutes'
import {
  expectNotFoundPageForPaths,
  expectRedirectWithLocationPreserved,
} from 'router/notFoundRoutes.testSupport'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

describe('NotFoundPage rendering in BibliographyRoutes', () => {
  const nonExistentAboutRoutes = [
    '/bibliography/search/non-existent',
    '/bibliography/afo-register/non-existent-page',
    '/bibliography/afo-register/invalid-section',
    '/bibliography/afo-register/undefined-route',
  ]
  expectNotFoundPageForPaths({
    paths: nonExistentAboutRoutes,
    getRoutes: () => [
      ...BibliographyRoutes({ ...getServices(), sitemap: false }),
    ],
  })
})

describe('BibliographyRoutes redirects', () => {
  test('redirects "/bibliography" to "/tools/references"', () => {
    render(
      <MemoryRouter initialEntries={['/bibliography']}>
        <Switch>
          <Route
            path="/tools/references"
            render={() => <div>Bibliography Redirect Target</div>}
          />
          {[...BibliographyRoutes({ ...getServices(), sitemap: false })]}
        </Switch>
      </MemoryRouter>,
    )

    expect(screen.getByText('Bibliography Redirect Target')).toBeInTheDocument()
  })

  test('preserves query and hash for "/bibliography/afo-register" redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/bibliography/afo-register?text=EN&textNumber=1#results',
      targetPath: '/tools/afo-register',
      expectedLocation: '/tools/afo-register?text=EN&textNumber=1#results',
      routes: [...BibliographyRoutes({ ...getServices(), sitemap: false })],
    })
  })

  test('preserves query and hash for bibliography new reference redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/bibliography/references/new-reference?mode=quick#create',
      targetPath: '/tools/references/new-reference',
      expectedLocation: '/tools/references/new-reference?mode=quick#create',
      routes: [...BibliographyRoutes({ ...getServices(), sitemap: false })],
    })
  })

  test('preserves query and hash for bibliography reference detail redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/bibliography/references/Reference.123?tab=meta#entry',
      targetPath: '/tools/references/:id',
      expectedLocation: '/tools/references/Reference.123?tab=meta#entry',
      routes: [...BibliographyRoutes({ ...getServices(), sitemap: false })],
    })
  })

  test('preserves query and hash for bibliography reference edit redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry:
        '/bibliography/references/Reference.123/edit?tab=history#editor',
      targetPath: '/tools/references/:id/edit',
      expectedLocation:
        '/tools/references/Reference.123/edit?tab=history#editor',
      routes: [...BibliographyRoutes({ ...getServices(), sitemap: false })],
    })
  })
})

describe('NotFoundPage rendering in CorpusRoutes', () => {
  const nonExistentAboutRoutes = [
    '/corpus/Corpus.12345/non-existent-page',
    '/corpus/Corpus.12345/invalid-section',
    '/corpus/Corpus.12345/undefined-route',
  ]
  expectNotFoundPageForPaths({
    paths: nonExistentAboutRoutes,
    getRoutes: () => [...CorpusRoutes({ ...getServices(), sitemap: false })],
  })
})

describe('NotFoundPage rendering in ToolsRoutes', () => {
  const nonExistentAboutRoutes = [
    '/tools/date-converter/non-existent-page',
    '/tools/date-converter/invalid-section',
    '/tools/date-converter/undefined-route',
  ]
  expectNotFoundPageForPaths({
    paths: nonExistentAboutRoutes,
    getRoutes: () => [...ToolsRoutes({ ...getServices(), sitemap: false })],
  })
})

describe('ToolsRoutes redirects', () => {
  test('redirects "/tools" to "/tools/introduction"', () => {
    render(
      <MemoryRouter initialEntries={['/tools']}>
        <Switch>
          <Route
            path="/tools/introduction"
            render={() => <div>Tools Redirect Target</div>}
          />
          {[...ToolsRoutes({ ...getServices(), sitemap: false })]}
        </Switch>
      </MemoryRouter>,
    )

    expect(screen.getByText('Tools Redirect Target')).toBeInTheDocument()
  })
})
