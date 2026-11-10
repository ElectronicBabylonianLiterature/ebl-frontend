import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildFragmentSearchLink } from 'map/domain/mapLinks'

import {
  makeFragmentService,
  makeProvenance,
  mockFitBounds,
  mockGetSource,
  mockSetData,
  renderMapTab,
  resetMapMocks,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')

const provenances = [
  makeProvenance({ id: 'assur', longName: 'Aššur' }),
  makeProvenance({ id: 'babylon', longName: 'Babylon' }),
]

describe('MapTab findspot suggestions', () => {
  beforeEach(resetMapMocks)

  it('suggests the diacritic spelling for a plain-ASCII query', async () => {
    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'assur')

    expect(
      await screen.findByRole('option', { name: 'Aššur' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Babylon' }),
    ).not.toBeInTheDocument()
  })

  it('applies the exact site name when a suggestion is chosen', async () => {
    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'assur')
    await userEvent.click(await screen.findByRole('option', { name: 'Aššur' }))

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Aššur' })).toHaveAttribute(
        'href',
        buildFragmentSearchLink('Aššur'),
      )
    })
    expect(
      screen.queryByRole('link', { name: 'Babylon' }),
    ).not.toBeInTheDocument()
  })

  it('keeps the chosen site name visible in the filter box', async () => {
    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'assur')
    await userEvent.click(await screen.findByRole('option', { name: 'Aššur' }))

    expect(
      await screen.findByText('Aššur', {
        selector: '.findspot-filter__single-value',
      }),
    ).toBeInTheDocument()
  })

  it('clears a chosen site with the keyboard and restores the full list', async () => {
    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await userEvent.type(input, 'assur')
    await userEvent.click(await screen.findByRole('option', { name: 'Aššur' }))
    await screen.findByText('Aššur', {
      selector: '.findspot-filter__single-value',
    })

    await userEvent.type(input, '{Backspace}')

    await waitFor(() => {
      expect(
        screen.queryByText('Aššur', {
          selector: '.findspot-filter__single-value',
        }),
      ).not.toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'Babylon' })).toBeInTheDocument()
  })

  it('zooms the map to a chosen site', async () => {
    mockGetSource.mockReturnValue({ setData: mockSetData })
    renderMapTab(makeFragmentService(provenances))

    const input = await screen.findByLabelText('Filter findspots by name')
    await waitFor(() => expect(mockFitBounds).toHaveBeenCalled())
    const fitCallsBeforePick = mockFitBounds.mock.calls.length

    await userEvent.type(input, 'assur')
    await userEvent.click(await screen.findByRole('option', { name: 'Aššur' }))

    await waitFor(() =>
      expect(mockFitBounds.mock.calls.length).toBeGreaterThan(
        fitCallsBeforePick,
      ),
    )
  })
})
