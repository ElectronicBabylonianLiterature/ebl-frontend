import React from 'react'

export default function Spinner ({ loading, children }) {
  return (loading || loading === undefined) && (
    <span>
      <i className='fa fa-spinner fa-spin' />
      {children || 'Loading...'}
    </span>
  )
}
