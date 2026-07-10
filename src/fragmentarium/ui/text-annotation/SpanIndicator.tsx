import React from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {
  AnnotationSpan,
  annotationSpanClassName,
} from 'fragmentarium/ui/text-annotation/annotationSpan'

export default function SpanIndicator({
  tokenId,
  entitySpan,
  activeSpanId,
  setActiveSpanId,
}: {
  tokenId?: string
  entitySpan: AnnotationSpan
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
}): JSX.Element {
  const isInitial = tokenId === _.first(entitySpan.span)

  return (
    <span
      title={entitySpan.name}
      onMouseUp={() => {
        setActiveSpanId(entitySpan.id)
      }}
      data-span-id={entitySpan.id}
      data-testid={`${tokenId}__${entitySpan.id}`}
      className={classNames(
        'span-indicator',
        `tier-depth--${entitySpan.tier}`,
        annotationSpanClassName(entitySpan),
        {
          highlight: entitySpan.id === activeSpanId,
          initial: isInitial,
          final: tokenId === _.last(entitySpan.span),
        },
      )}
    />
  )
}
