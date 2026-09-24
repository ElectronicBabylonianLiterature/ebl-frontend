import React from 'react'
import {
  TextPart,
  LanguagePart,
  BibliographyPart,
  MarkupPart,
  UrlPart,
} from 'transliteration/domain/markup'
import { LineTokens } from 'transliteration/ui/line-tokens'
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
import 'transliteration/ui/markup.css'

const textPartClassMap = {
  EmphasisPart: 'markup-emphasis',
  BoldPart: 'markup-bold',
  SuperscriptPart: 'markup-superscript',
  SubscriptPart: 'markup-subscript',
  StringPart: '',
}

function containsUnsafeUrlCharacter(url: string): boolean {
  return Array.from(url).some((character) => {
    const characterCode = character.charCodeAt(0)
    return character === '\\' || characterCode <= 31 || characterCode === 127
  })
}

function isAllowedUrl(url: string): boolean {
  if (containsUnsafeUrlCharacter(url)) {
    return false
  }
  try {
    if (url.startsWith('/')) {
      const sameOriginUrl = new URL(url, window.location.origin)
      return (
        !url.startsWith('//') &&
        sameOriginUrl.origin === window.location.origin &&
        ['http:', 'https:'].includes(sameOriginUrl.protocol)
      )
    }
    const protocol = new URL(url).protocol
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
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
  const label = text || url
  return isAllowedUrl(url) ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  ) : (
    <span>{label}</span>
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
    <Badge bg="danger">
      {reference.pages
        ? `@bib{${reference.id}@${reference.pages}}`
        : `@bib{${reference.id}}`}
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
          'Unexpected ParagraphPart. Use createParagraphs to split parts into paragraphs',
        )
      } else {
        return <DisplayTextPart key={index} part={part} />
      }
    }),
  )
}
