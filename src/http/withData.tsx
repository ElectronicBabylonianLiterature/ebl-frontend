import React, { useEffect, useRef, useState } from 'react'
import Spinner from 'common/ui/Spinner'
import ErrorAlert from 'common/errors/ErrorAlert'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import { isCancellation } from 'common/utils/abortError'

export type WithoutData<T> = Omit<T, 'data'>

export type WithData<PROPS, DATA> = PROPS & {
  data: DATA
}

export type Config<PROPS, DATA> = {
  watch: (props: PROPS) => unknown[]
  filter: (props: PROPS) => boolean
  defaultData: (props: PROPS) => DATA | null
  retry?: boolean
}

export default function withData<PROPS, GETTER_PROPS, DATA>(
  WrappedComponent: React.ComponentType<WithData<PROPS, DATA>>,
  getter: (props: PROPS & GETTER_PROPS, signal: AbortSignal) => Promise<DATA>,
  config: Partial<Config<PROPS & GETTER_PROPS, DATA>> = {},
): React.ComponentType<PROPS & GETTER_PROPS> {
  const fullConfig: Config<PROPS & GETTER_PROPS, DATA> = {
    watch: () => [],
    filter: () => true,
    defaultData: () => null,
    retry: false,
    ...config,
  }
  return function ComponentWithData(props: PROPS & GETTER_PROPS): JSX.Element {
    const [data, setData] = useState<DATA | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [retryCount, setRetryCount] = useState(0)
    const requestSequence = useRef(0)

    useEffect(
      () => {
        const requestId = requestSequence.current + 1
        requestSequence.current = requestId
        const abortController = new AbortController()
        const isCurrent = (): boolean =>
          requestSequence.current === requestId &&
          !abortController.signal.aborted
        setError(null)
        if (fullConfig.filter(props)) {
          setData(null)
          getter(props, abortController.signal)
            .then((resolvedData) => {
              if (isCurrent()) {
                setData(resolvedData)
              }
            })
            .catch((resolvedError) => {
              if (
                isCurrent() &&
                !isCancellation(resolvedError, abortController.signal)
              ) {
                setError(resolvedError as Error)
              }
            })
        } else {
          setData(fullConfig.defaultData(props))
        }
        return (): void => {
          abortController.abort()
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [...fullConfig.watch(props), retryCount],
    )

    return (
      <ErrorBoundary>
        {!data && !error && (
          <div className="text-center my-5 withData-spinner">
            <Spinner />
          </div>
        )}
        <ErrorAlert
          error={error}
          onRetry={
            fullConfig.retry === true
              ? () =>
                  setRetryCount((currentRetryCount) => currentRetryCount + 1)
              : undefined
          }
        />
        {data && <WrappedComponent data={data} {...props} />}
      </ErrorBoundary>
    )
  }
}
