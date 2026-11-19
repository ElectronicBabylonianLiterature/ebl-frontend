import { useCallback, useRef, useState } from 'react'
import type { RefObject } from 'react'

export default function useMapResearchSelection(
  searchContainer: RefObject<HTMLDivElement>,
) {
  const [selection, setSelection] = useState<{
    readonly kind: 'site' | 'area'
    readonly id: string
  } | null>(null)
  const selectionTrigger = useRef<HTMLElement | null>(null)
  const selectSite = useCallback(
    (id: string, trigger = document.activeElement as HTMLElement) => {
      selectionTrigger.current = trigger
      setSelection({ kind: 'site', id })
    },
    [],
  )
  const selectArea = useCallback(
    (id: string, trigger = document.activeElement as HTMLElement) => {
      selectionTrigger.current = trigger
      setSelection({ kind: 'area', id })
    },
    [],
  )
  const close = () => {
    setSelection(null)
    const trigger = selectionTrigger.current
    if (trigger && trigger !== document.body && document.contains(trigger)) {
      trigger.focus()
    } else {
      searchContainer.current?.querySelector('input')?.focus()
    }
  }
  return {
    selection,
    selectSite,
    selectArea,
    close,
    clear: () => setSelection(null),
    selectedSiteId: selection?.kind === 'site' ? selection.id : null,
    selectedAreaId: selection?.kind === 'area' ? selection.id : null,
  }
}
