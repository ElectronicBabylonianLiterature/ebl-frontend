import { waitFor } from '@testing-library/react'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  leaveAnnotation,
  lemmatizeInstances,
} from 'corpus/ui/edit-lite/annotationActions'
import {
  buildAlignmentDraft,
  buildLemmasLoadedActions,
  buildLemmatizationDraft,
  buildTokensLoadedActions,
} from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildEditLiteLines,
  createRecordedEditLiteStore,
  FakeChapterEditSource,
  RecordedEditLiteStore,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { AnnotationDraft } from 'corpus/ui/edit-lite/editLiteState'
import {
  annotateLine,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { findImplementation } from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(6)
const position = 3
const otherPosition = 4

interface Recorded extends RecordedEditLiteStore {
  readonly source: FakeChapterEditSource
  readonly onDone: jest.Mock
}

function openLine(
  { store }: RecordedEditLiteStore,
  index: number,
  createDraft?: (line: Line) => AnnotationDraft,
): void {
  const line = annotateLine(lines[index])
  ;[
    ...buildTokensLoadedActions(index, lines[index], line),
    ...buildLemmasLoadedActions(index, line, buildLineLemmatization(line)),
  ].forEach(store.dispatch)
  if (createDraft !== undefined) {
    store.dispatch({
      type: 'annotationChanged',
      index,
      line,
      draft: createDraft(line),
    })
  }
}

function recordAnswer<Parameters extends unknown[]>(
  mock: jest.MockInstance<Promise<ChapterOutline>, Parameters>,
  events: string[],
): void {
  const implementation = findImplementation(mock)
  mock.mockImplementation((...parameters: Parameters) => {
    const answer = implementation(...parameters)
    void answer.then(() => {
      events.push('answer')
      void Promise.resolve().then(() => events.push('after answer'))
    })
    return answer
  })
}

async function open(
  createDraft?: (line: Line) => AnnotationDraft,
): Promise<Recorded> {
  const recorded = createRecordedEditLiteStore(lines)
  const source = recorded.store.getSource() as FakeChapterEditSource
  const opened = { ...recorded, source, onDone: jest.fn() }
  openLine(recorded, position, createDraft)
  recordAnswer(source.saveLemmatization, recorded.events)
  recordAnswer(source.lemmatizeWordInstances, recorded.events)
  await Promise.resolve()
  recorded.events.length = 0
  return opened
}

test('the line is saved first and each outline is applied in the step of its answer', async () => {
  const { store, source, events, onDone } = await open(buildLemmatizationDraft)
  openLine({ store, events }, otherPosition)
  openLine({ store, events }, 5, buildAlignmentDraft)
  await Promise.resolve()
  events.length = 0
  lemmatizeInstances(store, position, 'line', ['line I'], onDone)
  await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1))

  expect(events.filter((event) => !event.startsWith('after save'))).toEqual([
    'saveStarted',
    'answer',
    'outlineReplaced',
    'after answer',
    'after outlineReplaced',
    'answer',
    'instancesLemmatized',
    'after answer',
    'after instancesLemmatized',
    'saveSucceeded',
  ])
  expect(source.lemmatizeWordInstances.mock.calls).toEqual([
    ['line', ['line I']],
  ])
  expect(store.getState().lines[position]).not.toHaveProperty('annotation')
  expect(store.getState().lines[otherPosition]).not.toHaveProperty('annotation')
  expect(store.getState().lines[5].annotation).toMatchObject({
    draft: { view: 'alignment' },
    lemmas: null,
    isOutdated: true,
    isStale: false,
  })
})

test('without unsaved changes of the line only the chapter is saved', async () => {
  const { store, source, events, onDone } = await open()
  const isStarted = lemmatizeInstances(
    store,
    position,
    'line',
    ['line I'],
    onDone,
  )
  await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1))

  expect(isStarted).toBe(true)
  expect(source.saveLemmatization).not.toHaveBeenCalled()
  expect(events.slice(0, 3)).toEqual([
    'saveStarted',
    'after saveStarted',
    'answer',
  ])
  expect(events).toContain('instancesLemmatized')
  expect(events).not.toContain('outlineReplaced')
})

test.each<[string, (recorded: Recorded) => void]>([
  [
    'another line has unsaved lemmatization changes',
    (recorded) => openLine(recorded, otherPosition, buildLemmatizationDraft),
  ],
  [
    'the line has unsaved text changes',
    ({ store }) =>
      store.dispatch({
        type: 'lineChanged',
        index: position,
        draft: setLineNumber(lines[position], '4a'),
      }),
  ],
  [
    'the line is being saved',
    ({ store }) => store.dispatch({ type: 'saveStarted', index: position }),
  ],
  [
    'a line is being moved',
    ({ store }) => store.dispatch({ type: 'moveStarted', index: 0 }),
  ],
])('nothing is saved for the chapter while %s', async (_name, block) => {
  const recorded = await open()
  block(recorded)
  const isStarted = lemmatizeInstances(
    recorded.store,
    position,
    'line',
    ['line I'],
    recorded.onDone,
  )
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(isStarted).toBe(false)
  expect(recorded.source.lemmatizeWordInstances).not.toHaveBeenCalled()
  expect(recorded.source.saveLemmatization).not.toHaveBeenCalled()
  expect(recorded.onDone).not.toHaveBeenCalled()
})

test('a refused save of the chapter marks the line and reports nothing as done', async () => {
  const { store, source, onDone } = await open()
  source.lemmatizeWordInstances.mockRejectedValueOnce(new Error('No change'))
  lemmatizeInstances(store, position, 'line', ['line I'], onDone)
  await waitFor(() =>
    expect(store.getState().lines[position].status).toBe('failed'),
  )

  expect(store.getState().lines[position]).toMatchObject({
    error: 'No change',
    annotation: { draft: null, isStale: false },
  })
  expect(store.getState().outline.revision).toBe('revision-1')
  expect(onDone).not.toHaveBeenCalled()
})

test('a line is left at once without changes and after the save with changes', async () => {
  const clean = await open()
  leaveAnnotation(clean.store, position, 'lemmatization', clean.onDone)

  expect(clean.onDone).toHaveBeenCalledTimes(1)
  expect(clean.events).toEqual([])

  const changed = await open(buildLemmatizationDraft)
  leaveAnnotation(changed.store, position, 'lemmatization', changed.onDone)

  expect(changed.onDone).not.toHaveBeenCalled()

  await waitFor(() => expect(changed.onDone).toHaveBeenCalledTimes(1))

  expect(changed.events).toContain('saveSucceeded')
  expect(changed.source.saveLemmatization).toHaveBeenCalledTimes(1)
})

test('a line is not left when its save is refused', async () => {
  const { store, source, onDone } = await open(buildLemmatizationDraft)
  source.saveLemmatization.mockRejectedValueOnce(new Error('Invalid lemma'))
  leaveAnnotation(store, position, 'lemmatization', onDone)
  await waitFor(() =>
    expect(store.getState().lines[position].status).toBe('failed'),
  )
  await Promise.resolve()

  expect(onDone).not.toHaveBeenCalled()
})
