import React from 'react'
import classNames from 'classnames'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { useSpanIndicator } from 'fragmentarium/ui/text-annotation/useSpanIndicator'

export default function SpanIndicatorView({
  tokenId,
  entitySpan,
}: {
  tokenId?: string
  entitySpan: AnnotationSpan
}): JSX.Element {
  const { realiaId, openRealiaPage, title, dataLabel, baseClassName } =
    useSpanIndicator(entitySpan, tokenId)

  return (
    <span
      title={title}
      data-label={dataLabel}
      onMouseUp={realiaId ? openRealiaPage : undefined}
      data-span-id={entitySpan.id}
      data-testid={`${tokenId}__${entitySpan.id}`}
      className={classNames(baseClassName, 'span-indicator--static')}
    />
  )
}
