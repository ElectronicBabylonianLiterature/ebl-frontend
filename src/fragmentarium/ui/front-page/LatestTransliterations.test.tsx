import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Chance from 'chance'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import LatestTransliterations from './LatestTransliterations'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'
import { queryItemOf } from 'test-support/utils'
import DossiersService from 'dossiers/application/DossiersService'
import { ResearchProjects } from 'research-projects/researchProject'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('dossiers/application/DossiersService')

beforeEach(() => {
  jest.clearAllMocks()
})

const chance = new Chance('latest-test')

const numberOfFragments = 2
let container: HTMLElement
let fragments: Fragment[]
let session: Session

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()

const setup = async (): Promise<void> => {
  session = new MemorySession(['read:fragments'])
  fragments = fragmentFactory.buildList(
    numberOfFragments,
    {},
    { transient: { chance } },
  )
  fragmentService.queryLatest.mockReturnValueOnce(
    Promise.resolve({
      items: fragments.map(queryItemOf),
      matchCountTotal: 0,
    }),
  )
  fragmentService.find
    .mockReturnValueOnce(Promise.resolve(fragments[0]))
    .mockReturnValueOnce(Promise.resolve(fragments[1]))
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })

  dossiersService.queryByIds.mockResolvedValue([])
  container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <LatestTransliterations
            fragmentService={fragmentService}
            dossiersService={dossiersService}
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>,
  ).container
  await screen.findByText('Latest Additions')
  await screen.findByText(fragments[0].number)
  await screen.findByText(fragments[1].number)
}

test('Snapshot', async () => {
  await setup()
  expect(container).toMatchSnapshot()
})

describe('preview mode', () => {
  const previewFragmentCount = 6
  let previewFragments: Fragment[]

  const setupPreview = async (): Promise<void> => {
    session = new MemorySession(['read:fragments'])
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
    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <SessionContext.Provider value={session}>
            <LatestTransliterations
              fragmentService={fragmentService}
              dossiersService={dossiersService}
              preview={true}
            />
          </SessionContext.Provider>
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )
    await screen.findByText('Latest Additions')
    for (const fragment of previewFragments.slice(0, 5)) {
      await screen.findByText(fragment.number)
    }
  }

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
    session = new MemorySession(['read:fragments'])
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
    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <SessionContext.Provider value={session}>
            <LatestTransliterations
              fragmentService={fragmentService}
              dossiersService={dossiersService}
              preview={true}
            />
          </SessionContext.Provider>
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )
    await screen.findByAltText(ResearchProjects.CAIC.name)
  })

  test('shows thumbnails when thumbnail endpoint returns a blob', async () => {
    session = new MemorySession(['read:fragments'])
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
    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <SessionContext.Provider value={session}>
            <LatestTransliterations
              fragmentService={fragmentService}
              dossiersService={dossiersService}
              preview={true}
            />
          </SessionContext.Provider>
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )

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

  test('uses prefetched summary fragments and thumbnail paths without extra fetches', async () => {
    session = new MemorySession(['read:fragments'])
    const fragmentWithPhoto = fragmentFactory.build(
      { hasPhoto: true },
      { transient: { chance } },
    )
    const thumbnailPath = '/images/summary-thumbnail.jpg'

    fragmentService.queryLatest.mockReturnValueOnce(
      Promise.resolve({
        items: [
          {
            museumNumber: fragmentWithPhoto.number,
            matchingLines: [1, 2, 3, 4],
            matchCount: 4,
            fragment: fragmentWithPhoto,
            thumbnailPath,
          },
        ],
        matchCountTotal: 4,
      }),
    )
    dossiersService.queryByIds.mockResolvedValue([])

    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <SessionContext.Provider value={session}>
            <LatestTransliterations
              fragmentService={fragmentService}
              dossiersService={dossiersService}
            />
          </SessionContext.Provider>
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )

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
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })

  test('does not show a summary thumbnail when the fragment has no photo', async () => {
    session = new MemorySession(['read:fragments'])
    const fragmentWithoutPhoto = fragmentFactory.build(
      { hasPhoto: false },
      { transient: { chance } },
    )

    fragmentService.queryLatest.mockReturnValueOnce(
      Promise.resolve({
        items: [
          {
            museumNumber: fragmentWithoutPhoto.number,
            matchingLines: [1, 2, 3, 4],
            matchCount: 4,
            fragment: fragmentWithoutPhoto,
            thumbnailPath: '/images/not-shown.jpg',
          },
        ],
        matchCountTotal: 4,
      }),
    )
    dossiersService.queryByIds.mockResolvedValue([])

    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <SessionContext.Provider value={session}>
            <LatestTransliterations
              fragmentService={fragmentService}
              dossiersService={dossiersService}
            />
          </SessionContext.Provider>
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )

    await screen.findByText(fragmentWithoutPhoto.number)

    expect(
      screen.queryByAltText(`Preview of ${fragmentWithoutPhoto.number}`),
    ).not.toBeInTheDocument()
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })

  test('does not show a summary thumbnail when the thumbnail path is null', async () => {
    session = new MemorySession(['read:fragments'])
    const fragmentWithPhoto = fragmentFactory.build(
      { hasPhoto: true },
      { transient: { chance } },
    )

    fragmentService.queryLatest.mockReturnValueOnce(
      Promise.resolve({
        items: [
          {
            museumNumber: fragmentWithPhoto.number,
            matchingLines: [1, 2, 3, 4],
            matchCount: 4,
            fragment: fragmentWithPhoto,
            thumbnailPath: null,
          },
        ],
        matchCountTotal: 4,
      }),
    )
    dossiersService.queryByIds.mockResolvedValue([])

    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <SessionContext.Provider value={session}>
            <LatestTransliterations
              fragmentService={fragmentService}
              dossiersService={dossiersService}
            />
          </SessionContext.Provider>
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )

    await screen.findByText(fragmentWithPhoto.number)

    expect(
      screen.queryByAltText(`Preview of ${fragmentWithPhoto.number}`),
    ).not.toBeInTheDocument()
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })

  test('removes broken summary thumbnails after an image error', async () => {
    session = new MemorySession(['read:fragments'])
    const fragmentWithPhoto = fragmentFactory.build(
      { hasPhoto: true },
      { transient: { chance } },
    )

    fragmentService.queryLatest.mockReturnValueOnce(
      Promise.resolve({
        items: [
          {
            museumNumber: fragmentWithPhoto.number,
            matchingLines: [1, 2, 3, 4],
            matchCount: 4,
            fragment: fragmentWithPhoto,
            thumbnailPath: '/images/broken-thumbnail.jpg',
          },
        ],
        matchCountTotal: 4,
      }),
    )
    dossiersService.queryByIds.mockResolvedValue([])

    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <SessionContext.Provider value={session}>
            <LatestTransliterations
              fragmentService={fragmentService}
              dossiersService={dossiersService}
            />
          </SessionContext.Provider>
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )

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
