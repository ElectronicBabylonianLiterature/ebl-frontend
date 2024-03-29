import {
  atfToken,
  atfTokenEllipsis,
  atfTokenKur,
  atfTokenRa,
  kurToken,
  languageShiftToken,
  raToken,
} from 'test-support/test-tokens'
import { createVariant, createManuscriptLine } from './line'

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

  test('Prefix alignment.', () => {
    const variant = createVariant({
      reconstructionTokens: [languageShiftToken, kurToken],
      manuscripts: [
        createManuscriptLine({
          atfTokens: [
            {
              ...atfToken,
              value: 'ku[r-ra-pa',
              parts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'k[ur',
                  name: 'kur',
                  nameParts: [
                    {
                      enclosureType: [],
                      cleanValue: 'ku',
                      value: 'kur',
                      type: 'ValueToken',
                    },
                    {
                      value: '[',
                      cleanValue: '',
                      enclosureType: [],
                      erasure: 'NONE',
                      side: 'LEFT',
                      type: 'BrokenAway',
                    },
                    {
                      enclosureType: [],
                      cleanValue: 'r',
                      value: 'r',
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
                  enclosureType: ['BROKEN_AWAY'],
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
                  enclosureType: ['BROKEN_AWAY'],
                  erasure: 'NONE',
                  type: 'Joiner',
                },
                {
                  enclosureType: [],
                  cleanValue: 'pa',
                  value: 'pa',
                  name: 'pa',
                  nameParts: [
                    {
                      enclosureType: [],
                      cleanValue: 'pa',
                      value: 'pa',
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
              cleanValue: 'kur-ra-pa',
            },
          ],
        }),
        createManuscriptLine({
          atfTokens: [
            {
              ...atfToken,
              value: 'kur-ra?-pa',
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
                  value: '-',
                  cleanValue: '-',
                  enclosureType: [],
                  erasure: 'NONE',
                  type: 'Joiner',
                },
                {
                  enclosureType: [],
                  cleanValue: 'ra',
                  value: 'ra?',
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
                  flags: ['UNCERTAIN'],
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
                  cleanValue: 'pa',
                  value: 'pa',
                  name: 'pa',
                  nameParts: [
                    {
                      enclosureType: [],
                      cleanValue: 'pa',
                      value: 'pa',
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
              cleanValue: 'kur-ra-pa',
            },
          ],
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
      ],
    })

    expect(variant.alignment).toEqual([
      {
        alignment: [
          {
            value: 'ku[r-ra-pa',
            alignment: 1,
            variant: null,
            isAlignable: true,
            suggested: true,
          },
        ],
        omittedWords: [],
      },
      {
        alignment: [
          {
            value: 'kur-ra?-pa',
            alignment: 1,
            variant: null,
            isAlignable: true,
            suggested: true,
          },
        ],
        omittedWords: [],
      },
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
            value: 'kur+ra-ra',
            alignment: 1,
            variant: null,
            isAlignable: true,
            suggested: true,
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

  test('Prefix alignment conflict.', () => {
    const variant = createVariant({
      reconstructionTokens: [languageShiftToken, raToken, kurToken],
      manuscripts: [
        createManuscriptLine({
          atfTokens: [atfTokenKur],
        }),
        createManuscriptLine({
          atfTokens: [atfTokenKur],
        }),
        createManuscriptLine({
          atfTokens: [atfTokenKur, atfTokenEllipsis],
        }),
      ],
    })

    expect(variant.alignment).toEqual([
      {
        alignment: [
          {
            value: 'kur',
            alignment: 2,
            variant: null,
            isAlignable: true,
            suggested: true,
          },
        ],
        omittedWords: [],
      },
      {
        alignment: [
          {
            value: 'kur',
            alignment: 2,
            variant: null,
            isAlignable: true,
            suggested: true,
          },
        ],
        omittedWords: [],
      },
      {
        alignment: [
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
