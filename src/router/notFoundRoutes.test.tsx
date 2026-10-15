import React from 'react'
import { expectNotFoundPageForPaths } from 'router/notFoundRoutes.testSupport'
import { getServices } from 'test-support/AppDriver'
import AboutRoutes from 'router/aboutRoutes'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import BibliographyRoutes from 'router/bibliographyRoutes'
import CorpusRoutes from 'router/corpusRoutes'
import DictionaryRoutes from 'router/dictionaryRoutes'
import SignRoutes from 'router/signRoutes'
import ToolsRoutes from 'router/toolsRoutes'
import ResearchProjectRoutes from 'router/researchProjectRoutes'

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
