import _ from 'lodash'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import createLemmatizationTestText from 'test-helpers/test-text'
import note from 'test-helpers/lines/note'
import { singleRuling } from 'test-helpers/lines/dollar'
import { column, object, surface } from 'test-helpers/lines/at'
import { Text, Label } from 'transliteration/domain/text'
import { lemmatized } from 'test-helpers/lines/text'
import { Word } from './token'
import createGlossaryToken from 'test-helpers/createGlossaryToken'
import { columnsWithSpan } from './../../test-helpers/lines/text'

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
  [new Text({ lines: [columnsWithSpan, ...lemmatized, singleRuling] }), 3],
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
        new LemmatizationToken('@bib{RN1@5}', false),
      ],
    ]
  )

  expect(text.createLemmatization(lemmas, suggestions)).toEqual(expected)
})

test('glossary', () => {
  const [firstLine, secondLine] = lemmatized
  const expected = [
    [
      'hepû I',
      [
        createGlossaryToken(
          new Label().setLineNumber(firstLine.lineNumber),
          firstLine.content[0] as Word
        ),
        createGlossaryToken(
          new Label(
            object.label,
            surface.surface_label,
            column.column_label,
            secondLine.lineNumber
          ),
          secondLine.content[0] as Word
        ),
      ],
    ],
    [
      'hepû II',
      [
        createGlossaryToken(
          new Label().setLineNumber(firstLine.lineNumber),
          firstLine.content[0] as Word,
          1
        ),
      ],
    ],
  ]
  expect(
    new Text({ lines: [firstLine, object, surface, column, secondLine] })
      .glossary
  ).toEqual(expected)
})
