import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapInspectorTabs from './MapInspectorTabs'
import MapInspectorMaps from './MapInspectorMaps'
import MapCompletenessNote from './MapCompletenessNote'
import { historicalMapOverlay } from 'test-support/map-fixtures'

const tabs = [
  { id: 'overview', label: 'Overview', render: () => <p>Overview body</p> },
  { id: 'evidence', label: 'Evidence', render: () => <p>Evidence body</p> },
  { id: 'maps', label: 'Maps', render: () => <p>Maps body</p> },
]

describe('MapInspectorTabs', () => {
  it('opens the first section and keeps one tab stop', () => {
    render(<MapInspectorTabs tabs={tabs} label="Sections" />)

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Evidence' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview body')
  })

  it('switches sections on click', async () => {
    render(<MapInspectorTabs tabs={tabs} label="Sections" />)

    await userEvent.click(screen.getByRole('tab', { name: 'Maps' }))

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Maps body')
  })

  it('moves between sections with the arrow keys and wraps', async () => {
    render(<MapInspectorTabs tabs={tabs} label="Sections" />)
    screen.getByRole('tab', { name: 'Overview' }).focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Evidence body')

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Maps body')
    expect(screen.getByRole('tab', { name: 'Maps' })).toHaveFocus()
  })

  it('ignores keys that are not arrows', async () => {
    render(<MapInspectorTabs tabs={tabs} label="Sections" />)
    screen.getByRole('tab', { name: 'Overview' }).focus()

    await userEvent.keyboard('{End}')

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview body')
  })
})

describe('MapInspectorMaps', () => {
  const overlay = historicalMapOverlay({
    shortTitle: 'Andrae 1938',
    dateLabel: '1938',
  })

  function renderMaps(activeIds: readonly string[] = []) {
    const props = {
      siteName: 'Aššur',
      overlays: [overlay],
      activeOverlayIds: new Set(activeIds),
      onToggleOverlay: jest.fn(),
      onCompare: jest.fn(),
    }
    return { props, ...render(<MapInspectorMaps {...props} />) }
  }

  it('lists site maps with their date and attribution', () => {
    renderMaps()

    expect(
      screen.getByText('Historical maps available for Aššur'),
    ).toBeInTheDocument()
    expect(screen.getByText('Andrae 1938')).toBeInTheDocument()
    expect(screen.getByText('1938')).toBeInTheDocument()
    expect(screen.getByText('Test attribution')).toBeInTheDocument()
  })

  it('shows and hides an overlay', async () => {
    const { props } = renderMaps()

    await userEvent.click(screen.getByRole('button', { name: 'Show' }))

    expect(props.onToggleOverlay).toHaveBeenCalledWith(overlay, true)
  })

  it('reports an already-active overlay as hideable', async () => {
    const { props } = renderMaps([overlay.id])

    const button = screen.getByRole('button', { name: 'Hide' })
    expect(button).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(button)
    expect(props.onToggleOverlay).toHaveBeenCalledWith(overlay, false)
  })

  it('offers comparison and reports an empty site', async () => {
    const { props } = renderMaps()
    await userEvent.click(
      screen.getByRole('button', { name: 'Compare historical maps' }),
    )
    expect(props.onCompare).toHaveBeenCalled()

    render(
      <MapInspectorMaps
        siteName="Uruk"
        overlays={[]}
        activeOverlayIds={new Set()}
        onToggleOverlay={jest.fn()}
        onCompare={jest.fn()}
      />,
    )
    expect(
      screen.getByText('No historical maps are available for Uruk.'),
    ).toBeInTheDocument()
  })
})

describe('MapCompletenessNote', () => {
  it('keeps the precision caveat one click away', async () => {
    render(<MapCompletenessNote />)
    const toggle = screen.getByRole('button', {
      name: 'How to read these counts',
    })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)

    expect(
      screen.getByText(/accessible to the current user/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/not exact fragment coordinates/),
    ).toBeInTheDocument()
  })
})
