import { screen } from '@testing-library/react'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  createFragmentCardSummary,
  SUMMARY_LEMMA_ID,
} from 'test-support/fragment-query-summary'
import {
  previewLine,
  tokenWithClass,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import {
  dossiersService,
  fragmentService,
  renderFragmentLines,
} from 'fragmentarium/ui/search/FragmentariumSearchResultComponents.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

beforeEach(() => {
  jest.clearAllMocks()
  dossiersService.queryByIds.mockResolvedValue([])
})

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

    expect(screen.getByText('And 2 more matching lines')).toBeVisible()
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
      screen.getByText('More matching lines may be available'),
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

    expect(screen.getByText('And 5 more matching lines')).toBeInTheDocument()
  })
})
