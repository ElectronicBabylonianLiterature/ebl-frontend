import React from 'react'
import Bluebird from 'bluebird'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { QueryItem } from 'query/QueryResult'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Text } from 'transliteration/domain/text'
import { FragmentLines } from './FragmentariumSearchResultComponents'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

beforeEach(() => {
  jest.clearAllMocks()
  dossiersService.queryByIds.mockResolvedValue([])
})

function renderFragmentLines(queryItem: QueryItem) {
  return render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <FragmentLines
          fragmentService={fragmentService}
          dossiersService={dossiersService}
          queryItem={queryItem}
          linesToShow={3}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

describe('FragmentLines', () => {
  it('renders summary-backed rows without hydrating them', async () => {
    const fragment = fragmentFactory.build({
      hasPhoto: false,
      dossiers: [],
    })

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [1, 2, 3],
      matchCount: 3,
      fragment,
      thumbnailPath: null,
    })

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
    expect(screen.getByText(fragment.number)).toBeInTheDocument()
  })

  it('renders summary-backed rows with empty previews without hydrating them', async () => {
    const fragment = fragmentFactory.build({
      hasPhoto: false,
      dossiers: [],
      text: new Text({ lines: [] }),
    })

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [],
      matchCount: 0,
      fragment,
      thumbnailPath: null,
    })

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
    expect(screen.getByText(fragment.number)).toBeInTheDocument()
  })

  it('shows the hydration spinner when the query item is not render-ready', async () => {
    fragmentService.find.mockReturnValueOnce(
      new Bluebird(() => undefined) as unknown as Bluebird<never>,
    )

    renderFragmentLines({
      museumNumber: 'X.1',
      matchingLines: [1, 2, 3],
      matchCount: 3,
    })

    expect(fragmentService.find).toHaveBeenCalledWith('X.1', [1, 2, 3], false)
    expect(await screen.findByLabelText('Spinner')).toBeInTheDocument()
    expect(screen.queryByText('X.1')).not.toBeInTheDocument()
  })
})
