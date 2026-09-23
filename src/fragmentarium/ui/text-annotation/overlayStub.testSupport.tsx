import React from 'react'

type OverlayStubProps = {
  children: React.ReactNode
  show?: boolean
}

export function reactBootstrapWithVisibleOverlay(): Record<string, unknown> {
  const actual = jest.requireActual('react-bootstrap')
  return {
    ...actual,
    Overlay: ({ children, show }: OverlayStubProps) =>
      show ? <>{children}</> : null,
  }
}
