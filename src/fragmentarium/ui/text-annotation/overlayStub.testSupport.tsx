import React from 'react'

type OverlayStubProps = {
  children:
    | React.ReactNode
    | ((props: Record<string, unknown>) => React.ReactNode)
  show?: boolean
}

export function reactBootstrapWithVisibleOverlay(): Record<string, unknown> {
  const actual = jest.requireActual('react-bootstrap')
  return {
    ...actual,
    Overlay: ({ children, show }: OverlayStubProps) => {
      if (!show) {
        return null
      }

      if (typeof children === 'function') {
        return <>{children({})}</>
      }

      return <>{children}</>
    },
  }
}
