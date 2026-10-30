/* eslint-disable camelcase */
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryItem } from 'query/QueryResult'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { fragment } from 'test-support/test-fragment'
import {
  createFragmentCardSummary,
  productionSummaryReferences,
  summaryBibliographyDocuments,
  SUMMARY_LEMMA_ID,
} from 'test-support/fragment-query-summary'
import {
  previewLine,
  readingWord,
  tokenWithClass,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import createReference from 'bibliography/application/createReference'
import { createResearchProject } from 'research-projects/researchProject'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { SurfaceAtLine, ColumnAtLine } from 'transliteration/domain/at-lines'
import { NoteLine } from 'transliteration/domain/note-line'
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
  linesToShow = 3,
  queryLemmas?: readonly string[],
) {
  return render(fragmentLinesElement(queryItem, linesToShow, queryLemmas))
}

function fragmentLinesElement(
  queryItem: QueryItem,
  linesToShow = 3,
  queryLemmas?: readonly string[],
) {
  return (
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <FragmentLines
          fragmentService={fragmentService}
          dossiersService={dossiersService}
          queryItem={queryItem}
          linesToShow={linesToShow}
          queryLemmas={queryLemmas}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>
  )
}

describe('FragmentLines', () => {
  it('counts hidden text lines across overlapping three-line matches', () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const preview = Array.from({ length: 5 }, (_unused, index) =>
      previewLine(index + 1, []),
    )

    renderFragmentLines(
      {
        museumNumber: fragment.number,
        matchingLines: [0, 1, 2, 2, 3, 4, 4, 5, 6],
        matchCount: 3,
        totalMatchingLines: 7,
        fragment: withPreviewLines(fragment, preview),
        cardSummary: createFragmentCardSummary(),
      },
      5,
    )

    expect(
      screen.getByRole('button', { name: 'Show 2 more matching lines' }),
    ).toBeVisible()
    expect(fragmentService.find).not.toHaveBeenCalled()
  })

  it('does not invent a numeric line count without preview metadata', () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [0, 1, 2, 3],
      matchCount: 20,
      fragment: withPreviewLines(fragment),
      cardSummary: createFragmentCardSummary(),
    })

    expect(
      screen.getByRole('button', { name: 'Show more matching lines' }),
    ).toBeVisible()
    expect(screen.queryByText(/And \d+ more/)).not.toBeInTheDocument()
  })

  it('deduplicates overlapping indexes before hydrating preview lines', async () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    fragmentService.find.mockResolvedValueOnce(fragment)

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [0, 1, 1, 2, 2, 3],
      matchCount: 2,
      totalMatchingLines: 4,
    })

    expect(await screen.findByText(fragment.number)).toBeInTheDocument()
    expect(fragmentService.find).toHaveBeenCalledWith(
      fragment.number,
      [0, 1, 2],
      false,
    )
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })
  it('renders compact summary lines and lemma highlights without hydration', () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })

    renderFragmentLines(
      {
        museumNumber: fragment.number,
        matchingLines: [1, 2],
        matchCount: 2,
        fragment: withPreviewLines(fragment),
        cardSummary: createFragmentCardSummary(),
        thumbnailPath: null,
      },
      3,
      [SUMMARY_LEMMA_ID],
    )

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
    expect(screen.getByText(fragment.number)).toBeInTheDocument()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByRole('table')).toHaveTextContent('kur ša')
    expect(
      screen.getByText(
        tokenWithClass('Transliteration__Word--highlight', 'kur'),
      ),
    ).toBeInTheDocument()
  })

  it('renders empty compact previews without hydrating them', () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [],
      matchCount: 0,
      fragment,
      cardSummary: createFragmentCardSummary(),
      thumbnailPath: null,
    })

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
    expect(screen.getByText(fragment.number)).toBeInTheDocument()
  })

  it('resolves summary thumbnail paths without fetching thumbnail blobs', async () => {
    const fragment = fragmentFactory.build({ hasPhoto: true, dossiers: [] })
    const thumbnailPath = `/fragments/${fragment.number}/thumbnail/small`

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [1, 2],
      matchCount: 2,
      fragment: withPreviewLines(fragment),
      cardSummary: createFragmentCardSummary(),
      thumbnailPath,
    })

    expect(
      await screen.findByAltText(`Preview of ${fragment.number}`),
    ).toHaveAttribute('src', `http://example.com${thumbnailPath}`)
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })

  it('shows the hydration spinner when the query item is not render-ready', async () => {
    fragmentService.find.mockReturnValueOnce(
      new Promise<never>(() => undefined),
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

  it('fetches and renders a thumbnail for a hydrated fragment with a photo', async () => {
    const fragment = fragmentFactory.build({ hasPhoto: true, dossiers: [] })
    fragmentService.find.mockResolvedValueOnce(fragment)
    fragmentService.findThumbnail.mockResolvedValueOnce({
      blob: new Blob([''], { type: 'image/jpeg' }),
    })

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [1, 2, 3],
      matchCount: 3,
    })

    expect(
      await screen.findByAltText(`Preview of ${fragment.number}`),
    ).toBeInTheDocument()
  })

  it('preserves scholarly card fields for production-shaped summaries', async () => {
    const summaryFragment = Fragment.create({
      ...fragment,
      references: productionSummaryReferences.map((reference) =>
        createReference({
          ...reference,
          document: summaryBibliographyDocuments[reference.id],
        }),
      ),
      projects: [createResearchProject('CAIC')],
      dossiers: [{ dossierId: 'D001', isUncertain: false }],
      archaeology: {
        excavationNumber: 'EX.7',
        site: { name: 'Babylon', abbreviation: '', parent: null },
      },
    })
    const thumbnailPath = '/fragments/Test.Fragment/thumbnail/small'
    dossiersService.queryByIds.mockResolvedValue([
      new DossierRecord({ _id: 'D001' }),
    ])

    renderFragmentLines(
      {
        museumNumber: summaryFragment.number,
        matchingLines: [1, 2, 3, 4, 5],
        matchCount: 5,
        totalMatchingLines: 5,
        fragment: withPreviewLines(summaryFragment),
        cardSummary: createFragmentCardSummary(),
        thumbnailPath,
      },
      2,
      [SUMMARY_LEMMA_ID],
    )
    expect(await screen.findByRole('button', { name: 'D001' })).toBeVisible()

    expect(
      screen.getByRole('heading', { name: 'Test.Fragment (LB)' }),
    ).toBeVisible()
    expect(screen.getByText('Accession no.: A.38.b')).toBeVisible()
    expect(screen.getByText('Excavation no.: EX.7')).toBeVisible()
    expect(screen.getByText('Provenance: Babylon')).toBeVisible()
    expect(screen.getByText('ARCHIVE ➝ Administrative ➝ Lists')).toBeVisible()
    expect(screen.getByRole('time')).toHaveTextContent('1.I.1 SE')
    expect(
      screen.getByLabelText(
        'Link to Cuneiform Artefacts of Iraq in Context project',
      ),
    ).toBeVisible()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByRole('table')).toHaveTextContent('kur ša')
    expect(
      screen.getByRole('button', { name: 'Show 3 more matching lines' }),
    ).toBeVisible()
    expect(
      screen.getByText(/Borger/, {
        selector: '.reference-popover__interactive',
      }),
    ).toHaveTextContent('Borger, 1957: 12-13 [l. 1.] (D)')
    expect(
      await screen.findByAltText('Preview of Test.Fragment'),
    ).toHaveAttribute('src', `http://example.com${thumbnailPath}`)
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })
  it('counts remaining compact summary lines from rows actually rendered', () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })

    renderFragmentLines(
      {
        museumNumber: fragment.number,
        matchingLines: [1, 2, 3, 4, 5, 6, 7],
        matchCount: 7,
        totalMatchingLines: 7,
        fragment: withPreviewLines(fragment),
        cardSummary: createFragmentCardSummary(),
        thumbnailPath: null,
      },
      5,
    )

    expect(
      screen.getByRole('button', { name: 'Show 5 more matching lines' }),
    ).toBeInTheDocument()
  })
})

