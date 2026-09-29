import {
  atfTokenEllipsis,
  atfTokenKur,
  kurToken,
  languageShiftToken,
  raToken,
} from 'test-support/test-tokens'
import { createVariant, createManuscriptLine } from 'corpus/domain/line'
import {
  brokenKurRaPaWord,
  kurPlusRaRaWord,
  uncertainKurRaPaWord,
} from 'corpus/domain/LineVariant.testSupport'

describe('alignment', () => {
  test('Prefix alignment.', () => {
    const variant = createVariant({
      reconstructionTokens: [languageShiftToken, kurToken],
      manuscripts: [
        createManuscriptLine({
          atfTokens: [brokenKurRaPaWord],
        }),
        createManuscriptLine({
          atfTokens: [uncertainKurRaPaWord],
        }),
        createManuscriptLine({
          atfTokens: [atfTokenEllipsis, kurPlusRaRaWord, atfTokenEllipsis],
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
