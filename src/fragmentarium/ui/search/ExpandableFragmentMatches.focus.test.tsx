import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryItem } from 'query/QueryResult'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  previewLine,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import { createFragmentCardSummary } from 'test-support/fragment-query-summary'
import {
  fragmentService,
  fragmentLinesElement,
  renderFragmentLines,
  resetFragmentLineMocks,
} from 'fragmentarium/ui/search/ExpandableFragmentMatches.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

beforeEach(resetFragmentLineMocks)

function setup(): {
  fullFragment: Fragment
  queryItem: QueryItem
  view: ReturnType<typeof renderFragmentLines>
} {
  const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
  const lines = [previewLine(1, []), previewLine(2, []), previewLine(3, [])]
  const queryItem = {
    museumNumber: base.number,
    matchingLines: [0, 1, 2],
    matchCount: 3,
    totalMatchingLines: 3,
    fragment: withPreviewLines(base, lines.slice(0, 2)),
    cardSummary: createFragmentCardSummary(),
  }
  const view = renderFragmentLines(queryItem, 2)
  return { fullFragment: withPreviewLines(base, lines), queryItem, view }
}

test('keyboard expansion and collapse retain focus on the surviving control', async () => {
  const { fullFragment } = setup()
  fragmentService.find.mockResolvedValueOnce(fullFragment)
  const more = screen.getByRole('button', { name: 'Show 1 more matching line' })
  expect(
    screen.getByText(`Matching lines in ${fullFragment.number}`),
  ).toHaveClass('visually-hidden')
  expect(more).toHaveAttribute('aria-controls', expect.any(String))
  more.focus()

  await userEvent.keyboard('{Enter}')

  const collapse = await screen.findByRole('button', {
    name: 'Collapse matching lines',
  })
  expect(collapse).toHaveFocus()
  await userEvent.keyboard(' ')

  expect(
    screen.getByRole('button', { name: 'Show 1 more matching line' }),
  ).toHaveFocus()
  expect(screen.getAllByRole('row')).toHaveLength(2)
  expect(fragmentService.find).toHaveBeenCalledTimes(1)
})

test('cancelling a pending load restores keyboard focus without applying its response', async () => {
  const { fullFragment } = setup()
  let completeRequest: (fragment: Fragment) => void = () => undefined
  fragmentService.find.mockReturnValueOnce(
    new Promise<Fragment>((resolve) => {
      completeRequest = resolve
    }),
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more matching line' }),
  )
  screen.getByRole('button', { name: 'Cancel loading' }).focus()

  await userEvent.keyboard('{Enter}')

  expect(
    screen.getByRole('button', { name: 'Show 1 more matching line' }),
  ).toHaveFocus()
  await act(async () => completeRequest(fullFragment))
  expect(screen.getAllByRole('row')).toHaveLength(2)
})

test('a completed background load does not steal focus from another control', async () => {
  const { fullFragment } = setup()
  let completeRequest: (fragment: Fragment) => void = () => undefined
  fragmentService.find.mockReturnValueOnce(
    new Promise<Fragment>((resolve) => {
      completeRequest = resolve
    }),
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more matching line' }),
  )
  const fragmentLink = screen.getByRole('link', { name: fullFragment.number })
  fragmentLink.focus()

  await act(async () => completeRequest(fullFragment))

  expect(fragmentLink).toHaveFocus()
  expect(screen.getAllByRole('row')).toHaveLength(3)
})

test('an unavailable result retains focus on its named controls group', async () => {
  const { fullFragment } = setup()
  fragmentService.find.mockResolvedValueOnce(
    withPreviewLines(fullFragment, [previewLine(1, []), previewLine(2, [])]),
  )
  screen.getByRole('button', { name: 'Show 1 more matching line' }).focus()

  await userEvent.keyboard('{Enter}')

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Additional matching lines are unavailable.',
  )
  expect(
    screen.getByRole('group', {
      name: `Matching lines in ${fullFragment.number}`,
    }),
  ).toHaveFocus()
})

test('a replacement query without controls does not focus a removed target', () => {
  const { queryItem, view } = setup()
  screen.getByRole('button', { name: 'Show 1 more matching line' }).focus()

  view.rerender(
    fragmentLinesElement({ ...queryItem, totalMatchingLines: 2 }, 2),
  )

  expect(screen.queryByRole('group')).not.toBeInTheDocument()
  expect(document.body).toHaveFocus()
})
