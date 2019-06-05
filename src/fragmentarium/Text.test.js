import { factory } from 'factory-girl'
import _ from 'lodash'
import { Line, Text } from './fragment'
import { fromJS, List } from 'immutable'
import Lemmatization, {
  LemmatizationToken
} from './lemmatization/Lemmatization'
import Lemma from './lemmatization/Lemma'

test('createLemmatization', async () => {
  const words = await factory.buildMany('word', 4)
  const lemmas = _(words)
    .map(word => new Lemma(word))
    .keyBy('value')
    .value()
  const suggestions = {
    kur: [[new Lemma(words[2])]],
    nu: [[new Lemma(words[3])]]
  }
  const text = new Text({
    lines: List.of(
      Line({
        type: 'TextLine',
        prefix: '1.',
        content: List.of(
          fromJS({
            type: 'Word',
            value: 'kur',
            uniqueLemma: [words[0]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          }),
          fromJS({
            type: 'Word',
            value: 'nu',
            uniqueLemma: [words[1]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          })
        )
      })
    )
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
