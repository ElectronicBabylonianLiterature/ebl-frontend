import { useEffect, useState } from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

export interface ProvenancesState {
  provenances: readonly ProvenanceRecord[] | null
  error: string | null
}

export default function useProvenances(
  fragmentService: FragmentService,
): ProvenancesState {
  const [provenances, setProvenances] = useState<
    readonly ProvenanceRecord[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    fragmentService
      .fetchProvenances()
      .then((fetchedProvenances) => {
        if (!ignore) {
          setProvenances(fetchedProvenances)
        }
      })
      .catch((fetchError: Error) => {
        if (!ignore) {
          setError(fetchError.message)
        }
      })

    return () => {
      ignore = true
    }
  }, [fragmentService])

  return { provenances, error }
}
