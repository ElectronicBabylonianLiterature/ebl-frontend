import React from 'react'
import classNames from 'classnames'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { openRealiaPageInNewTab } from 'realia/ui/realiaPage'
import {
  isRealiaPageShortcut,
  realiaPageHint,
  useSpanIndicator,
} from 'fragmentarium/ui/text-annotation/useSpanIndicator'

export { realiaPageHint }

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
  const { realiaId, label, title, dataLabel, baseClassName } = useSpanIndicator(
    entitySpan,
    tokenId,
  )

  function handleMouseUp(event: React.MouseEvent): void {
    if (realiaId && isRealiaPageShortcut(event)) {
      openRealiaPageInNewTab(label)
      return
    }
    setActiveSpanId(entitySpan.id)
  }

  return (
    <span
      title={title}
      data-label={dataLabel}
      onMouseUp={handleMouseUp}
      data-span-id={entitySpan.id}
      data-testid={`${tokenId}__${entitySpan.id}`}
      className={classNames(baseClassName, {
        highlight: entitySpan.id === activeSpanId,
      })}
    />
  )
}
