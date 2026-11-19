import { findInitialIndex } from 'corpus/ui/edit-lite/lineIndex'

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
