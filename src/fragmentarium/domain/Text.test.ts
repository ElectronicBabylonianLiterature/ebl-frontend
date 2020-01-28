import { factory } from 'factory-girl'
import _ from 'lodash'
import { Text } from './text'
import Lemmatization, {
  LemmatizationToken
} from 'fragmentarium/domain/Lemmatization'
import Lemma from 'fragmentarium/domain/Lemma'

test('createLemmatization', async () => {
  const words = await factory.buildMany('word', 4)
  const lemmas: { [key: string]: Lemma } = _(words)
    .map(word => new Lemma(word))
    .keyBy('value')
    .value()
  const suggestions = {
    kur: [[new Lemma(words[2])]],
    nu: [[new Lemma(words[3])]]
  }
  const text = new Text({
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [words[0]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true,
            erasure: 'NONE',
            parts: []
          },
          {
            type: 'Word',
            value: 'nu',
            uniqueLemma: [words[1]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true,
            erasure: 'NONE',
            parts: []
          }
        ]
      }
    ]
  })

  const expected = new Lemmatization(
    ['1.'],
    [
      [
        new LemmatizationToken(
          'kur',
          true,
          [new Lemma(words[0])],
          [[new Lemma(words[2])]]
        ),
        new LemmatizationToken(
          'nu',
          true,
          [new Lemma(words[1])],
          [[new Lemma(words[3])]]
        )
      ]
    ]
  )

  expect(text.createLemmatization(lemmas, suggestions)).toEqual(expected)
})
