import { act, waitFor } from '@testing-library/react'
import { annotationsNotAvailableMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import { buildReadyAnnotation } from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  annotateLine,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  failedResource,
  readyResource,
} from 'corpus/ui/edit-lite/lineAnnotations'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { readyLine } from 'corpus/ui/edit-lite/lineStates'
import {
  findAnnotation,
  openView,
  settleLoads,
} from 'corpus/ui/edit-lite/useEditLite.annotations.testSupport'
import {
  EditLiteHook,
  holdNextCall,
  moveAndWait,
  renderEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(5)
const position = 2

async function deleteAndWait(view: EditLiteHook, index: number): Promise<void> {
  const layoutVersion = view.state().layoutVersion
  view.run((actions) => actions.deleteLine(index, jest.fn()))
  await waitFor(() =>
    expect(view.state().layoutVersion).toBe(layoutVersion + 1),
  )
}

function listAnnotatedPositions(view: EditLiteHook): string[] {
  return Object.keys(view.state().lines).filter(
    (index) => findAnnotation(view, Number(index)) !== undefined,
  )
}

async function renderLoaded(
  source = createFakeChapterEditSource({ lines }),
): Promise<EditLiteHook> {
  const view = renderEditLiteHook(lines, source)
  await view.load(0, lines.length)
  return view
}

test('nothing is requested for the annotations until a view is opened', async () => {
  const view = await renderLoaded()
  view.run((actions) => actions.changeLine(1, setLineNumber(lines[1], '2a')))

  expect(view.source.loadAnnotatedLine).not.toHaveBeenCalled()
  expect(view.source.loadLemmatization).not.toHaveBeenCalled()
  expect(findAnnotation(view, position)).toBeUndefined()
})

test('opening the alignment loads the tokens of the line once and no lemmas', async () => {
  const view = await renderLoaded()
  const annotatedLine = await openView(view, position, 'alignment')
  view.run((actions) => actions.openAnnotation(position, 'alignment'))
  await settleLoads()

  expect(annotatedLine).toEqual(annotateLine(lines[position]))
  expect(view.state().lines[position]).toEqual({
    ...readyLine(lines[position]),
    annotation: buildReadyAnnotation(annotatedLine),
  })
  expect(view.source.loadAnnotatedLine.mock.calls).toEqual([[position]])
  expect(view.source.loadLemmatization).not.toHaveBeenCalled()
  expect(view.source.loadLines).toHaveBeenCalledTimes(1)
})

test('opening the lemmatization loads the tokens and then the lemmas, each once', async () => {
  const view = await renderLoaded()
  const annotatedLine = await openView(view, position, 'lemmatization')
  view.run((actions) => actions.openAnnotation(position, 'lemmatization'))
  view.run((actions) => actions.openAnnotation(position, 'alignment'))
  await settleLoads()

  expect(findAnnotation(view, position)).toEqual(
    buildReadyAnnotation(annotatedLine, {
      lemmas: readyResource(buildLineLemmatization(annotatedLine)),
    }),
  )
  expect(view.source.loadAnnotatedLine.mock.calls).toEqual([[position]])
  expect(view.source.loadLemmatization.mock.calls).toEqual([[annotatedLine]])
})

test('a second view opened while the tokens load does not request them again', async () => {
  const view = await renderLoaded()
  const held = holdNextCall(view.source.loadAnnotatedLine)
  view.run((actions) => actions.openAnnotation(position, 'alignment'))
  view.run((actions) => actions.openAnnotation(position, 'lemmatization'))

  expect(findAnnotation(view, position)?.tokens.status).toBe('loading')

  await act(async () => held.resolve())
  await openView(view, position, 'lemmatization')

  expect(view.source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
  expect(view.source.loadLemmatization).toHaveBeenCalledTimes(1)
})

test('tokens are not requested for a line that is not loaded', async () => {
  const view = renderEditLiteHook(lines)
  view.run((actions) => actions.openAnnotation(position, 'lemmatization'))

  expect(view.source.loadAnnotatedLine).not.toHaveBeenCalled()
  expect(view.state().lines).toEqual({})
})

test('a failed load keeps its reason and is repeated when the view is opened again', async () => {
  const view = await renderLoaded()
  view.source.loadAnnotatedLine.mockRejectedValueOnce(new Error('no tokens'))
  view.run((actions) => actions.openAnnotation(position, 'lemmatization'))
  await waitFor(() =>
    expect(findAnnotation(view, position)?.tokens).toEqual(
      failedResource('no tokens'),
    ),
  )
  view.source.loadLemmatization.mockRejectedValueOnce('no lemmas')
  view.run((actions) => actions.openAnnotation(position, 'lemmatization'))
  await waitFor(() =>
    expect(findAnnotation(view, position)?.lemmas).toEqual(
      failedResource('no lemmas'),
    ),
  )
  await openView(view, position, 'lemmatization')

  expect(view.source.loadAnnotatedLine).toHaveBeenCalledTimes(2)
  expect(view.source.loadLemmatization).toHaveBeenCalledTimes(2)
  expect(view.state().lines[position].status).toBe('ready')
})

test('the read-only snapshot answers with its reason and no lemmas are requested', async () => {
  const view = await renderLoaded(
    createFakeChapterEditSource({ lines, kind: 'legacy' }),
  )
  view.run((actions) => actions.openAnnotation(position, 'lemmatization'))
  await waitFor(() =>
    expect(findAnnotation(view, position)?.tokens).toEqual(
      failedResource(annotationsNotAvailableMessage),
    ),
  )
  await settleLoads()

  expect(view.source.loadLemmatization).not.toHaveBeenCalled()
})

test('tokens that arrive after their line was saved are ignored', async () => {
  const view = await renderLoaded()
  const held = holdNextCall(view.source.loadAnnotatedLine)
  view.run((actions) => actions.openAnnotation(position, 'alignment'))
  view.run((actions) =>
    actions.changeLine(position, setLineNumber(lines[position], '3a')),
  )
  view.run((actions) => actions.saveLine(position))
  await waitFor(() =>
    expect(view.state().lines[position].original?.number).toBe('3a'),
  )
  await act(async () => held.resolve())
  await settleLoads()

  expect(findAnnotation(view, position)).toBeUndefined()
  expect(view.source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
})

test.each<[string, (view: EditLiteHook) => Promise<void>]>([
  ['a line is moved across it', (view) => moveAndWait(view, 0, 3)],
  ['a line before it is deleted', (view) => deleteAndWait(view, 0)],
])(
  'tokens that arrive after %s are loaded again for the new position of their line',
  async (_name, changeLayout) => {
    const view = await renderLoaded()
    const held = holdNextCall(view.source.loadAnnotatedLine)
    view.run((actions) => actions.openAnnotation(position, 'lemmatization'))
    await changeLayout(view)

    expect(findAnnotation(view, position - 1)?.tokens.status).toBe('loading')

    await act(async () => held.resolve())
    await waitFor(() =>
      expect(findAnnotation(view, position - 1)?.lemmas?.status).toBe('ready'),
    )

    expect(view.state().lines[position - 1].original).toBe(lines[position])
    expect(findAnnotation(view, position - 1)?.tokens.value).toEqual(
      annotateLine(lines[position]),
    )
    expect(listAnnotatedPositions(view)).toEqual([`${position - 1}`])
    expect(view.source.loadAnnotatedLine.mock.calls).toEqual([
      [position],
      [position - 1],
    ])
    expect(view.source.loadLemmatization).toHaveBeenCalledTimes(1)
  },
)

test('lemmas that arrive after their line was moved go to that line', async () => {
  const view = await renderLoaded()
  const annotatedLine = await openView(view, position, 'alignment')
  const held = holdNextCall(view.source.loadLemmatization)
  view.run((actions) => actions.openAnnotation(position, 'lemmatization'))
  await moveAndWait(view, 0, 3)
  await act(async () => held.resolve())
  await waitFor(() =>
    expect(findAnnotation(view, position - 1)?.lemmas?.status).toBe('ready'),
  )

  expect(findAnnotation(view, position - 1)?.tokens.value).toBe(annotatedLine)
  expect(listAnnotatedPositions(view)).toEqual([`${position - 1}`])
  expect(view.source.loadLemmatization.mock.calls).toEqual([[annotatedLine]])
  expect(view.source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
})

test('tokens and lemmas that arrive after their line was deleted are ignored', async () => {
  const view = await renderLoaded()
  await openView(view, 1, 'alignment')
  const heldTokens = holdNextCall(view.source.loadAnnotatedLine)
  const heldLemmas = holdNextCall(view.source.loadLemmatization)
  view.run((actions) => actions.openAnnotation(position, 'lemmatization'))
  view.run((actions) => actions.openAnnotation(1, 'lemmatization'))
  await deleteAndWait(view, position)
  view.run((actions) => actions.deleteLine(1, jest.fn()))
  await waitFor(() => expect(view.state().layoutVersion).toBe(2))
  await act(async () => {
    heldTokens.resolve()
    heldLemmas.resolve()
  })
  await settleLoads()

  expect(listAnnotatedPositions(view)).toEqual([])
  expect(view.source.loadAnnotatedLine).toHaveBeenCalledTimes(2)
  expect(view.source.loadLemmatization).toHaveBeenCalledTimes(1)
})
