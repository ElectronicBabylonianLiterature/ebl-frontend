import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  confirmUpdateAll,
  listReconstructionLemmas,
  openLemmatization,
  selectLine,
  waitForReloadedWord,
} from 'corpus/ui/edit-lite/instances.testSupport'
import {
  button,
  listDisabledViews,
  openLoadedView,
  openWord,
  reconstructionRow,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import { options } from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

test('the tokens of every other line are dropped and the drafts of other lines are kept', async () => {
  const source = await openLemmatization('5')
  await selectLine('6')
  await openLoadedView('Alignment')
  await userEvent.keyboard('{Enter}')
  await selectLine('3')
  await userEvent.type(screen.getByLabelText('Number'), 'a')
  await selectLine('4')
  await openLoadedView('Lemmatization')
  await openWord(reconstructionRow(), 'line')
  await confirmUpdateAll()
  await waitForReloadedWord('line')
  source.loadAnnotatedLine.mockClear()
  source.loadLemmatization.mockClear()
  await selectLine('5')
  await openLoadedView('Lemmatization')

  expect(source.loadAnnotatedLine.mock.calls).toEqual([[4]])
  expect(source.loadLemmatization).toHaveBeenCalledTimes(1)
  expect(wordLabel(reconstructionRow(), 'line')).not.toHaveClass(
    'Word--suggestion',
  )

  await userEvent.click(options()[5])
  await openLoadedView('Alignment')
  await userEvent.click(button('Save alignment'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))
  await selectLine('3')
  await userEvent.click(button('Save line'))
  await waitFor(() =>
    expect(screen.queryByText('edited')).not.toBeInTheDocument(),
  )
  const [textLine, , , alignedLine] = await source.loadLines(2, 4)

  expect(source.saveAlignment.mock.calls.map(([index]) => index)).toEqual([5])
  expect(textLine.number).toBe('3a')
  expect(
    (
      await source.loadAnnotatedLine(5)
    ).variants[0].manuscripts[0].atfTokens.map((token) => token.alignment),
  ).toEqual([3, null])
  expect(listReconstructionLemmas([alignedLine])[0][3]).toEqual(['line I'])
})

test('a reset alignment draft of another line loads its tokens again after the update', async () => {
  const source = await openLemmatization('6')
  await openLoadedView('Alignment')
  await userEvent.keyboard('{Enter}')
  await selectLine('4')
  await openLoadedView('Lemmatization')
  await openWord(reconstructionRow(), 'line')
  await confirmUpdateAll()
  await waitForReloadedWord('line')
  source.loadAnnotatedLine.mockClear()
  await userEvent.click(options()[5])
  await openLoadedView('Alignment')

  expect(source.loadAnnotatedLine).not.toHaveBeenCalled()

  await userEvent.click(button('Reset'))
  await openLoadedView('Lemmatization')

  expect(source.loadAnnotatedLine.mock.calls).toEqual([[5]])
  expect(wordLabel(reconstructionRow(), 'line')).not.toHaveClass(
    'Word--suggestion',
  )
})
