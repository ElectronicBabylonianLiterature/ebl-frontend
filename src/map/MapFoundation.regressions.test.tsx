import React, { useLayoutEffect, useRef } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import FindspotFilterInput from 'map/FindspotFilterInput'
import MapShareLink from 'map/MapShareLink'
import { getReportableMapError } from 'map/mapBackgroundError'
import { parseMapUrlState } from 'map/mapUrlState'
import useMapUrlState from 'map/useMapUrlState'
import useFindspotMap from 'map/useFindspotMap'
import {
  deferMapLoad,
  makeProvenance,
  mockAddSource,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import { renderHarness } from 'map/useFindspotMap.testSupport'

jest.mock('maplibre-gl')

function UrlHarness(): JSX.Element {
  const { update } = useMapUrlState()
  const location = useLocation()
  return (
    <>
      <button onClick={() => update({ filter: 'Babylon' })}>Keep filter</button>
      <output data-testid="location-key">{location.key}</output>
      <output data-testid="location-search">{location.search}</output>
    </>
  )
}

function StyleBoundaryHarness({
  provenances,
}: {
  provenances: readonly ProvenanceRecord[] | null
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  useFindspotMap(ref, provenances)
  useLayoutEffect(() => {
    if (provenances === null) triggerMapEvent('style.load')
  }, [provenances])
  return <div ref={ref} />
}

function ExternalUrlHarness(): JSX.Element {
  const { state, update } = useMapUrlState()
  const location = useLocation()
  const navigate = useNavigate()
  useLayoutEffect(() => {
    if (location.search === '?mv=1&findspot=Babylon')
      update({ filter: 'Babylon' })
  }, [location.search, update])
  return (
    <>
      <button onClick={() => navigate('?mv=1&findspot=Babylon')}>
        External URL
      </button>
      <output>{state.filter}</output>
    </>
  )
}

test('accepts a filter update whose URL was already committed externally', () => {
  render(
    <MemoryRouter initialEntries={['/tools/map']}>
      <ExternalUrlHarness />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'External URL' }))
  expect(screen.getByText('Babylon')).toBeInTheDocument()
})

beforeEach(resetMapMocks)

test('does not navigate when a map filter update leaves the state unchanged', () => {
  render(
    <MemoryRouter
      initialEntries={['/tools/map?mv=1&findspot=Babylon&source=archive']}
    >
      <UrlHarness />
    </MemoryRouter>,
  )
  const originalKey = screen.getByTestId('location-key').textContent
  fireEvent.click(screen.getByRole('button', { name: 'Keep filter' }))
  expect(screen.getByTestId('location-key')).toHaveTextContent(
    originalKey ?? '',
  )
  expect(screen.getByTestId('location-search')).toHaveTextContent(
    '?mv=1&findspot=Babylon&source=archive',
  )
})

test('keeps the first duplicate query value when it is a null token', () => {
  expect(parseMapUrlState('mv=1&findspot&findspot=Babylon').filter).toBe('')
})

test('ignores a stale successful copy after a newer copy fails', async () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(
    navigator,
    'clipboard',
  )
  let resolveFirst!: () => void
  const first = new Promise<void>((resolve) => {
    resolveFirst = resolve
  })
  const writeText = jest
    .fn()
    .mockReturnValueOnce(first)
    .mockRejectedValueOnce(new Error('denied'))
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  try {
    render(<MapShareLink />)
    const button = screen.getByRole('button', { name: 'Copy map link' })
    await userEvent.click(button)
    await userEvent.click(button)
    await screen.findByText('Copying failed. Copy the address bar URL instead.')
    await act(async () => {
      resolveFirst()
      await first
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Copying failed. Copy the address bar URL instead.',
    )
  } finally {
    if (originalClipboard)
      Object.defineProperty(navigator, 'clipboard', originalClipboard)
    else Reflect.deleteProperty(navigator, 'clipboard')
  }
})

test('can choose the already selected findspot without leaving stale input text', async () => {
  const onFilterChange = jest.fn()
  render(
    <FindspotFilterInput
      provenances={[makeProvenance()]}
      filter="Babylon"
      onFilterChange={onFilterChange}
    />,
  )
  await userEvent.click(screen.getByLabelText('Filter findspots by name'))
  await userEvent.click(await screen.findByRole('option', { name: 'Babylon' }))
  expect(onFilterChange).toHaveBeenCalledWith('Babylon')
  expect(screen.getByLabelText('Filter findspots by name')).toHaveValue('')
  expect(
    screen.getByText('Babylon', { selector: '.findspot-filter__single-value' }),
  ).toBeInTheDocument()
})

test('does not add a source when style loading races with provenance cleanup', () => {
  deferMapLoad()
  const { rerender } = renderHarness(
    <StyleBoundaryHarness provenances={[makeProvenance()]} />,
  )
  rerender(<StyleBoundaryHarness provenances={null} />)
  expect(mockAddSource).not.toHaveBeenCalled()
})

test('does not report a map error whose object has no string message', () => {
  expect(getReportableMapError({ error: { message: 42 } })).toBeNull()
})
