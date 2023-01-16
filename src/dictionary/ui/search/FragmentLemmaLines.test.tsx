import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryService } from 'query/QueryService'
import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { dictionaryWord } from 'test-support/word-info-fixtures'
import FragmentLemmaLines from './FragmentLemmaLines'
import { fragment, lines } from 'test-support/test-fragment'
import { QueryItem, QueryResult } from 'query/QueryResult'
import Bluebird from 'bluebird'
import WordService from 'dictionary/application/WordService'
import { MemoryRouter } from 'react-router-dom'
import { DictionaryContext } from '../dictionary-context'
import { Fragment } from 'fragmentarium/domain/fragment'
import produce, { castDraft, Draft } from 'immer'
import { Text } from 'transliteration/domain/text'
import { TextLine, TextLineDto } from 'transliteration/domain/text-line'
import { atfTokenKur } from 'test-support/test-tokens'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('query/QueryService')

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const queryService = new (QueryService as jest.Mock<
  jest.Mocked<QueryService>
>)()

const lineDto: TextLineDto = {
  ...lines[0],
  content: [{ ...atfTokenKur, uniqueLemma: [dictionaryWord._id] }],
}
const text = new Text({
  lines: [new TextLine(lineDto)],
})

const fragmentWithLemma = produce(fragment, (draft: Draft<Fragment>) => {
  draft.text = castDraft(text)
})

let container: HTMLElement

function renderFragmentLemmaLines() {
  container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <FragmentLemmaLines
          lemmaId={dictionaryWord._id}
          queryService={queryService}
          fragmentService={fragmentService}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>
  ).container
}

describe('Show Fragmentarium entries', () => {
  beforeEach(async () => {
    const queryItem: QueryItem = {
      museumNumber: {
        prefix: 'Test',
        number: 'Fragment',
        suffix: '',
      },
      matchingLines: [0],
      matchCount: 1,
    }
    const queryResult: QueryResult = { items: [queryItem], matchCountTotal: 1 }
    queryService.query.mockReturnValue(Bluebird.resolve(queryResult))
    fragmentService.find.mockReturnValue(Bluebird.resolve(fragmentWithLemma))

    await act(async () => renderFragmentLemmaLines())

    expect(queryService.query).toBeCalledWith(dictionaryWord._id)
  })

  it('shows the fragment number', async () => {
    expect(screen.getByText(fragmentWithLemma.number)).toBeVisible()
  })

  it('shows the matching Fragmentarium line', async () => {
    expect(container).toMatchSnapshot()
  })
})
