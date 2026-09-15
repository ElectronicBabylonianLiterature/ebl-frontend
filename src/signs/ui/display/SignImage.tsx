import React from 'react'
import { Figure } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import DateDisplay from 'chronology/ui/DateDisplay'

export default function SignImage({
  croppedAnnotation,
  isCentroid = false,
}: {
  croppedAnnotation: CroppedAnnotation
  isCentroid?: boolean
}): JSX.Element {
  const label = croppedAnnotation.label ?? ''

  return (
    <div className={isCentroid ? 'sign-images__centroid-col' : undefined}>
      <Figure className={isCentroid ? 'sign-images__centroid' : undefined}>
        <Figure.Image
          className={'sign-images__sign-image'}
          src={`data:image/png;base64, ${croppedAnnotation.image}`}
        />
        <Figure.Caption>
          <Link to={`/library/${croppedAnnotation.fragmentNumber}`}>
            {croppedAnnotation.fragmentNumber}&nbsp;
          </Link>
          {label}
          {croppedAnnotation.date && (
            <DateDisplay date={croppedAnnotation.date} />
          )}
          {croppedAnnotation.provenance && (
            <span className="provenance">{`${croppedAnnotation.provenance}`}</span>
          )}
        </Figure.Caption>
      </Figure>
    </div>
  )
}
