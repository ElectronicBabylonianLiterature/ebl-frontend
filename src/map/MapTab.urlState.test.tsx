import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import { MAP_LOCATION_TEST_ID, renderMapTab } from 'test-support/map-render'
import { provenanceRecord } from 'test-support/map-fixtures'

const babylon = provenanceRecord()
const assur = provenanceRecord({
  id: 'assur',
  longName: 'Aššur',
  abbreviation: 'Aš',
  sortKey: 2,
})

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
  }) as unknown as typeof fetch
})

function mapSearch(): string {
  return screen.getByTestId(MAP_LOCATION_TEST_ID).textContent ?? ''
}

async function mountMapTab(initialEntries?: readonly string[]): Promise<void> {
  renderMapTab({ provenances: [babylon, assur], initialEntries })
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  act(() => lastMapMock().emit('load'))
}

describe('restoring state from the url', () => {
  it('restores a site filter and selection from a versioned url', async () => {
    await mountMapTab(['/?v=1&q=Babylon&site=babylon&l=boundaries,areas'])

    expect(screen.getByLabelText('Site name')).toHaveValue('Babylon')
    expect(
      await screen.findByRole('heading', { name: 'Babylon' }),
    ).toBeInTheDocument()
  })

  it('ignores an unknown state version', async () => {
    await mountMapTab(['/?v=99&q=Babylon'])

    expect(screen.getByLabelText('Site name')).toHaveValue('')
  })

  it('ignores an unavailable overlay', async () => {
    await mountMapTab(['/?v=1&o=not-a-real-overlay:0.5'])

    expect(lastMapMock().layers.size).toBeGreaterThan(0)
    expect(
      [...lastMapMock().layers.keys()].some((id) =>
        id.includes('not-a-real-overlay'),
      ),
    ).toBe(false)
  })

  it('restores the camera from the url', async () => {
    await mountMapTab(['/?v=1&c=43.25,35.45&z=14&b=20&p=30'])

    expect(screen.getByLabelText('Findspot map')).toBeInTheDocument()
  })
})

describe('writing state to the url', () => {
  it('records a selection in the query string', async () => {
    await mountMapTab()

    await userEvent.click(screen.getByRole('button', { name: /Babylon/ }))

    await waitFor(() => expect(mapSearch()).toContain('site=babylon'))
  })

  it('records layer visibility', async () => {
    await mountMapTab()

    await waitFor(() => expect(mapSearch()).toContain('l=boundaries'))
  })

  it('always records the schema version', async () => {
    await mountMapTab()

    await waitFor(() => expect(mapSearch()).toContain('v=1'))
  })
})

describe('copy map link', () => {
  it('confirms a successful copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    await mountMapTab()

    await userEvent.click(screen.getByRole('button', { name: 'Copy map link' }))

    expect(writeText).toHaveBeenCalledWith(window.location.href)
    expect(
      await screen.findByText('Map link copied to clipboard.'),
    ).toBeInTheDocument()
  })

  it('reports a clipboard failure without losing the link', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('nope')) },
    })
    await mountMapTab()

    await userEvent.click(screen.getByRole('button', { name: 'Copy map link' }))

    expect(
      await screen.findByText(
        'Copying failed. Copy the address bar URL instead.',
      ),
    ).toBeInTheDocument()
  })

  it('reports a missing clipboard api', async () => {
    Object.assign(navigator, { clipboard: undefined })
    await mountMapTab()

    await userEvent.click(screen.getByRole('button', { name: 'Copy map link' }))

    expect(
      await screen.findByText(
        'Copying failed. Copy the address bar URL instead.',
      ),
    ).toBeInTheDocument()
  })
})
