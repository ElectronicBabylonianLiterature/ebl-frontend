import { waitFor } from '@testing-library/react'
import _ from 'lodash'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesLoadedActions,
  createFakeChapterEditSource,
  createFakeEditLiteStore,
  FakeChapterEditSource,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteActions } from 'corpus/ui/edit-lite/editLiteActions'
import { EditLiteActions } from 'corpus/ui/edit-lite/EditLiteContext'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteStore } from 'corpus/ui/edit-lite/editLiteStore'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { loadRange } from 'corpus/ui/edit-lite/lineLoading'
import { readyLine } from 'corpus/ui/edit-lite/lineStates'
import { holdNextAnswer } from 'corpus/ui/edit-lite/useEditLite.testSupport'

interface Editor {
  readonly source: FakeChapterEditSource
  readonly store: EditLiteStore
  readonly actions: EditLiteActions
  readonly events: string[]
}

type StartChange = (editor: Editor) => Promise<() => void>
type PrepareSource = (source: FakeChapterEditSource) => void

const lines: readonly Line[] = buildEditLiteLines(6)
const firstDraft: Line = setLineNumber(lines[0], '1a')
const lastDraft: Line = setLineNumber(lines[5], '6a')
const loadedState: EditLiteState = reduceEditLite(
  createEditLiteState(buildEditLiteOutline(lines)),
  ...buildLinesLoadedActions(0, lines.slice(0, 4)),
  ...buildLinesLoadedActions(5, lines.slice(5)),
  { type: 'lineChanged', index: 0, draft: firstDraft },
  { type: 'lineChanged', index: 5, draft: lastDraft },
)
const changes: readonly [string, StartChange, string, Line, Line][] = [
  [
    'moved',
    (editor) => startMove(editor, jest.fn()),
    'lineMoved',
    lines[0],
    firstDraft,
  ],
  ['deleted', startDelete, 'lineDeleted', lines[5], lastDraft],
]
const answers: readonly [string, PrepareSource, string][] = [
  ['answered', _.noop, 'linesLoaded'],
  [
    'refused',
    (source): void => {
      source.loadLines.mockRejectedValueOnce(new Error('Network error'))
    },
    'linesFailed',
  ],
]

function createEditor(): Editor {
  const source = createFakeChapterEditSource({ lines })
  const events: string[] = []
  const store = createFakeEditLiteStore(
    source,
    loadedState,
    (action: EditLiteAction): void => {
      events.push(action.type)
    },
  )
  return { source, store, events, actions: createEditLiteActions(store) }
}

function startMove(editor: Editor, onMoved: () => void): Promise<() => void> {
  const prepareAnswer = holdNextAnswer(editor.source.moveLine)
  editor.actions.moveLine(0, 4, onMoved)
  return prepareAnswer()
}

function startDelete(editor: Editor): Promise<() => void> {
  const prepareAnswer = holdNextAnswer(editor.source.deleteLine)
  editor.actions.deleteLine(0, jest.fn())
  return prepareAnswer()
}

async function waitForEvent(editor: Editor, event: string): Promise<void> {
  await waitFor(() => expect(editor.events).toContain(event))
}

describe.each(changes)(
  'a line requested just before another line is %s',
  (_name, startChange, completion, original, draft) => {
    async function requestBeforeCompletion(editor: Editor): Promise<void> {
      const answerChange = await startChange(editor)
      answerChange()
      editor.actions.ensureLines(4, 1)
      await waitForEvent(editor, completion)
    }

    it('is not loaded into the new layout', async () => {
      const editor = createEditor()
      await requestBeforeCompletion(editor)

      expect(editor.events).toEqual([
        expect.stringMatching(/Started$/),
        'linesRequested',
        completion,
      ])
      expect(editor.source.loadLines).not.toHaveBeenCalled()
      expect(editor.store.getState().lines[3]).toBeUndefined()
      expect(editor.store.getState().lines[4]).toEqual({
        status: 'ready',
        original,
        draft,
        error: null,
      })
    })

    it('is loaded from its new place when it is requested again', async () => {
      const editor = createEditor()
      await requestBeforeCompletion(editor)
      editor.actions.ensureLines(3, 2)
      await waitForEvent(editor, 'linesLoaded')

      expect(editor.source.loadLines.mock.calls).toEqual([[3, 1]])
      expect(editor.store.getState().lines[3]).toEqual(readyLine(lines[4]))
      expect(editor.store.getState().lines[4].draft).toBe(draft)
    })

    it.each(answers)(
      'leaves the draft at its old place alone when a request started afterwards is %s',
      async (_answer, prepare, event) => {
        const editor = createEditor()
        prepare(editor.source)
        await requestBeforeCompletion(editor)
        const changedState = editor.store.getState()
        await loadRange(editor.store, [4])

        expect(editor.source.loadLines.mock.calls).toEqual([[4, 1]])
        expect(editor.events.slice(3)).toEqual([event])
        expect(editor.store.getState()).toBe(changedState)
        expect(changedState.lines[4].draft).toBe(draft)
      },
    )
  },
)

test('lines requested again in the step that completes a move are loaded once from the new layout', async () => {
  const editor = createEditor()
  const answerMove = await startMove(editor, () =>
    editor.actions.ensureLines(3, 2),
  )
  answerMove()
  editor.actions.ensureLines(4, 1)
  await waitForEvent(editor, 'linesLoaded')

  expect(editor.events).toEqual([
    'moveStarted',
    'linesRequested',
    'lineMoved',
    'linesRequested',
    'linesLoaded',
  ])
  expect(editor.source.loadLines.mock.calls).toEqual([[3, 1]])
  expect(editor.store.getState().lines[3]).toEqual(readyLine(lines[4]))
  expect(editor.store.getState().lines[4]).toEqual({
    status: 'ready',
    original: lines[0],
    draft: firstDraft,
    error: null,
  })
})
