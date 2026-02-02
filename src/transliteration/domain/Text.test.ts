import note from 'test-support/lines/note'
import { singleRuling } from 'test-support/lines/dollar'
import { Text } from 'transliteration/domain/text'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import { firstColumnSpan } from '../../test-support/lines/text-columns'

const text = new Text({ lines: [note, singleRuling, note, note, singleRuling] })

test('notes', () => {
  expect(text.notes).toEqual(
    new Map([
      [0, [note]],
      [1, [note, note]],
      [2, []],
    ]),
  )
})

test('lines', () => {
  expect(text.lines).toEqual([singleRuling, singleRuling])
})

test.each([
  [text, 1],
  [new Text({ lines: [firstColumnSpan, ...lemmatized, singleRuling] }), 3],
])('numberOfColumns', (text, expected) => {
  expect(text.numberOfColumns).toEqual(expected)
})
