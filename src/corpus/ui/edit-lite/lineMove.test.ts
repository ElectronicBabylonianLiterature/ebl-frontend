import _ from 'lodash'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { createLine } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  beginningChoiceLabel,
  deleteIndex,
  findMoveTarget,
  listMoveChoices,
  moveIndex,
  moveItem,
  moveLineOutlines,
} from 'corpus/ui/edit-lite/lineMove'

interface Move {
  readonly labels: readonly string[]
  readonly from: number
  readonly to: number
}

const maximumSize = 7
const moves: readonly Move[] = _.range(1, maximumSize + 1).flatMap((size) =>
  _.range(size).flatMap((from) =>
    _.range(size).map((to) => ({
      labels: _.range(size).map((position) => `line ${position}`),
      from,
      to,
    })),
  ),
)
const deletions: readonly Move[] = moves.filter(({ from, to }) => from === to)
const outlineLines: readonly LineOutline[] = buildEditLiteOutline(
  ['11', '12a', "6'", 'A+1'].map((number) => createLine({ number })),
).lines

function removeThenInsert<Item>(
  items: readonly Item[],
  from: number,
  to: number,
): Item[] {
  const rest = items.filter((_item, position) => position !== from)
  return [...rest.slice(0, to), items[from], ...rest.slice(to)]
}

function withoutIndex(line: LineOutline): Omit<LineOutline, 'index'> {
  return _.omit(line, 'index')
}

test('the cases cover every move in chapters of up to seven lines', () => {
  expect(moves).toHaveLength(1 + 4 + 9 + 16 + 25 + 36 + 49)
})

test.each<[number, number, string[]]>([
  [0, 2, ['b', 'c', 'a', 'd']],
  [3, 0, ['d', 'a', 'b', 'c']],
  [1, 2, ['a', 'c', 'b', 'd']],
  [2, 1, ['a', 'c', 'b', 'd']],
  [0, 3, ['b', 'c', 'd', 'a']],
  [2, 2, ['a', 'b', 'c', 'd']],
])('moveItem from %i to %i gives %j', (from, to, expected) => {
  const items: readonly string[] = ['a', 'b', 'c', 'd']

  expect(moveItem(items, from, to)).toEqual(expected)
  expect(items).toEqual(['a', 'b', 'c', 'd'])
})

test('moveItem removes the item and inserts it at the target position', () => {
  moves.forEach(({ labels, from, to }) => {
    const moved = moveItem(labels, from, to)

    expect(moved).toEqual(removeThenInsert(labels, from, to))
    expect(moved[to]).toBe(labels[from])
    expect(_.without(moved, labels[from])).toEqual(
      _.without(labels, labels[from]),
    )
  })
})

test('moveIndex says where every line of the old order is in the new order', () => {
  moves.forEach(({ labels, from, to }) => {
    const moved = removeThenInsert(labels, from, to)

    expect(
      labels.map((_label, index) => moved[moveIndex(index, from, to)]),
    ).toEqual(labels)
  })
})

test('moveIndex leaves every position alone when the line does not move', () => {
  _.range(maximumSize).forEach((position) => {
    expect(
      _.range(maximumSize).map((index) => moveIndex(index, position, position)),
    ).toEqual(_.range(maximumSize))
  })
})

test('moveIndex leaves the positions after the stored lines alone', () => {
  moves.forEach(({ labels, from, to }) => {
    expect(moveIndex(labels.length, from, to)).toBe(labels.length)
    expect(moveIndex(labels.length + 3, from, to)).toBe(labels.length + 3)
  })
})

test('deleteIndex says where every other line is after a line is deleted', () => {
  deletions.forEach(({ labels, from: deletedIndex }) => {
    const remaining = labels.filter((_label, index) => index !== deletedIndex)

    labels.forEach((label, index) => {
      expect(remaining[deleteIndex(index, deletedIndex)]).toBe(
        index === deletedIndex ? labels[deletedIndex + 1] : label,
      )
    })
    expect(deleteIndex(labels.length, deletedIndex)).toBe(remaining.length)
  })
})

