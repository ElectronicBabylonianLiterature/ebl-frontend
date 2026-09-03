import { useEffect, useState } from 'react'
import {
  type ExcavationPolygonIndex,
  fetchExcavationPolygonIndex,
} from 'map/excavationPolygonIndex'

export interface ExcavationPolygonIndexState {
  readonly index: ExcavationPolygonIndex
  readonly isLoaded: boolean
}

const EMPTY_INDEX: ExcavationPolygonIndex = new Map()

export default function useExcavationPolygonIndex(): ExcavationPolygonIndexState {
  const [index, setIndex] = useState<ExcavationPolygonIndex>(EMPTY_INDEX)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let ignore = false

    fetchExcavationPolygonIndex()
      .then((fetchedIndex) => {
        if (!ignore) {
          setIndex(fetchedIndex)
          setIsLoaded(true)
        }
      })
      .catch(() => {
        if (!ignore) setIsLoaded(true)
      })

    return () => {
      ignore = true
    }
  }, [])

  return { index, isLoaded }
}
