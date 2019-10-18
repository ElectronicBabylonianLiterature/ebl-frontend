import React from 'react'

import { Node } from 'react'
import { Spinner as BootstrapSpinner } from 'react-bootstrap'

type Props = {
  loading: boolean
  children?: Node
}

export default function Spinner({ loading, children }: Props) {
  return (
    loading && (
      <>
        <BootstrapSpinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
        {children || ' Loading...'}
      </>
    )
  )
}
Spinner.defaultProps = {
  loading: true
}
