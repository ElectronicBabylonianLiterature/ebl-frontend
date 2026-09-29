import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route, Switch } from 'router/compat'
import { getServices } from 'test-support/AppDriver'
import DictionaryRoutes from 'router/dictionaryRoutes'
import SignRoutes from 'router/signRoutes'
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

describe('NotFoundPage rendering in DictionaryRoutes', () => {
  const nonExistentAboutRoutes = [
    '/dictionary/search/non-existent',
    '/dictionary/Dictionary.12345/non-existent-page',
    '/dictionary/Dictionary.12345/invalid-section',
    '/dictionary/Dictionary.12345/undefined-route',
  ]
  expectNotFoundPageForPaths({
    paths: nonExistentAboutRoutes,
    getRoutes: () => [
      ...DictionaryRoutes({ ...getServices(), sitemap: false }),
    ],
  })
})

describe('DictionaryRoutes redirects', () => {
  test('redirects "/dictionary" to tools dictionary', () => {
    render(
      <MemoryRouter initialEntries={['/dictionary']}>
        <Switch>
          {[...DictionaryRoutes({ ...getServices(), sitemap: false })]}
          <Route
            path="/tools/dictionary"
            render={() => <div>Dictionary Redirect Target</div>}
          />
        </Switch>
      </MemoryRouter>,
    )

    expect(screen.getByText('Dictionary Redirect Target')).toBeInTheDocument()
  })

  test('redirects "/dictionary/:id" to tools dictionary detail', () => {
    render(
      <MemoryRouter initialEntries={['/dictionary/Dictionary.12345']}>
        <Switch>
          {[...DictionaryRoutes({ ...getServices(), sitemap: false })]}
          <Route
            path="/tools/dictionary/:id"
            render={() => <div>Dictionary Detail Redirect Target</div>}
          />
        </Switch>
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Dictionary Detail Redirect Target'),
    ).toBeInTheDocument()
  })

  test('redirects "/dictionary/:id/edit" to tools dictionary editor', () => {
    render(
      <MemoryRouter initialEntries={['/dictionary/Dictionary.12345/edit']}>
        <Switch>
          {[...DictionaryRoutes({ ...getServices(), sitemap: false })]}
          <Route
            path="/tools/dictionary/:id/edit"
            render={() => <div>Dictionary Edit Redirect Target</div>}
          />
        </Switch>
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Dictionary Edit Redirect Target'),
    ).toBeInTheDocument()
  })

  test('preserves query and hash for "/dictionary/:id" redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/dictionary/Dictionary.12345?tab=forms#entry',
      targetPath: '/tools/dictionary/:id',
      expectedLocation: '/tools/dictionary/Dictionary.12345?tab=forms#entry',
      routes: [...DictionaryRoutes({ ...getServices(), sitemap: false })],
    })
  })
})

describe('NotFoundPage rendering in SignRoutes', () => {
  const nonExistentAboutRoutes = [
    '/signs/search/non-existent',
    '/signs/Signs.12345/non-existent-page',
    '/signs/Signs.12345/invalid-section',
    '/signs/Signs.12345/undefined-route',
  ]
  expectNotFoundPageForPaths({
    paths: nonExistentAboutRoutes,
    getRoutes: () => [...SignRoutes({ ...getServices(), sitemap: false })],
  })
})

describe('SignRoutes redirects', () => {
  test('redirects "/signs" to tools signs', () => {
    render(
      <MemoryRouter initialEntries={['/signs']}>
        <Switch>
          {[...SignRoutes({ ...getServices(), sitemap: false })]}
          <Route
            path="/tools/signs"
            render={() => <div>Signs Redirect Target</div>}
          />
        </Switch>
      </MemoryRouter>,
    )

    expect(screen.getByText('Signs Redirect Target')).toBeInTheDocument()
  })

  test('redirects "/signs/:id" to tools signs detail', () => {
    render(
      <MemoryRouter initialEntries={['/signs/Signs.12345']}>
        <Switch>
          {[...SignRoutes({ ...getServices(), sitemap: false })]}
          <Route
            path="/tools/signs/:id"
            render={() => <div>Signs Detail Redirect Target</div>}
          />
        </Switch>
      </MemoryRouter>,
    )

    expect(screen.getByText('Signs Detail Redirect Target')).toBeInTheDocument()
  })

  test('preserves query and hash for "/signs/:id" redirect', () => {
    expectRedirectWithLocationPreserved({
      initialEntry: '/signs/Signs.12345?view=variants#glyph',
      targetPath: '/tools/signs/:id',
      expectedLocation: '/tools/signs/Signs.12345?view=variants#glyph',
      routes: [...SignRoutes({ ...getServices(), sitemap: false })],
    })
  })
})
