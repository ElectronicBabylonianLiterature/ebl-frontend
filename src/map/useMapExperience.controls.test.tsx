import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import useMapExperience from 'map/useMapExperience'

function MapRoute({ children }: React.PropsWithChildren): JSX.Element {
  return <MemoryRouter initialEntries={['/tools/map']}>{children}</MemoryRouter>
}

it('persists layer and visualization controls and resets their URL state', async (): Promise<void> => {
  const { result } = renderHook(useMapExperience, { wrapper: MapRoute })
  act((): void => result.current.setShowExcavationAreas(true))
  await waitFor((): void =>
    expect(result.current.showExcavationAreas).toBe(true),
  )
  act((): void => result.current.setVisualization('density'))
  await waitFor((): void =>
    expect(result.current.visualization).toBe('density'),
  )
  act((): void => result.current.setTerrain(true))
  await waitFor((): void => expect(result.current.terrain).toBe(true))
  act((): void => result.current.setFilter('Uruk'))
  await waitFor((): void => expect(result.current.filter).toBe('Uruk'))
  act((): void =>
    result.current.setSelection({
      type: 'excavation-area',
      polygonId: 'area-a',
    }),
  )
  await waitFor((): void =>
    expect(result.current.selection?.polygonId).toBe('area-a'),
  )
  act((): void => result.current.resetState())
  await waitFor((): void => {
    expect(result.current).toEqual(
      expect.objectContaining({
        showExcavationAreas: false,
        visualization: 'mapped',
        terrain: false,
        filter: '',
        selection: null,
      }),
    )
  })
})
