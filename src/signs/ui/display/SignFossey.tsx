import React, { useLayoutEffect, useRef, useState } from 'react'
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

// Counts how many items fit in the first `maxRows` rows of a wrapping grid.
function useItemsInRows(
  container: React.RefObject<HTMLElement>,
  itemCount: number,
  maxRows: number,
): number {
  const [count, setCount] = useState(itemCount)
  useLayoutEffect(() => {
    const element = container.current
    if (!element) {
      return
    }
    const measure = (): void => {
      const tops: number[] = []
      for (const child of Array.from(element.children) as HTMLElement[]) {
        if (!tops.includes(child.offsetTop)) {
          tops.push(child.offsetTop)
        }
        if (tops.length > maxRows) {
          setCount(Array.from(element.children).indexOf(child))
          return
        }
      }
      setCount(itemCount)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [container, itemCount, maxRows])
  return count
}

function FosseyCard({ fossey }: { fossey: Fossey }): JSX.Element {
  const label = `${fossey.number}${fossey.suffix ?? ''}`
  return (
    <figure className="SignPage__fossey-card">
      <div className="SignPage__fossey-image">
        <img
          src={`data:image/png;base64, ${fossey.sign}`}
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
  const container = useRef<HTMLUListElement>(null)
  const [expanded, setExpanded] = useState(false)
  const fitting = useItemsInRows(container, fosseys.length, fosseyMaxRows)
  const hasMore = fitting < fosseys.length
  return (
    <>
      <ul className="SignPage__fossey-cards" ref={container}>
        {fosseys.map((fossey, index) => (
          <li
            key={`${fossey.number}${fossey.suffix ?? ''}`}
            hidden={!expanded && index >= fitting}
          >
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
