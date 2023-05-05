//import React from 'react'
import { getSitemapAsFile, getAllSlugs } from 'router/sitemap'

import SignService from 'signs/application/SignService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import TextService from 'corpus/application/TextService'
import MarkupService from 'markup/application/MarkupService'
import Bluebird from 'bluebird'
import { Services } from './router'
import { saveAs } from 'file-saver'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

jest.mock('signs/application/SignService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('markup/application/MarkupService')
jest.mock('http/ApiClient')

let services: Services

beforeEach(() => {
  const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
  const bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()

  const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
  const markupService = new (MarkupService as jest.Mock<
    jest.Mocked<MarkupService>
  >)()

  signService.listAllSigns.mockReturnValue(Bluebird.resolve(['a2']))
  bibliographyService.listAllBibliography.mockReturnValue(
    Bluebird.resolve(['ref1'])
  )
  wordService.listAllWords.mockReturnValue(Bluebird.resolve(['awīlum I']))
  fragmentService.listAllFragments.mockReturnValue(Bluebird.resolve(['BM.42']))
  textService.listAllTexts.mockReturnValue(
    Bluebird.resolve([{ index: 1, category: 1, genre: 'L' }])
  )
  textService.listAllChapters.mockReturnValue(
    Bluebird.resolve([
      { index: 1, category: 1, genre: 'L', stage: 'OB', chapter: '-' },
    ])
  )

  services = {
    signService: signService,
    bibliographyService: bibliographyService,
    wordService: wordService,
    fragmentService: fragmentService,
    fragmentSearchService: fragmentSearchService,
    textService: textService,
    markupService: markupService,
  }
})

it('get all slugs', async () => {
  await getAllSlugs(services)
  expect(services.signService.listAllSigns).toHaveBeenCalled()
  expect(services.bibliographyService.listAllBibliography).toHaveBeenCalled()
  expect(services.wordService.listAllWords).toHaveBeenCalled()
  expect(services.fragmentService.listAllFragments).toHaveBeenCalled()
  expect(services.textService.listAllTexts).toHaveBeenCalled()
  expect(services.textService.listAllChapters).toHaveBeenCalled()
})

it('get sitemap as file', async () => {
  const slugs = await getAllSlugs(services)
  getSitemapAsFile(services, slugs)
  expect(saveAs).toHaveBeenNthCalledWith(1, expect.anything(), 'sitemap.xml.gz')
  expect(saveAs).toHaveBeenNthCalledWith(
    2,
    expect.anything(),
    'sitemap1.xml.gz'
  )
})
