import React from 'react'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'

export default function SpanIndicators<Span extends AnnotationSpan>({
  spans,
  tokenId,
  renderSpan,
}: {
  spans: readonly Span[]
  tokenId?: string | null
  renderSpan: (span: Span, tokenId: string) => JSX.Element
}): JSX.Element {
  if (!tokenId) {
    return <></>
  }

  const wordId: string = tokenId

  return (
    <>
      {spans
        .filter((span) => span.span.includes(wordId))
        .map((span) => (
          <React.Fragment key={span.id}>
            {renderSpan(span, wordId)}
          </React.Fragment>
        ))}
    </>
  )
}
