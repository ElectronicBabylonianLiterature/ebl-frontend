import React from 'react'
import WordService from 'dictionary/application/WordService'
import { wordFactory } from 'test-support/word-fixtures'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { render, screen, within } from '@testing-library/react'
import WordInfo from './WordInfo'
import Bluebird from 'bluebird'
import { Word } from 'transliteration/domain/token'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DictionaryWord from 'dictionary/domain/Word'
import { LineInfoContext } from 'corpus/ui/AlignedManuscriptTokens'
import TextService from 'corpus/application/TextService'
import {
  LineDetails,
  LineVariantDetails,
  ManuscriptLineDisplay,
} from 'corpus/domain/line-details'
import { ManuscriptTypes } from 'corpus/domain/manuscript'
import { PeriodModifiers, Periods } from 'corpus/domain/period'
import { Provenances } from 'corpus/domain/provenance'
import { lines } from 'test-support/test-fragment'
import { NoteLine } from 'transliteration/domain/note-line'
import { TextLine } from 'transliteration/domain/text-line'

jest.mock('dictionary/application/WordService')
jest.mock('corpus/application/TextService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const textServiceMock = new (TextService as jest.Mock<
  jest.Mocked<TextService>
>)()

const dictionaryWord = wordFactory.homonymNotI().build()
const word: Word = {
  enclosureType: [],
  cleanValue: '|KUR.KUR|',
  value: '|KUR.KUR|',
  language: 'AKKADIAN',
  normalized: false,
  lemmatizable: true,
  alignable: true,
  uniqueLemma: [dictionaryWord._id],
  erasure: 'NONE',
  alignment: null,
  variant: null,
  parts: [
    {
      enclosureType: [],
      cleanValue: '|KUR.KUR|',
      value: '|KUR.KUR|',
      type: 'CompoundGrapheme',
    },
  ],
  type: 'Word',
  hasVariantAlignment: false,
}
const LINE_INFO = {
  chapterId: {
    textId: { genre: 'L', category: 99, index: 99 },
    stage: 'Old Babylonian',
    name: '',
  },
  lineNumber: 1,
  variantNumber: 1,
  textService: textServiceMock,
}
const lineDetails = new LineDetails(
  [
    new LineVariantDetails(
      [],
      new NoteLine({
        content: [],
        parts: [
          {
            text: 'note note',
            type: 'StringPart',
          },
        ],
      }),
      [
        new ManuscriptLineDisplay(
          Provenances.Nippur,
          PeriodModifiers['Early'],
          Periods['Ur III'],
          ManuscriptTypes.School,
          '1',
          [],
          ['o'],
          new TextLine(lines[0]),
          [],
          [],
          [],
          'BM.X',
          false,
          'X.1'
        ),
      ],
      [],
      []
    ),
  ],
  0
)

const modifierClass = 'block__element--modifier'
const trigger = 'trigger'

function WrappedWordInfo({ word }: { word: Word }): JSX.Element {
  return (
    <MemoryRouter>
      <DictionaryContext.Provider value={wordServiceMock}>
        <LineInfoContext.Provider value={LINE_INFO}>
          <WordInfo word={word} tokenClasses={[modifierClass]}>
            {trigger}
          </WordInfo>
        </LineInfoContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>
  )
}

async function renderAndOpen(
  dictionaryWord: DictionaryWord,
  lineDetails: LineDetails
) {
  wordServiceMock.find.mockReturnValueOnce(Bluebird.resolve(dictionaryWord))
  textServiceMock.findChapterLine.mockReturnValue(Bluebird.resolve(lineDetails))

  render(<WrappedWordInfo word={word} />)

  userEvent.click(screen.getByRole('button', { name: 'trigger' }))
  return screen.findByRole('tooltip')
}

test('heading', async () => {
  const view = await renderAndOpen(dictionaryWord, lineDetails)
  expect(within(view).getByText(trigger)).toHaveClass(modifierClass)
})

test('lemma', async () => {
  const view = await renderAndOpen(dictionaryWord, lineDetails)
  expect(within(view).getByText(dictionaryWord.lemma.join(' '))).toBeVisible()
})

test('homonym', async () => {
  const view = await renderAndOpen(dictionaryWord, lineDetails)
  expect(within(view).getByText(dictionaryWord.homonym)).toBeVisible()
})

test('guide word', async () => {
  const view = await renderAndOpen(dictionaryWord, lineDetails)
  expect(within(view).getByText(`“${dictionaryWord.guideWord}”`)).toBeVisible()
})

test('dictionary link', async () => {
  const view = await renderAndOpen(dictionaryWord, lineDetails)
  const link = within(view).getByRole('link', {
    name: 'Open the word in the Dictionary.',
  })
  expect(link).toHaveAttribute(
    'href',
    `/dictionary/${encodeURIComponent(dictionaryWord._id)}`
  )
  expect(link).toHaveAttribute('target', '_blank')
})

test('no lemma', () => {
  const notLemmatized: Word = { ...word, uniqueLemma: [] }

  render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordServiceMock}>
        <LineInfoContext.Provider value={LINE_INFO}>
          <WordInfo word={notLemmatized} tokenClasses={[]}>
            {trigger}
          </WordInfo>
        </LineInfoContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>
  )

  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.getByText(trigger)).toBeVisible()
})

test('variant alignment indicator', async () => {
  render(<WrappedWordInfo word={{ ...word, hasVariantAlignment: true }} />)

  expect(screen.getByText('‡')).toBeVisible()
})

test('no variant alignment indicator', async () => {
  render(<WrappedWordInfo word={word} />)

  expect(screen.queryByText('‡')).not.toBeInTheDocument()
})
