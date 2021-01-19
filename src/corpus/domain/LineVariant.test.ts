import { createVariant, createManuscriptLine } from './text'

test('alignment', () => {
  const variant = createVariant({
    reconstructionTokens: [
      {
        value: '%n',
        cleanValue: '%n',
        enclosureType: [],
        erasure: 'NONE',
        language: 'AKKADIAN',
        normalized: true,
        type: 'LanguageShift',
      },
      {
        value: 'kur',
        cleanValue: 'kur',
        enclosureType: [],
        erasure: 'NONE',
        lemmatizable: true,
        alignment: null,
        variant: null,
        uniqueLemma: [],
        normalized: true,
        language: 'AKKADIAN',
        parts: [
          {
            value: 'kur',
            cleanValue: 'kur',
            enclosureType: [],
            erasure: 'NONE',
            type: 'ValueToken',
          },
        ],
        modifiers: [],
        type: 'AkkadianWord',
      },
      {
        value: 'ra',
        cleanValue: 'ra',
        enclosureType: [],
        erasure: 'NONE',
        lemmatizable: true,
        alignment: null,
        variant: null,
        uniqueLemma: [],
        normalized: true,
        language: 'AKKADIAN',
        parts: [
          {
            value: 'kur',
            cleanValue: 'kur',
            enclosureType: [],
            erasure: 'NONE',
            type: 'ValueToken',
          },
        ],
        modifiers: [],
        type: 'AkkadianWord',
      },
    ],
    manuscripts: [
      createManuscriptLine({
        atfTokens: [
          {
            type: 'Word',
            value: 'kur',
            parts: [],
            cleanValue: 'kur',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true,
            erasure: 'NONE',
            alignment: null,
            variant: null,
            enclosureType: [],
          },
          {
            type: 'Word',
            value: 'ra',
            parts: [],
            cleanValue: 'ra',
            uniqueLemma: [],
            normalized: false,
            language: 'AKKADIAN',
            lemmatizable: true,
            erasure: 'NONE',
            alignment: 2,
            variant: null,
            enclosureType: [],
          },
        ],
      }),
    ],
  })

  expect(variant.alignment).toEqual([
    {
      alignment: [
        {
          value: 'kur',
          alignment: 1,
          variant: null,
          isAlignable: true,
          suggested: true,
        },
        {
          value: 'ra',
          alignment: 2,
          variant: null,
          isAlignable: true,
          suggested: false,
        },
      ],
      omittedWords: [],
    },
  ])
})
