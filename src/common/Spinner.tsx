import React from 'react'
import { Spinner as BootstrapSpinner } from 'react-bootstrap'

type Props = {
  loading: boolean
  children?: React.ReactNode
}

export default function Spinner({
  loading,
  children,
}: Props): JSX.Element | null {
  return loading ? (
    <>
      <BootstrapSpinner
        className="mr-2"
        aria-label="Spinner"
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
      />
      {children || ' Loading...'}
    </>
  ) : null
}
Spinner.defaultProps = {
  loading: true,
}
