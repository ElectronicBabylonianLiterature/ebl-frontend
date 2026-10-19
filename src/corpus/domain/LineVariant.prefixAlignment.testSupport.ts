import { ManuscriptLine, createManuscriptLine } from 'corpus/domain/line'
import { atfToken, atfTokenEllipsis } from 'test-support/test-tokens'
import {
  brokenKurRaPa,
  uncertainKurRaPa,
} from 'corpus/domain/LineVariant.prefixAlignmentWords.testSupport'

export const prefixAlignmentManuscripts: readonly ManuscriptLine[] = [
  createManuscriptLine({
    atfTokens: [brokenKurRaPa],
  }),
  createManuscriptLine({
    atfTokens: [uncertainKurRaPa],
  }),
  createManuscriptLine({
    atfTokens: [
      atfTokenEllipsis,
      {
        ...atfToken,
        value: 'kur+ra-ra',
        parts: [
          {
            enclosureType: [],
            cleanValue: 'kur',
            value: 'kur',
            name: 'kur',
            nameParts: [
              {
                enclosureType: [],
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
          {
            value: '+',
            cleanValue: '+',
            enclosureType: [],
            erasure: 'NONE',
            type: 'Joiner',
          },
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
            value: '-',
            cleanValue: '-',
            enclosureType: [],
            erasure: 'NONE',
            type: 'Joiner',
          },
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
        cleanValue: 'kur+ra-ra',
      },
      atfTokenEllipsis,
    ],
  }),
]
