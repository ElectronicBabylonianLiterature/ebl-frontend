import React from 'react'

export default function ExternalLink({
  children,
  ...props
}: {
  children: string
  props: { href: string }
}): JSX.Element {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
