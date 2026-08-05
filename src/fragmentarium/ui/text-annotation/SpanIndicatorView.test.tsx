import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import SpanIndicatorView from 'fragmentarium/ui/text-annotation/SpanIndicatorView'
import { realiaPageLinkHint } from 'fragmentarium/ui/text-annotation/useSpanIndicator'
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
    expect(indicator).toHaveAttribute(
      'title',
      `Apkallu (${realiaPageLinkHint})`,
    )
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

  it('points a realia span at its page instead of scripting the navigation', () => {
    renderView(realiaSpan)
    const indicator = getIndicator('Realia-1')

    expect(indicator.tagName).toEqual('A')
    expect(indicator).toHaveAttribute('href', '/tools/realia/Apkallu')
    expect(indicator).toHaveAttribute('target', '_blank')
    expect(indicator).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it.each([[false], [true]])(
    'leaves a realia left click to the browser, altKey %s',
    (altKey) => {
      renderView(realiaSpan)
      fireEvent.mouseUp(getIndicator('Realia-1'), { altKey, button: 0 })

      expect(openInNewTab).not.toHaveBeenCalled()
    },
  )

  it('does nothing on a left click of a tag span', () => {
    renderView(entitySpan)
    fireEvent.mouseUp(getIndicator('Entity-1'), { altKey: false, button: 0 })

    expect(openInNewTab).not.toHaveBeenCalled()
  })
})

function getContinuationIndicator(): HTMLElement {
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
  return screen.getByTestId('Word-2__Realia-2')
}

describe('reaching the realia page without a mouse', () => {
  it('exposes the realia indicator as a named link', () => {
    renderView(realiaSpan)
    const indicator = getIndicator('Realia-1')

    expect(indicator).toHaveAccessibleName('Open the Realia page for Apkallu')
    expect(screen.getByRole('link')).toEqual(indicator)
  })

  it('relies on the native link instead of a role and tabindex shim', () => {
    renderView(realiaSpan)
    const indicator = getIndicator('Realia-1')

    expect(indicator).not.toHaveAttribute('role')
    expect(indicator).not.toHaveAttribute('tabindex')
  })

  it.each([['Enter'], [' '], ['a']])(
    'leaves %s to the browser rather than scripting it',
    (key) => {
      renderView(realiaSpan)
      fireEvent.keyDown(getIndicator('Realia-1'), { key })

      expect(openInNewTab).not.toHaveBeenCalled()
    },
  )

  it('leaves a tag indicator out of the tab order and unnamed', () => {
    renderView(entitySpan)
    const indicator = getIndicator('Entity-1')

    expect(indicator).not.toHaveAttribute('role')
    expect(indicator).not.toHaveAttribute('tabindex')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    fireEvent.keyDown(indicator, { key: 'Enter' })
    expect(openInNewTab).not.toHaveBeenCalled()
  })

  it('gives a multi-word realia a single tab stop, on its first word', () => {
    const continuation = getContinuationIndicator()

    expect(continuation.tagName).toEqual('SPAN')
    expect(continuation).not.toHaveAttribute('tabindex')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('still opens the realia page from a left click on a later word', () => {
    fireEvent.mouseUp(getContinuationIndicator(), { altKey: false, button: 0 })

    expect(openInNewTab).toHaveBeenCalledWith(
      '/tools/realia/Apkallu',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('ignores a non-left click on a later word', () => {
    fireEvent.mouseUp(getContinuationIndicator(), { altKey: false, button: 1 })

    expect(openInNewTab).not.toHaveBeenCalled()
  })
})
