import React from 'react'

type FigureSide = 'Left' | 'Right'

export default function AboutFigure({
  side,
  width,
  src,
  alt,
  children,
}: {
  side: FigureSide
  width: string
  src: string
  alt: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <figure className={`Introduction__photo${side}`}>
      <img className={`Introduction__${width}`} src={src} alt={alt} />
      <figcaption className="Introduction__caption">{children}</figcaption>
    </figure>
  )
}
