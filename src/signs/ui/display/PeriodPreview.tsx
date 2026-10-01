import React from 'react'
import { Figure } from 'react-bootstrap'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import {
  formatFormLabel,
  sortGroupsByClusterRank,
} from 'signs/ui/display/signImageGrouping'

export default function PeriodPreview({
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
