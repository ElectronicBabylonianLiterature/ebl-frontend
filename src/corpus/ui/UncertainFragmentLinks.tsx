import React, { useEffect, useRef, useState } from 'react'
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

interface LookupSnapshot {
  key: string
  service: Props['fragmentService']
  values: ReadonlyMap<string, LookupResult>
}

export default function UncertainFragmentLinks({
  uncertainFragments,
  fragmentService,
}: Props): JSX.Element {
  const [results, setResults] = useState<LookupSnapshot>()
  const completed = useRef<LookupSnapshot>()
  const [retry, setRetry] = useState(0)
  const key = JSON.stringify(
    uncertainFragments.map(({ museumNumber }) => museumNumber),
  )
  useEffect(() => {
    const controller = new AbortController()
    const previous = completed.current
    const values = new Map(
      previous?.key === key && previous.service === fragmentService
        ? previous.values
        : [],
    )
    completed.current = { key, service: fragmentService, values }
    const numbers = _.uniq(JSON.parse(key) as string[]).filter(
      (number) => values.get(number)?.error !== null,
    )
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
          values.set(museumNumber, result)
          setResults({ key, service: fragmentService, values: new Map(values) })
        })
    })
    return () => controller.abort()
  }, [key, fragmentService, retry])
  const values =
    results?.key === key && results.service === fragmentService
      ? results.values
      : undefined
  const errors = [...(values?.values() ?? [])].flatMap(({ error }) =>
    error ? [error] : [],
  )
  const error =
    errors.length > 1
      ? new Error(
          `${errors.length} fragment lookups failed. ${errors[0].message}`,
        )
      : (errors[0] ?? null)
  return (
    <>
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
            </li>
          )
        })}
      </ul>
      <ErrorAlert
        error={error}
        onRetry={() => setRetry((attempt) => attempt + 1)}
      />
    </>
  )
}
