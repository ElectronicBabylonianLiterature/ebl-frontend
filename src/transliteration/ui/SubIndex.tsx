import React from 'react'
import { NamedSign } from 'transliteration/domain/token'

const subscriptNumbers: ReadonlyMap<string, string> = new Map([
  ['0', '₀'],
  ['1', '₁'],
  ['2', '₂'],
  ['3', '₃'],
  ['4', '₄'],
  ['5', '₅'],
  ['6', '₆'],
  ['7', '₇'],
  ['8', '₈'],
  ['9', '₉'],
])

function numberToUnicodeSubscript(number: number | null | undefined): string {
  return (
    number
      ?.toString()
      .split('')
      .map((number) => subscriptNumbers.get(number))
      .join('') ?? 'ₓ'
  )
}

export default function SubIndex({ token }: { token: NamedSign }): JSX.Element {
  const subIndex = numberToUnicodeSubscript(token.subIndex)
  return <span className="Transliteration__subIndex">{subIndex}</span>
}
