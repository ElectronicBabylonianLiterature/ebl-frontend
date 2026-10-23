import { useCallback, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import useActiveSection from 'common/hooks/useActiveSection'
import {
  EntryNavSection,
  getEntryAnchorIds,
  getEntrySectionByAnchor,
} from 'common/ui/entry-page/entryNavSections'
import {
  scrollToSection,
  useEntrySectionState,
} from 'common/ui/entry-page/useEntrySectionState'

export interface EntryPageNavigation {
  readonly openSections: Readonly<Record<string, boolean>>
  readonly toggleSection: (id: string) => void
  readonly activeId: string | null
  readonly selectedId: string | null
  readonly navigateToSection: (id: string) => void
}

export default function useEntryPageNavigation(
  topId: string,
  navSections: readonly EntryNavSection[],
): EntryPageNavigation {
  const sectionIds = useMemo(
    () => navSections.map((section) => section.id),
    [navSections],
  )
  const anchorIds = useMemo(
    () => getEntryAnchorIds(topId, navSections),
    [topId, navSections],
  )
  const sectionByAnchor = useMemo(
    () => getEntrySectionByAnchor(navSections),
    [navSections],
  )
  const { openSections, toggleSection, openSection } =
    useEntrySectionState(sectionIds)
  const { activeId, selectActiveSection } = useActiveSection(anchorIds)
  const history = useHistory()
  const location = useLocation()
  const selectedId = useMemo(() => {
    const hashId = decodeURIComponent(location.hash.replace(/^#/, ''))
    return hashId || null
  }, [location.hash])

  useEffect(() => {
    if (!selectedId) {
      return
    }
    const sectionId = sectionByAnchor[selectedId]
    if (sectionId) {
      openSection(sectionId)
    }
    selectActiveSection(selectedId)
    scrollToSection(selectedId)
  }, [location, selectedId, sectionByAnchor, openSection, selectActiveSection])

  const navigateToSection = useCallback(
    (id: string): void => {
      history.push({
        pathname: location.pathname,
        search: location.search,
        hash: `#${id}`,
      })
    },
    [history, location.pathname, location.search],
  )

  return {
    openSections,
    toggleSection,
    activeId,
    selectedId,
    navigateToSection,
  }
}
