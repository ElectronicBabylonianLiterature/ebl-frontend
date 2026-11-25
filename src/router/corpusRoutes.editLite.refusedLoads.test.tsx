import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import { openServedEditLiteRoute } from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildEditLiteLines,
  listLineNumbers,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  deleteSelectedLine,
  loadedEditor,
  options,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { holdNextAnswer } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(6)

async function moveSelectedLineDown(): Promise<void> {
  await userEvent.click(button('Move down'))
}

test.each<[string, () => Promise<void>, string[], number]>([
  ['moved', moveSelectedLineDown, ['1', '3', '2', '4', '5', '6'], 5],
  ['deleted', deleteSelectedLine, ['1', '3', '4', '5', '6'], 4],
])(
  'a line that was refused while another line was being %s is loaded when the change is answered',
  async (_name, startChange, storedNumbers, lastPosition) => {
    const { chapter, fakeApi } = await openServedEditLiteRoute(lines, '?line=2')
    await loadedEditor('2')
    const prepareAnswer = holdNextAnswer(fakeApi.client.postJson)
    await startChange()
    const answerChange = await prepareAnswer()

    expect(listLineNumbers(chapter.lines)).toEqual(storedNumbers)
    expect(chapter.revision).toBe('revision-2')

    await userEvent.click(options()[5])
    const refusedEditor = screen.getByRole('region', { name: 'Line 6' })
    await waitFor(() =>
      expect(fakeApi.client.fetchJson).toHaveBeenLastCalledWith(
        expect.stringMatching(/limit=2&revision=revision-1$/),
        false,
        undefined,
      ),
    )
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(within(refusedEditor).queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText(chapterChangedMessage)).not.toBeInTheDocument()

    await act(async () => answerChange())
    await waitFor(() => expect(options()).toHaveLength(storedNumbers.length))
    const editor = await loadedEditor('6')

    expect(selectedOptions()).toEqual([options()[lastPosition]])
    expect(within(editor).getByLabelText('Number')).toHaveValue('6')
    expect(within(editor).queryByRole('alert')).not.toBeInTheDocument()
    expect(fakeApi.client.fetchJson).toHaveBeenLastCalledWith(
      expect.stringMatching(/limit=2&revision=revision-2$/),
      false,
      undefined,
    )
  },
)
