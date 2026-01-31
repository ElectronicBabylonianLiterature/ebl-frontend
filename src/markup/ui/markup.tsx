import React from 'react'
import withData from 'http/withData'
import MarkupService from 'markup/application/MarkupService'
import { MarkupPart } from 'transliteration/domain/markup'
import Markup from 'transliteration/ui/markup'
import { isParagraphPart } from 'transliteration/domain/type-guards'
import _ from 'lodash'

type ParagraphMarkupPart = MarkupPart & { paragraph: number }

export function createParagraphs(
  parts: readonly MarkupPart[],
): ParagraphMarkupPart[][] {
  const paragraphs: ParagraphMarkupPart[] = []
  let current = 0

  for (const part of parts) {
    if (isParagraphPart(part)) {
      current++
    } else {
      paragraphs.push({ ...part, paragraph: current })
    }
  }

  return Object.values(_.groupBy(paragraphs, 'paragraph'))
}

export function MarkupText(parts: readonly MarkupPart[]): JSX.Element {
  return (
    <>
      {createParagraphs(parts).map((paragraphParts, index) => (
        <Markup parts={paragraphParts} key={index} container={'p'} />
      ))}
    </>
  )
}

export default withData<
  { text: string },
  { markupService: MarkupService },
  readonly MarkupPart[]
>(
  ({ data: parts }): JSX.Element => MarkupText(parts),
  ({ markupService, text }) => markupService.fromString(text),
)
