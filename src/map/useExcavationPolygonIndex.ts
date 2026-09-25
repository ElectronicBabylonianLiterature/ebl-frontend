import { useEffect, useState } from 'react'
import {
  type ExcavationPolygonIndex,
  fetchExcavationPolygonIndex,
} from 'map/excavationPolygonIndex'

export interface ExcavationPolygonIndexState {
  readonly index: ExcavationPolygonIndex
  readonly isLoaded: boolean
  readonly error: Error | null
}

const EMPTY_INDEX: ExcavationPolygonIndex = new Map()

function asError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason))
}

export default function useExcavationPolygonIndex(): ExcavationPolygonIndexState {
  const [state, setState] = useState<ExcavationPolygonIndexState>({
    index: EMPTY_INDEX,
    isLoaded: false,
    error: null,
  })

  useEffect(() => {
    let ignore = false

    fetchExcavationPolygonIndex()
      .then((index) => {
        if (!ignore) setState({ index, isLoaded: true, error: null })
      })
      .catch((reason: unknown) => {
        if (!ignore) {
          setState({
            index: EMPTY_INDEX,
            isLoaded: true,
            error: asError(reason),
          })
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  return state
}
