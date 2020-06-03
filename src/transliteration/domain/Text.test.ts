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
import { TextLine } from './line'

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
  const firstLine: TextLine = {
    prefix: '1.',
    content: [
      {
        enclosureType: [],
        erasure: 'NONE',
        cleanValue: 'kur',
        value: 'kur',
        language: 'AKKADIAN',
        normalized: false,
        lemmatizable: true,
        uniqueLemma: ['hepû I', 'hepû II'],
        parts: [
          {
            enclosureType: [],
            erasure: 'NONE',
            cleanValue: 'kur',
            value: 'kur',
            name: 'kur',
            nameParts: [
              {
                enclosureType: [],
                erasure: 'NONE',
                cleanValue: 'kur',
                value: 'kur',
                type: 'ValueToken',
              },
            ],
            subIndex: 1,
            modifiers: [],
            flags: [],
            sign: null,
            type: 'Reading',
          },
        ],
        type: 'Word',
      },
      {
        enclosureType: [],
        erasure: 'NONE',
        cleanValue: '...',
        value: '...',
        type: 'UnknownNumberOfSigns',
      },
    ],
    lineNumber: {
      number: 1,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    type: 'TextLine',
  }
  const secondLine: TextLine = {
    prefix: '2.',
    content: [
      {
        enclosureType: [],
        erasure: 'NONE',
        cleanValue: 'kur',
        value: 'kur',
        language: 'AKKADIAN',
        normalized: false,
        lemmatizable: true,
        uniqueLemma: ['hepû I'],
        parts: [
          {
            enclosureType: [],
            erasure: 'NONE',
            cleanValue: 'kur',
            value: 'kur',
            name: 'kur',
            nameParts: [
              {
                enclosureType: [],
                erasure: 'NONE',
                cleanValue: 'kur',
                value: 'kur',
                type: 'ValueToken',
              },
            ],
            subIndex: 1,
            modifiers: [],
            flags: [],
            sign: null,
            type: 'Reading',
          },
        ],
        type: 'Word',
      },
    ],
    lineNumber: {
      number: 2,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    type: 'TextLine',
  }
  const expected = [
    [
      'hepû I',
      [
        {
          label: new Label().setLineNumber(firstLine.lineNumber),
          value: 'kur',
          word: firstLine.content[0],
          uniqueLemma: 'hepû I',
        },
        {
          label: new Label(
            object.label,
            surface.surface_label,
            column.column_label,
            secondLine.lineNumber
          ),
          value: 'kur',
          word: secondLine.content[0],
          uniqueLemma: 'hepû I',
        },
      ],
    ],
    [
      'hepû II',
      [
        {
          label: new Label().setLineNumber(firstLine.lineNumber),
          value: 'kur',
          word: firstLine.content[0],
          uniqueLemma: 'hepû II',
        },
      ],
    ],
  ]
  expect(
    new Text({ lines: [firstLine, object, surface, column, secondLine] })
      .glossary
  ).toEqual(expected)
})
