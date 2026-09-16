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
import { createFragmentCardSummary } from 'test-support/fragment-query-summary'
import { withPreviewLines } from 'test-support/fragment-query-preview'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { Periods } from 'common/utils/period'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLines } from 'fragmentarium/ui/search/FragmentariumSearchResultComponents'
import mockObjectUrl from 'test-support/mockObjectUrl'

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

mockObjectUrl('blob:url')

beforeEach(() => {
  jest.clearAllMocks()
  dossiersService.queryByIds.mockResolvedValue([])
})

function renderFragmentLines(
  queryItem: QueryItem,
  includeLatestRecord = false,
) {
  return render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <FragmentLines
          fragmentService={fragmentService}
          dossiersService={dossiersService}
          queryItem={queryItem}
          linesToShow={3}
          includeLatestRecord={includeLatestRecord}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

describe('thumbnail variants', () => {
  const thumbnailPath = '/fragments/K.1/thumbnail/small'

  function photoFragment(): Fragment {
    return withPreviewLines(
      fragmentFactory.build({ hasPhoto: true, dossiers: [] }),
    )
  }

  it('renders the summary thumbnail without fetching a blob', () => {
    const summaryFragment = photoFragment()

    renderFragmentLines({
      museumNumber: summaryFragment.number,
      matchingLines: [1],
      matchCount: 1,
      fragment: summaryFragment,
      cardSummary: createFragmentCardSummary(),
      thumbnailPath,
    })

    expect(
      screen.getByAltText(`Preview of ${summaryFragment.number}`),
    ).toHaveAttribute('src', `http://example.com${thumbnailPath}`)
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })

  it('falls back to the blob thumbnail for a legacy prefetched fragment', async () => {
    const legacyFragment = photoFragment()
    fragmentService.findThumbnail.mockReturnValue(
      Bluebird.resolve({ blob: new Blob([''], { type: 'image/jpeg' }) }),
    )

    renderFragmentLines({
      museumNumber: legacyFragment.number,
      matchingLines: [1],
      matchCount: 1,
      fragment: legacyFragment,
    })

    expect(
      await screen.findByAltText(`Preview of ${legacyFragment.number}`),
    ).toHaveAttribute('src', 'blob:url')
    expect(fragmentService.findThumbnail).toHaveBeenCalledWith(
      legacyFragment,
      'small',
    )
    expect(fragmentService.find).not.toHaveBeenCalled()
  })

  it('renders nothing when the legacy thumbnail has no blob', async () => {
    const legacyFragment = photoFragment()
    fragmentService.findThumbnail.mockReturnValue(
      Bluebird.resolve({ blob: null }),
    )

    renderFragmentLines({
      museumNumber: legacyFragment.number,
      matchingLines: [1],
      matchCount: 1,
      fragment: legacyFragment,
    })

    expect(await screen.findByText(legacyFragment.number)).toBeInTheDocument()
    expect(
      screen.queryByAltText(`Preview of ${legacyFragment.number}`),
    ).not.toBeInTheDocument()
  })
})

describe('latest transliteration record display', () => {
  const historical = new RecordEntry({
    user: 'Historical',
    date: '1998-01-17T10:50:36.127247/1999-04-17T10:29:39.127247',
    type: 'HistoricalTransliteration',
  })
  const current = new RecordEntry({
    user: 'Current',
    date: '2024-02-03T00:00:00.000000',
    type: 'Transliteration',
  })

  function recordFragment(record: readonly RecordEntry[]): Fragment {
    return withPreviewLines(
      fragmentFactory.build(
        { hasPhoto: false, dossiers: [] },
        { associations: { record } },
      ),
    )
  }

  function queryItemFor(fragment: Fragment): QueryItem {
    return {
      museumNumber: fragment.number,
      matchingLines: [1],
      matchCount: 1,
      fragment,
    }
  }

  it('shows the current record and never the historical one', () => {
    const fragment = recordFragment([historical, current])

    renderFragmentLines(queryItemFor(fragment), true)

    expect(screen.getByText(/Current/)).toBeInTheDocument()
    expect(screen.queryByText(/Historical/)).not.toBeInTheDocument()
    expect(screen.queryByText('No record')).not.toBeInTheDocument()
  })

  it('shows no record for a hydrated fragment without a current record', async () => {
    const fragment = recordFragment([historical])
    fragmentService.find.mockReturnValue(Bluebird.resolve(fragment))

    renderFragmentLines(
      { museumNumber: fragment.number, matchingLines: [1], matchCount: 1 },
      true,
    )

    expect(await screen.findByText('No record')).toBeInTheDocument()
    expect(screen.queryByText(/Historical/)).not.toBeInTheDocument()
  })
})

describe('summary card details', () => {
  it('omits the script suffix and thumbnail when neither is available', () => {
    const noScriptFragment = withPreviewLines(
      fragmentFactory.build({
        hasPhoto: true,
        dossiers: [],
        script: { period: Periods.None, periodModifier: undefined },
      }),
    )

    renderFragmentLines({
      museumNumber: noScriptFragment.number,
      matchingLines: [1],
      matchCount: 1,
      fragment: noScriptFragment,
      cardSummary: createFragmentCardSummary(),
      thumbnailPath: undefined,
    })

    expect(screen.getByText(noScriptFragment.number)).toBeInTheDocument()
    expect(
      screen.queryByAltText(`Preview of ${noScriptFragment.number}`),
    ).not.toBeInTheDocument()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })
})
