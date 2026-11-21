import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import {
  editLiteChapterId,
  openServedEditLiteRoute,
  ServedEditLiteRoute,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildEditLiteLines,
  buildMoveUrl,
  listLineNumbers,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  loadedEditor,
  moveSelectedLineTo,
  optionNumbers,
  options,
  selectedOptions,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { ApiError } from 'http/ApiClient'
import { createChapterUrl } from 'test-support/FakeApiExpectation'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const chapterUrl = createChapterUrl(editLiteChapterId)
const lines: readonly Line[] = buildEditLiteLines(5)
const initialOrder: readonly string[] = ['1', '2', '3', '4', '5']

test('a line is moved across an edited line and the draft is saved to its own line', async () => {
  const { chapter, fakeApi } = await openServedEditLiteRoute(lines, '?line=3')
  await typeIntoNumber('3', 'x')
  await userEvent.click(options()[0])
  await loadedEditor('1')
  await moveSelectedLineTo('After line 4')
  await waitForOrder(['2', '3', '4', '1', '5'])

  expect(selectedOptions()).toEqual([options()[3]])
  expect(listLineNumbers(chapter.lines)).toEqual(['2', '3', '4', '1', '5'])
  expect(within(options()[1]).getByText('edited')).toBeVisible()
  expect(screen.getAllByText('edited')).toHaveLength(1)

  await userEvent.click(options()[1])
  const editor = await loadedEditor('3')

  expect(within(editor).getByLabelText('Number')).toHaveValue('3x')

  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('region', { name: 'Line 3x' })).toBe(editor)
  expect(listLineNumbers(chapter.lines)).toEqual(['2', '3x', '4', '1', '5'])
  expect(chapter.lines.filter((line) => lines.includes(line))).toEqual([
    lines[1],
    lines[3],
    lines[0],
    lines[4],
  ])
  expect(fakeApi.client.postJson.mock.calls).toEqual([
    [buildMoveUrl('revision-1'), { from: 0, to: 3 }],
    [
      `${chapterUrl}/lines?view=outline&revision=revision-2`,
      expect.objectContaining({
        edited: [{ index: 1, line: expect.objectContaining({ number: '3x' }) }],
      }),
    ],
  ])
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test.each<[string, (served: ServedEditLiteRoute) => Promise<void>, string]>([
  [
    'was changed by someone else',
    async ({ fakeApi }): Promise<void> => {
      await fakeApi.client.postJson(buildMoveUrl('revision-1'), {
        from: 3,
        to: 4,
      })
    },
    chapterChangedMessage,
  ],
  [
    'cannot be ordered that way',
    async ({ fakeApi }): Promise<void> => {
      fakeApi.client.postJson.mockRejectedValueOnce(
        new ApiError('Invalid extent', { description: 'Invalid extent' }, 422),
      )
    },
    'Invalid extent',
  ],
])(
  'a move in a chapter that %s shows the reason and moves nothing',
  async (_name, prepare, message) => {
    const served = await openServedEditLiteRoute(lines, '?line=2')
    await typeIntoNumber('2', 'x')
    await prepare(served)
    const storedLines = served.chapter.lines
    await userEvent.click(button('Move up'))
    const editor = within(await loadedEditor('2'))

    expect(await editor.findByRole('alert')).toHaveTextContent(message)
    expect(optionNumbers()).toEqual(initialOrder)
    expect(selectedOptions()).toEqual([options()[1]])
    expect(editor.getByLabelText('Number')).toHaveValue('2x')
    expect(served.chapter.lines).toBe(storedLines)
    expect(served.fakeApi.client.postJson).toHaveBeenLastCalledWith(
      buildMoveUrl('revision-1'),
      { from: 1, to: 0 },
    )
  },
)
