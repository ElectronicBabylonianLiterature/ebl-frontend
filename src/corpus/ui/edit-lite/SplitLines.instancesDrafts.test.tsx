import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createFakeChapterEditSource } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  confirmUpdateAll,
  instanceOptions,
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
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import {
  options,
  typeIntoNumber,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { instancesBusyMessage } from 'corpus/ui/edit-lite/annotationActions'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'

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

test('an update confirmed while another line is being saved is refused with a reason', async () => {
  const source = createFakeChapterEditSource(instanceOptions)
  const held = holdNextCall(source.saveLine)
  await openLemmatization('4', source)
  await selectLine('3')
  await typeIntoNumber('3', 'a')
  await userEvent.click(button('Save line'))
  await selectLine('4')
  await openLoadedView('Lemmatization')
  await openWord(reconstructionRow(), 'line')
  await confirmUpdateAll()

  expect(await screen.findByRole('alert')).toHaveTextContent(
    instancesBusyMessage,
  )
  expect(source.lemmatizeWordInstances).not.toHaveBeenCalled()
  expect(wordButton(reconstructionRow(), 'line')).toHaveAttribute(
    'aria-expanded',
    'true',
  )

  await act(async () => {
    held.resolve()
    await source.saveLine.mock.results[0].value
  })
})
