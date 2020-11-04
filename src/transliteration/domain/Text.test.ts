import _ from 'lodash'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import createLemmatizationTestText from 'test-support/test-text'
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
    ])
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

test('createLemmatization', async () => {
  const [text, words] = await createLemmatizationTestText()
  const lemmas: { [key: string]: Lemma } = _(words)
    .map((word) => new Lemma(word))
    .keyBy('value')
    .value()
  const suggestions = {
    kur: [[new Lemma(words[2])]],
    nu: [[new Lemma(words[3])]],
  }
  const expected = new Lemmatization(
    ['1.', '#note: '],
    [
      [
        new LemmatizationToken('k[ur', true, [], suggestions.kur),
        new LemmatizationToken('n]u', true, [], suggestions.nu),
        new LemmatizationToken('bu', true, [new Lemma(words[0])], []),
      ],
      [
        new LemmatizationToken('this is a note ', false),
        new LemmatizationToken('@i{italic text}', false),
        new LemmatizationToken(' ', false),
        new LemmatizationToken('@akk{kur}', false),
        new LemmatizationToken(' ', false),
        new LemmatizationToken('@sux{kur}', false),
        new LemmatizationToken('@bib{RN1@5}', false),
      ],
    ]
  )

  expect(text.createLemmatization(lemmas, suggestions)).toEqual(expected)
})
