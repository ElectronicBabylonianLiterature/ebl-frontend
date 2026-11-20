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
  readonly onSelectFromUrl?: () => void
}

function clearLinkedResearch(research: ResearchSelection): void {
  if (document.activeElement?.closest('.map-research-inspector')) {
    research.close()
  } else {
    research.clear()
  }
}

function synchronizeLinkedArea({
  experience,
  research,
  polygonIndex,
  isLoaded,
  error,
  onSelectFromUrl,
}: Options): void {
  const polygonId = experience.selection?.polygonId ?? null
  if (polygonId === null) {
    if (research.selectedAreaId !== null) clearLinkedResearch(research)
    return
  }
  if (!isLoaded || error !== null) return
  if (!findExcavationPolygon(polygonIndex, polygonId)) {
    experience.setSelection(null)
    if (research.selectedAreaId !== null) clearLinkedResearch(research)
    return
  }
  if (research.selectedAreaId !== polygonId) {
    onSelectFromUrl?.()
    research.selectArea(polygonId, document.body, false)
  }
}

export default function useMapLinkedAreaSelection(options: Options) {
  const { experience, research } = options
  useEffect(() => synchronizeLinkedArea(options), [options])
  return {
    selectSite: useCallback(
      (id: string, trigger?: HTMLElement) => {
        experience.setSelection(null)
        research.selectSite(id, trigger)
      },
      [experience, research],
    ),
    selectArea: useCallback(
      (id: string, trigger?: HTMLElement, focusInspector = true) => {
        experience.setSelection({ type: 'excavation-area', polygonId: id })
        research.selectArea(id, trigger, focusInspector)
      },
      [experience, research],
    ),
    close: useCallback(() => {
      experience.setSelection(null)
      research.close()
    }, [experience, research]),
  }
}