test('the cases cover every deletion in chapters of up to seven lines', () => {
  expect(deletions).toHaveLength(1 + 2 + 3 + 4 + 5 + 6 + 7)
})

test('findMoveTarget puts the line directly after the chosen line', () => {
  moves
    .filter(({ from, to }) => from !== to)
    .forEach(({ labels, from, to: precedingIndex }) => {
      const target = findMoveTarget(from, precedingIndex)
      const moved = removeThenInsert(labels, from, target)

      expect(moved[target]).toBe(labels[from])
      expect(moved[target - 1]).toBe(labels[precedingIndex])
    })
})

test('findMoveTarget puts the line first when nothing precedes it', () => {
  _.range(maximumSize).forEach((from) => {
    expect(findMoveTarget(from, -1)).toBe(0)
  })
})

test('listMoveChoices offers every other position exactly once', () => {
  moves.forEach(({ labels, from }) => {
    const lines = buildEditLiteOutline(buildEditLiteLines(labels.length)).lines

    expect(listMoveChoices(lines, from).map((choice) => choice.to)).toEqual(
      _.without(_.range(labels.length), from),
    )
  })
})

test('listMoveChoices names the line that will precede the moved line', () => {
  moves.forEach(({ labels, from }) => {
    const lines = buildEditLiteOutline(buildEditLiteLines(labels.length)).lines
    const numbers = lines.map((line) => line.number)

    listMoveChoices(lines, from).forEach(({ to, label }) => {
      const moved = removeThenInsert(numbers, from, to)

      expect(moved[to]).toBe(numbers[from])
      expect(label).toBe(
        to === 0 ? beginningChoiceLabel : `After line ${moved[to - 1]}`,
      )
    })
  })
})

test.each<[number, { to: number; label: string }[]]>([
  [
    0,
    [
      { to: 1, label: 'After line 12a' },
      { to: 2, label: "After line 6'" },
      { to: 3, label: 'After line A+1' },
    ],
  ],
  [
    2,
    [
      { to: 0, label: 'At the beginning' },
      { to: 1, label: 'After line 11' },
      { to: 3, label: 'After line A+1' },
    ],
  ],
  [
    3,
    [
      { to: 0, label: 'At the beginning' },
      { to: 1, label: 'After line 11' },
      { to: 2, label: 'After line 12a' },
    ],
  ],
])('the choices for the line at position %i are %j', (from, expected) => {
  expect(listMoveChoices(outlineLines, from)).toEqual(expected)
})

test('a chapter with one line has no place to move it to', () => {
  expect(listMoveChoices(outlineLines.slice(0, 1), 0)).toEqual([])
})

test('moveLineOutlines moves the line and numbers the positions anew', () => {
  moves.forEach(({ labels, from, to }) => {
    const lines = buildEditLiteOutline(buildEditLiteLines(labels.length)).lines
    const moved = moveLineOutlines(lines, from, to)

    expect(moved.map(withoutIndex)).toEqual(
      removeThenInsert(lines, from, to).map(withoutIndex),
    )
    expect(moved.map((line) => line.index)).toEqual(_.range(labels.length))
    expect(lines.map((line) => line.index)).toEqual(_.range(labels.length))
  })
})

test('moveLineOutlines keeps the lines that stay at their position as they are', () => {
  moves.forEach(({ labels, from, to }) => {
    const lines = buildEditLiteOutline(buildEditLiteLines(labels.length)).lines
    const moved = moveLineOutlines(lines, from, to)
    const first = Math.min(from, to)
    const last = Math.max(from, to)

    lines.forEach((line, index) => {
      expect(moved[index] === line).toBe(
        from === to || index < first || index > last,
      )
    })
  })
})
