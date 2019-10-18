import React, { useState, useEffect } from 'react'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import ErrorBoundary from 'common/ErrorBoundary'

const defaultConfig = {
  watch: () => [],
  filter: () => true,
  defaultData: null
}

export default function withData(WrappedComponent, getter, config = {}) {
  const fullConfig = {
    ...defaultConfig,
    ...config
  }
  return function(props) {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(
      () => {
        let fetchPromise
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
