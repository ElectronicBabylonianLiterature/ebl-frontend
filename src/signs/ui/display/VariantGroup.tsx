import React from 'react'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import SignImage from 'signs/ui/display/SignImage'
import { formatFormLabel } from 'signs/ui/display/signImageGrouping'

export default function VariantGroup({
  form,
  centroid,
  variants,
}: {
  form: string
  centroid?: CroppedAnnotation
  variants: CroppedAnnotation[]
}): JSX.Element {
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
