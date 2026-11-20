import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createFragmentariumSearchHarness,
  queryResult,
  FragmentariumSearchHarness,
} from 'fragmentarium/ui/search/FragmentariumSearch.testSupport'

let harness: FragmentariumSearchHarness

beforeEach(() => {
  jest.clearAllMocks()
  harness = createFragmentariumSearchHarness()
  harness.fragmentService.query.mockResolvedValue(queryResult())
})

test('switching result tabs does not repeat the Library or Corpus queries', async () => {
  harness.renderSearch({ transliteration: 'kur' })

  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
  await userEvent.click(screen.getByRole('tab', { name: 'Library' }))
  await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))

  expect(await screen.findByText('Found 0 chapters')).toBeVisible()
  expect(harness.textService.query).toHaveBeenCalledTimes(1)
  expect(harness.fragmentService.query).toHaveBeenCalledTimes(1)
})

test('queries the Corpus again when the corpus criteria change', async () => {
  const view = harness.renderSearch({
    transliteration: 'kur',
    lemmas: 'ina I',
    lemmaOperator: 'line',
  })

  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  view.rerender(
    harness.buildSearchElement(
      { transliteration: 'ana', lemmas: 'ina I', lemmaOperator: 'line' },
      'library',
    ),
  )
  expect(
    await screen.findByText('Found 2 matching lines. Showing documents 1-1'),
  ).toBeVisible()
  expect(await screen.findByText('Found 0 chapters')).toBeInTheDocument()

  expect(harness.textService.query).toHaveBeenCalledTimes(2)
  expect(harness.textService.query).toHaveBeenLastCalledWith({
    transliteration: 'ana',
    lemmas: 'ina I',
    lemmaOperator: 'line',
  })
})
