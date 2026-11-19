import { useMemo, useRef } from 'react'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

export interface MapCameraOwnership {
  readonly claim: () => () => boolean
  readonly capture: () => () => boolean
  readonly shouldFitData: () => boolean
}

export default function useMapCameraOwnership(
  provenances: readonly ProvenanceRecord[] | null,
): MapCameraOwnership {
  const latestData = useRef(provenances)
  latestData.current = provenances
  const request = useRef<{ data: typeof provenances }>()

  return useMemo(() => {
    const capture = () => {
      const owner = request.current
      const data = latestData.current
      return () => request.current === owner && latestData.current === data
    }
    return {
      capture,
      claim: () => {
        request.current = { data: latestData.current }
        return capture()
      },
      shouldFitData: () => request.current?.data !== latestData.current,
    }
  }, [])
}
