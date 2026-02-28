import React from 'react'
import { render, screen } from '@testing-library/react'
import AkkadianWordAnalysis from 'akkadian/ui/akkadianWordAnalysis'
import * as phoneticSegments from 'akkadian/application/phonetics/segments'
import { AkkadianWord } from 'transliteration/domain/token'

const heavyWeight = '\uF700'
const stressedHeavyWeight = '\uF704'

const word: AkkadianWord = {
  parts: [
    {
      value: 'anšar',
      enclosureType: [],
      cleanValue: 'anšar',
      erasure: 'NONE',
      type: 'ValueToken',
    },
  ],
  enclosureType: [],
  uniqueLemma: ['Anšar I'],
  cleanValue: 'anšar',
  hasOmittedAlignment: false,
  modifiers: [],
  erasure: 'NONE',
  normalized: true,
  alignable: true,
  language: 'AKKADIAN',
  value: 'anšar',
  lemmatizable: true,
  variant: null,
  alignment: null,
  hasVariantAlignment: false,
  type: 'AkkadianWord',
}

describe('AkkadianWordAnalysis', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('displays meter', () => {
    render(<AkkadianWordAnalysis word={word} showMeter={true} showIpa={true} />)
    expect(
      screen.getByText(`${stressedHeavyWeight} ${heavyWeight}`),
    ).toBeInTheDocument()
  })
  it('displays IPA', () => {
    render(<AkkadianWordAnalysis word={word} showMeter={true} showIpa={true} />)
    expect(screen.getByText('ˈan.ʃar')).toBeInTheDocument()
  })

  it('renders empty output when phonetic conversion fails', () => {
    jest
      .spyOn(phoneticSegments, 'tokenToPhoneticSegments')
      .mockImplementation(() => {
        throw new Error('boom')
      })

    render(<AkkadianWordAnalysis word={word} showMeter={true} showIpa={true} />)

    expect(screen.queryByText('ˈan.ʃar')).not.toBeInTheDocument()
    expect(
      screen.queryByText(`${stressedHeavyWeight} ${heavyWeight}`),
    ).not.toBeInTheDocument()
  })
})
