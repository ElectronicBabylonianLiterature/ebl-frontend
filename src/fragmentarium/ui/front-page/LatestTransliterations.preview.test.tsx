import { screen } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { queryItemOf } from 'test-support/utils'
import { ResearchProjects } from 'research-projects/researchProject'
import {
  chance,
  createLatestTransliterationsTestContext,
  LatestTransliterationsTestContext,
} from 'fragmentarium/ui/front-page/LatestTransliterations.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('dossiers/application/DossiersService')

const previewFragmentCount = 6

let context: LatestTransliterationsTestContext
let previewFragments: Fragment[]

beforeEach(() => {
  jest.clearAllMocks()
  context = createLatestTransliterationsTestContext()
})

async function setupPreview(): Promise<void> {
  const { fragmentService, dossiersService, renderLatest } = context
  previewFragments = fragmentFactory.buildList(
    previewFragmentCount,
    {},
    { transient: { chance } },
  )
  fragmentService.queryLatest.mockReturnValueOnce(
    Promise.resolve({
      items: previewFragments.map(queryItemOf),
      matchCountTotal: 0,
    }),
  )
  previewFragments
    .slice(0, 5)
    .forEach((fragment) =>
      fragmentService.find.mockReturnValueOnce(Promise.resolve(fragment)),
    )
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })
  dossiersService.queryByIds.mockResolvedValue([])

  renderLatest(true)

  await screen.findByText('Latest Additions')
  for (const fragment of previewFragments.slice(0, 5)) {
    await screen.findByText(fragment.number)
  }
}

describe('preview mode', () => {
  test('shows only 5 items regardless of total available', async () => {
    await setupPreview()
    expect(
      screen.queryByText(previewFragments[5].number),
    ).not.toBeInTheDocument()
  })

  test('shows view-all link to the Library', async () => {
    await setupPreview()
    const viewAllLink = screen.getByRole('link', {
      name: /view all in library/i,
    })
    expect(viewAllLink).toHaveAttribute('href', '/library')
  })

  test('shows fragment description first line', async () => {
    await setupPreview()
    const firstLine = previewFragments[0].description.split('\n')[0]
    expect(screen.getByText(firstLine)).toBeInTheDocument()
  })

  test('shows project banner when fragment has projects', async () => {
    const { fragmentService, dossiersService, renderLatest } = context
    const fragmentWithProject = fragmentFactory.build(
      {},
      {
        associations: { projects: [ResearchProjects.CAIC] },
        transient: { chance },
      },
    )
    fragmentService.queryLatest.mockReturnValueOnce(
      Promise.resolve({
        items: [queryItemOf(fragmentWithProject)],
        matchCountTotal: 0,
      }),
    )
    fragmentService.find.mockReturnValueOnce(
      Promise.resolve(fragmentWithProject),
    )
    fragmentService.findThumbnail.mockResolvedValue({ blob: null })
    dossiersService.queryByIds.mockResolvedValue([])

    renderLatest(true)

    await screen.findByAltText(ResearchProjects.CAIC.name)
  })

  test('shows thumbnails when thumbnail endpoint returns a blob', async () => {
    const { fragmentService, dossiersService, renderLatest } = context
    const fragmentWithPhoto = fragmentFactory.build(
      { hasPhoto: true },
      { transient: { chance } },
    )
    const queryItem = {
      museumNumber: fragmentWithPhoto.number,
      matchingLines: [1, 2, 3, 4],
      matchCount: 4,
    }
    const thumbnailBlob = new Blob(['thumbnail'], { type: 'image/jpeg' })
    ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce('blob:thumbnail')
    fragmentService.queryLatest.mockReturnValueOnce(
      Promise.resolve({
        items: [queryItem],
        matchCountTotal: 0,
      }),
    )
    fragmentService.find.mockReturnValueOnce(Promise.resolve(fragmentWithPhoto))
    fragmentService.findThumbnail.mockResolvedValueOnce({ blob: thumbnailBlob })
    dossiersService.queryByIds.mockResolvedValue([])

    renderLatest(true)

    const thumbnail = await screen.findByAltText(
      `Preview of ${fragmentWithPhoto.number}`,
    )
    expect(thumbnail).toHaveAttribute('src', 'blob:thumbnail')
    expect(fragmentService.find).toHaveBeenCalledWith(
      fragmentWithPhoto.number,
      [1, 2, 3],
      false,
    )
    expect(fragmentService.findThumbnail).toHaveBeenCalledWith(
      fragmentWithPhoto,
      'small',
    )
  })
})
