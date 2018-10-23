import React from 'react'
import { Link } from 'react-router-dom'

function createUrl (number) {
  // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
  return `/fragmentarium/${encodeURIComponent(encodeURIComponent(number))}`
}

function FragmentLink ({ number, children, ...props }) {
  return (
    <Link to={createUrl(number)} {...props}>
      {children}
    </Link>
  )
}

export default FragmentLink
