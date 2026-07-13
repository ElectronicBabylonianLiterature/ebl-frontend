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
import { openRealiaPageInNewTab } from 'realia/ui/realiaPage'

export const realiaPageHint = 'Alt+click to open the Realia page in a new tab'

const leftMouseButton = 0

function isRealiaPageShortcut(event: React.MouseEvent): boolean {
  return event.altKey && event.button === leftMouseButton
}

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
  const realiaId = isRealiaAnnotationSpan(entitySpan)
    ? entitySpan.realiaId
    : null
  const label = getSpanLabel(lookup, entitySpan)

  function handleMouseUp(event: React.MouseEvent): void {
    if (realiaId && isRealiaPageShortcut(event)) {
      openRealiaPageInNewTab(realiaId)
      return
    }
    setActiveSpanId(entitySpan.id)
  }

  return (
    <span
      title={realiaId ? `${label} (${realiaPageHint})` : label}
      data-label={realiaId ? label : undefined}
      onMouseUp={handleMouseUp}
      data-span-id={entitySpan.id}
      data-testid={`${tokenId}__${entitySpan.id}`}
      className={classNames(
        'span-indicator',
        `tier-depth--${entitySpan.tier}`,
        getSpanIndicatorClass(lookup, entitySpan),
        {
          'span-indicator--realia': !!realiaId,
          highlight: entitySpan.id === activeSpanId,
          initial: isInitial,
          final: tokenId === _.last(entitySpan.span),
        },
      )}
    />
  )
}
