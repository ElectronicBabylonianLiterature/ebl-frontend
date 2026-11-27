import _ from 'lodash'
import { lineChangedOnServerMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
  LineState,
} from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'

interface MoveCase {
  readonly size: number
  readonly from: number
  readonly to: number
  readonly changed: number
}

interface MoveResult {
  readonly places: readonly number[]
  readonly before: EditLiteState
  readonly after: EditLiteState
  readonly outline: ChapterOutline
}

const maximumSize = 6
const moveCases: readonly MoveCase[] = _.range(2, maximumSize + 1).flatMap(
  (size) =>
    _.range(size).flatMap((from) =>
      _.without(_.range(size), from).flatMap((to) =>
        _.range(size).map((changed) => ({ size, from, to, changed })),
      ),
    ),
)

function isDirty(position: number): boolean {
  return position % 2 === 0
}

function rename(line: Line, suffix: string): Line {
  return setLineNumber(line, `${line.number}${suffix}`)
}

function buildState(lines: readonly Line[]): EditLiteState {
  return reduceEditLite(
    createEditLiteState(buildEditLiteOutline(lines)),
    ...buildLinesLoadedActions(0, lines),
    ...lines.flatMap((line, index): EditLiteAction[] =>
      isDirty(index)
        ? [{ type: 'lineChanged', index, draft: rename(line, 'x') }]
        : [],
    ),
  )
}

function move({ size, from, to, changed }: MoveCase): MoveResult {
  const lines = buildEditLiteLines(size)
  const before = buildState(lines)
  const outline = buildEditLiteOutline(
    moveItem(
      lines.map((line, position) =>
        position === changed ? rename(line, 'z') : line,
      ),
      from,
      to,
    ),
    'revision-2',
  )
  return {
    places: moveItem(_.range(size), from, to),
    before,
    outline,
    after: reduceEditLite(
      before,
      { type: 'moveStarted', index: from },
      { type: 'lineMoved', from, to, outline },
    ),
  }
}

function expectEntry(
  { before }: MoveResult,
  place: number,
  changed: number,
): LineState | undefined {
  const flagged: LineState = {
    ...before.lines[place],
    status: 'failed',
    error: lineChangedOnServerMessage,
  }
  const changedEntry = isDirty(place) ? flagged : undefined
  return place === changed ? changedEntry : before.lines[place]
}

test('the cases cover every move and every changed line in chapters of up to six lines', () => {
  expect(moveCases).toHaveLength(2 * 2 + 6 * 3 + 12 * 4 + 20 * 5 + 30 * 6)
})

test('every entry follows its line and only the line that differs on the server is settled', () => {
  moveCases.forEach((moveCase) => {
    const result = move(moveCase)
    const expectedEntries = result.places.map((place) =>
      expectEntry(result, place, moveCase.changed),
    )

    expect(
      result.places.map((_place, index) => result.after.lines[index]),
    ).toEqual(expectedEntries)
    expect(Object.keys(result.after.lines).map(Number)).toEqual(
      _.range(moveCase.size).filter(
        (index) => expectedEntries[index] !== undefined,
      ),
    )
  })
})

test('the entries of the lines that neither moved nor differ are kept as they are', () => {
  moveCases.forEach((moveCase) => {
    const { places, before, after } = move(moveCase)

    _.without(_.range(moveCase.size), moveCase.from, moveCase.changed).forEach(
      (place) => {
        expect(after.lines[places.indexOf(place)]).toBe(before.lines[place])
      },
    )
  })
})

test('the outline of the server is taken over and a new layout starts', () => {
  moveCases.forEach((moveCase) => {
    const { after, outline } = move(moveCase)

    expect(after.outline).toEqual(outline)
    expect(after.layoutVersion).toBe(1)
  })
})
