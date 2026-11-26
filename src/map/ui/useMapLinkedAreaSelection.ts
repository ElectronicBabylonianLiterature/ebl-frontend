import { useCallback, useEffect } from 'react'
import {
  type ExcavationPolygonIndex,
  findExcavationPolygon,
} from 'map/domain/excavationPolygonIndex'
import type { MapExperience } from 'map/ui/useMapExperience'
import type useMapResearchSelection from 'map/ui/useMapResearchSelection'

type ResearchSelection = ReturnType<typeof useMapResearchSelection>

interface Options {
  readonly experience: Pick<
    MapExperience,
    'filter' | 'selection' | 'setSelection'
  >
  readonly research: ResearchSelection
  readonly polygonIndex: ExcavationPolygonIndex
  readonly isLoaded: boolean
  readonly error: Error | null
  readonly onSelectFromUrl?: (polygonId: string) => void
}

type LinkedResearch = Pick<
  ResearchSelection,
  'selectedAreaId' | 'selectArea' | 'close' | 'clear'
>

function clearLinkedResearch(research: LinkedResearch): void {
  if (document.activeElement?.closest('.map-research-inspector')) {
    research.close()
  } else {
    research.clear()
  }
}

function synchronizeLinkedArea(
  polygonId: string | null,
  setSelection: MapExperience['setSelection'],
  research: LinkedResearch,
  {
    polygonIndex,
    isLoaded,
    error,
    onSelectFromUrl,
  }: Pick<Options, 'polygonIndex' | 'isLoaded' | 'error' | 'onSelectFromUrl'>,
): void {
  if (polygonId === null) {
    if (research.selectedAreaId !== null) clearLinkedResearch(research)
    return
  }
  if (!isLoaded || error !== null) return
  if (!findExcavationPolygon(polygonIndex, polygonId)) {
    setSelection(null)
    if (research.selectedAreaId !== null) clearLinkedResearch(research)
    return
  }
  if (research.selectedAreaId !== polygonId) {
    onSelectFromUrl?.(polygonId)
    research.selectArea(polygonId, document.body, false)
  }
}

export default function useMapLinkedAreaSelection({
  experience,
  research,
  polygonIndex,
  isLoaded,
  error,
  onSelectFromUrl,
}: Options) {
  const polygonId = experience.selection?.polygonId ?? null
  const { setSelection } = experience
  const { selectedAreaId, selectArea, selectSite, close, clear } = research
  useEffect(
    () =>
      synchronizeLinkedArea(
        polygonId,
        setSelection,
        { selectedAreaId, selectArea, close, clear },
        { polygonIndex, isLoaded, error, onSelectFromUrl },
      ),
    [
      polygonId,
      setSelection,
      selectedAreaId,
      selectArea,
      close,
      clear,
      polygonIndex,
      isLoaded,
      error,
      onSelectFromUrl,
    ],
  )
  return {
    selectSite: useCallback(
      (id: string, trigger?: HTMLElement) => {
        setSelection(null)
        selectSite(id, trigger)
      },
      [setSelection, selectSite],
    ),
    selectArea: useCallback(
      (id: string, trigger?: HTMLElement, focusInspector = true) => {
        setSelection({ type: 'excavation-area', polygonId: id })
        selectArea(id, trigger, focusInspector)
      },
      [setSelection, selectArea],
    ),
    close: useCallback(() => {
      setSelection(null)
      close()
    }, [setSelection, close]),
  }
}
