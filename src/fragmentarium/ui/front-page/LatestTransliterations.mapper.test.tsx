import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import LatestTransliterations from 'fragmentarium/ui/front-page/LatestTransliterations'
import { QueryResult } from 'query/QueryResult'
import { fragmentDto } from 'test-support/test-fragment'
import { ResearchProjects } from 'research-projects/researchProject'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')

type ApiClient = {
  fetchJson: jest.Mock
  postJson: jest.Mock
  fetchBlob: jest.Mock
}

let apiClient: ApiClient
let fragmentRepository: FragmentRepository
let fragmentService: jest.Mocked<FragmentService>
let dossiersService: jest.Mocked<DossiersService>

function latestFragmentDto(index: number) {
  return {
    ...fragmentDto,
    museumNumber: { prefix: 'K', number: String(index), suffix: '' },
    description: `Latest ${index}
Extra`,
    hasPhoto: false,
    script: {
      period: 'Neo-Assyrian',
      periodModifier: 'None',
      uncertain: false,
    },
    projects: ['CAIC'],
    record: [
      {
        user: 'Mapper Tester',
        type: 'Transliteration',
        date: '2024-02-03T00:00:00.000Z',
      },
    ],
  }
}

function latestItemDto(index: number) {
  return {
    museumNumber: { prefix: 'K', number: String(index), suffix: '' },
    matchingLines: [1, 2, 3, 4],
    matchCount: 4,
  }
}

function latestSummaryItemDto() {
  return {
    ...latestItemDto(1),
    description: 'Summary without latest record',
    script: {
      period: 'Neo-Assyrian',
      periodModifier: 'None',
      uncertain: false,
    },
    matchingLinePreview: { lines: [] },
    hasPhoto: false,
    thumbnailPath: null,
  }
}

async function mappedLatest(
  raw: Record<string, unknown>,
): Promise<QueryResult> {
  apiClient.fetchJson.mockResolvedValueOnce(raw)
  return fragmentRepository.queryLatest()
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
  apiClient = {
    fetchJson: jest.fn(),
    postJson: jest.fn(),
    fetchBlob: jest.fn(),
  }
  fragmentRepository = new FragmentRepository(apiClient)
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
})

test('preview renders mapper-prefetched latest fragments without detail calls', async () => {
  const queryResult = await mappedLatest({
    matchCountTotal: 1,
    items: [latestItemDto(1)],
    fragments: [latestFragmentDto(1)],
  })

  renderLatest(queryResult)

  expect(await screen.findByText('K.1')).toBeVisible()
  expect(screen.getByText('Latest 1')).toBeVisible()
  expect(screen.getByText('(NA)')).toBeVisible()
  expect(screen.getByText('3 Feb 2024')).toBeVisible()
  expect(screen.getByAltText(ResearchProjects.CAIC.name)).toBeVisible()
  const viewAllLink = screen.getByRole('link', {
    name: /view all in library/i,
  })
  expect(viewAllLink).toHaveAttribute('href', '/library')
  expect(fragmentService.find).not.toHaveBeenCalled()
})

test('preview caps mapper-prefetched latest fragments without detail calls', async () => {
  const queryResult = await mappedLatest({
    matchCountTotal: 6,
    items: Array.from({ length: 6 }, (_, index) => latestItemDto(index + 1)),
    fragments: Array.from({ length: 6 }, (_, index) =>
      latestFragmentDto(index + 1),
    ),
  })

  renderLatest(queryResult)

  expect(await screen.findByText('K.1')).toBeVisible()
  expect(screen.getByText('K.5')).toBeVisible()
  expect(screen.queryByText('K.6')).not.toBeInTheDocument()
  expect(fragmentService.find).not.toHaveBeenCalled()
})

test('preview hydrates mapper-produced summary placeholders for latest record data', async () => {
  const queryResult = await mappedLatest({
    matchCountTotal: 1,
    items: [latestSummaryItemDto()],
  })
  const detailQueryResult = await mappedLatest({
    matchCountTotal: 1,
    items: [{ ...latestItemDto(1), fragment: latestFragmentDto(1) }],
  })
  const detailFragment = detailQueryResult.items[0].fragment

  if (!detailFragment) {
    throw new Error('Expected mapper to produce a detail fragment')
  }

  fragmentService.find.mockResolvedValueOnce(detailFragment)

  renderLatest(queryResult)

  expect(await screen.findByText('Latest 1')).toBeVisible()
  expect(screen.getByText('3 Feb 2024')).toBeVisible()
  expect(fragmentService.find).toHaveBeenCalledWith('K.1', [1, 2, 3], false)
})

test('library renders mapper-prefetched latest fragments without detail calls', async () => {
  const queryResult = await mappedLatest({
    matchCountTotal: 1,
    items: [latestItemDto(1)],
    fragments: [latestFragmentDto(1)],
  })

  renderLatest(queryResult, false)

  expect(await screen.findByText('K.1')).toBeVisible()
  expect(screen.getByText(/Mapper Tester \(Transliteration/)).toBeVisible()
  expect(fragmentService.find).not.toHaveBeenCalled()
})
