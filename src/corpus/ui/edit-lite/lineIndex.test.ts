import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { createLine } from 'corpus/domain/line'
import { buildEditLiteOutline } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  findInitialIndex,
  findInitialLine,
  findLineIndex,
} from 'corpus/ui/edit-lite/lineIndex'

const lines: readonly LineOutline[] = buildEditLiteOutline(
  ['11', '12a', "6'", 'A+1'].map((number) => createLine({ number })),
).lines

test.each<[string, number | undefined, number, number | null]>([
  ['no initial line', undefined, 3, null],
  ['a negative index', -1, 3, null],
  ['a fractional index', 1.5, 3, null],
  ['an index that is not a number', Number.NaN, 3, null],
  ['the index after the last line', 3, 3, null],
  ['the first index of an empty chapter', 0, 0, null],
  ['the first index', 0, 3, 0],
  ['an index in the middle', 1, 3, 1],
  ['the last index', 2, 3, 2],
])(
  'findInitialIndex of %s',
  (_description, initialLine, lineCount, expected) => {
    expect(findInitialIndex(initialLine, lineCount)).toBe(expected)
  },
)

test.each([
  ['11', 0],
  ['12a', 1],
  ['12A', 1],
  [' 12a. ', 1],
  ["6'", 2],
  ['6′', 2],
  ['6’', 2],
  ['6ʾ', 2],
  ['a+1', 3],
  ['12', -1],
  ['', -1],
])(
  'the line number "%s" is at position %s',
  (lineNumber: string, index: number) => {
    expect(findLineIndex(lines, lineNumber)).toBe(index)
  },
)

test.each<[string, string | null, number | undefined]>([
  ['no line number', null, undefined],
  ['an empty line number', '', undefined],
  ['a line number the chapter does not have', '12', undefined],
  ['the first line number', '11', 0],
  ['a line number in another spelling', ' 6′. ', 2],
])('findInitialLine of %s', (_description, lineNumber, expected) => {
  expect(findInitialLine(lines, lineNumber)).toBe(expected)
})
