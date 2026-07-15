import React from 'react'
import classNames from 'classnames'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { openRealiaPageInNewTab } from 'realia/ui/realiaPage'
import {
  isRealiaPageShortcut,
  useSpanIndicator,
} from 'fragmentarium/ui/text-annotation/useSpanIndicator'

export default function SpanIndicatorView({
  tokenId,
  entitySpan,
}: {
  tokenId?: string
  entitySpan: AnnotationSpan
}): JSX.Element {
  const { realiaId, label, title, dataLabel, baseClassName } = useSpanIndicator(
    entitySpan,
    tokenId,
  )

  function openRealiaPage(event: React.MouseEvent): void {
    if (realiaId && isRealiaPageShortcut(event)) {
      openRealiaPageInNewTab(label)
    }
  }

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
