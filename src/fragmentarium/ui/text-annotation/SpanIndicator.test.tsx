import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import SpanIndicator, {
  realiaPageHint,
} from 'fragmentarium/ui/text-annotation/SpanIndicator'
import RealiaInfoContext from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import {
  RealiaInfoLookup,
  toRealiaDisplayInfo,
} from 'fragmentarium/ui/text-annotation/realiaInfo'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  entityAnnotationSpan,
  realiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
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

const entitySpan = entityAnnotationSpan({
  id: 'Entity-1',
  type: 'DIVINE_NAME',
  span: ['Word-1'],
})
const realiaSpan = realiaAnnotationSpan(
  { id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-1'] },
  { tier: 2 },
)

const setActiveSpanId = jest.fn()
const openInNewTab = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  window.open = openInNewTab
})

function renderIndicator(entitySpan: AnnotationSpan): void {
  render(
    <RealiaInfoContext.Provider value={{ lookup, register: jest.fn() }}>
      <SpanIndicator
        tokenId={'Word-1'}
        entitySpan={entitySpan}
        activeSpanId={null}
        setActiveSpanId={setActiveSpanId}
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
    expect(indicator).toHaveClass('span-indicator--realia')
  })

  it('hints the new tab shortcut next to the lemma on hover', () => {
    renderIndicator(realiaSpan)

    expect(getIndicator('Realia-1')).toHaveAttribute(
      'title',
      `Apkallu (${realiaPageHint})`,
    )
  })

  it('hints nothing on a tag span', () => {
    renderIndicator(entitySpan)

    expect(getIndicator('Entity-1')).toHaveAttribute('title', 'Divine Name')
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

  it('opens the realia page in a new tab on alt + left click', () => {
    renderIndicator(realiaSpan)
    fireEvent.mouseUp(getIndicator('Realia-1'), { altKey: true, button: 0 })

    expect(openInNewTab).toHaveBeenCalledWith(
      '/tools/realia/realia_000846',
      '_blank',
      'noopener,noreferrer',
    )
    expect(setActiveSpanId).not.toHaveBeenCalled()
  })

  it('activates a realia span on a plain left click', () => {
    renderIndicator(realiaSpan)
    fireEvent.mouseUp(getIndicator('Realia-1'), { altKey: false, button: 0 })

    expect(setActiveSpanId).toHaveBeenCalledWith('Realia-1')
    expect(openInNewTab).not.toHaveBeenCalled()
  })

  it('activates a realia span on alt + a button other than the left one', () => {
    renderIndicator(realiaSpan)
    fireEvent.mouseUp(getIndicator('Realia-1'), { altKey: true, button: 1 })

    expect(setActiveSpanId).toHaveBeenCalledWith('Realia-1')
    expect(openInNewTab).not.toHaveBeenCalled()
  })

  it('activates a tag span on alt + left click', () => {
    renderIndicator(entitySpan)
    fireEvent.mouseUp(getIndicator('Entity-1'), { altKey: true, button: 0 })

    expect(setActiveSpanId).toHaveBeenCalledWith('Entity-1')
    expect(openInNewTab).not.toHaveBeenCalled()
  })
})
