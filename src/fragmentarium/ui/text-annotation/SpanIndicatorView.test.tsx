import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import SpanIndicatorView from 'fragmentarium/ui/text-annotation/SpanIndicatorView'
import { realiaPageHint } from 'fragmentarium/ui/text-annotation/SpanIndicator'
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

const lookup: RealiaInfoLookup = new Map([
  ['realia_000846', toRealiaDisplayInfo(mappedEntry)],
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

const openInNewTab = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  window.open = openInNewTab
})

function renderView(entitySpan: AnnotationSpan): void {
  render(
    <RealiaInfoContext.Provider value={{ lookup, register: jest.fn() }}>
      <SpanIndicatorView tokenId={'Word-1'} entitySpan={entitySpan} />
    </RealiaInfoContext.Provider>,
  )
}

function getIndicator(id: string): HTMLElement {
  return screen.getByTestId(`Word-1__${id}`)
}

describe('SpanIndicatorView', () => {
  it('labels and colours a realia span like the editor', () => {
    renderView(realiaSpan)
    const indicator = getIndicator('Realia-1')

    expect(indicator).toHaveClass(
      'named-entity__DIVINE_NAME',
      'span-indicator--realia',
      'tier-depth--2',
    )
    expect(indicator).toHaveAttribute('data-label', 'Apkallu')
    expect(indicator).toHaveAttribute('title', `Apkallu (${realiaPageHint})`)
  })

  it('renders a tag span with its entity class, no realia label, no hint', () => {
    renderView(entitySpan)
    const indicator = getIndicator('Entity-1')

    expect(indicator).toHaveClass('named-entity__DIVINE_NAME')
    expect(indicator).not.toHaveClass('span-indicator--realia')
    expect(indicator).not.toHaveAttribute('data-label')
    expect(indicator).toHaveAttribute('title', 'Divine Name')
  })

  it('marks every display indicator as static and never highlighted', () => {
    renderView(entitySpan)

    expect(getIndicator('Entity-1')).toHaveClass('span-indicator--static')
    expect(getIndicator('Entity-1')).not.toHaveClass('highlight')
  })

  it('opens the realia page by lemma in a new tab on alt + left click', () => {
    renderView(realiaSpan)
    fireEvent.mouseUp(getIndicator('Realia-1'), { altKey: true, button: 0 })

    expect(openInNewTab).toHaveBeenCalledWith(
      '/tools/realia/Apkallu',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('does nothing on a plain left click of a realia span', () => {
    renderView(realiaSpan)
    fireEvent.mouseUp(getIndicator('Realia-1'), { altKey: false, button: 0 })

    expect(openInNewTab).not.toHaveBeenCalled()
  })

  it('does nothing on alt + a button other than the left one', () => {
    renderView(realiaSpan)
    fireEvent.mouseUp(getIndicator('Realia-1'), { altKey: true, button: 1 })

    expect(openInNewTab).not.toHaveBeenCalled()
  })

  it('does nothing on alt + left click of a tag span', () => {
    renderView(entitySpan)
    fireEvent.mouseUp(getIndicator('Entity-1'), { altKey: true, button: 0 })

    expect(openInNewTab).not.toHaveBeenCalled()
  })
})

describe('reaching the realia page without a mouse', () => {
  it('exposes the realia indicator as a named link in the tab order', () => {
    renderView(realiaSpan)
    const indicator = getIndicator('Realia-1')

    expect(indicator).toHaveAttribute('role', 'link')
    expect(indicator).toHaveAttribute('tabindex', '0')
    expect(indicator).toHaveAccessibleName('Open the Realia page for Apkallu')
  })

  it.each([['Enter'], [' ']])('opens the realia page on %s', (key) => {
    renderView(realiaSpan)
    fireEvent.keyDown(getIndicator('Realia-1'), { key })

    expect(openInNewTab).toHaveBeenCalledWith(
      '/tools/realia/Apkallu',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('ignores any other key', () => {
    renderView(realiaSpan)
    fireEvent.keyDown(getIndicator('Realia-1'), { key: 'a' })

    expect(openInNewTab).not.toHaveBeenCalled()
  })

  it('leaves a tag indicator out of the tab order and unnamed', () => {
    renderView(entitySpan)
    const indicator = getIndicator('Entity-1')

    expect(indicator).not.toHaveAttribute('role')
    expect(indicator).not.toHaveAttribute('tabindex')
    fireEvent.keyDown(indicator, { key: 'Enter' })
    expect(openInNewTab).not.toHaveBeenCalled()
  })

  it('gives a multi-word realia a single tab stop, on its first word', () => {
    const wideSpan = realiaAnnotationSpan({
      id: 'Realia-2',
      realiaId: 'realia_000846',
      span: ['Word-1', 'Word-2'],
    })
    render(
      <RealiaInfoContext.Provider value={{ lookup, register: jest.fn() }}>
        <SpanIndicatorView tokenId={'Word-2'} entitySpan={wideSpan} />
      </RealiaInfoContext.Provider>,
    )
    const continuation = screen.getByTestId('Word-2__Realia-2')

    expect(continuation).not.toHaveAttribute('tabindex')
    fireEvent.mouseUp(continuation, { altKey: true, button: 0 })
    expect(openInNewTab).toHaveBeenCalled()
  })
})
