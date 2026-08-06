import React from 'react'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import SignService from 'signs/application/SignService'
import SignImages from 'signs/ui/display/SignImages'
import { MemoryRouter } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const signName = 'signName'
const imageString =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='

const croppedAnnotations: CroppedAnnotation[] = [
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

function renderSignImages() {
  render(
    <MemoryRouter>
      <SignImages signName={signName} signService={signService} />
    </MemoryRouter>,
  )
}

describe('Sign Images Empty', () => {
  async function setup(): Promise<void> {
    signService.getCentroidImages.mockReturnValue(Promise.resolve([]))
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
    expect(signService.getCentroidImages).toBeCalledWith(
      signName,
      expect.any(AbortSignal),
    )
  }

  it('Check there are no Images', async () => {
    await setup()
    croppedAnnotations.forEach((croppedAnnotation) => {
      expect(
        screen.queryByText(croppedAnnotation.fragmentNumber),
      ).not.toBeInTheDocument()
    })
  })
})
