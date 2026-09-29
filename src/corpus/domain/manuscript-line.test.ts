import { createManuscriptLine } from 'corpus/domain/manuscript-line'
import { getPhoneticSegments } from 'akkadian/application/phonetics/segments'
import {
  atfTokenEllipsis,
  atfTokenKur,
  atfTokenRa,
  kurToken,
  languageShiftToken,
  raToken,
} from 'test-support/test-tokens'

describe('phonetics', () => {
  test('returns phonetic segments of the Akkadian words only', () => {
    const manuscriptLine = createManuscriptLine({
      atfTokens: [languageShiftToken, kurToken, atfTokenRa, raToken],
    })

    expect(manuscriptLine.phonetics).toEqual([
      getPhoneticSegments(kurToken.cleanValue, {}),
      getPhoneticSegments(raToken.cleanValue, {}),
    ])
  })

  test('is empty without Akkadian words', () => {
    const manuscriptLine = createManuscriptLine({ atfTokens: [atfTokenRa] })

    expect(manuscriptLine.phonetics).toEqual([])
  })
})

describe('lacuna and alignment index map', () => {
  test('Akkadian words do not begin or end with lacuna', () => {
    const manuscriptLine = createManuscriptLine({ atfTokens: [kurToken] })

    expect(manuscriptLine.beginsWithLacuna).toBe(false)
    expect(manuscriptLine.endsWithLacuna).toBe(false)
  })

  test('maps irrelevant tokens to the previous index from the left', () => {
    const manuscriptLine = createManuscriptLine({
      atfTokens: [atfTokenKur, languageShiftToken, atfTokenEllipsis],
    })

    expect(manuscriptLine.endsWithLacuna).toBe(true)
    expect(manuscriptLine.createAlignmentIndexMap(3)).toEqual([0, 0, 1])
  })
})
