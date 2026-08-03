import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { CompactFragmentCard } from './LatestTransliterationCard'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { QueryItem } from 'query/QueryResult'
import { ResearchProject } from 'research-projects/researchProject'

jest.mock('fragmentarium/application/FragmentService')

let fragmentService: jest.Mocked<FragmentService>

beforeEach(() => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  ;(URL.createObjectURL as jest.Mock).mockReturnValue('blob:url')
})

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
