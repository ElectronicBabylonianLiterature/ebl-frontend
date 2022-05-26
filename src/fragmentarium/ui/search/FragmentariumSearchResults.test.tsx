import React from 'react'
import { Router } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Bluebird from 'bluebird'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import FragmentariumSearchResults from 'fragmentarium/ui/search/FragmentariumSearchResults'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Text } from 'transliteration/domain/text'
import textLineFixture from 'test-support/lines/text-line'
import WordService from 'dictionary/application/WordService'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, MemoryHistory } from 'history'

let history: MemoryHistory

jest.mock('fragmentarium/application/FragmentSearchService')
const number = 'K.003292'
let fragments: FragmentInfo[]
const fragmentSearchService = new (FragmentSearchService as jest.Mock<
  jest.Mocked<FragmentSearchService>
>)()
jest.mock('dictionary/application/WordService')

const wordService = new (WordService as jest.Mock<WordService>)()

function renderFragmentariumSearchResults(
  number = '',
  transliteration = '',
  bibliographyId = '',
  pages = '',
  paginationIndex = 0
) {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  return render(
    <Router history={history}>
      <FragmentariumSearchResults
        number={number}
        transliteration={transliteration}
        bibliographyId={bibliographyId}
        pages={pages}
        fragmentSearchService={fragmentSearchService}
        wordService={wordService}
        paginationIndex={paginationIndex}
      />
    </Router>
  )
}

describe('search fragmentarium only number', () => {
  beforeEach(async () => {
    fragments = fragmentInfoFactory.buildList(2)
    fragmentSearchService.searchFragmentarium.mockReturnValueOnce(
      Bluebird.resolve({ fragmentInfos: fragments, totalCount: 2 })
    )
    renderFragmentariumSearchResults(number)
    await screen.findByText(fragments[0].number)
  })

  it('Searches for the given parameters', () => {
    expect(fragmentSearchService.searchFragmentarium).toBeCalledWith(
      number,
      '',
      '',
      '',
      0
    )
  })
  it('Displays and links results', async () => {
    for (const fragment of fragments) {
      expect(screen.getByText(fragment.number)).toHaveAttribute(
        'href',
        `/fragmentarium/${fragment.number}`
      )
    }
  })
})

const transliteration = 'ma i-ra\nka li'

const matchingLineTestTextFixture = new Text({
  lines: [textLineFixture],
})

describe('search fragmentarium only transliteration', () => {
  beforeEach(async () => {
    fragments = [
      fragmentInfoFactory.build({ matchingLines: matchingLineTestTextFixture }),
    ]
    fragmentSearchService.searchFragmentarium.mockReturnValueOnce(
      Bluebird.resolve({ fragmentInfos: fragments, totalCount: 1 })
    )
    renderFragmentariumSearchResults('', transliteration)
    await screen.findByText(fragments[0].number)
  })
  it('Queries the API with given parameters', () => {
    expect(fragmentSearchService.searchFragmentarium).toBeCalledWith(
      '',
      transliteration,
      '',
      '',
      0
    )
  })
  it('Links results', () => {
    for (const fragment of fragments) {
      expect(screen.getByText(fragment.number)).toHaveAttribute(
        'href',
        `/fragmentarium/${fragment.number}`
      )
    }
  })
  it('Displays script', () => {
    for (const fragment of fragments) {
      expect(screen.getAllByText(`(${fragment.script})`)).not.toEqual([])
    }
  })
  it('Displays matching lines', () => {
    expect(screen.getByText('kur')).toBeVisible()
  })
})

describe('test scrolling through pagination', () => {
  beforeEach(async () => {
    fragments = fragmentInfoFactory.buildList(115)
    fragmentSearchService.searchFragmentarium
      .mockReturnValueOnce(
        Bluebird.resolve({
          fragmentInfos: fragments.slice(0, 100),
          totalCount: 115,
        })
      )
      .mockReturnValueOnce(
        Bluebird.resolve({
          fragmentInfos: fragments.slice(100, 115),
          totalCount: 115,
        })
      )
    renderFragmentariumSearchResults('', transliteration, '', '', 0)
    await screen.findByText(fragments[0].number)
  })
  it('Next Page', async () => {
    userEvent.click(screen.getByText('2'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith({ search: 'paginationIndex=1' })
    )
    await waitFor(() =>
      expect(fragmentSearchService.searchFragmentarium).toBeCalledWith(
        '',
        transliteration,
        '',
        '',
        1
      )
    )
    await screen.findByText(fragments[100].number)
    expect(screen.queryByText(fragments[0].number)).not.toBeInTheDocument()
  })
})
