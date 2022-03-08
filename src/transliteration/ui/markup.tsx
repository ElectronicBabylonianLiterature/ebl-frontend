import React from 'react'
import {
  TextPart,
  LanguagePart,
  BibliographyPart,
  MarkupPart,
} from 'transliteration/domain/markup'
import { LineTokens } from './line-tokens'
import { Shift } from 'transliteration/domain/token'
import Reference from 'bibliography/domain/Reference'
import Citation from 'bibliography/ui/Citation'
import { Badge } from 'react-bootstrap'
import {
  isBibliographyPart,
  isLanguagePart,
} from 'transliteration/domain/type-guards'

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

export default function Markup({
  parts,
  container = 'div',
  className,
}: {
  parts: readonly MarkupPart[]
  container?: string
  className?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className },
    parts.map((part: MarkupPart, index: number) => {
      if (isLanguagePart(part)) {
        return <DisplayLaguagePart key={index} part={part} />
      } else if (isBibliographyPart(part)) {
        return <DisplayBibliographyPart key={index} part={part} />
      } else {
        return <DisplayTextPart key={index} part={part} />
      }
    })
  )
}
