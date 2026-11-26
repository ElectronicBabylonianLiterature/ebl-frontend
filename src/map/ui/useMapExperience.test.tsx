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
