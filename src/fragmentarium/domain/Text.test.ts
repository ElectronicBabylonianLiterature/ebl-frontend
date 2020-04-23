import _ from 'lodash'
import Lemmatization, {
  LemmatizationToken
} from 'fragmentarium/domain/Lemmatization'
import Lemma from 'fragmentarium/domain/Lemma'
import createLemmatizationTestText from 'test-helpers/test-text'

test('createLemmatization', async () => {
  const [text, words] = await createLemmatizationTestText()
  const lemmas: { [key: string]: Lemma } = _(words)
    .map(word => new Lemma(word))
    .keyBy('value')
    .value()
  const suggestions = {
    kur: [[new Lemma(words[2])]],
    nu: [[new Lemma(words[3])]]
  }
  const expected = new Lemmatization(
    ['1.'],
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
        )
      ]
    ]
  )

  expect(text.createLemmatization(lemmas, suggestions)).toEqual(expected)
})
