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

test('keeps router hash and selected tab in sync when switching tabs', async () => {
  harness.fragmentService.query.mockResolvedValue(queryResult())
  harness.renderSearch({ transliteration: 'kur' })

  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
  expect(screen.getByTestId('search-location')).toHaveTextContent('#corpus')
  expect(
    screen.getByRole('tab', { name: 'Corpus', selected: true }),
  ).toBeVisible()
  await userEvent.click(screen.getByRole('tab', { name: 'Library' }))
  expect(screen.getByTestId('search-location')).toHaveTextContent('#library')
  expect(
    screen.getByRole('tab', { name: 'Library', selected: true }),
  ).toBeVisible()
})

test('keeps the Library tab selected when paginating after a tab switch', async () => {
  harness.fragmentService.query.mockResolvedValue(queryResult(2, true))
  harness.renderSearch({ transliteration: 'kur' })

  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
  await userEvent.click(screen.getByRole('tab', { name: 'Library' }))
  await userEvent.click(screen.getAllByText('Next')[0])

  expect(screen.getByTestId('search-location')).toHaveTextContent(
    'paginationIndex=1#library',
  )
  expect(
    screen.getByRole('tab', { name: 'Library', selected: true }),
  ).toBeVisible()
})

test('does not browse the Corpus for Library-only search criteria', async () => {
  harness.fragmentService.query.mockResolvedValue(queryResult())
  harness.renderSearch({ number: 'K.1' })

  await screen.findByText('Found 1 document')
  await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))

  expect(
    screen.getByText(
      'Enter a transliteration or lemma search to search the Corpus.',
    ),
  ).toBeVisible()
  expect(harness.textService.query).not.toHaveBeenCalled()
})

test('opens the Library tab when no tab is requested', async () => {
  harness.fragmentService.query.mockResolvedValue(queryResult())

  harness.renderSearch({ number: 'K.1' }, '')

  expect(
    await screen.findByRole('tab', { name: 'Library', selected: true }),
  ).toBeVisible()
})
