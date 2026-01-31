import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Switch } from 'react-router-dom'
import { getServices } from 'test-support/AppDriver'

import AboutRoutes from './aboutRoutes'
import FragmentariumRoutes from './fragmentariumRoutes'
import BibliographyRoutes from './bibliographyRoutes'
import CorpusRoutes from './corpusRoutes'
import DictionaryRoutes from './dictionaryRoutes'
import SignRoutes from './signRoutes'
import ToolsRoutes from './toolsRoutes'

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
        <MemoryRouter>
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
        <MemoryRouter>
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
        <MemoryRouter>
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

describe('NotFoundPage rendering in CorpusRoutes', () => {
  const nonExistentAboutRoutes = [
    '/corpus/Corpus.12345/non-existent-page',
    '/corpus/Corpus.12345/invalid-section',
    '/corpus/Corpus.12345/undefined-route',
  ]
  nonExistentAboutRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter>
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
        <MemoryRouter>
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
        <MemoryRouter>
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

describe('NotFoundPage rendering in ToolsRoutes', () => {
  const nonExistentAboutRoutes = [
    '/tools/date-converter/non-existent-page',
    '/tools/date-converter/invalid-section',
    '/tools/date-converter/undefined-route',
  ]
  nonExistentAboutRoutes.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <MemoryRouter>
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
