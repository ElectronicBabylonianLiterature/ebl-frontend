import React from 'react'
import { Link } from 'react-router-dom'

export function createFragmentUrl (number) {
  // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
  return `/fragmentarium/${encodeURIComponent(encodeURIComponent(number))}`
}

export default function FragmentLink ({ number, children, ...props }) {
  return (
    <Link to={createFragmentUrl(number)} {...props}>
      {children}
    </Link>
  )
}
