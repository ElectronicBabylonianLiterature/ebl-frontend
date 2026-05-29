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

function renderSignImages(activeSignName: string = signName) {
  render(
    <MemoryRouter>
      <SignImages signName={activeSignName} signService={signService} />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

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
    expect(screen.getByTitle('Variant 2')).toBeInTheDocument()
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
      `data:image/png;base64, ${croppedAnnotations[2].image}`,
    )
  })

  it('Fetches cluster variants when a period accordion is opened', async () => {
    signService.getClusterVariants.mockReturnValue(
      Bluebird.resolve([
        {
          ...croppedAnnotations[2],
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

  it('Shows a warning and keeps centroid fallback when some cluster variants fail', async () => {
    signService.getClusterVariants
      .mockReturnValueOnce(
        Bluebird.resolve([
          {
            ...croppedAnnotations[0],
            annotationId: 'loaded-variant-annotation',
            fragmentNumber: 'K.6403',
            pcaClustering: {
              clusterId: 'cluster-1',
              clusterRank: 0,
              form: 'canonical1',
              isCentroid: false,
              clusterSize: 2,
              isMain: true,
            },
          },
        ]),
      )
      .mockReturnValueOnce(Bluebird.reject(new Error('Failed to load cluster')))

    await setup()

    await userEvent.click(
      screen.getByRole('button', {
        name: /Unclassified/,
      }),
    )

    expect(
      await screen.findByText(
        /Some variants could not be loaded. Showing available centroid data/,
      ),
    ).toBeInTheDocument()

    expect(screen.getByText('K.6403')).toBeInTheDocument()
    expect(screen.getByText('K.6404')).toBeInTheDocument()
  })

  it('Retries loading variants after a failed cluster request', async () => {
    signService.getClusterVariants
      .mockReturnValueOnce(Bluebird.reject(new Error('Failed to load cluster')))
      .mockReturnValueOnce(Bluebird.resolve([]))

    await setup()

    await userEvent.click(
      screen.getByRole('button', {
        name: /Middle Assyrian/,
      }),
    )

    expect(
      await screen.findByText(
        /Some variants could not be loaded. Showing available centroid data/,
      ),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', {
        name: /Middle Assyrian/,
      }),
    )

    expect(signService.getClusterVariants).toHaveBeenCalledTimes(2)
  })

  it('Shows warning and keeps centroid fallback when cluster variants response is empty', async () => {
    signService.getClusterVariants.mockReturnValueOnce(Bluebird.resolve([]))

    await setup()

    await userEvent.click(
      screen.getByRole('button', {
        name: /Middle Assyrian/,
      }),
    )

    expect(
      await screen.findByText(
        /Some variants could not be loaded. Showing available centroid data/,
      ),
    ).toBeInTheDocument()

    expect(screen.getByText('K.6401')).toBeInTheDocument()
    expect(
      screen.getAllByText('No additional variants').length,
    ).toBeGreaterThan(0)
  })
})

describe('Sign Images fallback behavior', () => {
  it('falls back to normalized sign name when first lookup is empty', async () => {
    signService.getImages.mockReturnValueOnce(Bluebird.resolve([]))
    signService.getImages.mockReturnValueOnce(
      Bluebird.resolve(croppedAnnotations),
    )

    renderSignImages('|AN|')
    await waitForSpinnerToBeRemoved(screen)

    expect(signService.getImages).toHaveBeenNthCalledWith(1, '|AN|')
    expect(signService.getImages).toHaveBeenNthCalledWith(2, 'AN')

    await userEvent.click(screen.getByRole('button', { name: 'Unclassified' }))
    expect(screen.getByText(croppedAnnotations[0].fragmentNumber)).toBeVisible()
  })

  it('falls back to normalized sign name when first lookup fails', async () => {
    signService.getImages.mockReturnValueOnce(
      Bluebird.reject(new Error('Lookup failed')),
    )
    signService.getImages.mockReturnValueOnce(
      Bluebird.resolve(croppedAnnotations),
    )

    renderSignImages('|AN|')
    await waitForSpinnerToBeRemoved(screen)

    expect(signService.getImages).toHaveBeenNthCalledWith(1, '|AN|')
    expect(signService.getImages).toHaveBeenNthCalledWith(2, 'AN')

    await userEvent.click(screen.getByRole('button', { name: 'Unclassified' }))
    expect(screen.getByText(croppedAnnotations[0].fragmentNumber)).toBeVisible()
  })

  it('renders unknown script groups without throwing', async () => {
    signService.getImages.mockReturnValue(
      Bluebird.resolve([
        {
          ...croppedAnnotations[0],
          script: 'CUSTOM',
        },
      ]),
    )

    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)

    expect(screen.getByRole('button', { name: 'CUSTOM' })).toBeInTheDocument()
    expect(screen.getByText(croppedAnnotations[0].fragmentNumber)).toBeVisible()
  })

  it('skips rendering entries with missing image payload', async () => {
    signService.getImages.mockReturnValue(
      Bluebird.resolve([
        {
          ...croppedAnnotations[0],
          image: '',
        },
      ]),
    )

    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
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
