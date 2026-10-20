import React from 'react'
import { useLocation } from 'react-router-dom'

export default function LocationDisplay({
  testId = 'location',
}: {
  testId?: string
}): JSX.Element {
  const location = useLocation()
  return (
    <div data-testid={testId}>
      {location.pathname}
      {location.search}
      {location.hash}
    </div>
  )
}
