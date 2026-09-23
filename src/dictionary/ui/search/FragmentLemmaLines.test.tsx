import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { render, screen } from '@testing-library/react'
import { dictionaryWord } from 'test-support/word-info-fixtures'
import FragmentLemmaLines, { RenderFragmentLines } from './FragmentLemmaLines'
import { fragment, lines } from 'test-support/test-fragment'
import { QueryItem, QueryResult } from 'query/QueryResult'
import WordService from 'dictionary/application/WordService'
import { MemoryRouter } from 'react-router-dom'
import { DictionaryContext } from '../dictionary-context'
import { Fragment } from 'fragmentarium/domain/fragment'
import { produce, castDraft, Draft } from 'immer'
import { Text } from 'transliteration/domain/text'
import { TextLine, TextLineDto } from 'transliteration/domain/text-line'
import { atfTokenKur } from 'test-support/test-tokens'
import { lineNumberFactory } from 'test-support/linenumber-factory'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')

beforeEach(() => {
  jest.clearAllMocks()
})

const word = { ...dictionaryWord, _id: 'testWordId' }

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

const lineDto: TextLineDto = {
  ...lines[0],
  content: [{ ...atfTokenKur, uniqueLemma: [word._id] }],
}
const text = new Text({
  lines: [new TextLine(lineDto)],
})

const fragmentWithLemma = produce(fragment, (draft: Draft<Fragment>) => {
  draft.text = castDraft(text)
})

const previewSubsetText = new Text({
  lines: [
    new TextLine(lineDto),
    new TextLine({
      ...lines[1],
      prefix: '2.',
      lineNumber: lineNumberFactory.build({ number: 2 }),
    }),
  ],
})

const previewSubsetFragment = produce(fragment, (draft: Draft<Fragment>) => {
  draft.text = castDraft(previewSubsetText)
})

let container: HTMLElement

function renderFragmentLemmaLines() {
  container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <FragmentLemmaLines
          lemmaId={word._id}
          fragmentService={fragmentService}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  ).container
}

describe('Show Library entries', () => {
  const setup = async () => {
    const queryItem: QueryItem = {
      museumNumber: 'Test.Fragment',
      matchingLines: [0],
      matchCount: 1,
    }
    const queryResult: QueryResult = { items: [queryItem], matchCountTotal: 1 }
    fragmentService.query.mockReturnValue(Promise.resolve(queryResult))
    fragmentService.find.mockReturnValue(Promise.resolve(fragmentWithLemma))

    renderFragmentLemmaLines()

    expect(fragmentService.query).toBeCalledWith({ lemmas: word._id })
    await screen.findByText(fragmentWithLemma.number)
  }

  it('shows the fragment number', async () => {
    await setup()
    expect(await screen.findByText(fragmentWithLemma.number)).toBeVisible()
  })

  it('shows the matching Library line', async () => {
    await setup()
    await screen.findByText(fragmentWithLemma.number)
    await screen.findByText('kur')
    expect(container).toMatchSnapshot()
  })

  it('renders a document-count fallback when matchCountTotal is null', async () => {
    const queryItem: QueryItem = {
      museumNumber: 'Test.Fragment',
      matchingLines: [0],
      matchCount: 1,
    }
    fragmentService.query.mockReturnValue(
      Promise.resolve({ items: [queryItem], matchCountTotal: null }),
    )
    fragmentService.find.mockReturnValue(Promise.resolve(fragmentWithLemma))

    renderFragmentLemmaLines()

    expect(
      await screen.findByText('Matches found in 1 Library document'),
    ).toBeVisible()
    expect(screen.queryByText('0 matches')).not.toBeInTheDocument()
  })
})

describe('RenderFragmentLines', () => {
  it('renders the preview subset without hydrating the fragment', () => {
    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <RenderFragmentLines
            fragment={previewSubsetFragment}
            lemmaIds={[word._id]}
            linesToShow={3}
            totalLines={5}
          />
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'kur' })).toBeVisible()
    expect(screen.getByText('And 2 more')).toBeVisible()
  })
})
