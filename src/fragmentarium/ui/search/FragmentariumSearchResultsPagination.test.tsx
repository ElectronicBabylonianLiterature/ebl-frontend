import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Bluebird from 'bluebird'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import FragmentariumSearchResults from 'fragmentarium/ui/search/FragmentariumSearchResultsPagination'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Text } from 'transliteration/domain/text'
import textLineFixture from 'test-support/lines/text-line'
import WordService from 'dictionary/application/WordService'

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
  pages = ''
) {
  return render(
    <MemoryRouter>
      <FragmentariumSearchResults
        number={number}
        transliteration={transliteration}
        bibliographyId={bibliographyId}
        pages={pages}
        fragmentSearchService={fragmentSearchService}
        wordService={wordService}
      />
    </MemoryRouter>
  )
}

describe('search fragmentarium only number', () => {
  beforeEach(async () => {
    fragments = fragmentInfoFactory.buildList(2)
    fragmentSearchService.searchFragmentarium.mockReturnValueOnce(
      Bluebird.resolve(fragments)
    )
    renderFragmentariumSearchResults(number)
    await screen.findByText(fragments[0].number)
  })

  it('Searches for the given parameters', () => {
    expect(fragmentSearchService.searchFragmentarium).toBeCalledWith(
      number,
      '',
      '',
      ''
    )
  })

  it('Displays and links results', async () => {
    for (const fragment of fragments) {
      expect(await screen.findByText(fragment.number)).toHaveAttribute(
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
      Bluebird.resolve(fragments)
    )
    renderFragmentariumSearchResults('', transliteration)
    await screen.findByText(fragments[0].number)
  })

  it('Queries the API with given parameters', () => {
    expect(fragmentSearchService.searchFragmentarium).toBeCalledWith(
      '',
      transliteration,
      '',
      ''
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
