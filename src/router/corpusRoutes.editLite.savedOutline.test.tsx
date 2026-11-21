import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  countRequests,
  openServedEditLiteRoute,
  ServedEditLiteRoute,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildEditLiteLines,
  buildLineUrl,
  listLineNumbers,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  deleteSelectedLine,
  loadedEditor,
  options,
  selectedOptions,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import {
  answerOnce,
  holdAnswerTo,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(6)
const firstReloadUrl = buildLineUrl(0, 'revision-2')

async function saveLineAs(
  lineNumber: string,
  suffix: string,
): Promise<HTMLElement> {
  await typeIntoNumber(lineNumber, suffix)
  await userEvent.click(button('Save line'))
  return screen.findByRole('region', { name: `Line ${lineNumber}${suffix}` })
}

async function waitForSavedLine(editor: HTMLElement): Promise<void> {
  await waitFor(() =>
    expect(within(editor).getByLabelText('Number')).toBeEnabled(),
  )
}

async function moveFifthLineUpWithDraftOnFourth(
  firstNumbers: readonly string[],
): Promise<void> {
  await userEvent.click(options()[3])
  await typeIntoNumber('4', 'x')
  await userEvent.click(options()[4])
  await loadedEditor('5')
  await userEvent.click(button('Move up'))
  await waitForOrder([...firstNumbers, '3', '5', '4', '6'])
}

async function expectMovedLineSelectedAndDraftOnItsLine({
  chapter,
}: ServedEditLiteRoute): Promise<void> {
  const editor = await loadedEditor('5')

  expect(selectedOptions()).toEqual([options()[3]])
  expect(within(editor).getByLabelText('Number')).toHaveValue('5')
  expect(within(editor).queryByRole('alert')).not.toBeInTheDocument()
  expect(within(options()[4]).getByText('edited')).toBeVisible()
  expect(screen.getAllByText('edited')).toHaveLength(1)
  expect(listLineNumbers(chapter.lines).slice(2)).toEqual(['3', '5', '4', '6'])
}

test('a move after a save whose reload failed takes the selection and the drafts along', async () => {
  const served = await openServedEditLiteRoute(lines, '?line=1')
  answerOnce(served.fakeApi.client.fetchJson, firstReloadUrl, () =>
    Promise.reject(new TypeError('Failed to fetch')),
  )
  const savedEditor = await saveLineAs('1', 'a')
  await waitForSavedLine(savedEditor)

  expect(within(savedEditor).getByLabelText('Number')).toHaveValue('1a')
  expect(within(savedEditor).queryByRole('alert')).not.toBeInTheDocument()
  expect(within(options()[0]).getByText('1a')).toBeVisible()
  expect(countRequests(served.fakeApi, firstReloadUrl)).toBe(2)

  await moveFifthLineUpWithDraftOnFourth(['1a', '2'])
  await expectMovedLineSelectedAndDraftOnItsLine(served)
  await userEvent.click(options()[4])
  const draftEditor = await loadedEditor('4')

  expect(within(draftEditor).getByLabelText('Number')).toHaveValue('4x')
  expect(within(draftEditor).queryByRole('alert')).not.toBeInTheDocument()
  expect(listLineNumbers(served.chapter.lines)).toEqual([
    '1a',
    '2',
    '3',
    '5',
    '4',
    '6',
  ])
})

test('a move after two saves whose reloads finished out of order is followed and the next delete removes the selected line', async () => {
  const served = await openServedEditLiteRoute(lines, '?line=1')
  const { chapter, fakeApi } = served
  const firstReload = holdAnswerTo(fakeApi.client.fetchJson, firstReloadUrl)
  await saveLineAs('1', 'a')
  await userEvent.click(options()[1])
  await waitForSavedLine(await saveLineAs('2', 'b'))
  await act(async () => firstReload.resolve())
  await userEvent.click(options()[0])
  await waitForSavedLine(await loadedEditor('1a'))

  expect(within(options()[0]).getByText('1a')).toBeVisible()
  expect(within(options()[1]).getByText('2b')).toBeVisible()
  expect(chapter.revision).toBe('revision-3')

  await moveFifthLineUpWithDraftOnFourth(['1a', '2b'])
  await expectMovedLineSelectedAndDraftOnItsLine(served)
  await deleteSelectedLine()
  await waitFor(() => expect(options()).toHaveLength(5))
  const draftEditor = await loadedEditor('4')

  expect(within(draftEditor).getByLabelText('Number')).toHaveValue('4x')
  expect(listLineNumbers(chapter.lines)).toEqual(['1a', '2b', '3', '4', '6'])
  expect(fakeApi.client.postJson).toHaveBeenLastCalledWith(
    expect.stringContaining('/lines?view=outline&revision=revision-4'),
    expect.objectContaining({ deleted: [3] }),
  )
})
