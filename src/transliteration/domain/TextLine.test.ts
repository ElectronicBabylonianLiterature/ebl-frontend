import { lemmatized } from 'test-helpers/lines/text-lemmatization'
import { columns, columnsWithSpan } from 'test-helpers/lines/text-columns'

test('columns', () => {
  expect(columns.columns).toEqual([
    {
      span: null,
      content: [
        {
          enclosureType: [],
          erasure: 'NONE',
          cleanValue: 'kur',
          value: 'kur',
          language: 'AKKADIAN',
          normalized: false,
          lemmatizable: true,
          uniqueLemma: [],
          parts: [
            {
              enclosureType: [],
              erasure: 'NONE',
              cleanValue: 'kur',
              value: 'kur',
              type: 'Reading',
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
            },
          ],
          type: 'Word',
        },
      ],
    },
    {
      span: 1,
      content: [
        {
          enclosureType: [],
          erasure: 'NONE',
          cleanValue: 'kur',
          value: 'kur',
          language: 'AKKADIAN',
          normalized: false,
          lemmatizable: true,
          uniqueLemma: [],
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
    },
    {
      span: 1,
      content: [
        {
          enclosureType: [],
          erasure: 'NONE',
          cleanValue: 'kur',
          value: 'kur',
          language: 'AKKADIAN',
          normalized: false,
          lemmatizable: true,
          uniqueLemma: [],
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
    },
  ])
})

test.each([
  [lemmatized[0], 1],
  [columns, 3],
  [columnsWithSpan, 3],
])('numberOfColumns', (line, expected) => {
  expect(line.numberOfColumns).toEqual(expected)
})
