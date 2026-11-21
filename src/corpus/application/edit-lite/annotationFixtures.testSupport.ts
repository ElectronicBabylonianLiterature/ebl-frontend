import { LineAlignment } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import {
  createLine,
  createLineAlignment,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'
import {
  atfTokens,
  reconstructionTokens,
} from 'test-support/test-corpus-tokens'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

export const annotatedLine: Line = createLine({
  number: '1',
  variants: [
    createVariant({
      reconstruction: '%n kur-kur',
      reconstructionTokens,
      manuscripts: [
        createManuscriptLine({
          manuscriptId: 1,
          labels: ['o'],
          number: '1',
          atf: 'kur ra ...',
          atfTokens,
          omittedWords: [1],
        }),
      ],
    }),
  ],
})

export const lineAlignment: LineAlignment = createLineAlignment(annotatedLine)

export const lineAlignmentDto = {
  alignment: [
    [
      {
        alignment: [
          {
            value: 'kur',
            alignment: null,
            variant: '',
            type: '',
            language: '',
          },
          {
            value: 'ra',
            alignment: 1,
            variant: 'ra',
            type: 'Word',
            language: 'AKKADIAN',
          },
          { value: '...' },
        ],
        omittedWords: [1],
      },
    ],
  ],
}

export const lineLemmatization: readonly LineLemmatization[] = [
  [
    [
      new LemmatizationToken('%n', false),
      new LemmatizationToken('kur-kur', true, [], []),
    ],
    [
      [
        new LemmatizationToken('kur', true, [], []),
        new LemmatizationToken('ra', true, null, []),
        new LemmatizationToken('...', false),
      ],
    ],
  ],
]

export const lineLemmatizationDto = {
  lemmatization: [
    {
      reconstruction: [{ value: '%n' }, { value: 'kur-kur', uniqueLemma: [] }],
      manuscripts: [
        [{ value: 'kur', uniqueLemma: [] }, { value: 'ra' }, { value: '...' }],
      ],
    },
  ],
}
