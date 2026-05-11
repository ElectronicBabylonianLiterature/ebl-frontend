import { getSitemapAsFile, getAllSlugs } from 'router/sitemap'

import SignService from 'signs/application/SignService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import TextService from 'corpus/application/TextService'
import MarkupService, {
  CachedMarkupService,
} from 'markup/application/MarkupService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import Bluebird from 'bluebird'
import { saveAs } from 'file-saver'
import pako from 'pako'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import DossiersService from 'dossiers/application/DossiersService'
import Services from 'router/Services'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

jest.mock('signs/application/SignService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('markup/application/MarkupService')
jest.mock('http/ApiClient')

let services: Services

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => resolve(fileReader.result as ArrayBuffer)
    fileReader.onerror = () => reject(fileReader.error)
    fileReader.readAsArrayBuffer(blob)
  })
}

beforeEach(() => {
  const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
  const bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const findspotService = new (FindspotService as jest.Mock<
    jest.Mocked<FindspotService>
  >)()
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
  const cachedMarkupService = new (CachedMarkupService as jest.Mock<
    jest.Mocked<CachedMarkupService>
  >)()

  const afoRegisterService = new (AfoRegisterService as jest.Mock<
    jest.Mocked<AfoRegisterService>
  >)()
  const dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()

  signService.listAllSigns.mockReturnValue(Bluebird.resolve(['a2']))
  bibliographyService.listAllBibliography.mockReturnValue(
    Bluebird.resolve(['ref1']),
  )
  wordService.listAllWords.mockReturnValue(Bluebird.resolve(['awīlum I']))
  fragmentService.listAllFragments.mockReturnValue(Bluebird.resolve(['BM.42']))
  textService.listAllTexts.mockReturnValue(
    Bluebird.resolve([{ index: 1, category: 1, genre: 'L' }]),
  )
  textService.listAllChapters.mockReturnValue(
    Bluebird.resolve([
      { index: 1, category: 1, genre: 'L', stage: 'OB', chapter: '-' },
    ]),
  )

  services = {
    signService: signService,
    bibliographyService: bibliographyService,
    wordService: wordService,
    fragmentService: fragmentService,
    findspotService: findspotService,
    fragmentSearchService: fragmentSearchService,
    textService: textService,
    markupService: markupService,
    cachedMarkupService: cachedMarkupService,
    afoRegisterService: afoRegisterService,
    dossiersService: dossiersService,
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
    'sitemap1.xml.gz',
  )
})

it('does not include projects wildcard route in sitemap xml', async () => {
  const slugs = await getAllSlugs(services)
  getSitemapAsFile(services, slugs)

  const saveAsMock = saveAs as jest.MockedFunction<typeof saveAs>
  const sitemapChunkArchive = saveAsMock.mock.calls[1][0] as Blob
  const sitemapChunkBuffer = await readBlobAsArrayBuffer(sitemapChunkArchive)
  const sitemapXml = pako.ungzip(new Uint8Array(sitemapChunkBuffer), {
    to: 'string',
  }) as string

  expect(sitemapXml).toContain('/projects')
  expect(sitemapXml).toContain('/projects/CAIC')
  expect(sitemapXml).not.toContain('/projects/*')
})
