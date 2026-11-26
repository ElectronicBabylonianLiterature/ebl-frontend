import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import useMapExperience from 'map/ui/useMapExperience'
import useMapResearchSelection from 'map/ui/useMapResearchSelection'
import useMapLinkedAreaSelection from 'map/ui/useMapLinkedAreaSelection'
import { excavationPolygon } from 'test-support/map-fixtures'

const FIRST = 'assur-area-a-checksum'
const SECOND = 'assur-area-b-checksum'
const INDEX: ExcavationPolygonIndex = new Map([
  ['assur', [excavationPolygon(), excavationPolygon({ polygonId: SECOND })]],
])
const EMPTY: ExcavationPolygonIndex = new Map()
const SEARCH = { current: null }
type LinkedProps = Pick<
  Parameters<typeof useMapLinkedAreaSelection>[0],
  'polygonIndex' | 'isLoaded' | 'error' | 'onSelectFromUrl'
>

function renderLinked(
  initialEntry = '/tools/map',
  initialProps: LinkedProps = {
    polygonIndex: INDEX,
    isLoaded: true,
    error: null as Error | null,
  },
) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  )
  return renderHook(
    (props) => {
      const experience = useMapExperience()
      const research = useMapResearchSelection(SEARCH, experience.filter)
      const linked = useMapLinkedAreaSelection({
        ...props,
        experience,
        research,
      })
      return { experience, research, linked, navigate: useNavigate() }
    },
    { wrapper, initialProps },
  )
}

it('restores a validated URL area without taking focus and follows external area navigation', () => {
  const onSelectFromUrl = jest.fn()
  const { result } = renderLinked(`/tools/map?selected=area%3A${FIRST}`, {
    polygonIndex: INDEX,
    isLoaded: true,
    error: null,
    onSelectFromUrl,
  })
  expect(result.current.research.selectedAreaId).toBe(FIRST)
  expect(result.current.research.focusInspector).toBe(false)
  expect(result.current.experience.showExcavationAreas).toBe(true)
  expect(onSelectFromUrl).toHaveBeenCalledTimes(1)
  act(() => result.current.experience.setShowExcavationAreas(false))
  expect(onSelectFromUrl).toHaveBeenCalledTimes(1)

  act(() => result.current.navigate(`/tools/map?selected=area%3A${SECOND}`))

  expect(result.current.research.selectedAreaId).toBe(SECOND)
  expect(result.current.research.focusInspector).toBe(false)
  expect(onSelectFromUrl).toHaveBeenCalledTimes(2)
})

it('preserves a URL selection while assets are loading or unavailable and clears invalid IDs only after validation', () => {
  const { result, rerender } = renderLinked(
    '/tools/map?selected=area%3Amissing',
    {
      polygonIndex: EMPTY,
      isLoaded: false,
      error: null,
    },
  )
  expect(result.current.experience.selection?.polygonId).toBe('missing')
  rerender({ polygonIndex: EMPTY, isLoaded: true, error: new Error('offline') })
  expect(result.current.experience.selection?.polygonId).toBe('missing')

  rerender({ polygonIndex: INDEX, isLoaded: true, error: null })

  expect(result.current.experience.selection).toBeNull()
  expect(result.current.research.selectedAreaId).toBeNull()
})

it('keeps native area focus policy and lets site inspection replace the area URL without losing the site', () => {
  const { result } = renderLinked()
  const select = document.createElement('select')
  act(() => result.current.linked.selectArea(FIRST, select, false))
  expect(result.current.experience.selection?.polygonId).toBe(FIRST)
  expect(result.current.research.focusInspector).toBe(false)
  act(() => result.current.linked.selectArea(SECOND))
  expect(result.current.research.focusInspector).toBe(true)

  act(() => result.current.linked.selectSite('babylon'))

  expect(result.current.experience.selection).toBeNull()
  expect(result.current.research.selectedSiteId).toBe('babylon')
  expect(result.current.research.focusInspector).toBe(true)
})

it('clears both representations on Close and on an effective filter change but preserves layer preferences', () => {
  const { result } = renderLinked()
  act(() => result.current.linked.selectArea(FIRST))
  act(() => result.current.experience.setShowExcavationAreas(false))
  expect(result.current.research.selectedAreaId).toBe(FIRST)
  act(() => result.current.experience.setFilter(''))
  expect(result.current.experience.selection?.polygonId).toBe(FIRST)

  act(() => result.current.experience.setFilter('Uruk'))

  expect(result.current.experience.selection).toBeNull()
  expect(result.current.research.selectedAreaId).toBeNull()
  expect(result.current.experience.showExcavationAreas).toBe(false)
  act(() => result.current.linked.selectArea(FIRST))
  act(() => result.current.linked.close())
  expect(result.current.experience.selection).toBeNull()
  expect(result.current.research.selection).toBeNull()
})

it('reconciles URL removal without clearing a local site and retains areas explicitly selected with a history filter', () => {
  const { result } = renderLinked(`/tools/map?selected=area%3A${FIRST}`)
  act(() => result.current.navigate('/tools/map'))
  expect(result.current.research.selection).toBeNull()
  act(() => result.current.linked.selectSite('babylon'))
  expect(result.current.research.selectedSiteId).toBe('babylon')

  act(() =>
    result.current.navigate(
      `/tools/map?findspot=Uruk&selected=area%3A${FIRST}`,
    ),
  )

  expect(result.current.experience.filter).toBe('Uruk')
  expect(result.current.research.selectedAreaId).toBe(FIRST)
})
