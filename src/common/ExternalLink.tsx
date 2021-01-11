import React from 'react'

export default function ExternalLink({ children, ...props }): JSX.Element {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
