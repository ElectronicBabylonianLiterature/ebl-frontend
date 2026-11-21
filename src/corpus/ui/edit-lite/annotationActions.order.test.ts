import { waitFor } from '@testing-library/react'
import { Line } from 'corpus/domain/line'
import { saveAnnotation } from 'corpus/ui/edit-lite/annotationActions'
import {
  buildEditLiteLines,
  createRecordedEditLiteStore,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { annotateLine } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { readyResource } from 'corpus/ui/edit-lite/lineAnnotations'
import { findImplementation } from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(4)
const draftPosition = 2

test('the outline of the answer is applied in the step of the answer, before the reload', async () => {
  const { store, events } = createRecordedEditLiteStore(lines)
  const source = store.getSource() as FakeChapterEditSource
  const save = findImplementation(source.saveAlignment)
  source.saveAlignment.mockImplementation((...parameters) => {
    const answer = save(...parameters)
    void answer.then(() => {
      events.push('answer')
      void Promise.resolve().then(() => events.push('after answer'))
    })
    return answer
  })
  store.dispatch({ type: 'annotationRequested', index: draftPosition })
  store.dispatch({
    type: 'annotationSettled',
    original: lines[draftPosition],
    tokens: readyResource(annotateLine(lines[draftPosition])),
  })
  await Promise.resolve()
  events.length = 0
  saveAnnotation(store, draftPosition, 'alignment')
  await waitFor(() => expect(events).toContain('after saveSucceeded'))

  expect(events).toEqual([
    'saveStarted',
    'after saveStarted',
    'answer',
    'outlineReplaced',
    'after answer',
    'after outlineReplaced',
    'saveSucceeded',
    'after saveSucceeded',
  ])
})
