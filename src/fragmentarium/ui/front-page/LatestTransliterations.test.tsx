import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import LatestTransliterations from './LatestTransliterations'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { QueryItem, QueryResult } from 'query/QueryResult'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')

let fragmentService: jest.Mocked<FragmentService>
let dossiersService: jest.Mocked<DossiersService>

function latestItem(
  index: number,
  thumbnailPath: string | null = null,
): QueryItem {
  const fragment = fragmentFactory.build(
    {
      description: `Summary ${index}\nExtra`,
      hasPhoto: thumbnailPath !== null,
    },
    { associations: { record: [] } },
  )

  return {
    museumNumber: fragment.number,
    matchingLines: [1, 2, 3],
    matchCount: 3,
    fragment,
    thumbnailPath,
  }
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

test('preview renders repository-shaped summaries without detail hydration', async () => {
  const items = [latestItem(1, '/images/latest-1.jpg')]

  renderLatest({ items, matchCountTotal: 1 })

  expect(await screen.findByText(items[0].museumNumber)).toBeVisible()
  expect(screen.getByText('Summary 1')).toBeVisible()
  expect(
    screen.getByAltText(`Preview of ${items[0].museumNumber}`),
  ).toHaveAttribute('src', '/images/latest-1.jpg')
  expect(fragmentService.find).not.toHaveBeenCalled()
  expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
})

test('preview caps repository-shaped summaries before rendering cards', async () => {
  const items = Array.from({ length: 6 }, (_, index) => latestItem(index + 1))

  renderLatest({ items, matchCountTotal: 6 })

  expect(await screen.findByText(items[0].museumNumber)).toBeVisible()
  expect(screen.getByText(items[4].museumNumber)).toBeVisible()
  expect(screen.queryByText(items[5].museumNumber)).not.toBeInTheDocument()
  expect(fragmentService.find).not.toHaveBeenCalled()
})

test('preview omits missing and broken summary thumbnails', async () => {
  const withBrokenThumbnail = latestItem(1, '/images/broken.jpg')
  const withoutThumbnail = latestItem(2)

  renderLatest({
    items: [withBrokenThumbnail, withoutThumbnail],
    matchCountTotal: 2,
  })

  const thumbnail = await screen.findByAltText(
    `Preview of ${withBrokenThumbnail.museumNumber}`,
  )
  fireEvent.error(thumbnail)

  expect(
    screen.queryByAltText(`Preview of ${withBrokenThumbnail.museumNumber}`),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByAltText(`Preview of ${withoutThumbnail.museumNumber}`),
  ).not.toBeInTheDocument()
  expect(fragmentService.find).not.toHaveBeenCalled()
})
