import {
  atfTokenEllipsis,
  atfTokenKur,
  kurToken,
  languageShiftToken,
  raToken,
} from 'test-support/test-tokens'
import { createVariant, createManuscriptLine } from 'corpus/domain/line'
import { prefixAlignmentManuscripts } from 'corpus/domain/LineVariant.prefixAlignment.testSupport'

describe('prefix alignment', () => {
  test('Prefix alignment.', () => {
    const variant = createVariant({
      reconstructionTokens: [languageShiftToken, kurToken],
      manuscripts: prefixAlignmentManuscripts,
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
