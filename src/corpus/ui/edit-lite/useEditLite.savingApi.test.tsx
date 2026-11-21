import { act, waitFor } from '@testing-library/react'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildLineUrl,
  listLineNumbers,
  toSavedLine,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { readyLine } from 'corpus/ui/edit-lite/lineStates'
import {
  holdAnswerTo,
  openServedEditLiteHook,
  ServedEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(6)
const firstDraft: Line = setLineNumber(lines[0], '1a')
const secondDraft: Line = setLineNumber(lines[1], '2b')

async function saveUntilStored(
  { view }: ServedEditLiteHook,
  index: number,
  revision: string,
): Promise<void> {
  view.run((actions) => actions.saveLine(index))
  await waitFor(() => expect(view.state().outline.revision).toBe(revision))
}

test('two saves whose reloads are answered out of order leave the outline at the latest revision', async () => {
  const editing = await openServedEditLiteHook(lines)
  const { chapter, fakeApi, view } = editing
  view.run((actions) => actions.changeLine(0, firstDraft))
  view.run((actions) => actions.changeLine(1, secondDraft))
  const firstReload = holdAnswerTo(
    fakeApi.client.fetchJson,
    buildLineUrl(0, 'revision-2'),
  )
  await saveUntilStored(editing, 0, 'revision-2')

  expect(view.state().lines[0].status).toBe('saving')
  expect(view.state().outline.lines[0].number).toBe('1a')

  await saveUntilStored(editing, 1, 'revision-3')
  await view.waitForLine(1, 'ready')

  expect(view.state().lines[0].status).toBe('saving')

  await act(async () => firstReload.resolve())
  await view.waitForLine(0, 'ready')

  expect(view.state().outline).toEqual(chapter.outline)
  expect(view.state().outline.revision).toBe('revision-3')
  expect(listLineNumbers(view.state().outline.lines)).toEqual([
    '1a',
    '2b',
    '3',
    '4',
    '5',
    '6',
  ])
  expect(view.state().lines[0]).toEqual(readyLine(toSavedLine(firstDraft)))
  expect(view.state().lines[1]).toEqual(readyLine(toSavedLine(secondDraft)))
  expect(view.state().lines[2]).toEqual(readyLine(lines[2]))
  expect(chapter.lines.slice(0, 2)).toEqual([
    toSavedLine(firstDraft),
    toSavedLine(secondDraft),
  ])
})

test('a new line is put into the outline as soon as it is saved and is then loaded like any other line', async () => {
  const editing = await openServedEditLiteHook(lines)
  const { chapter, fakeApi, view } = editing
  view.run((actions) => actions.addLine())
  fakeApi.client.fetchJson.mockClear()
  view.run((actions) => actions.saveLine(6))
  await waitFor(() => expect(view.state().newLine).toBeNull())

  expect(fakeApi.client.fetchJson).not.toHaveBeenCalled()
  expect(view.state().outline).toEqual(chapter.outline)
  expect(view.state().outline.revision).toBe('revision-2')
  expect(view.state().outline.lines).toHaveLength(7)
  expect(view.state().lines[6]).toBeUndefined()

  await view.load(6, 1)

  expect(fakeApi.client.fetchJson.mock.calls).toEqual([
    [buildLineUrl(6, 'revision-2'), false, undefined],
  ])
  expect(view.state().lines[6]).toEqual(readyLine(chapter.lines[6]))
})
