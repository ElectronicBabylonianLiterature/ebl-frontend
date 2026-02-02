import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Promise from 'bluebird'
import ErrorAlert from 'common/ErrorAlert'
import Spinner from 'common/Spinner'
import { createFragmentUrl } from './FragmentLink'
import usePromiseEffect from 'common/usePromiseEffect'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

type Props = {
  query: () => Promise<FragmentInfo>
  children?: React.ReactNode
}

function FragmentButton({ query, children }: Props) {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [setPromise, cancelPromise] = usePromiseEffect()

  const onError = (error) => {
    setIsLoading(false)
    setError(error)
  }

  const navigateToFragment = (fragmentInfo) =>
    navigate(createFragmentUrl(fragmentInfo.number))

  const handleClick = (event) => {
    cancelPromise()
    setIsLoading(true)
    setError(null)
    const request = query()
    setPromise(request)
    request.then(navigateToFragment).catch(onError)
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
