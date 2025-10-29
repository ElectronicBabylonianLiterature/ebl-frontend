import React from 'react'
import {
  TextPart,
  LanguagePart,
  BibliographyPart,
  MarkupPart,
  UrlPart,
} from 'transliteration/domain/markup'
import { LineTokens } from './line-tokens'
import { Shift } from 'transliteration/domain/token'
import Reference from 'bibliography/domain/Reference'
import Citation from 'bibliography/ui/Citation'
import { Badge } from 'react-bootstrap'
import {
  isBibliographyPart,
  isLanguagePart,
  isParagraphPart,
  isUrlPart,
} from 'transliteration/domain/type-guards'
import './markup.css'

const textPartClassMap = {
  EmphasisPart: 'markup-emphasis',
  BoldPart: 'markup-bold',
  SuperscriptPart: 'markup-superscript',
  SubscriptPart: 'markup-subscript',
  StringPart: '',
}

export function DisplayTextPart({
  part: { type, text },
}: {
  part: TextPart
}): JSX.Element {
  const className = textPartClassMap[type]
  return className ? (
    <span className={className}>{text}</span>
  ) : (
    <span>{text}</span>
  )
}

export function DisplayUrlPart({
  part: { url, text },
}: {
  part: UrlPart
}): JSX.Element {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {text || url}
    </a>
  )
}

export function DisplayLanguagePart({
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
        return <DisplayLanguagePart key={index} part={part} />
      } else if (isBibliographyPart(part)) {
        return <DisplayBibliographyPart key={index} part={part} />
      } else if (isUrlPart(part)) {
        return <DisplayUrlPart key={index} part={part} />
      } else if (isParagraphPart(part)) {
        throw new Error(
          'Unexpected ParagraphPart. Use createParagraphs to split parts into paragraphs'
        )
      } else {
        return <DisplayTextPart key={index} part={part} />
      }
    })
  )
}
