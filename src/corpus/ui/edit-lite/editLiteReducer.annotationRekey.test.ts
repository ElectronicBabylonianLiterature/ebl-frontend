import { Line } from 'corpus/domain/line'
import {
  buildAnnotationStates,
  buildReadyAnnotation,
} from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildEditLiteOutline,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'
import {
  annotateLine,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { readyResource } from 'corpus/ui/edit-lite/lineAnnotations'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'
import { readyLine } from 'corpus/ui/edit-lite/lineStates'

const { lines, annotatedLine, tokensState, draftState } = buildAnnotationStates(
  5,
  1,
)
const draftLine: LineState = draftState.lines[1]

function move(state: EditLiteState, from: number, to: number): EditLiteState {
  return reduceEditLite(
    state,
    { type: 'moveStarted', index: from },
    {
      type: 'lineMoved',
      from,
      to,
      outline: buildEditLiteOutline(moveItem(lines, from, to), 'revision-2'),
    },
  )
}

function deleteLine(state: EditLiteState, index: number): EditLiteState {
  const remainingLines: readonly Line[] = lines.filter(
    (_line, position) => position !== index,
  )
  return reduceEditLite(
    state,
    { type: 'deleteStarted', index },
    {
      type: 'lineDeleted',
      index,
      outline: buildEditLiteOutline(remainingLines, 'revision-2'),
    },
  )
}

function listAnnotatedPositions(state: EditLiteState): string[] {
  return Object.keys(state.lines).filter(
    (index) => state.lines[Number(index)].annotation !== undefined,
  )
}

test.each<[string, number, number, number]>([
  ['another line down across it', 0, 3, 0],
  ['another line up across it', 3, 0, 2],
  ['the line itself', 1, 3, 3],
  ['a line behind it', 2, 3, 1],
])(
  'the draft follows its line when %s is moved',
  (_name, from, to, position) => {
    const state = move(draftState, from, to)

    expect(state.lines[position]).toEqual(draftLine)
    expect(state.lines[position].annotation).toBe(draftLine.annotation)
    expect(listAnnotatedPositions(state)).toEqual([`${position}`])
  },
)

test.each<[string, number, number]>([
  ['before it', 0, 0],
  ['behind it', 2, 1],
])(
  'the draft follows its line when a line %s is deleted',
  (_name, index, position) => {
    const state = deleteLine(draftState, index)

    expect(state.lines[position]).toBe(draftLine)
    expect(listAnnotatedPositions(state)).toEqual([`${position}`])
  },
)

test('the draft of a deleted line goes with it', () => {
  expect(listAnnotatedPositions(deleteLine(draftState, 1))).toEqual([])
})

test.each<[string, (state: EditLiteState) => EditLiteState]>([
  ['moved', (state) => move(state, 0, 2)],
  ['deleted', (state) => deleteLine(state, 0)],
])(
  'loads under way settle on their lines wherever they are after a line is %s',
  (_name, change) => {
    const otherAnnotatedLine = annotateLine(lines[2])
    const lemmatization = buildLineLemmatization(annotatedLine)
    const loadingState = reduceEditLite(
      tokensState,
      { type: 'lemmasRequested', index: 1 },
      { type: 'annotationRequested', index: 2 },
    )
    const changedState = change(loadingState)
    const state = reduceEditLite(
      changedState,
      {
        type: 'annotationSettled',
        original: lines[2],
        tokens: readyResource(otherAnnotatedLine),
      },
      {
        type: 'lemmasSettled',
        line: annotatedLine,
        lemmas: readyResource(lemmatization),
      },
    )

    expect(changedState.lines[0]).toBe(loadingState.lines[1])
    expect(changedState.lines[1]).toBe(loadingState.lines[2])
    expect(state.lines[0]).toEqual({
      ...readyLine(lines[1]),
      annotation: buildReadyAnnotation(annotatedLine, {
        lemmas: readyResource(lemmatization),
      }),
    })
    expect(state.lines[1]).toEqual({
      ...readyLine(lines[2]),
      annotation: buildReadyAnnotation(otherAnnotatedLine),
    })
    expect(listAnnotatedPositions(state)).toEqual(['0', '1'])
  },
)

test('an answer for a line that was deleted meanwhile is ignored', () => {
  const loadingState = reduceEditLite(tokensState, {
    type: 'annotationRequested',
    index: 2,
  })
  const deletedState = deleteLine(loadingState, 2)
  const state = reduceEditLite(
    deleteLine(deletedState, 1),
    {
      type: 'annotationSettled',
      original: lines[2],
      tokens: readyResource(annotateLine(lines[2])),
    },
    {
      type: 'lemmasSettled',
      line: annotatedLine,
      lemmas: readyResource(buildLineLemmatization(annotatedLine)),
    },
  )

  expect(listAnnotatedPositions(deletedState)).toEqual(['1'])
  expect(listAnnotatedPositions(state)).toEqual([])
})
