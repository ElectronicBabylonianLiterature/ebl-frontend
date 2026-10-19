import React from 'react'
import { render, screen } from '@testing-library/react'
import SignService from 'signs/application/SignService'
import SignImages from 'signs/ui/display/SignImages'
import { MemoryRouter } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('signs/application/SignService')

export const signService = new (SignService as jest.Mock<
  jest.Mocked<SignService>
>)()
export const signName = 'signName'
export const imageString =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='

export const croppedAnnotations: CroppedAnnotation[] = [
  {
    fragmentNumber: 'K.6400',
    image: imageString,
    script: '',
    provenance: 'ASSUR',
    label: 'label-1',
    annotationId: 'annotation-1',
    pcaClustering: {
      clusterId: 'cluster-1',
      clusterRank: 0,
      form: 'canonical1',
      isCentroid: true,
      clusterSize: 2,
      isMain: true,
    },
  },
  {
    fragmentNumber: 'K.6404',
    image: imageString,
    script: '',
    label: 'label-3',
    annotationId: 'annotation-3',
    pcaClustering: {
      clusterId: 'cluster-3',
      clusterRank: 1,
      form: 'variant2',
      isCentroid: true,
      clusterSize: 1,
      isMain: true,
    },
  },
  {
    fragmentNumber: 'K.6401',
    image: imageString,
    script: 'MA',
    label: 'label-2',
    annotationId: 'annotation-2',
    pcaClustering: {
      clusterId: 'cluster-2',
      clusterRank: 1,
      form: 'variant1',
      isCentroid: true,
      clusterSize: 1,
      isMain: true,
    },
  },
]

export function renderSignImages(): void {
  render(
    <MemoryRouter>
      <SignImages signName={signName} signService={signService} />
    </MemoryRouter>,
  )
}

export function createMockSignService(): jest.Mocked<SignService> {
  return new (SignService as jest.Mock<jest.Mocked<SignService>>)()
}

export async function setUpSignImages(
  mockedSignService: jest.Mocked<SignService>,
  centroidImages: CroppedAnnotation[],
): Promise<void> {
  mockedSignService.getCentroidImages.mockReturnValue(
    Promise.resolve(centroidImages),
  )
  render(
    <MemoryRouter>
      <SignImages signName={signName} signService={mockedSignService} />
    </MemoryRouter>,
  )
  await waitForSpinnerToBeRemoved(screen)
  expect(mockedSignService.getCentroidImages).toHaveBeenCalledWith(
    signName,
    expect.any(AbortSignal),
  )
}
