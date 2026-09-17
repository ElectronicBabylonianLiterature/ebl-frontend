import React from 'react'
import { render, screen } from '@testing-library/react'
import PeriodPreview from 'signs/ui/display/PeriodPreview'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import { imageString } from 'signs/ui/display/signImages.testSupport'

function createAnnotation(
  annotationId: string,
  pcaClustering: CroppedAnnotation['pcaClustering'],
): CroppedAnnotation {
  return {
    fragmentNumber: 'K.1',
    image: imageString,
    script: '',
    label: annotationId,
    annotationId,
    pcaClustering,
  }
}

test('A group without a centroid previews its first annotation', () => {
  render(
    <PeriodPreview
      annotations={[
        createAnnotation('annotation-1', {
          clusterId: 'cluster-1',
          clusterRank: 0,
          form: 'canonical',
          isCentroid: false,
          clusterSize: 1,
          isMain: true,
        }),
      ]}
    />,
  )

  expect(screen.getByTitle(/canonical/i)).toBeVisible()
})

test('A group without a form falls back to an unknown-form label', () => {
  render(
    <PeriodPreview
      annotations={[
        createAnnotation('annotation-2', {
          clusterId: 'cluster-2',
          clusterRank: 0,
          form: '',
          isCentroid: true,
          clusterSize: 1,
          isMain: true,
        }),
      ]}
    />,
  )

  expect(screen.getByTitle(/unknown form/i)).toBeVisible()
})
