import React from 'react'
import classNames from 'classnames'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { useSpanIndicator } from 'fragmentarium/ui/text-annotation/useSpanIndicator'

const activationKeys = ['Enter', ' ']

export default function SpanIndicatorView({
  tokenId,
  entitySpan,
}: {
  tokenId?: string
  entitySpan: AnnotationSpan
}): JSX.Element {
  const {
    realiaId,
    label,
    isInitial,
    openRealiaPage,
    openRealiaPageDirectly,
    title,
    dataLabel,
    baseClassName,
  } = useSpanIndicator(entitySpan, tokenId)

  function handleKeyDown(event: React.KeyboardEvent): void {
    if (activationKeys.includes(event.key)) {
      event.preventDefault()
      openRealiaPageDirectly()
    }
  }

  const linkProps =
    realiaId && isInitial
      ? {
          role: 'link',
          tabIndex: 0,
          'aria-label': `Open the Realia page for ${label}`,
          onKeyDown: handleKeyDown,
        }
      : {}
  const realiaProps = realiaId
    ? { onMouseUp: openRealiaPage, ...linkProps }
    : {}

  return (
    <span
      title={title}
      data-label={dataLabel}
      data-span-id={entitySpan.id}
      data-testid={`${tokenId}__${entitySpan.id}`}
      className={classNames(baseClassName, 'span-indicator--static')}
      {...realiaProps}
    />
  )
}
