import React, { useContext } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {
  AnnotationSpan,
  isRealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import RealiaInfoContext from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import {
  getSpanIndicatorClass,
  getSpanLabel,
} from 'fragmentarium/ui/text-annotation/realiaInfo'

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
  const { lookup } = useContext(RealiaInfoContext)
  const isInitial = tokenId === _.first(entitySpan.span)
  const isRealia = isRealiaAnnotationSpan(entitySpan)
  const label = getSpanLabel(lookup, entitySpan)

  return (
    <span
      title={label}
      data-label={isRealia ? label : undefined}
      onMouseUp={() => {
        setActiveSpanId(entitySpan.id)
      }}
      data-span-id={entitySpan.id}
      data-testid={`${tokenId}__${entitySpan.id}`}
      className={classNames(
        'span-indicator',
        `tier-depth--${entitySpan.tier}`,
        getSpanIndicatorClass(lookup, entitySpan),
        {
          'span-indicator--realia': isRealia,
          highlight: entitySpan.id === activeSpanId,
          initial: isInitial,
          final: tokenId === _.last(entitySpan.span),
        },
      )}
    />
  )
}
