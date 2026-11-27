import { fromLineDto } from 'corpus/application/dtos'
import {
  areLinesEqual,
  toDeletedLineDto,
  toLineEditsDto,
  toNewLineDto,
} from 'corpus/application/edit-lite/lineEdits'
import { EditStatus, Line } from 'corpus/domain/line'

const lineDto = {
  number: '3',
  oldLineNumbers: [{ number: 'old 3', reference: { id: 'RN1' } }],
  isSecondLineOfParallelism: true,
  isBeginningOfSection: false,
  translation: '#tr.en: Primeval Apsu',
  variants: [
    {
      reconstruction: '%n apsûm-ma\n#note: a note',
      reconstructionTokens: [{ value: 'apsûm-ma', type: 'AkkadianWord' }],
      intertext: '(intertext)',
      manuscripts: [
        {
          manuscriptId: 1,
          labels: ['o'],
          number: '3',
          atf: 'ZU.AB-ma\n$ single ruling',
          atfTokens: [{ value: 'ZU.AB-ma', type: 'Word' }],
          omittedWords: [1],
        },
      ],
    },
  ],
}

const line: Line = fromLineDto(lineDto)

const expectedLineDto = {
  number: '3',
  oldLineNumbers: [{ number: 'old 3', reference: { id: 'RN1' } }],
  isSecondLineOfParallelism: true,
  isBeginningOfSection: false,
  translation: '#tr.en: Primeval Apsu',
  variants: [
    {
      reconstruction: '%n apsûm-ma\n#note: a note',
      intertext: '(intertext)',
      manuscripts: [
        {
          manuscriptId: 1,
          labels: ['o'],
          number: '3',
          atf: 'ZU.AB-ma\n$ single ruling',
          omittedWords: [1],
        },
      ],
    },
  ],
}

describe('toLineEditsDto', () => {
  it('describes one edited line and nothing else', () => {
    expect(toLineEditsDto(4, line)).toEqual({
      new: [],
      deleted: [],
      edited: [{ index: 4, line: expectedLineDto }],
    })
  })

  it('sends neither the edit status nor the token trees', () => {
    const [{ line: sentLine }] = toLineEditsDto(0, {
      ...line,
      status: EditStatus.EDITED,
    }).edited

    expect(sentLine).not.toHaveProperty('status')
    expect(sentLine.variants[0]).not.toHaveProperty('reconstructionTokens')
    expect(sentLine.variants[0].manuscripts[0]).not.toHaveProperty('atfTokens')
  })

  it('sends properties it does not know back unchanged', () => {
    expect(toLineEditsDto(0, line).edited[0].line).toHaveProperty(
      'oldLineNumbers',
      lineDto.oldLineNumbers,
    )
  })
})

describe('areLinesEqual', () => {
  it('is true for the same line loaded twice', () => {
    expect(areLinesEqual(line, fromLineDto(lineDto))).toBe(true)
  })

  it('ignores the edit status and the token trees', () => {
    const reloaded = fromLineDto({
      ...lineDto,
      variants: lineDto.variants.map((variant) => ({
        ...variant,
        reconstructionTokens: [],
        manuscripts: variant.manuscripts.map((manuscriptLine) => ({
          ...manuscriptLine,
          atfTokens: [],
        })),
      })),
    })

    expect(
      areLinesEqual(line, { ...reloaded, status: EditStatus.EDITED }),
    ).toBe(true)
  })

  it.each<[string, Record<string, unknown>]>([
    ['number', { ...lineDto, number: '3a' }],
    ['translation', { ...lineDto, translation: '' }],
    ['flag', { ...lineDto, isBeginningOfSection: true }],
    ['unknown property', { ...lineDto, oldLineNumbers: [] }],
    ['variant count', { ...lineDto, variants: [] }],
    [
      'reconstruction',
      {
        ...lineDto,
        variants: [{ ...lineDto.variants[0], reconstruction: '%n apsû' }],
      },
    ],
    [
      'manuscript text',
      {
        ...lineDto,
        variants: [
          {
            ...lineDto.variants[0],
            manuscripts: [
              { ...lineDto.variants[0].manuscripts[0], atf: 'ZU.AB' },
            ],
          },
        ],
      },
    ],
  ])('is false when the %s differs', (_name, changedDto) => {
    expect(areLinesEqual(line, fromLineDto(changedDto))).toBe(false)
    expect(areLinesEqual(fromLineDto(changedDto), line)).toBe(false)
  })
})

describe('toNewLineDto', () => {
  it('sends the line as the only new line', () => {
    expect(toNewLineDto(line)).toEqual({
      new: [expectedLineDto],
      deleted: [],
      edited: [],
    })
  })
})

describe('toDeletedLineDto', () => {
  it('sends the index as the only deleted line', () => {
    expect(toDeletedLineDto(7)).toEqual({ new: [], deleted: [7], edited: [] })
  })
})
