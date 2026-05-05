import React from 'react'
import { render, screen } from '@testing-library/react'
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
})
