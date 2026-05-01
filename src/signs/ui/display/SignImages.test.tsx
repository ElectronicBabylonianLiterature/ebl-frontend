import React from 'react'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import SignImages from 'signs/ui/display/SignImages'
import { MemoryRouter } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import userEvent from '@testing-library/user-event'

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

describe('Sign Images', () => {
  async function setup(): Promise<void> {
    signService.getCentroidImages.mockReturnValue(
      Bluebird.resolve(croppedAnnotations),
    )
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
    expect(signService.getCentroidImages).toBeCalledWith(signName)
  }

  it('Displays centroid preview labels while accordions are closed', async () => {
    await setup()

    expect(screen.getByTitle('Canonical 1')).toBeInTheDocument()
    expect(screen.getByTitle('Variant 1')).toBeInTheDocument()
  })

  it('Displays preview image for unclassified sign', async () => {
    await setup()

    expect(screen.getByTitle('Canonical 1')).toHaveAttribute(
      'src',
      `data:image/png;base64, ${croppedAnnotations[0].image}`,
    )
  })

  it('Displays preview image for classified sign', async () => {
    await setup()

    expect(screen.getByTitle('Variant 1')).toHaveAttribute(
      'src',
      `data:image/png;base64, ${croppedAnnotations[1].image}`,
    )
  })

  it('Fetches cluster variants when a period accordion is opened', async () => {
    signService.getClusterVariants.mockReturnValue(
      Bluebird.resolve([
        {
          ...croppedAnnotations[1],
          annotationId: 'variant-annotation',
          fragmentNumber: 'K.6402',
          pcaClustering: {
            clusterId: 'cluster-2',
            clusterRank: 1,
            form: 'variant1',
            isCentroid: false,
            clusterSize: 2,
            isMain: true,
          },
        },
      ]),
    )

    await setup()

    await userEvent.click(
      screen.getByRole('button', {
        name: /Middle Assyrian/,
      }),
    )

    expect(signService.getClusterVariants).toHaveBeenCalledWith(
      signName,
      'cluster-2',
      'MA',
    )

    expect(await screen.findByText('K.6402')).toBeInTheDocument()
  })
})

describe('Sign Images Empty', () => {
  async function setup(): Promise<void> {
    signService.getCentroidImages.mockReturnValue(Bluebird.resolve([]))
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
    expect(signService.getCentroidImages).toBeCalledWith(signName)
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