describe('expanding Library matching lines', () => {
  function fullFragmentWithMarkers(base: Fragment): Fragment {
    return Fragment.create({
      ...base,
      text: new Text({
        lines: [
          new SurfaceAtLine({
            type: 'SurfaceAtLine',
            prefix: '@',
            content: [],
            displayValue: 'obverse',
            surface_label: {
              surface: 'OBVERSE',
              text: 'obverse',
              abbreviation: 'o',
              status: [],
            },
          }),
          new TextLine(previewLine(6, [readingWord])),
          new NoteLine({ content: [], parts: [] }),
          new SurfaceAtLine({
            type: 'SurfaceAtLine',
            prefix: '@',
            content: [],
            displayValue: 'reverse',
            surface_label: {
              surface: 'REVERSE',
              text: 'reverse',
              abbreviation: 'r',
              status: [],
            },
          }),
          new ColumnAtLine({
            type: 'ColumnAtLine',
            prefix: '@',
            content: [],
            displayValue: 'column ii',
            column_label: { column: 2, abbreviation: 'ii', status: [] },
          }),
          new TextLine(previewLine(6, [readingWord])),
          new TextLine(previewLine(7, [readingWord])),
        ],
      }),
    })
  }

  it('loads one card on demand, retains first-occurrence order and labels, and reuses loaded data', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const fullFragment = fullFragmentWithMarkers(base)
    const reverse = {
      ...previewLine(6, [readingWord]),
      index: 5,
      location: {
        object: null,
        surface: 'r',
        column: 'ii',
        sealNumber: null,
      },
    }
    const obverse = {
      ...previewLine(6, [readingWord]),
      index: 1,
      location: {
        object: null,
        surface: 'o',
        column: null,
        sealNumber: null,
      },
    }
    fragmentService.find.mockResolvedValueOnce(fullFragment)
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [5, 1, 5, 6],
        matchCount: 2,
        totalMatchingLines: 3,
        fragment: withPreviewLines(base, [reverse, obverse]),
        cardSummary: createFragmentCardSummary(),
      },
      2,
      [SUMMARY_LEMMA_ID],
    )

    expect(fragmentService.find).not.toHaveBeenCalled()
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(fragmentService.find).toHaveBeenCalledWith(base.number)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('link', { name: 'r. ii 7' })).toBeVisible()
    expect(
      within(screen.getByRole('table'))
        .getAllByRole('cell')
        .filter((cell) =>
          cell.classList.contains('fragment-lines-with-lemma__line-number'),
        )
        .map((cell) => cell.textContent),
    ).toEqual(['r. ii 6', 'o. 6', 'r. ii 7'])
    expect(
      screen.getAllByText(
        tokenWithClass('Transliteration__Word--highlight', 'kur'),
      ),
    ).toHaveLength(3)

    await userEvent.click(
      screen.getByRole('button', { name: 'Collapse matching lines' }),
    )
    expect(screen.getAllByRole('row')).toHaveLength(2)
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })

  it('reveals large result sets in bounded batches', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const lines = Array.from({ length: 25 }, (_unused, index) =>
      previewLine(index + 1, []),
    )
    fragmentService.find.mockResolvedValueOnce(withPreviewLines(base, lines))
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: lines.map((_line, index) => index),
        matchCount: 25,
        totalMatchingLines: 25,
        fragment: withPreviewLines(base, lines.slice(0, 2)),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 23 more matching lines' }),
    )
    expect(
      await screen.findByRole('button', {
        name: 'Show 13 more matching lines',
      }),
    ).toBeVisible()
    expect(screen.getAllByRole('row')).toHaveLength(12)
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 13 more matching lines' }),
    )
    expect(screen.getAllByRole('row')).toHaveLength(22)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })

  it('offers retry after a failed request', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const lines = [previewLine(1, []), previewLine(2, []), previewLine(3, [])]
    fragmentService.find
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(withPreviewLines(base, lines))
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [0, 1, 2],
        matchCount: 3,
        totalMatchingLines: 3,
        fragment: withPreviewLines(base, lines.slice(0, 2)),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load matching lines.',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Retry loading matching lines' }),
    )
    expect(await screen.findByText('3')).toBeVisible()
    expect(fragmentService.find).toHaveBeenCalledTimes(2)
  })

  it('ignores an obsolete response after cancellation or query change', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const lines = [previewLine(1, []), previewLine(2, []), previewLine(3, [])]
    let resolveRequest: (value: Fragment) => void = () => undefined
    fragmentService.find.mockReturnValueOnce(
      new Promise<Fragment>((resolve) => {
        resolveRequest = resolve
      }),
    )
    const firstItem: QueryItem = {
      museumNumber: base.number,
      matchingLines: [0, 1, 2],
      matchCount: 3,
      totalMatchingLines: 3,
      fragment: withPreviewLines(base, lines.slice(0, 2)),
      cardSummary: createFragmentCardSummary(),
    }
    const view = renderFragmentLines(firstItem, 2)

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(
      screen.getByRole('button', { name: 'Loading matching lines…' }),
    ).toBeDisabled()
    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel loading' }),
    )
    const nextItem: QueryItem = {
      ...firstItem,
      matchingLines: [8],
      totalMatchingLines: 1,
      fragment: withPreviewLines(base, [previewLine(9, [])]),
    }
    view.rerender(fragmentLinesElement(nextItem, 2))
    await act(async () => {
      resolveRequest(withPreviewLines(base, lines))
    })

    expect(screen.getByRole('table')).toHaveTextContent('9')
    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })

  it('expands only the clicked card', async () => {
    const first = fragmentFactory.build({
      number: 'First.Fragment',
      hasPhoto: false,
      dossiers: [],
    })
    const second = fragmentFactory.build({
      number: 'Second.Fragment',
      hasPhoto: false,
      dossiers: [],
    })
    const lines = [previewLine(1, []), previewLine(2, [])]
    const item = (base: Fragment): QueryItem => ({
      museumNumber: base.number,
      matchingLines: [0, 1],
      matchCount: 2,
      totalMatchingLines: 2,
      fragment: withPreviewLines(base, lines.slice(0, 1)),
      cardSummary: createFragmentCardSummary(),
    })
    fragmentService.find.mockResolvedValueOnce(withPreviewLines(first, lines))
    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <FragmentLines
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={item(first)}
            linesToShow={1}
          />
          <FragmentLines
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={item(second)}
            linesToShow={1}
          />
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )

    expect(fragmentService.find).not.toHaveBeenCalled()
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Show 1 more matching line' })[0],
    )
    expect(
      await screen.findByRole('button', { name: 'Collapse matching lines' }),
    ).toBeVisible()
    expect(fragmentService.find).toHaveBeenCalledWith(first.number)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
    expect(
      screen
        .getAllByRole('table')
        .map((table) => within(table).getAllByRole('row').length),
    ).toEqual([2, 1])
  })

  it('does not offer expansion beyond an exact matching-line total', () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [0, 1, 99],
        matchCount: 2,
        totalMatchingLines: 2,
        fragment: withPreviewLines(base, [
          previewLine(1, []),
          previewLine(2, []),
        ]),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    expect(
      screen.queryByRole('button', { name: /more matching lines/ }),
    ).not.toBeInTheDocument()
    expect(fragmentService.find).not.toHaveBeenCalled()
  })

  it('keeps the preview when returned indexes contain no additional text line', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const lines = [previewLine(1, []), previewLine(2, [])]
    fragmentService.find.mockResolvedValueOnce(withPreviewLines(base, lines))
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [0, 1, 99],
        matchCount: 3,
        totalMatchingLines: 3,
        fragment: withPreviewLines(base, lines),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Additional matching lines are unavailable.',
    )
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: /more matching lines/ }),
    ).not.toBeInTheDocument()
  })

  it('ignores a request from a card removed by page navigation', async () => {
    const first = fragmentFactory.build({
      number: 'Page.One',
      hasPhoto: false,
      dossiers: [],
    })
    const second = fragmentFactory.build({
      number: 'Page.Two',
      hasPhoto: false,
      dossiers: [],
    })
    const lines = [previewLine(1, []), previewLine(2, [])]
    let resolveRequest: (value: Fragment) => void = () => undefined
    fragmentService.find.mockReturnValueOnce(
      new Promise<Fragment>((resolve) => {
        resolveRequest = resolve
      }),
    )
    const item = (base: Fragment): QueryItem => ({
      museumNumber: base.number,
      matchingLines: [0, 1],
      matchCount: 2,
      totalMatchingLines: 2,
      fragment: withPreviewLines(base, lines.slice(0, 1)),
      cardSummary: createFragmentCardSummary(),
    })
    const page = (key: string, base: Fragment) => (
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <FragmentLines
            key={key}
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={item(base)}
            linesToShow={1}
          />
        </DictionaryContext.Provider>
      </MemoryRouter>
    )
    const view = render(page('first', first))
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    view.rerender(page('second', second))
    await act(async () => {
      resolveRequest(withPreviewLines(first, lines))
    })

    expect(screen.getByRole('link', { name: second.number })).toBeVisible()
    expect(
      screen.queryByRole('link', { name: first.number }),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })
})
