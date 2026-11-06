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

function setup(lineCount = 3): {
  fullFragment: Fragment
  queryItem: QueryItem
  view: ReturnType<typeof renderFragmentLines>
} {
  const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
  const lines = Array.from({ length: lineCount }, (_unused, index) =>
    previewLine(index + 1, []),
  )
  const queryItem = {
    museumNumber: base.number,
    matchingLines: lines.map((_line, index) => index),
    matchCount: lineCount,
    totalMatchingLines: lineCount,
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

test('a pending load keeps its focused button operable without duplicate requests', async () => {
  const { fullFragment } = setup(15)
  let completeRequest: (fragment: Fragment) => void = () => undefined
  fragmentService.find.mockReturnValueOnce(
    new Promise<Fragment>((resolve) => {
      completeRequest = resolve
    }),
  )
  screen.getByRole('button', { name: 'Show 10 more matching lines' }).focus()

  await userEvent.keyboard('{Enter}')

  const loadingButton = screen.getByRole('button', {
    name: 'Loading matching lines…',
  })
  expect(loadingButton).toHaveAttribute('aria-disabled', 'true')
  expect(loadingButton).toBeEnabled()
  expect(loadingButton).toHaveFocus()
  await userEvent.keyboard('{Enter} ')
  await userEvent.click(loadingButton)
  expect(fragmentService.find).toHaveBeenCalledTimes(1)

  await act(async () => completeRequest(fullFragment))

  const nextBatch = screen.getByRole('button', {
    name: 'Show 3 more matching lines',
  })
  expect(nextBatch).toHaveAttribute('aria-disabled', 'false')
  expect(nextBatch).toHaveFocus()
  expect(screen.getAllByRole('row')).toHaveLength(12)
  expect(fragmentService.find).toHaveBeenCalledTimes(1)
})
