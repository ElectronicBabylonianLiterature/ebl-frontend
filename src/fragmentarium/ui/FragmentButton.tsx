import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from 'common/errors/ErrorAlert'
import Spinner from 'common/ui/Spinner'
import { createFragmentUrl } from './FragmentLink'
import usePromiseEffect from 'common/hooks/usePromiseEffect'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

type Props = {
  query: (signal?: AbortSignal) => Promise<FragmentInfo>
  children?: React.ReactNode
}

function FragmentButton({ query, children }: Props) {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [runRequest] = usePromiseEffect()

  const onError = (error) => {
    setIsLoading(false)
    setError(error)
  }

  const navigateToFragment = (fragmentInfo) =>
    navigate(createFragmentUrl(fragmentInfo.number))

  const handleClick = (event) => {
    setIsLoading(true)
    setError(null)
    runRequest((signal) =>
      query(signal)
        .then((fragmentInfo) => {
          if (!signal.aborted) {
            navigateToFragment(fragmentInfo)
          }
        })
        .catch((error) => {
          if (!signal.aborted) {
            onError(error)
          }
        }),
    )
  }

  return (
    <>
      <Button className="m-1" variant="primary" onClick={handleClick}>
        {isLoading ? <Spinner /> : children}
      </Button>
      <ErrorAlert error={error} />
    </>
  )
}

export default FragmentButton
