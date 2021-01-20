import { createVariant, createManuscriptLine } from './line'

describe('alignment', () => {
  test('Already aligned.', () => {
    const alignment = 2
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
              value: 'ra',
              cleanValue: 'ra',
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
              value: 'ra',
              parts: [
                {
                  enclosureType: [],
                  cleanValue: 'ra',
                  value: 'ra',
                  name: 'ra',
                  nameParts: [
                    {
                      enclosureType: [],
                      cleanValue: 'ra',
                      value: 'ra',
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
              cleanValue: 'ra',
              uniqueLemma: [],
              normalized: false,
              language: 'AKKADIAN',
              lemmatizable: true,
              erasure: 'NONE',
              alignment: alignment,
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
            value: 'ra',
            alignment: alignment,
            variant: null,
            isAlignable: true,
            suggested: false,
          },
        ],
        omittedWords: [],
      },
    ])
  })

  test('Line does not end with lacuna.', () => {
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
          parts: [],
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
              value: 'ra',
              cleanValue: 'ra',
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
              value: 'ra',
              parts: [
                {
                  enclosureType: [],
                  cleanValue: 'ra',
                  value: 'ra',
                  name: 'ra',
                  nameParts: [
                    {
                      enclosureType: [],
                      cleanValue: 'ra',
                      value: 'ra',
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
              cleanValue: 'ra',
              uniqueLemma: [],
              normalized: false,
              language: 'AKKADIAN',
              lemmatizable: true,
              erasure: 'NONE',
              alignment: null,
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
            value: 'ra',
            alignment: 2,
            variant: null,
            isAlignable: true,
            suggested: true,
          },
        ],
        omittedWords: [],
      },
    ])
  })

  test('Line ends with lacuna.', () => {
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
              value: 'ra...',
              parts: [
                {
                  enclosureType: [],
                  cleanValue: 'ra',
                  value: 'ra',
                  name: 'ra',
                  nameParts: [
                    {
                      enclosureType: [],
                      cleanValue: 'ra',
                      value: 'ra',
                      type: 'ValueToken',
                    },
                  ],
                  subIndex: 1,
                  modifiers: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                },
                {
                  enclosureType: [],
                  cleanValue: '...',
                  value: '...',
                  type: 'UnknownNumberOfSigns',
                },
              ],
              cleanValue: 'ra...',
              uniqueLemma: [],
              normalized: false,
              language: 'AKKADIAN',
              lemmatizable: true,
              erasure: 'NONE',
              alignment: null,
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
            value: 'ra...',
            alignment: 1,
            variant: null,
            isAlignable: true,
            suggested: true,
          },
        ],
        omittedWords: [],
      },
    ])
  })
})
