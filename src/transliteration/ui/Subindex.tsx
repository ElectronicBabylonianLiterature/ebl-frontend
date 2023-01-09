import React from 'react'
import { NamedSign } from 'transliteration/domain/token'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'

export default function SubIndex({ token }: { token: NamedSign }): JSX.Element {
  const subIndex = numberToUnicodeSubscript(token.subIndex)
  return <span className="Transliteration__subIndex">{subIndex}</span>
}
