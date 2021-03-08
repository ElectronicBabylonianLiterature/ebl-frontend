import React, { DetailedHTMLProps, ReactNode } from 'react'

export default function ExternalLink({
  children,
  ...props
}: { children: ReactNode } & DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>): JSX.Element {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
