import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import useMapExperience from 'map/useMapExperience'
import useMapCamera from 'map/useMapCamera'
import useMapUrlPersistence from 'map/useMapUrlPersistence'

const context = { knownOverlayIds: new Set<string>() }

beforeEach(() => resetMapLibreMock())

function mount(initialEntries = ['/before', '/map']) {
  const map = createMapMock()
  const mapRef = { current: asLibreMap(map) }
  function Harness(): JSX.Element {
    const navigate = useNavigate()
    const location = useLocation()
    const experience = useMapExperience(context)
    const camera = useMapCamera(mapRef, true, experience.requestedCamera)
    useMapUrlPersistence(camera, experience, context)
    return (
      <>
        <output aria-label="Location">
          {location.pathname}
          {location.search}
        </output>
        <output aria-label="Camera requested">
          {String(experience.requestedCamera !== null)}
        </output>
        <button onClick={() => navigate(-1)}>Back</button>
        <input
          aria-label="Filter"
          value={experience.siteFilter}
          onChange={(event) => experience.setSiteFilter(event.target.value)}
        />
        <button onClick={() => navigate('/map?v=1&c=12,34&z=13&b=25&p=40')}>
          Restore camera
        </button>
        <button
          onClick={() =>
            experience.setSelection({ type: 'site', provenanceId: 'babylon' })
          }
        >
          Select site
        </button>
      </>
    )
  }
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Harness />
    </MemoryRouter>,
  )
  return map
}

test('normalizes an initial URL by replacing its history entry', () => {
  mount()
  expect(screen.getByLabelText('Camera requested')).toHaveTextContent('false')
  expect(screen.getByLabelText('Location')).toHaveTextContent('/map?v=1')
  fireEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(screen.getByLabelText('Location')).toHaveTextContent(
    /^\/before(?:\?|$)/,
  )
})

test('applies a restored camera without overwriting it during URL synchronization', () => {
  const map = mount(['/map?v=1&c=43,35&z=8'])
  fireEvent.click(screen.getByRole('button', { name: 'Restore camera' }))
  expect(map.getCenter()).toEqual({ lng: 12, lat: 34 })
  expect(map.getZoom()).toBe(13)
  expect(map.getBearing()).toBe(25)
  expect(map.getPitch()).toBe(40)
  expect(screen.getByLabelText('Location')).toHaveTextContent('z=13')
  fireEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(map.getCenter()).toEqual({ lng: 43, lat: 35 })
  expect(map.getZoom()).toBe(8)
  expect(screen.getByLabelText('Location')).toHaveTextContent('z=8')
})

test('keeps live camera movement when another state change writes the URL', () => {
  const map = mount(['/map?v=1&c=43,35&z=8'])
  act(() => {
    map.jumpTo({ center: [10, 20], zoom: 11, bearing: 0, pitch: 0 })
    map.emit('moveend')
  })
  fireEvent.click(screen.getByRole('button', { name: 'Select site' }))
  expect(screen.getByLabelText('Location')).toHaveTextContent('z=11')
  expect(screen.getByLabelText('Location')).toHaveTextContent('site=babylon')
})

test('replaces debounced filter edits without adding history entries', () => {
  jest.useFakeTimers()
  try {
    mount()
    fireEvent.change(screen.getByLabelText('Filter'), {
      target: { value: 'Assur' },
    })
    act(() => jest.advanceTimersByTime(400))
    expect(screen.getByLabelText('Location')).toHaveTextContent('q=Assur')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Location')).toHaveTextContent(
      /^\/before(?:\?|$)/,
    )
  } finally {
    jest.useRealTimers()
  }
})

test('restores a filter-only history entry without requesting a fallback camera', () => {
  const map = mount(['/map?v=1&q=Assur', '/map?v=1&c=44.4,33&z=5'])
  expect(screen.getByLabelText('Camera requested')).toHaveTextContent('true')
  expect(map.getCenter()).toEqual({ lng: 44.4, lat: 33 })
  map.jumpTo.mockClear()

  fireEvent.click(screen.getByRole('button', { name: 'Back' }))

  expect(screen.getByLabelText('Filter')).toHaveValue('Assur')
  expect(screen.getByLabelText('Camera requested')).toHaveTextContent('false')
  expect(map.jumpTo).not.toHaveBeenCalled()
})
