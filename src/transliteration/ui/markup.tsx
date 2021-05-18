import React from 'react'
import {
  TextPart,
  LanguagePart,
  BibliographyPart,
} from 'transliteration/domain/markup'
import { LineTokens } from './line-tokens'
import { Shift } from 'transliteration/domain/token'
import Reference from 'bibliography/domain/Reference'
import Citation from 'bibliography/ui/Citation'
import { Badge } from 'react-bootstrap'

export function DisplayTextPart({
  part: { type, text },
}: {
  part: TextPart
}): JSX.Element {
  return type === 'EmphasisPart' ? <em>{text}</em> : <span>{text}</span>
}

export function DisplayLaguagePart({
  part,
}: {
  part: LanguagePart
}): JSX.Element {
  const initialShift: Shift = {
    enclosureType: [],
    cleanValue: '',
    value: '',
    language: part.language,
    normalized: false,
    type: 'LanguageShift',
  }
  return <LineTokens content={[initialShift, ...part.tokens]} />
}

export function DisplayBibliographyPart({
  part: { reference },
}: {
  part: BibliographyPart
}): JSX.Element {
  return reference instanceof Reference ? (
    <Citation reference={reference} />
  ) : (
    <Badge variant="danger">
      @bib&#123;{reference.id}@{reference.pages}&#125;
    </Badge>
  )
}
