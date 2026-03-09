import React from 'react'
import { render, screen } from '@testing-library/react'
import AkkadianWordAnalysis from 'akkadian/ui/akkadianWordAnalysis'
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
})
