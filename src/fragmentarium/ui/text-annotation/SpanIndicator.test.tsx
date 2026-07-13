import React from 'react'
import { render, screen } from '@testing-library/react'
import SpanIndicator from 'fragmentarium/ui/text-annotation/SpanIndicator'
import RealiaInfoContext from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import {
  RealiaInfoLookup,
  toRealiaDisplayInfo,
} from 'fragmentarium/ui/text-annotation/realiaInfo'
import {
  AnnotationSpan,
  EntityAnnotationSpan,
  RealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

const mappedEntry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
  type: ['Divine names'],
})
const unmappedEntry = realiaEntryFactory.build({
  id: 'Ziggurat',
  realiaId: 'realia_000999',
  type: ['Literature'],
})

const lookup: RealiaInfoLookup = new Map([
  ['realia_000846', toRealiaDisplayInfo(mappedEntry)],
  ['realia_000999', toRealiaDisplayInfo(unmappedEntry)],
])

const entitySpan: EntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'DIVINE_NAME',
  span: ['Word-1'],
  tier: 1,
  name: 'Divine Name',
}
const realiaSpan: RealiaAnnotationSpan = {
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-1'],
  tier: 2,
  name: 'realia_000846',
}

function renderIndicator(entitySpan: AnnotationSpan): void {
  render(
    <RealiaInfoContext.Provider value={{ lookup, register: jest.fn() }}>
      <SpanIndicator
        tokenId={'Word-1'}
        entitySpan={entitySpan}
        activeSpanId={null}
        setActiveSpanId={jest.fn()}
      />
    </RealiaInfoContext.Provider>,
  )
}

function getIndicator(id: string): HTMLElement {
  return screen.getByTestId(`Word-1__${id}`)
}

describe('SpanIndicator', () => {
  it('labels a realia span with the full lemma', () => {
    renderIndicator(realiaSpan)
    const indicator = getIndicator('Realia-1')

    expect(indicator).toHaveAttribute('data-label', 'Apkallu')
    expect(indicator).toHaveAttribute('title', 'Apkallu')
    expect(indicator).toHaveClass('span-indicator--realia')
  })

  it('colours a mapped realia span like its tag', () => {
    renderIndicator(realiaSpan)

    expect(getIndicator('Realia-1')).toHaveClass('named-entity__DIVINE_NAME')
  })

  it('colours an unmapped realia span with the realia colour', () => {
    renderIndicator({ ...realiaSpan, realiaId: 'realia_000999' })
    const indicator = getIndicator('Realia-1')

    expect(indicator).toHaveClass('named-entity__REALIA')
    expect(indicator).toHaveAttribute('data-label', 'Ziggurat')
  })

  it('falls back to the realiaId when the lemma is not resolved', () => {
    renderIndicator({ ...realiaSpan, realiaId: 'realia_404' })
    const indicator = getIndicator('Realia-1')

    expect(indicator).toHaveAttribute('data-label', 'realia_404')
    expect(indicator).toHaveClass('named-entity__REALIA')
  })

  it('renders a tag span with its entity class and no realia label', () => {
    renderIndicator(entitySpan)
    const indicator = getIndicator('Entity-1')

    expect(indicator).toHaveClass('named-entity__DIVINE_NAME')
    expect(indicator).not.toHaveClass('span-indicator--realia')
    expect(indicator).not.toHaveAttribute('data-label')
  })

  it('renders the tier depth class', () => {
    renderIndicator(realiaSpan)

    expect(getIndicator('Realia-1')).toHaveClass('tier-depth--2')
  })
})
