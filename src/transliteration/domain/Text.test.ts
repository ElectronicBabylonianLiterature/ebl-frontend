import _ from 'lodash'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import createLemmatizationTestText from 'test-helpers/test-text'
import note from 'test-helpers/lines/note'
import { singleRuling } from 'test-helpers/lines/dollar'
import { Text } from 'transliteration/domain/text'

const text = new Text({ lines: [singleRuling, note] })

test('notes', () => {
  expect(text.notes).toEqual([note])
})

test('lines', () => {
  expect(text.lines).toEqual([singleRuling])
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
        new LemmatizationToken(
          'k[ur',
          true,
          [new Lemma(words[0])],
          [[new Lemma(words[2])]]
        ),
        new LemmatizationToken(
          'n]u',
          true,
          [new Lemma(words[1])],
          [[new Lemma(words[3])]]
        ),
      ],
      [
        new LemmatizationToken('this is a note ', false),
        new LemmatizationToken('@i{italic text}', false),
        new LemmatizationToken(' ', false),
        new LemmatizationToken('@akk{kur}', false),
        new LemmatizationToken(' ', false),
        new LemmatizationToken('@sux{kur}', false),
      ],
    ]
  )

  expect(text.createLemmatization(lemmas, suggestions)).toEqual(expected)
})
