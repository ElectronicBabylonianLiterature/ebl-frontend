import React from 'react'

type FigureSide = 'Left' | 'Right'

export default function AboutFigure({
  side,
  width,
  src,
  alt,
  href,
  children,
}: {
  side: FigureSide
  width: string
  src: string
  alt: string
  href?: string
  children: React.ReactNode
}): JSX.Element {
  const image = <img className={`Introduction__${width}`} src={src} alt={alt} />
  return (
    <figure className={`Introduction__photo${side}`}>
      {href ? <a href={href}>{image}</a> : image}
      <figcaption className="Introduction__caption">{children}</figcaption>
    </figure>
  )
}
