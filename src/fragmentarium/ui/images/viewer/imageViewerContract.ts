import { ReactNode } from 'react'

export interface ViewerZoomControls {
  readonly zoomIn: () => void
  readonly zoomOut: () => void
  readonly reset: () => void
}

export interface ImageRendererProps {
  readonly imageUrl?: string
  readonly alt: string
  readonly renderToolbar: (controls: ViewerZoomControls) => ReactNode
}

export type ImageRenderer = (props: ImageRendererProps) => JSX.Element
