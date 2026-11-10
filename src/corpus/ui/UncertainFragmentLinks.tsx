import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import type { UncertainFragment } from 'corpus/domain/text'
import FragmentariumLink from 'corpus/ui/FragmentariumLink'
import type FragmentService from 'fragmentarium/application/FragmentService'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import ErrorAlert from 'common/errors/ErrorAlert'

const fragmentExistenceLimiter = new ConcurrencyLimiter(4)

type Props = {
  uncertainFragments: readonly UncertainFragment[]
  fragmentService: Pick<FragmentService, 'isInFragmentarium'>
}

interface LookupResult {
  exists: boolean
  error: Error | null
}

export default function UncertainFragmentLinks({
  uncertainFragments,
  fragmentService,
}: Props): JSX.Element {
  const [results, setResults] = useState<{
    key: string
    service: Props['fragmentService']
    values: ReadonlyMap<string, LookupResult>
  }>()
  const [retry, setRetry] = useState(0)
  const key = JSON.stringify(
    uncertainFragments.map(({ museumNumber }) => museumNumber),
  )
  useEffect(() => {
    const controller = new AbortController()
    const numbers = _.uniq(JSON.parse(key) as string[])
    numbers.forEach((museumNumber) => {
      fragmentExistenceLimiter
        .run(
          () =>
            fragmentService.isInFragmentarium(museumNumber, controller.signal),
          controller.signal,
        )
        .then(
          (exists): LookupResult => ({ exists, error: null }),
          (error: Error): LookupResult => ({ exists: false, error }),
        )
        .then((result) => {
          if (controller.signal.aborted) return
          setResults((previous) => {
            const values = new Map(
              previous?.key === key && previous.service === fragmentService
                ? previous.values
                : [],
            )
            values.set(museumNumber, result)
            return { key, service: fragmentService, values }
          })
        })
    })
    return () => controller.abort()
  }, [key, fragmentService, retry])
  const values =
    results?.key === key && results.service === fragmentService
      ? results.values
      : undefined
  return (
    <ul className="list-of-manuscripts__uncertain-fragments">
      {uncertainFragments.map((uncertainFragment, index) => {
        const result = values?.get(uncertainFragment.museumNumber)
        return (
          <li key={`${uncertainFragment.museumNumber}-${index}`}>
            <FragmentariumLink
              item={{
                ...uncertainFragment,
                isInFragmentarium: result?.exists === true,
              }}
            />
            <ErrorAlert
              error={result?.error ?? null}
              onRetry={() => setRetry((attempt) => attempt + 1)}
            />
          </li>
        )
      })}
    </ul>
  )
}
