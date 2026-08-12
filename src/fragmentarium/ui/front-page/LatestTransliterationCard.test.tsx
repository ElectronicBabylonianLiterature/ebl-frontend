import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { CompactFragmentCard } from 'fragmentarium/ui/front-page/LatestTransliterationCard'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { QueryItem } from 'query/QueryResult'
import { ResearchProject } from 'research-projects/researchProject'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import mockObjectUrl from 'test-support/mockObjectUrl'

jest.mock('fragmentarium/application/FragmentService')

let fragmentService: jest.Mocked<FragmentService>

mockObjectUrl('blob:url')

beforeEach(() => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
})

function makeReadyItem(overrides: Partial<QueryItem> = {}): QueryItem {
  const fragment =
    overrides.fragment ??
    fragmentFactory.build(
      { hasPhoto: false, description: 'Render-ready description' },
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

  return {
    museumNumber: fragment.number,
    matchingLines: [1, 2, 3],
    matchCount: 3,
    ...overrides,
    fragment,
  }
}

function renderCard(queryItem: QueryItem): void {
  render(
    <MemoryRouter>
      <CompactFragmentCard
        queryItem={queryItem}
        fragmentService={fragmentService}
      />
    </MemoryRouter>,
  )
}

test('reports an unsupported summary without hydrating details', () => {
  renderCard({
    museumNumber: 'K.9',
    matchingLines: [1, 2, 3],
    matchCount: 3,
    cardSummary: { type: 'UnsupportedFragmentCardSummary' },
  })

  expect(fragmentService.find).not.toHaveBeenCalled()
  expect(
    screen.getByText('Details for this result are unavailable.'),
  ).toBeVisible()
  expect(screen.getByRole('link', { name: 'K.9' })).toHaveAttribute(
    'href',
    '/library/K.9',
  )
})

test('renders a thumbnail when the fragment has a photo', async () => {
  const fragment = fragmentFactory.build({ hasPhoto: true })
  fragmentService.find.mockReturnValue(Promise.resolve(fragment))
  fragmentService.findThumbnail.mockResolvedValue({
    blob: new Blob([''], { type: 'image/jpeg' }),
  })

  renderCard({
    museumNumber: fragment.number,
    matchingLines: [],
    matchCount: 0,
  })

  expect(
    await screen.findByAltText(`Preview of ${fragment.number}`),
  ).toBeInTheDocument()
})

test('omits the record date and description when absent', async () => {
  const fragment = fragmentFactory.build(
    { hasPhoto: false, description: '' },
    { associations: { record: [] } },
  )
  fragmentService.find.mockReturnValue(Promise.resolve(fragment))

  renderCard({
    museumNumber: fragment.number,
    matchingLines: [],
    matchCount: 0,
  })

  expect(await screen.findByText(fragment.number)).toBeInTheDocument()
  expect(
    screen.queryByText(/^\d{1,2} [A-Z][a-z]{2} \d{4}$/),
  ).not.toBeInTheDocument()
})

test('omits the project logo image when the project has no logo', async () => {
  const projectWithoutLogo: ResearchProject = {
    name: 'Project Without Logo',
    abbreviation: 'PWL',
  }
  const fragment = fragmentFactory.build({
    hasPhoto: false,
    projects: [projectWithoutLogo],
  })
  fragmentService.find.mockReturnValue(Promise.resolve(fragment))

  renderCard({
    museumNumber: fragment.number,
    matchingLines: [],
    matchCount: 0,
  })

  expect(await screen.findByText(fragment.number)).toBeInTheDocument()
  expect(screen.queryByAltText(projectWithoutLogo.name)).not.toBeInTheDocument()
})

test('renders a render-ready query item without hydrating details', async () => {
  const latestQueryItem = makeReadyItem()

  renderCard(latestQueryItem)

  expect(
    await screen.findByText(latestQueryItem.museumNumber),
  ).toBeInTheDocument()
  expect(screen.getByText('Render-ready description')).toBeVisible()
  expect(screen.getByText('3 Feb 2024')).toBeVisible()
  expect(fragmentService.find).not.toHaveBeenCalled()
})

test('resolves a summary thumbnail path without fetching a thumbnail blob', async () => {
  const latestQueryItem = makeReadyItem({
    thumbnailPath: '/fragments/K.1/thumbnail/small',
    fragment: fragmentFactory.build(
      { hasPhoto: true },
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
    ),
  })

  renderCard(latestQueryItem)

  const thumbnail = await screen.findByAltText(
    `Preview of ${latestQueryItem.fragment?.number}`,
  )
  expect(thumbnail).toHaveAttribute(
    'src',
    'http://example.com/fragments/K.1/thumbnail/small',
  )
  expect(fragmentService.find).not.toHaveBeenCalled()
  expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
})

test('hides a broken summary thumbnail', async () => {
  const latestQueryItem = makeReadyItem({
    thumbnailPath: '/fragments/K.1/thumbnail/small',
    fragment: fragmentFactory.build(
      { hasPhoto: true },
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
    ),
  })

  renderCard(latestQueryItem)

  const thumbnail = await screen.findByAltText(
    `Preview of ${latestQueryItem.fragment?.number}`,
  )
  fireEvent.error(thumbnail)

  await waitFor(() =>
    expect(
      screen.queryByAltText(`Preview of ${latestQueryItem.fragment?.number}`),
    ).not.toBeInTheDocument(),
  )
  expect(fragmentService.find).not.toHaveBeenCalled()
})

test('omits a missing summary thumbnail without detail hydration', async () => {
  const latestQueryItem = makeReadyItem({
    thumbnailPath: null,
    fragment: fragmentFactory.build(
      { hasPhoto: true },
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
    ),
  })

  renderCard(latestQueryItem)

  expect(
    await screen.findByText(latestQueryItem.museumNumber),
  ).toBeInTheDocument()
  expect(
    screen.queryByAltText(`Preview of ${latestQueryItem.fragment?.number}`),
  ).not.toBeInTheDocument()
  expect(fragmentService.find).not.toHaveBeenCalled()
  expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
})
