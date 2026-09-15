import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  chance,
  createLatestTransliterationsTestContext,
  LatestTransliterationsTestContext,
} from 'fragmentarium/ui/front-page/LatestTransliterations.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('dossiers/application/DossiersService')

let context: LatestTransliterationsTestContext

beforeEach(() => {
  jest.clearAllMocks()
  context = createLatestTransliterationsTestContext()
})

function renderSummaryItem(
  fragment: Fragment,
  thumbnailPath: string | null,
): void {
  const { fragmentService, dossiersService, renderLatest } = context
  fragmentService.queryLatest.mockReturnValueOnce(
    Promise.resolve({
      items: [
        {
          museumNumber: fragment.number,
          matchingLines: [1, 2, 3, 4],
          matchCount: 4,
          fragment: fragment,
          thumbnailPath: thumbnailPath,
        },
      ],
      matchCountTotal: 4,
    }),
  )
  dossiersService.queryByIds.mockResolvedValue([])

  renderLatest()
}

function expectNoPrefetches(): void {
  expect(context.fragmentService.find).not.toHaveBeenCalled()
  expect(context.fragmentService.findThumbnail).not.toHaveBeenCalled()
}

describe('summary-backed thumbnails', () => {
  test('uses prefetched summary fragments and thumbnail paths without extra fetches', async () => {
    const fragmentWithPhoto = fragmentFactory.build(
      { hasPhoto: true },
      { transient: { chance } },
    )
    const thumbnailPath = '/images/summary-thumbnail.jpg'

    renderSummaryItem(fragmentWithPhoto, thumbnailPath)

    const thumbnail = await screen.findByAltText(
      `Preview of ${fragmentWithPhoto.number}`,
    )

    expect(thumbnail).toHaveAttribute('src', thumbnailPath)
    expect(thumbnail).toHaveAttribute('loading', 'lazy')
    expect(
      screen.getByRole('link', {
        name: `Preview of ${fragmentWithPhoto.number}`,
      }),
    ).toHaveAttribute('href', `/library/${fragmentWithPhoto.number}`)
    expectNoPrefetches()
  })

  test('does not show a summary thumbnail when the fragment has no photo', async () => {
    const fragmentWithoutPhoto = fragmentFactory.build(
      { hasPhoto: false },
      { transient: { chance } },
    )

    renderSummaryItem(fragmentWithoutPhoto, '/images/not-shown.jpg')

    await screen.findByText(fragmentWithoutPhoto.number)

    expect(
      screen.queryByAltText(`Preview of ${fragmentWithoutPhoto.number}`),
    ).not.toBeInTheDocument()
    expectNoPrefetches()
  })

  test('does not show a summary thumbnail when the thumbnail path is null', async () => {
    const fragmentWithPhoto = fragmentFactory.build(
      { hasPhoto: true },
      { transient: { chance } },
    )

    renderSummaryItem(fragmentWithPhoto, null)

    await screen.findByText(fragmentWithPhoto.number)

    expect(
      screen.queryByAltText(`Preview of ${fragmentWithPhoto.number}`),
    ).not.toBeInTheDocument()
    expectNoPrefetches()
  })

  test('removes broken summary thumbnails after an image error', async () => {
    const fragmentWithPhoto = fragmentFactory.build(
      { hasPhoto: true },
      { transient: { chance } },
    )

    renderSummaryItem(fragmentWithPhoto, '/images/broken-thumbnail.jpg')

    const thumbnail = await screen.findByAltText(
      `Preview of ${fragmentWithPhoto.number}`,
    )
    fireEvent.error(thumbnail)

    await waitFor(() =>
      expect(
        screen.queryByAltText(`Preview of ${fragmentWithPhoto.number}`),
      ).not.toBeInTheDocument(),
    )
  })
})
