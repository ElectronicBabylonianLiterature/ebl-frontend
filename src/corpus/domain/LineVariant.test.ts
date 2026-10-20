import {
  atfTokenEllipsis,
  atfTokenKur,
  atfTokenRa,
  kurToken,
  languageShiftToken,
  raToken,
} from 'test-support/test-tokens'
import { createVariant, createManuscriptLine } from 'corpus/domain/line'

describe('alignment', () => {
  test('Already aligned.', () => {
    const alignment = 2
    const variant = createVariant({
      reconstructionTokens: [languageShiftToken, raToken],
      manuscripts: [
        createManuscriptLine({
          atfTokens: [{ ...atfTokenRa, alignment: alignment }],
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
      reconstructionTokens: [languageShiftToken, kurToken, raToken],
      manuscripts: [
        createManuscriptLine({
          atfTokens: [
            atfTokenRa,
            {
              type: 'Word',
              value: 'x',
              parts: [
                {
                  enclosureType: [],
                  cleanValue: 'x',
                  value: 'x',
                  flags: [],
                  type: 'UnclearSign',
                },
              ],
              cleanValue: 'x',
              uniqueLemma: [],
              normalized: false,
              language: 'AKKADIAN',
              lemmatizable: false,
              alignable: false,
              erasure: 'ERASED',
              alignment: null,
              variant: null,
              enclosureType: [],
              hasVariantAlignment: false,
              hasOmittedAlignment: false,
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
          {
            value: 'x',
            alignment: null,
            variant: null,
            isAlignable: false,
            suggested: false,
          },
        ],
        omittedWords: [],
      },
    ])
  })

  test('Line ends with lacuna.', () => {
    const variant = createVariant({
      reconstructionTokens: [languageShiftToken, kurToken, raToken],
      manuscripts: [
        createManuscriptLine({
          atfTokens: [
            {
              ...atfTokenRa,
              value: 'ra...',
              parts: [
                ...atfTokenRa.parts,
                {
                  enclosureType: [],
                  cleanValue: '...',
                  value: '...',
                  type: 'UnknownNumberOfSigns',
                },
              ],
              cleanValue: 'ra...',
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

  test('Line begins and ends with lacuna.', () => {
    const variant = createVariant({
      reconstructionTokens: [languageShiftToken, kurToken],
      manuscripts: [
        createManuscriptLine({
          atfTokens: [atfTokenEllipsis, atfTokenKur, atfTokenEllipsis],
        }),
      ],
    })

    expect(variant.alignment).toEqual([
      {
        alignment: [
          {
            value: '...',
            alignment: null,
            variant: null,
            isAlignable: false,
            suggested: false,
          },
          {
            value: 'kur',
            alignment: null,
            variant: null,
            isAlignable: true,
            suggested: false,
          },
          {
            value: '...',
            alignment: null,
            variant: null,
            isAlignable: false,
            suggested: false,
          },
        ],
        omittedWords: [],
      },
    ])
  })
})
