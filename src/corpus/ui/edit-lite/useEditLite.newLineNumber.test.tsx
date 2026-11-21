import { act, waitFor } from '@testing-library/react'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  listLineNumbers,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import {
  EditLiteHook,
  holdNextCall,
  moveAndWait,
  renderEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(5)

async function addLine(view: EditLiteHook): Promise<string | undefined> {
  view.run((actions) => actions.addLine())
  await waitFor(() => expect(view.state().newLine?.status).toBe('ready'))
  return view.state().newLine?.draft?.number
}

test.each<[string, number, number, number[][]]>([
  ['is loaded', 0, 5, []],
  ['is not loaded yet', 4, 1, [[4, 1]]],
])(
  'addLine skips the numbers that lines have when the last line %s',
  async (_name, offset, limit, requests) => {
    const view = renderEditLiteHook(lines)
    await view.load(offset, limit)
    await moveAndWait(view, 4, 0)
    view.source.loadLines.mockClear()

    expect(listLineNumbers(view.state().outline.lines)).toEqual([
      '5',
      '1',
      '2',
      '3',
      '4',
    ])
    await expect(addLine(view)).resolves.toBe('6')
    expect(view.source.loadLines.mock.calls).toEqual(requests)
  },
)

test('addLine skips a number that a line got while the last line was loaded', async () => {
  const view = renderEditLiteHook(lines)
  await view.load(0, 1)
  const held = holdNextCall(view.source.loadLines)
  view.run((actions) => actions.addLine())
  view.run((actions) => actions.changeLine(0, setLineNumber(lines[0], '6')))
  view.run((actions) => actions.saveLine(0))
  await waitFor(() => expect(view.state().outline.lines[0].number).toBe('6'))
  await act(async () => held.resolve())
  await waitFor(() => expect(view.state().newLine?.status).toBe('ready'))

  expect(view.state().newLine?.draft?.number).toBe('7')
})

test('addLine proposes no number when the last number cannot be continued', async () => {
  const view = renderEditLiteHook([...lines, setLineNumber(lines[0], '5b')])

  await expect(addLine(view)).resolves.toBe('')
})
