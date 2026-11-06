import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import fs from 'fs'
import path from 'path'
import {
  makeFragmentService,
  makeProvenance,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapExcavationLayers'

jest.mock('maplibre-gl')

const WARNING = 'Excavation areas are unavailable.'
const originalMatchMedia = window.matchMedia

afterEach(() => {
  window.matchMedia = originalMatchMedia
})

describe('excavation failure visibility with closed controls', () => {
  beforeEach(() => {
    resetMapMocks()
    fetchMock.resetMocks()
  })

  it('places an invalid requested asset warning before the map', async () => {
    fetchMock.mockResponseOnce('{"type":"FeatureCollection","features":[]}')
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&areas=1',
    )

    const warning = await screen.findByText(WARNING)
    expect(
      screen.queryByRole('region', { name: 'Map layers' }),
    ).not.toBeInTheDocument()
    expect(
      warning.compareDocumentPosition(
        screen.getByRole('region', { name: 'Interactive findspot map' }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('shows source failures after closing the layer drawer', async () => {
    fetchMock.mockResponseOnce(
      fs.readFileSync(
        path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
        'utf8',
      ),
    )
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&areas=1',
    )
    await userEvent.click(
      await screen.findByRole('button', { name: 'Map layers' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Close Map layers' }),
    )

    act(() => {
      triggerMapEvent('error', {
        sourceId: EXCAVATION_AREAS_SOURCE_ID,
        error: { message: 'unavailable' },
      })
    })

    expect(await screen.findByText(WARNING)).toBeInTheDocument()
  })

  it('keeps an unused failed asset quiet until controls are opened', async () => {
    fetchMock.mockRejectOnce(new Error('unavailable'))
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Presentation mode' }),
    )
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Exit presentation mode' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Map layers' }))
    expect(await screen.findByText(WARNING)).toBeInTheDocument()
  })
})

it('keeps a requested source failure visible with the narrow drawer collapsed', async () => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponseOnce(
    fs.readFileSync(
      path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
      'utf8',
    ),
  )
  renderMapTab(
    makeFragmentService([makeProvenance()]),
    '/tools/map?mv=1&areas=1',
  )
  await userEvent.click(
    await screen.findByRole('button', { name: 'Map layers' }),
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Collapse Map layers' }),
  )
  expect(screen.queryByLabelText('Excavation areas')).not.toBeInTheDocument()
  act(() => {
    triggerMapEvent('error', {
      sourceId: EXCAVATION_AREAS_SOURCE_ID,
      error: { message: 'unavailable' },
    })
  })
  expect(await screen.findByText(WARNING)).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Expand Map layers' }),
  ).toHaveAttribute('aria-expanded', 'false')
})
