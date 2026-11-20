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
  const dataVersion = useRef(0)
  if (latestData.current !== provenances) {
    latestData.current = provenances
    dataVersion.current += 1
  }
  const request = useRef<{ dataVersion: number }>()

  return useMemo(() => {
    const capture = () => {
      const owner = request.current
      const version = dataVersion.current
      return () => request.current === owner && dataVersion.current === version
    }
    return {
      capture,
      claim: () => {
        request.current = { dataVersion: dataVersion.current }
        return capture()
      },
      shouldFitData: () => request.current?.dataVersion !== dataVersion.current,
    }
  }, [])
}
