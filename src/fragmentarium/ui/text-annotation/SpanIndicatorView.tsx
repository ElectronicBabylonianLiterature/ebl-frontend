import React from 'react'
import classNames from 'classnames'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  realiaPageLinkHint,
  useSpanIndicator,
} from 'fragmentarium/ui/text-annotation/useSpanIndicator'
import { getRealiaPageUrl } from 'realia/ui/realiaPage'

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
    openRealiaPageOnClick,
    title,
    dataLabel,
    baseClassName,
  } = useSpanIndicator(entitySpan, tokenId, realiaPageLinkHint)

  const sharedProps = {
    title,
    'data-label': dataLabel,
    'data-span-id': entitySpan.id,
    'data-testid': `${tokenId}__${entitySpan.id}`,
    className: classNames(baseClassName, 'span-indicator--static'),
  }

  if (realiaId && isInitial) {
    return (
      <a
        {...sharedProps}
        href={getRealiaPageUrl(label)}
        target={'_blank'}
        rel={'noopener noreferrer'}
        aria-label={`Open the Realia page for ${label}`}
      />
    )
  }

  return (
    <span
      {...sharedProps}
      {...(realiaId ? { onMouseUp: openRealiaPageOnClick } : {})}
    />
  )
}
