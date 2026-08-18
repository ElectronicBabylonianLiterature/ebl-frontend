import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createFragmentariumSearchHarness,
  queryResult,
  FragmentariumSearchHarness,
} from './FragmentariumSearch.testSupport'

let harness: FragmentariumSearchHarness

beforeEach(() => {
  jest.clearAllMocks()
  harness = createFragmentariumSearchHarness()
})

test('displays Corpus results when the Corpus tab is selected', async () => {
  harness.fragmentService.query.mockResolvedValue(queryResult())
  const corpusResult = {
    items: [
      {
        textId: { genre: 'L', category: 1, index: 1 },
        lines: [1],
        variants: [0],
        name: 'Only Chapter',
        stage: 'Neo-Assyrian',
        matchCount: 1,
      },
    ],
    matchCountTotal: 1,
  }
  harness.textService.query.mockResolvedValue(corpusResult)

  harness.renderSearch({ transliteration: 'kur' })

  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))

  expect(await screen.findByText('Only Chapter')).toBeVisible()
  expect(harness.textService.query).toHaveBeenCalledWith({
    transliteration: 'kur',
  })
})

test('updates the URL anchor when switching between result tabs', async () => {
  harness.fragmentService.query.mockResolvedValue(queryResult())
  harness.renderSearch({ transliteration: 'kur' })

  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
  expect(window.location.hash).toBe('#corpus')
  await userEvent.click(screen.getByRole('tab', { name: 'Library' }))
  expect(window.location.hash).toBe('#library')
})
