import {
  AnnotationToken,
  createAnnotationTokens,
} from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import Annotation from 'fragmentarium/domain/annotation'
import { Text } from 'transliteration/domain/text'
import * as at from 'test-support/lines/at'
import * as dollar from 'test-support/lines/dollar'
import { TextLine } from 'transliteration/domain/text-line'

test.each([
  [
    new AnnotationToken('kur', 'HasSign', 'kur', [2, 0, 1], true),
    new Annotation(
      {
        x: 1,
        y: 1,
        height: 1,
        width: 1,
        type: 'RECTANGLE',
      },
      {
        value: 'ruk',
        type: 'HasSign',
        path: [2, 0, 1],
        signName: 'RUK',
      }
    ),
    true,
  ],
  [
    new AnnotationToken('kur', 'HasSign', 'kur', [2, 0, 1], true),
    new Annotation(
      {
        x: 1,
        y: 1,
        height: 1,
        width: 1,
        type: 'RECTANGLE',
      },
      {
        value: 'ruk',
        type: 'HasSign',
        path: [2, 0, 4],
        signName: 'RUK',
      }
    ),
    false,
  ],
  [
    new AnnotationToken('kur', 'HasSign', 'kur', [2, 0, 1], true),
    {
      geometry: {
        x: 1,
        y: 1,
        height: 1,
        width: 1,
        type: 'RECTANGLE',
      },
      data: {
        value: 'ruk',
        type: 'Reading',
        path: [2, 0, 1],
        signName: 'RUK',
      },
    },
    true,
  ],
  [
    new AnnotationToken('kur', 'HasSign', 'kur', [2, 0, 1], true),
    {
      geometry: {
        x: 1,
        y: 1,
        height: 1,
        width: 1,
        type: 'RECTANGLE',
      },
      data: {
        value: 'ruk',
        type: 'Reading',
        path: [2, 0, 4],
        signName: 'RUK',
      },
    },
    false,
  ],
  [new AnnotationToken('kur', 'HasSign', 'kur', [2, 0, 1], true), null, false],
])(
  'isEqualPath %#',
  (token: AnnotationToken, annotation: any, expected: boolean) => {
    expect(token.isEqualPath(annotation)).toEqual(expected)
  }
)

it('', () => {
  const textLine = new TextLine({
    type: 'TextLine',
    prefix: '1.',
    content: [
      {
        enclosureType: [],
        cleanValue: '|KUR₂.KUR|',
        value: '|KUR₂.KUR|',
        language: 'SUMERIAN',
        normalized: false,
        lemmatizable: false,
        alignable: false,
        uniqueLemma: [],
        erasure: 'NONE',
        alignment: null,
        variant: null,
        parts: [
          {
            enclosureType: [],
            cleanValue: '|KUR₂.KUR|',
            value: '|KUR₂.KUR|',
            type: 'CompoundGrapheme',
          },
        ],
        type: 'Word',
      },
    ],
    lineNumber: {
      number: 2,
      hasPrime: true,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
  })
  const text = new Text({
    lines: [at.surface, textLine, dollar.singleRuling],
  })

  const tokens = [
    [
      new AnnotationToken('@', 'Disabled', '@', [0], false),
      new AnnotationToken('OBVERSE', 'SurfaceAtLine', 'obverse', [0, 0], true),
    ],
    [
      new AnnotationToken('1.', 'Disabled', '1.', [1], false),
      new AnnotationToken(
        '|KUR₂.KUR|',
        'HasSign',
        '|KUR₂.KUR|',
        [1, 0, 0],
        true
      ),
    ],
    [
      new AnnotationToken('$', 'Disabled', '$', [2], false),
      new AnnotationToken(
        'SINGLE',
        'RulingDollarLine',
        'single ruling',
        [2, 0],
        true
      ),
    ],
  ]
  expect(createAnnotationTokens(text)).toStrictEqual(tokens)
})
