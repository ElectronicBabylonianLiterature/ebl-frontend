import React from 'react'
import { render } from '@testing-library/react'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import MarkupService from 'markup/application/MarkupService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextView from 'corpus/ui/TextView'
import ChapterView from 'corpus/ui/ChapterView'
import ChapterEditView from 'corpus/ui/ChapterEditView'
import ChapterSiglumsAndTransliterations from 'corpus/ui/ChapterSiglumsAndTransliterations'
import ManuscriptsTable from 'corpus/ui/ManuscriptsTable'
import { CorpusSearchResult } from 'corpus/ui/search/CorpusSearchResult'
import CorpusLemmaLines from 'dictionary/ui/search/CorpusLemmaLines'
import { chapterId } from 'corpus/application/TextService.testSupport'
import { text } from 'test-support/test-corpus-text'
import {
  expectAbortedOnUnmount,
  PendingRead,
  pendingRead,
} from 'test-support/pendingRead'

jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('markup/application/MarkupService')
jest.mock('bibliography/application/BibliographyService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const markupService = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()
const bibliographyService = new (BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>)()

type PendingReadInstaller = (read: PendingRead['read']) => void

const getters: [string, () => JSX.Element, PendingReadInstaller][] = [
  [
    'TextView → find',
    () => (
      <TextView
        id={text.id}
        textService={textService}
        fragmentService={fragmentService}
      />
    ),
    (read) => textService.find.mockImplementation(read),
  ],
  [
    'ChapterView → find',
    () => (
      <ChapterView
        id={chapterId}
        textService={textService}
        wordService={wordService}
        markupService={markupService}
        activeLine=""
      />
    ),
    (read) => textService.find.mockImplementation(read),
  ],
  [
    'ChapterEditView → findChapter',
    () => (
      <ChapterEditView
        id={chapterId}
        textService={textService}
        bibliographyService={bibliographyService}
        fragmentService={fragmentService}
        wordService={wordService}
      />
    ),
    (read) => textService.findChapter.mockImplementation(read),
  ],
  [
    'ChapterSiglumsAndTransliterations → findColophons',
    () => (
      <ChapterSiglumsAndTransliterations
        id={chapterId}
        textService={textService}
        method="findColophons"
      />
    ),
    (read) => textService.findColophons.mockImplementation(read),
  ],
  [
    'ManuscriptsTable → findManuscripts',
    () => (
      <ManuscriptsTable
        id={chapterId}
        uncertainFragments={[]}
        textService={textService}
        fragmentService={fragmentService}
      />
    ),
    (read) => textService.findManuscripts.mockImplementation(read),
  ],
  [
    'CorpusSearchResult → query',
    () => (
      <CorpusSearchResult
        textService={textService}
        corpusQuery={{ lemmas: 'kur' }}
      />
    ),
    (read) => textService.query.mockImplementation(read),
  ],
  [
    'CorpusLemmaLines → query',
    () => <CorpusLemmaLines lemmaId="kur" textService={textService} />,
    (read) => textService.query.mockImplementation(read),
  ],
]

beforeEach(() => {
  jest.clearAllMocks()
  const never = new Promise<never>(() => undefined)
  textService.find.mockReturnValue(never)
  textService.findChapter.mockReturnValue(never)
  textService.findChapterDisplay.mockReturnValue(never)
})

it.each(getters)(
  '%s receives the withData signal',
  async (_name, element, installPendingRead) => {
    const pending = pendingRead()
    installPendingRead(pending.read)

    const { unmount } = render(element())

    await expectAbortedOnUnmount(pending, unmount)
  },
)
