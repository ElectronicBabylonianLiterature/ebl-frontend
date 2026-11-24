import { useCallback, useEffect, useState } from 'react'
import {
  type ExcavationPolygonIndex,
  fetchExcavationPolygonIndex,
} from 'map/domain/excavationPolygonIndex'

export interface ExcavationPolygonIndexState {
  readonly index: ExcavationPolygonIndex
  readonly isLoaded: boolean
  readonly error: Error | null
  readonly retry: () => void
}

const EMPTY_INDEX: ExcavationPolygonIndex = new Map()

function asError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason))
}

export default function useExcavationPolygonIndex(): ExcavationPolygonIndexState {
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState({
    index: EMPTY_INDEX,
    isLoaded: false,
    error: null as Error | null,
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
  }, [requestVersion])

  const retry = useCallback(() => {
    setState({ index: EMPTY_INDEX, isLoaded: false, error: null })
    setRequestVersion((version) => version + 1)
  }, [])

  return { ...state, retry }
}
