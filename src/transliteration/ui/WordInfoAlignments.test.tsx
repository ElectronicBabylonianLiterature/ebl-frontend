import React, { useState } from 'react'
import TextService from 'corpus/application/TextService'
import WordService from 'dictionary/application/WordService'
import { Word } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { MemoryRouter } from 'react-router-dom'
import { screen, render, within } from '@testing-library/react'
import {
  LemmaMap,
  createLemmaMap,
  LineLemmasContext,
} from './LineLemmasContext'
import { ReconstructionPopover } from './WordInfo'
import {
  highlightIndexSetterMock,
  lemmatizableToken,
  lineInfo,
} from 'test-support/line-group-fixtures'
import userEvent from '@testing-library/user-event'
import Bluebird from 'bluebird'
import {
  alignedManuscriptLineDto,
  dictionaryWord,
  manuscriptLineDto,
  variantTokenDto,
} from 'test-support/word-info-fixtures'
import { LineDetails } from 'corpus/domain/line-details'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import { TextLine } from 'transliteration/domain/text-line'
import { LineGroup } from './LineGroup'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'

jest.mock('dictionary/application/WordService')
jest.mock('corpus/application/TextService')

const MockTextService = TextService as jest.Mock<jest.Mocked<TextService>>
const textServiceMock = new MockTextService()

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()

const reconstructionToken = { ...lemmatizableToken, sentenceIndex: 1 }
const trigger = 'trigger'

let view: HTMLElement

function WrappedWordInfoWithPopover({
  word,
  lineGroup,
}: {
  word: Word
  lineGroup: LineGroup
}): JSX.Element {
  const [lemmaMap, lemmaSetter] = useState<LemmaMap>(
    createLemmaMap(['ušurtu I'])
  )
  return (
    <MemoryRouter>
      <LineLemmasContext.Provider
        value={{
          lemmaMap: lemmaMap,
          lemmaSetter: lemmaSetter,
        }}
      >
        <DictionaryContext.Provider value={wordServiceMock}>
          <ReconstructionPopover token={word} lineGroup={lineGroup}>
            {trigger}
          </ReconstructionPopover>
        </DictionaryContext.Provider>
      </LineLemmasContext.Provider>
    </MemoryRouter>
  )
}

const manuscriptLine = manuscriptLineDisplayFactory.build(
  {},
  {
    associations: manuscriptLineDto,
  }
)

const variantManuscriptLine = manuscriptLineDisplayFactory.build(
  {},
  {
    associations: {
      ...manuscriptLineDto,
      line: new TextLine({
        ...alignedManuscriptLineDto,
        content: [variantTokenDto],
      }),
    },
  }
)

const lineDetails = new LineDetails(
  [
    lineVariantDisplayFactory.build({
      reconstruction: [],
      manuscripts: [manuscriptLine],
    }),
  ],
  0
)

const lineDetailsWithVariant = new LineDetails(
  [
    lineVariantDisplayFactory.build({
      reconstruction: [],
      manuscripts: [variantManuscriptLine],
    }),
  ],
  0
)

async function renderAndOpen(dictionaryWord: DictionaryWord) {
  wordServiceMock.find.mockReturnValue(Bluebird.resolve(dictionaryWord))

  const lineGroup = new LineGroup(
    [reconstructionToken],
    {
      ...lineInfo,
      textService: textServiceMock,
    },
    highlightIndexSetterMock
  )

  render(
    <WrappedWordInfoWithPopover
      word={reconstructionToken as Word}
      lineGroup={lineGroup}
    />
  )

  userEvent.click(screen.getByRole('button', { name: 'trigger ‡' }))
  return screen.findByRole('tooltip')
}

describe('WordInfoWithPopover', () => {
  beforeEach(async () => {
    textServiceMock.findChapterLine.mockReturnValue(
      Bluebird.resolve(lineDetails)
    )
    view = await renderAndOpen(dictionaryWord)
  })

  it('shows trigger', () => {
    expect(within(view).getByText(trigger)).toBeVisible()
  })

  it('shows lemma', () => {
    expect(within(view).getByText(dictionaryWord.lemma.join(' '))).toBeVisible()
  })

  it(`shows aligned manuscript siglum '${manuscriptLine.siglum}'`, () => {
    expect(within(view).getByText(manuscriptLine.siglum)).toBeVisible()
  })

  it(`shows aligned manuscript token`, () => {
    expect(within(view).getByText('testlemma')).toBeVisible()
  })
})

describe('WordInfoWithPopover with variant', () => {
  beforeEach(async () => {
    textServiceMock.findChapterLine.mockReturnValue(
      Bluebird.resolve(lineDetailsWithVariant)
    )
    view = await renderAndOpen(dictionaryWord)
  })

  it(`shows aligned variant heading`, () => {
    expect(within(view).getByText('Variant₁:')).toBeVisible()
  })

  it(`shows aligned variant token lemma link`, () => {
    expect(
      within(view).getAllByText(dictionaryWord.lemma.join(' '))
    ).toHaveLength(2)
  })
})
