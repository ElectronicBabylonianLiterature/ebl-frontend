import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import useMapExperience from 'map/ui/useMapExperience'

it('keeps research filters and excavation visibility in the shared URL state', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  )
  const { result } = renderHook(useMapExperience, { wrapper })
  expect(result.current.showExcavationAreas).toBe(true)
  act(() => result.current.setFilter('Uruk'))
  expect(result.current.filter).toBe('Uruk')
  act(() => result.current.setShowExcavationAreas(false))
  expect(result.current.showExcavationAreas).toBe(false)
  expect(result.current.filter).toBe('Uruk')
})

it('preserves linked area selection for unchanged filters and layer changes, then clears it with a new filter', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  )
  const { result } = renderHook(useMapExperience, { wrapper })
  const selection = {
    type: 'excavation-area' as const,
    polygonId: 'assur-area-a',
  }
  act(() => result.current.setSelection(selection))
  act(() => result.current.setFilter(''))
  act(() => result.current.setShowExcavationAreas(false))
  expect(result.current.selection).toEqual(selection)

  act(() => result.current.setFilter('Uruk'))

  expect(result.current.selection).toBeNull()
  expect(result.current.filter).toBe('Uruk')
  expect(result.current.showExcavationAreas).toBe(false)
})
