import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createFragmentariumSearchHarness,
  queryResult,
} from 'fragmentarium/ui/search/FragmentariumSearch.testSupport'
import { parseSearchCriteria } from 'fragmentarium/ui/search/pagination'

it('keeps an invalid URL constraint clearable without querying the Library', async () => {
  const harness = createFragmentariumSearchHarness()
  harness.renderSearch(parseSearchCriteria('?findspotId=7x'))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Findspot ID 7x is invalid.',
  )
  expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()
  await userEvent.click(
    screen.getByRole('button', { name: 'Clear findspot filter' }),
  )

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled()
  expect(harness.fragmentService.query).not.toHaveBeenCalled()
  expect(harness.textService.query).not.toHaveBeenCalled()
  expect(screen.getByTestId('search-location')).not.toHaveTextContent(
    'findspotId',
  )
})

it('keeps valid Corpus searches available while suppressing an invalid Library request', async () => {
  const harness = createFragmentariumSearchHarness()
  harness.renderSearch({ findspotId: '7x', transliteration: 'kur' }, 'corpus')

  expect(await screen.findByText('Found 0 chapters')).toBeVisible()
  expect(harness.textService.query).toHaveBeenCalledWith({
    transliteration: 'kur',
  })
  expect(harness.fragmentService.query).not.toHaveBeenCalled()
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Findspot ID 7x is invalid.',
  )
})

it.each(['0', '7', 0])('queries valid findspot ID %s', async (findspotId) => {
  const harness = createFragmentariumSearchHarness()
  harness.fragmentService.query.mockResolvedValue(queryResult())
  harness.renderSearch({ findspotId })

  expect(await screen.findByText('Found 0 chapters')).toBeVisible()
  expect(harness.fragmentService.query).toHaveBeenCalledWith({
    findspotId,
    limit: 51,
    offset: 0,
    count: 'exact',
  })
})
