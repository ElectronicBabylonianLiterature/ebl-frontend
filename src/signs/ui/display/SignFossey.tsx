import React, { useLayoutEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { Button } from 'react-bootstrap'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Fossey } from 'signs/domain/Sign'

export const fosseyMaxRows = 3

export interface FosseyRange {
  readonly first: number
  readonly last: number
}

export function groupFossey(fosseys: readonly Fossey[]): {
  withImages: readonly Fossey[]
  ranges: readonly FosseyRange[]
} {
  const sorted = _.sortBy(fosseys, (fossey) => fossey.number)
  const ranges: FosseyRange[] = []
  sorted
    .filter((fossey) => fossey.sign === '')
    .forEach(({ number }) => {
      const last = ranges[ranges.length - 1]
      if (last && number <= last.last + 1) {
        ranges[ranges.length - 1] = { first: last.first, last: number }
      } else {
        ranges.push({ first: number, last: number })
      }
    })
  return {
    withImages: sorted.filter((fossey) => fossey.sign !== ''),
    ranges,
  }
}

function gridColumnCount(element: HTMLElement): number | null {
  const tracks = window
    .getComputedStyle(element)
    .gridTemplateColumns.split(' ')
    .filter((track) => track !== '' && track !== 'none')
  return tracks.length > 0 ? tracks.length : null
}

function useGridColumns(element: HTMLElement | null): number | null {
  const [columns, setColumns] = useState<number | null>(null)
  useLayoutEffect(() => {
    if (element === null) {
      return
    }
    const measure = (): void => setColumns(gridColumnCount(element))
    measure()
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return columns
}

function FosseyCard({ fossey }: { fossey: Fossey }): JSX.Element {
  const label = `${fossey.number}${fossey.suffix ?? ''}`
  return (
    <figure className="SignPage__fossey-card">
      <div className="SignPage__fossey-image">
        <img
          src={`data:image/png;base64,${fossey.sign}`}
          alt={`Fossey ${label}`}
        />
      </div>
      <figcaption className="SignPage__fossey-caption">
        <span className="SignPage__fossey-number">
          <strong>{label}</strong>
          {fossey.page > 0 && (
            <span className="SignPage__fossey-muted">p. {fossey.page}</span>
          )}
        </span>
        {fossey.reference && <span>{fossey.reference}</span>}
        {fossey.museumNumber && (
          <span>
            (={' '}
            <Link to={`/library/${museumNumberToString(fossey.museumNumber)}`}>
              {museumNumberToString(fossey.museumNumber)}
            </Link>
            )
          </span>
        )}
        {fossey.date && (
          <span className="SignPage__fossey-muted">({fossey.date})</span>
        )}
      </figcaption>
    </figure>
  )
}

function FosseyCards({ fosseys }: { fosseys: readonly Fossey[] }): JSX.Element {
  const [container, setContainer] = useState<HTMLUListElement | null>(null)
  const [expanded, setExpanded] = useState(false)
  const columns = useGridColumns(container)
  const fitting =
    columns === null
      ? fosseys.length
      : Math.min(fosseys.length, columns * fosseyMaxRows)
  const hasMore = fitting < fosseys.length
  return (
    <>
      <ul className="SignPage__fossey-cards" ref={setContainer}>
        {fosseys.slice(0, expanded ? fosseys.length : fitting).map((fossey) => (
          <li key={`${fossey.page}-${fossey.number}${fossey.suffix ?? ''}`}>
            <FosseyCard fossey={fossey} />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="SignPage__show-more">
          <Button
            variant="outline-primary"
            size="sm"
            aria-expanded={expanded}
            onClick={(): void => setExpanded(!expanded)}
          >
            {expanded
              ? 'Show less'
              : `Show more (${fosseys.length - fitting} more)`}
          </Button>
        </div>
      )}
    </>
  )
}

export function fosseySummary(total: number, withImages: number): string {
  if (withImages === 0) {
    return `${total} number${total === 1 ? '' : 's'} · no sign images available`
  }
  return withImages === total
    ? `${total} form${total === 1 ? '' : 's'}, all with sign images`
    : `${total} numbers · ${withImages} with sign images; the others are grouped into ranges below`
}

export default function FosseyDisplay({
  fosseys,
}: {
  fosseys: readonly Fossey[]
}): JSX.Element {
  const { withImages, ranges } = groupFossey(fosseys)
  return (
    <>
      <p className="SignPage__note">
        {fosseySummary(fosseys.length, withImages.length)}
      </p>
      {withImages.length > 0 && <FosseyCards fosseys={withImages} />}
      {ranges.length > 0 && (
        <ul className="SignPage__fossey-ranges">
          {ranges.map(({ first, last }) => (
            <li key={first} className="SignPage__fossey-range">
              <strong>{first === last ? first : `${first} – ${last}`}</strong>
              <span>
                {last - first + 1} number{last === first ? '' : 's'} · no sign
                image
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
