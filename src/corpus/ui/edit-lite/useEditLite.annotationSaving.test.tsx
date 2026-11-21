import { act, waitFor } from '@testing-library/react'
import { createLineAlignment, Line } from 'corpus/domain/line'
import { buildReadyAnnotation } from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  AnnotationDraft,
  AnnotationView,
} from 'corpus/ui/edit-lite/editLiteState'
import {
  annotateLine,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  setLineNumber,
  setLineTranslation,
} from 'corpus/ui/edit-lite/lineDraft'
import { readyLine } from 'corpus/ui/edit-lite/lineStates'
import {
  findAnnotation,
  openView,
  openViewWithDraft,
  saveView,
  settleLoads,
} from 'corpus/ui/edit-lite/useEditLite.annotations.testSupport'
import {
  Deferred,
  EditLiteHook,
  holdNextCall,
  renderEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(5)
const position = 2
const views: readonly AnnotationView[] = ['alignment', 'lemmatization']

async function renderLoaded(): Promise<EditLiteHook> {
  const view = renderEditLiteHook(lines)
  await view.load(0, lines.length)
  return view
}

function listSavedValues(view: EditLiteHook, name: AnnotationView): unknown[] {
  const save =
    name === 'alignment'
      ? view.source.saveAlignment
      : view.source.saveLemmatization
  return save.mock.calls.map(([index, value]) => [index, value])
}

function findDraftValue(draft: AnnotationDraft): unknown {
  return draft.view === 'alignment' ? draft.alignment : draft.lemmatization
}

function expectNothingSaved(view: EditLiteHook): void {
  expect(view.source.saveAlignment).not.toHaveBeenCalled()
  expect(view.source.saveLemmatization).not.toHaveBeenCalled()
  expect(view.source.saveLine).not.toHaveBeenCalled()
}

test.each(views)(
  'a saved %s draft goes to its line, which is then loaded again without tokens',
  async (name) => {
    const view = await renderLoaded()
    const draft = await openViewWithDraft(view, position, name)
    const held = holdNextCall(view.source.loadLines)
    view.run((actions) => actions.saveAnnotation(position, name))
    view.run((actions) => actions.saveAnnotation(position, name))
    const savingLine = await view.waitForLine(position, 'saving')

    expect(savingLine.annotation?.draft).toBe(draft)

    await act(async () => held.resolve())
    const savedLine = await view.waitForLine(position, 'ready')

    expect(savedLine).toEqual(
      readyLine((await view.source.loadLines(position, 1))[0]),
    )
    expect(savedLine).not.toHaveProperty('annotation')
    expect(listSavedValues(view, name)).toEqual([
      [position, findDraftValue(draft)],
    ])
    expect(view.source.saveLine).not.toHaveBeenCalled()
  },
)

test('without a draft the values on screen are saved, suggestions included', async () => {
  const view = await renderLoaded()
  const annotatedLine = await openView(view, position, 'lemmatization')
  const alignment = createLineAlignment(annotatedLine)
  await saveView(view, position, 'alignment')
  const savedLine = await view.source.loadAnnotatedLine(position)

  expect(alignment[0][0].alignment[0]).toMatchObject({
    alignment: 1,
    suggested: true,
  })
  expect(view.source.saveAlignment.mock.calls).toEqual([[position, alignment]])
  expect(savedLine.variants[0].manuscripts[0].atfTokens[0].alignment).toBe(1)
  expect(savedLine.variants[0].alignment[0].alignment[0].suggested).toBe(false)

  await openView(view, position, 'lemmatization')
  await saveView(view, position, 'lemmatization')

  expect(view.source.saveLemmatization.mock.calls).toEqual([
    [position, buildLineLemmatization(savedLine)],
  ])
})

test('a refused save keeps the draft with the reason and can be repeated', async () => {
  const view = await renderLoaded()
  const draft = await openViewWithDraft(view, position, 'alignment')
  view.source.saveAlignment.mockRejectedValueOnce(
    new Error('Invalid alignment'),
  )
  view.run((actions) => actions.saveAnnotation(position, 'alignment'))
  const failedLine = await view.waitForLine(position, 'failed')

  expect(failedLine).toEqual({
    status: 'failed',
    original: lines[position],
    draft: lines[position],
    error: 'Invalid alignment',
    annotation: buildReadyAnnotation(annotateLine(lines[position]), { draft }),
  })
  expect(view.state().outline).toBe(view.outline)
  expect(view.source.loadLines).toHaveBeenCalledTimes(1)

  await saveView(view, position, 'alignment')

  expect(listSavedValues(view, 'alignment')).toEqual([
    [position, findDraftValue(draft)],
    [position, findDraftValue(draft)],
  ])
})

test('nothing is saved for a view that has nothing loaded or holds another draft', async () => {
  const view = await renderLoaded()
  view.run((actions) => actions.saveAnnotation(position, 'alignment'))
  view.run((actions) => actions.saveAnnotation(7, 'alignment'))
  await openViewWithDraft(view, position, 'alignment')
  view.run((actions) => actions.saveAnnotation(position, 'lemmatization'))
  view.run((actions) => actions.saveLine(position))
  await openView(view, 1, 'alignment')
  view.run((actions) => actions.saveAnnotation(1, 'lemmatization'))
  await settleLoads()

  expectNothingSaved(view)
  expect(view.state().lines[position].status).toBe('ready')
})

test('an annotation is not saved over unsaved text changes', async () => {
  const view = await renderLoaded()
  await openView(view, position, 'alignment')
  view.run((actions) =>
    actions.changeLine(position, setLineNumber(lines[position], '3a')),
  )
  view.run((actions) => actions.saveAnnotation(position, 'alignment'))
  await settleLoads()

  expectNothingSaved(view)
  expect(view.state().lines[position].draft?.number).toBe('3a')
})

test('a draft made on a line that changed on the server is not saved', async () => {
  const view = await renderLoaded()
  const draft = await openViewWithDraft(view, position, 'alignment')
  const changedLines = lines.map((line, index) =>
    index === position ? setLineTranslation(line, '#tr.en: changed') : line,
  )
  view.source.importLines.mockResolvedValueOnce(
    buildEditLiteOutline(changedLines, 'revision-2'),
  )
  await act(async () => {
    await view.actions().importLines('')
  })
  view.run((actions) => actions.saveAnnotation(position, 'alignment'))
  await settleLoads()

  expectNothingSaved(view)
  expect(findAnnotation(view, position)).toMatchObject({ draft, isStale: true })
  expect(view.state().lines[position].status).toBe('failed')

  view.run((actions) => actions.resetLine(position))

  expect(view.state().lines[position]).toBeUndefined()
})

test.each<[string, (view: EditLiteHook) => Deferred<void>]>([
  [
    'moved',
    (view) => {
      const held = holdNextCall(view.source.moveLine)
      view.run((actions) => actions.moveLine(0, 1, jest.fn()))
      return held
    },
  ],
  [
    'deleted',
    (view) => {
      const held = holdNextCall(view.source.deleteLine)
      view.run((actions) => actions.deleteLine(0, jest.fn()))
      return held
    },
  ],
])('no annotation is saved while a line is %s', async (_name, changeLayout) => {
  const view = await renderLoaded()
  await openViewWithDraft(view, position, 'alignment')
  const held = changeLayout(view)
  view.run((actions) => actions.saveAnnotation(position, 'alignment'))
  await act(async () => held.resolve())
  await waitFor(() => expect(view.state().layoutVersion).toBe(1))

  expectNothingSaved(view)
})

test('no line is moved or deleted while an annotation is saved', async () => {
  const view = await renderLoaded()
  await openViewWithDraft(view, position, 'alignment')
  const held = holdNextCall(view.source.saveAlignment)
  view.run((actions) => actions.saveAnnotation(position, 'alignment'))
  view.run((actions) => actions.moveLine(0, 1, jest.fn()))
  view.run((actions) => actions.deleteLine(0, jest.fn()))
  await act(async () => held.resolve())
  await view.waitForLine(position, 'ready')

  expect(view.source.moveLine).not.toHaveBeenCalled()
  expect(view.source.deleteLine).not.toHaveBeenCalled()
  expect(view.state().layoutVersion).toBe(0)
})
