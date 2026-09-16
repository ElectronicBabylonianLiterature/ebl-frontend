import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import LatestTransliterations from './LatestTransliterations'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { Periods } from 'common/utils/period'
import { ResearchProjects } from 'research-projects/researchProject'
import { QueryItem, QueryResult } from 'query/QueryResult'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')

let fragmentService: jest.Mocked<FragmentService>
let dossiersService: jest.Mocked<DossiersService>

function latestItem(index: number): QueryItem {
  return {
    museumNumber: `K.${index}`,
    matchingLines: [1, 2, 3],
    matchCount: 3,
  }
}

function latestFragment(index: number) {
  return fragmentFactory.build(
    {
      number: `K.${index}`,
      description: `Full ${index}
Extra`,
      hasPhoto: false,
      script: { period: Periods['Neo-Assyrian'] },
      projects: [ResearchProjects.CAIC],
    },
    {
      associations: {
        record: [
          new RecordEntry({
            type: 'Transliteration',
            user: 'Tester',
            date: '2024-02-03T00:00:00.000Z',
          }),
        ],
      },
    },
  )
}

function renderLatest(queryResult: QueryResult, preview = true): void {
  fragmentService.queryLatest.mockReturnValueOnce(Promise.resolve(queryResult))

  render(
    <MemoryRouter>
      <LatestTransliterations
        fragmentService={fragmentService}
        dossiersService={dossiersService}
        preview={preview}
      />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  fragmentService.find.mockResolvedValue(fragmentFactory.build())
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })
})

test('preview hydrates minimal latest items before rendering cards', async () => {
  const items = [latestItem(1)]
  const fragment = latestFragment(1)
  fragmentService.find.mockResolvedValue(fragment)

  renderLatest({ items, matchCountTotal: 1 })

  expect(await screen.findByText(fragment.number)).toBeVisible()
  expect(screen.getByText('Full 1')).toBeVisible()
  expect(screen.getByText('(NA)')).toBeVisible()
  expect(screen.getByText('3 Feb 2024')).toBeVisible()
  expect(screen.getByAltText(ResearchProjects.CAIC.name)).toBeVisible()
  expect(fragmentService.find).toHaveBeenCalledWith('K.1', [1, 2, 3], false)
})

test('preview caps minimal latest items before hydrating cards', async () => {
  const items = Array.from({ length: 6 }, (_, index) => latestItem(index + 1))
  fragmentService.find.mockImplementation((museumNumber: string) =>
    Promise.resolve(fragmentFactory.build({ number: museumNumber })),
  )

  renderLatest({ items, matchCountTotal: 6 })

  expect(await screen.findByText('K.1')).toBeVisible()
  expect(screen.getByText('K.5')).toBeVisible()
  expect(screen.queryByText('K.6')).not.toBeInTheDocument()
  expect(fragmentService.find).toHaveBeenCalledTimes(5)
})

test('library page renders render-ready items with a transliteration record without hydrating', async () => {
  const fragment = latestFragment(1)
  const items: QueryItem[] = [
    {
      museumNumber: fragment.number,
      matchingLines: [1, 2, 3],
      matchCount: 3,
      fragment,
      thumbnailPath: null,
    },
  ]

  renderLatest({ items, matchCountTotal: 1 }, false)

  expect(await screen.findByText(fragment.number)).toBeInTheDocument()
  expect(screen.getByText(/Tester \(Transliteration/)).toBeVisible()
  expect(fragmentService.find).not.toHaveBeenCalled()
})

test('library page hydrates summary items that lack a transliteration record', async () => {
  const summaryFragment = fragmentFactory.build(
    { hasPhoto: false, dossiers: [] },
    { associations: { record: [] } },
  )
  const detailFragment = latestFragment(2)
  const items: QueryItem[] = [
    {
      museumNumber: summaryFragment.number,
      matchingLines: [1, 2, 3],
      matchCount: 3,
      fragment: summaryFragment,
      thumbnailPath: null,
    },
  ]
  fragmentService.find.mockResolvedValue(detailFragment)

  renderLatest({ items, matchCountTotal: 1 }, false)

  expect(await screen.findByText(detailFragment.number)).toBeInTheDocument()
  expect(fragmentService.find).toHaveBeenCalledWith(
    summaryFragment.number,
    [1, 2, 3],
    false,
  )
})
