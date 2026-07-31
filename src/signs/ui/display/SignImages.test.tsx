import { screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Bluebird from 'bluebird'
import userEvent from '@testing-library/user-event'
import {
  croppedAnnotations,
  renderSignImages,
  signName,
  signService,
} from 'signs/ui/display/signImages.testSupport'

jest.mock('signs/application/SignService')

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
      .mockImplementationOnce(() =>
        Bluebird.reject(new Error('Failed to load cluster')),
      )

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
      .mockImplementationOnce(() =>
        Bluebird.reject(new Error('Failed to load cluster')),
      )
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
