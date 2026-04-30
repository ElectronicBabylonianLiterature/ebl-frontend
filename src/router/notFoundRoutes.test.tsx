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
import { newsletters } from 'about/ui/news'

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
  nonExistentRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Switch>
            {[...FragmentariumRoutes({ ...getServices(), sitemap: false })]}
          </Switch>
        </MemoryRouter>,
      )
      expect(
        screen.getByText(/The page you are looking for does not exist./i),
      ).toBeInTheDocument()
    })
  })
})

describe('NotFoundPage rendering in AboutRoutes', () => {
  const nonExistentAboutRoutes = [
    '/about/non-existent-page',
    '/about/invalid-section',
    '/about/undefined-route',
  ]
  nonExistentAboutRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Switch>
            {[...AboutRoutes({ ...getServices(), sitemap: false })]}
          </Switch>
        </MemoryRouter>,
      )
      expect(
        screen.getByText(/The page you are looking for does not exist./i),
      ).toBeInTheDocument()
    })
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

describe('NotFoundPage rendering in BibliographyRoutes', () => {
  const nonExistentAboutRoutes = [
    '/bibliography/search/non-existent',
    '/bibliography/afo-register/non-existent-page',
    '/bibliography/afo-register/invalid-section',
    '/bibliography/afo-register/undefined-route',
  ]
  nonExistentAboutRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Switch>
            {[...BibliographyRoutes({ ...getServices(), sitemap: false })]}
          </Switch>
        </MemoryRouter>,
      )
      expect(
        screen.getByText(/The page you are looking for does not exist./i),
      ).toBeInTheDocument()
    })
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
})

describe('NotFoundPage rendering in CorpusRoutes', () => {
  const nonExistentAboutRoutes = [
    '/corpus/Corpus.12345/non-existent-page',
    '/corpus/Corpus.12345/invalid-section',
    '/corpus/Corpus.12345/undefined-route',
  ]
  nonExistentAboutRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Switch>
            {[...CorpusRoutes({ ...getServices(), sitemap: false })]}
          </Switch>
        </MemoryRouter>,
      )
      expect(
        screen.getByText(/The page you are looking for does not exist./i),
      ).toBeInTheDocument()
    })
  })
})

describe('NotFoundPage rendering in DictionaryRoutes', () => {
  const nonExistentAboutRoutes = [
    '/dictionary/search/non-existent',
    '/dictionary/Dictionary.12345/non-existent-page',
    '/dictionary/Dictionary.12345/invalid-section',
    '/dictionary/Dictionary.12345/undefined-route',
  ]
  nonExistentAboutRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Switch>
            {[...DictionaryRoutes({ ...getServices(), sitemap: false })]}
          </Switch>
        </MemoryRouter>,
      )
      expect(
        screen.getByText(/The page you are looking for does not exist./i),
      ).toBeInTheDocument()
    })
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
})

describe('NotFoundPage rendering in SignRoutes', () => {
  const nonExistentAboutRoutes = [
    '/signs/search/non-existent',
    '/signs/Signs.12345/non-existent-page',
    '/signs/Signs.12345/invalid-section',
    '/signs/Signs.12345/undefined-route',
  ]
  nonExistentAboutRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Switch>
            {[...SignRoutes({ ...getServices(), sitemap: false })]}
          </Switch>
        </MemoryRouter>,
      )
      expect(
        screen.getByText(/The page you are looking for does not exist./i),
      ).toBeInTheDocument()
    })
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
})

describe('NotFoundPage rendering in ToolsRoutes', () => {
  const nonExistentAboutRoutes = [
    '/tools/date-converter/non-existent-page',
    '/tools/date-converter/invalid-section',
    '/tools/date-converter/undefined-route',
  ]
  nonExistentAboutRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Switch>
            {[...ToolsRoutes({ ...getServices(), sitemap: false })]}
          </Switch>
        </MemoryRouter>,
      )
      expect(
        screen.getByText(/The page you are looking for does not exist./i),
      ).toBeInTheDocument()
    })
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
