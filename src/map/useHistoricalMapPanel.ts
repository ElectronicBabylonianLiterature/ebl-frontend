import { useCallback, useMemo, useState } from 'react'
import {
  type HistoricalMapOverlayGroup,
  type HistoricalMapOverlaySeries,
  groupHistoricalMapOverlaySeries,
  groupHistoricalMapOverlaysBySite,
  validatedHistoricalMapOverlays,
} from './historicalOverlays'

export interface HistoricalMapPanel {
  readonly groups: readonly HistoricalMapOverlayGroup[]
  readonly series: readonly HistoricalMapOverlaySeries[]
  readonly filter: string
  readonly expandedSiteIds: ReadonlySet<string>
  readonly setFilter: (filter: string) => void
  readonly setExpandedSiteIds: React.Dispatch<React.SetStateAction<Set<string>>>
  readonly findSeries: (
    seriesId: string,
  ) => HistoricalMapOverlaySeries | undefined
  readonly browseSite: (siteName: string) => void
}

export default function useHistoricalMapPanel(): HistoricalMapPanel {
  const [filter, setFilter] = useState('')
  const [expandedSiteIds, setExpandedSiteIds] = useState(
    () => new Set<string>(),
  )

  const groups = useMemo(
    () => groupHistoricalMapOverlaysBySite(validatedHistoricalMapOverlays),
    [],
  )
  const series = useMemo(
    () => groupHistoricalMapOverlaySeries(validatedHistoricalMapOverlays),
    [],
  )

  const findSeries = useCallback(
    (seriesId: string) => series.find((entry) => entry.seriesId === seriesId),
    [series],
  )

  const browseSite = useCallback(
    (siteName: string) => {
      setFilter(siteName)

      const siteGroup = groups.find(
        (group) => group.siteName.toLowerCase() === siteName.toLowerCase(),
      )
      if (siteGroup) {
        setExpandedSiteIds((current) => new Set([...current, siteGroup.siteId]))
      }
    },
    [groups],
  )

  return {
    groups,
    series,
    filter,
    expandedSiteIds,
    setFilter,
    setExpandedSiteIds,
    findSeries,
    browseSite,
  }
}
