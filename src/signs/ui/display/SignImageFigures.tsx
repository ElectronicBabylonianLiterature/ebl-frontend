import React from 'react'
import { Figure } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import DateDisplay from 'chronology/ui/DateDisplay'
import {
  formatFormLabel,
  sortGroupsByClusterRank,
} from 'signs/ui/display/signImageGrouping'
import './SignImages.css'

export function SignImage({
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

export function VariantGroup({
  form,
  centroid,
  variants,
}: {
  form: string
  centroid?: CroppedAnnotation
  variants: CroppedAnnotation[]
}) {
  return (
    <div className="sign-images__variant-group">
      <div className="sign-images__variant-header">
        {formatFormLabel(form)}:
      </div>

      <div className="sign-images__variant-layout">
        <div className="sign-images__variant-representative">
          {centroid && <SignImage croppedAnnotation={centroid} isCentroid />}
        </div>

        <div className="sign-images__variant-examples">
          {variants.length === 0 ? (
            <div className="text-muted">No additional variants</div>
          ) : (
            variants.map((annotation, index) => (
              <div key={index} className="sign-images__variant-example-item">
                <SignImage croppedAnnotation={annotation} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function PeriodPreview({
  annotations,
}: {
  annotations: CroppedAnnotation[]
}): JSX.Element {
  const previewGroups = sortGroupsByClusterRank(annotations)

  return (
    <div className="sign-images__period-preview">
      {previewGroups.map(([clusterId, group]) => {
        const centroid =
          group.find((annotation) => annotation.pcaClustering?.isCentroid) ??
          group[0]

        return (
          <div key={clusterId} className="sign-images__period-preview-item">
            <Figure.Image
              className="sign-images__period-preview-image"
              src={`data:image/png;base64, ${centroid.image}`}
              title={formatFormLabel(
                centroid.pcaClustering?.form || 'Unknown form',
              )}
            />
          </div>
        )
      })}
    </div>
  )
}
