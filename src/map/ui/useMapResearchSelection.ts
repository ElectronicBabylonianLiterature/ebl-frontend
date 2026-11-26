import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

function useClearSelectionOnFilterChange(
  filter: string,
  searchContainer: RefObject<HTMLDivElement>,
  clear: () => void,
): void {
  const previousFilter = useRef(filter)
  useEffect(() => {
    if (previousFilter.current === filter) return
    previousFilter.current = filter
    const inspectorHadFocus = document.activeElement?.closest(
      '.map-research-inspector',
    )
    clear()
    if (inspectorHadFocus) {
      searchContainer.current?.querySelector('input')?.focus()
    }
  }, [clear, filter, searchContainer])
}

export default function useMapResearchSelection(
  searchContainer: RefObject<HTMLDivElement>,
  filter: string,
) {
  const [selection, setSelection] = useState<{
    readonly kind: 'site' | 'area'
    readonly id: string
    readonly focusInspector: boolean
  } | null>(null)
  const selectionTrigger = useRef<HTMLElement | null>(null)
  const selectSite = useCallback(
    (id: string, trigger = document.activeElement as HTMLElement) => {
      selectionTrigger.current = trigger
      setSelection({ kind: 'site', id, focusInspector: true })
    },
    [],
  )
  const selectArea = useCallback(
    (
      id: string,
      trigger = document.activeElement as HTMLElement,
      focusInspector = true,
    ) => {
      selectionTrigger.current = trigger
      setSelection({ kind: 'area', id, focusInspector })
    },
    [],
  )
  const clear = useCallback(() => setSelection(null), [])
  useClearSelectionOnFilterChange(filter, searchContainer, clear)
  const close = useCallback(() => {
    setSelection(null)
    const trigger = selectionTrigger.current
    if (trigger && trigger !== document.body && document.contains(trigger)) {
      trigger.focus()
    } else {
      searchContainer.current?.querySelector('input')?.focus()
    }
  }, [searchContainer])
  return {
    selection,
    selectSite,
    selectArea,
    close,
    clear,
    focusInspector: selection?.focusInspector ?? true,
    selectedSiteId: selection?.kind === 'site' ? selection.id : null,
    selectedAreaId: selection?.kind === 'area' ? selection.id : null,
  }
}
