import React from 'react'
import { render, screen } from '@testing-library/react'
import SpanIndicators from 'fragmentarium/ui/text-annotation/SpanIndicators'
import { entityAnnotationSpan } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { EntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'

const spans: readonly EntityAnnotationSpan[] = [
  entityAnnotationSpan({
    id: 'Entity-1',
    type: 'PERSONAL_NAME',
    span: ['Word-1', 'Word-2'],
  }),
  entityAnnotationSpan({
    id: 'Entity-2',
    type: 'DIVINE_NAME',
    span: ['Word-3'],
  }),
]

function renderSpan(span: EntityAnnotationSpan, tokenId: string): JSX.Element {
  return <span data-testid={`${tokenId}__${span.id}`} />
}

function renderIndicators(tokenId?: string | null): HTMLElement {
  return render(
    <SpanIndicators spans={spans} tokenId={tokenId} renderSpan={renderSpan} />,
  ).container
}

describe('SpanIndicators', () => {
  it('renders only the spans covering the word', () => {
    renderIndicators('Word-2')

    expect(screen.getByTestId('Word-2__Entity-1')).toBeVisible()
    expect(screen.queryByTestId('Word-2__Entity-2')).not.toBeInTheDocument()
  })

  it('renders nothing for a token without an id', () => {
    expect(renderIndicators(null)).toBeEmptyDOMElement()
  })
})
