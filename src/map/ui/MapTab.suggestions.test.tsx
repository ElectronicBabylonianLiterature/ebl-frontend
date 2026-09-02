import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildFragmentSearchLink } from 'map/domain/mapLinks'

import {
  makeFragmentService,
  makeProvenance,
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
})
