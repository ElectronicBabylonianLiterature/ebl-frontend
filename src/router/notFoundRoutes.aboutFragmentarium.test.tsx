import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route, Switch } from 'router/compat'
import { getServices } from 'test-support/AppDriver'
import AboutRoutes from 'router/aboutRoutes'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import ResearchProjectRoutes from 'router/researchProjectRoutes'
import { newsletters } from 'about/ui/news'
import { expectNotFoundPageForPaths } from 'router/notFoundRoutes.testSupport'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

describe('NotFoundPage rendering in FragmentariumRoutes', () => {
  const nonExistentRoutes = [
    '/library/search/non-existent',
    '/library/Fragment.12345/match/non-existent',
    '/library/Fragment.12345/annotate/non-existent',
    '/library/Fragment.12345/non-existent',
  ]
  expectNotFoundPageForPaths({
    paths: nonExistentRoutes,
    getRoutes: () => [
      ...FragmentariumRoutes({ ...getServices(), sitemap: false }),
    ],
  })
})

describe('NotFoundPage rendering in AboutRoutes', () => {
  const nonExistentAboutRoutes = [
    '/about/non-existent-page',
    '/about/invalid-section',
    '/about/undefined-route',
  ]
  expectNotFoundPageForPaths({
    paths: nonExistentAboutRoutes,
    getRoutes: () => [...AboutRoutes({ ...getServices(), sitemap: false })],
  })
})

describe('AboutRoutes redirects', () => {
  test('redirects "/about" to "/about/library"', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Switch>
          <Route
            path="/about/library"
            render={() => <div>About Redirect Target</div>}
          />
          {[...AboutRoutes({ ...getServices(), sitemap: false })]}
        </Switch>
      </MemoryRouter>,
    )

    expect(screen.getByText('About Redirect Target')).toBeInTheDocument()
  })

  test('redirects "/news" to latest newsletter', () => {
    const latestNewsletterPath = `/about/news/${newsletters[0].number}`

    render(
      <MemoryRouter initialEntries={['/news']}>
        <Switch>
          <Route
            path={latestNewsletterPath}
            render={() => <div>News Redirect Target</div>}
          />
          {[...AboutRoutes({ ...getServices(), sitemap: false })]}
        </Switch>
      </MemoryRouter>,
    )

    expect(screen.getByText('News Redirect Target')).toBeInTheDocument()
  })

  test('redirects "/about/news" to latest newsletter', () => {
    const latestNewsletterPath = `/about/news/${newsletters[0].number}`

    render(
      <MemoryRouter initialEntries={['/about/news']}>
        <Switch>
          <Route
            path={latestNewsletterPath}
            render={() => <div>About News Redirect Target</div>}
          />
          {[...AboutRoutes({ ...getServices(), sitemap: false })]}
        </Switch>
      </MemoryRouter>,
    )

    expect(screen.getByText('About News Redirect Target')).toBeInTheDocument()
  })

  test('redirects "/about/dictionary" to "/about/akkadian-dictionary"', () => {
    render(
      <MemoryRouter initialEntries={['/about/dictionary']}>
        <Switch>
          <Route
            path="/about/akkadian-dictionary"
            render={() => <div>Akkadian Dictionary Redirect Target</div>}
          />
          {[...AboutRoutes({ ...getServices(), sitemap: false })]}
        </Switch>
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Akkadian Dictionary Redirect Target'),
    ).toBeInTheDocument()
  })
})

describe('NotFoundPage rendering in ResearchProjectRoutes', () => {
  const nonExistentResearchProjectRoutes = [
    '/projects/unknown-project',
    '/projects/CAIC/unknown-path',
    '/projects/RECC/unknown-path/deeper',
  ]
  expectNotFoundPageForPaths({
    paths: nonExistentResearchProjectRoutes,
    getRoutes: () => [
      ...ResearchProjectRoutes({ ...getServices(), sitemap: false }),
    ],
  })
})
