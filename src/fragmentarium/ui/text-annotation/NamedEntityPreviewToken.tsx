import React, { PropsWithChildren, useContext } from 'react'
import NamedEntityPreviewContext from 'fragmentarium/ui/text-annotation/NamedEntityPreviewContext'
import SpanIndicators from 'fragmentarium/ui/text-annotation/SpanIndicators'
import SpanIndicatorView from 'fragmentarium/ui/text-annotation/SpanIndicatorView'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { Token } from 'transliteration/domain/token'
import { isIdToken } from 'transliteration/domain/type-guards'
import './NamedEntities.sass'

function renderIndicator(span: AnnotationSpan, tokenId: string): JSX.Element {
  return <SpanIndicatorView tokenId={tokenId} entitySpan={span} />
}

export default function NamedEntityPreviewToken({
  token,
  children,
}: PropsWithChildren<{ token: Token }>): JSX.Element {
  const { namedEntities, realia } = useContext(NamedEntityPreviewContext)
  const tokenId = isIdToken(token) ? token.id : undefined
  const hasAnnotations = namedEntities.length > 0 || realia.length > 0

  if (!tokenId || !hasAnnotations) {
    return <>{children}</>
  }

  return (
    <span className={'named-entity-preview'}>
      {children}
      <SpanIndicators
        spans={namedEntities}
        tokenId={tokenId}
        renderSpan={renderIndicator}
      />
      <SpanIndicators
        spans={realia}
        tokenId={tokenId}
        renderSpan={renderIndicator}
      />
    </span>
  )
}
