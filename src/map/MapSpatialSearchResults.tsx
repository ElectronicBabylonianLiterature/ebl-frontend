import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { findspotLabel } from 'map/findspotLabel'
import type { FindspotMapData } from 'map/findspotMapData'
import { buildFindspotFragmentSearchLink } from 'map/mapLinks'

const FINDSPOTS_PER_PAGE = 25

interface Props {
  readonly findspotIds: readonly number[]
  readonly findspots: readonly FindspotMapData[]
}

export default function MapSpatialSearchResults({
  findspotIds,
  findspots,
}: Props): JSX.Element {
  const resultsKey = useMemo(() => JSON.stringify(findspotIds), [findspotIds])
  const [pagination, setPagination] = useState({ resultsKey, page: 0 })
  const [focusedFindspotId, setFocusedFindspotId] = useState<number | null>(
    null,
  )
  let page = pagination.page
  if (pagination.resultsKey !== resultsKey) {
    const focusedIndex =
      focusedFindspotId === null ? -1 : findspotIds.indexOf(focusedFindspotId)
    page = focusedIndex < 0 ? 0 : Math.floor(focusedIndex / FINDSPOTS_PER_PAGE)
    setPagination({ resultsKey, page })
    if (focusedIndex < 0) setFocusedFindspotId(null)
  }
  const focusRequested = useRef(false)
  const firstResultRef = useCallback((node: HTMLAnchorElement | null): void => {
    if (node && focusRequested.current) {
      focusRequested.current = false
      node.focus()
    }
  }, [])
  const findspotsById = useMemo(
    () => new Map(findspots.map((findspot) => [findspot.findspotId, findspot])),
    [findspots],
  )
  const start = page * FINDSPOTS_PER_PAGE
  const end = Math.min(start + FINDSPOTS_PER_PAGE, findspotIds.length)
  const changePage = (next: number): void => {
    focusRequested.current = true
    setPagination({ resultsKey, page: next })
  }

  return (
    <>
      {findspotIds.length > FINDSPOTS_PER_PAGE ? (
        <p
          className="map-tool-panel__note"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {start + 1}–{end} of {findspotIds.length} mapped findspots.
        </p>
      ) : null}
      <ul className="map-tool-panel__findspots">
        {findspotIds.slice(start, end).map((id, index) => (
          <li key={id}>
            <Link
              ref={index === 0 ? firstResultRef : undefined}
              to={buildFindspotFragmentSearchLink(id)}
              onFocus={() => setFocusedFindspotId(id)}
              onBlur={() => setFocusedFindspotId(null)}
            >
              Tablets from {findspotLabel(findspotsById.get(id) ?? {})}
            </Link>
          </li>
        ))}
      </ul>
      {findspotIds.length > FINDSPOTS_PER_PAGE ? (
        <div
          className="map-tool-panel__actions"
          role="group"
          aria-label="Findspot result pages"
        >
          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            disabled={page === 0}
            onClick={() => changePage(page - 1)}
          >
            Previous findspots
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            disabled={end === findspotIds.length}
            onClick={() => changePage(page + 1)}
          >
            Next findspots
          </Button>
        </div>
      ) : null}
    </>
  )
}
