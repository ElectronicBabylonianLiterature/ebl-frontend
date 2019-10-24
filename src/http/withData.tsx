import React, { useState, useEffect } from 'react'
import Promise from 'bluebird'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import ErrorBoundary from 'common/ErrorBoundary'

type Config<PROPS, DATA> = {
  watch: (props: PROPS) => any[],
  filter: (props: PROPS) => boolean,
  defaultData: DATA | null
}

export default function withData<PROPS, DATA>(
  WrappedComponent: React.ComponentType<PROPS> ,
  getter: (props: PROPS) => Promise<DATA>,
  config: Partial<Config<PROPS, DATA>> = {}
) {
  const fullConfig: Config<PROPS, DATA> = {
    watch: () => [],
    filter: () => true,
    defaultData: null,
    ...config
  }
  return function ComponentWithData(props: PROPS) {
    const [data, setData] = useState<DATA | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(
      () => {
        let fetchPromise: Promise<void>
        setError(null)
        if (fullConfig.filter(props)) {
          setData(null)
          fetchPromise = getter(props)
            .then(setData)
            .catch(setError)
        } else {
          setData(fullConfig.defaultData)
        }
        return () => fetchPromise && fetchPromise.cancel()
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fullConfig.watch(props)
    )

    return (
      <ErrorBoundary>
        <Spinner loading={!data && !error} />
        <ErrorAlert error={error} />
        {data && <WrappedComponent data={data} {...props} />}
      </ErrorBoundary>
    )
  }
}
