import React from 'react'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import SignImages, {
  sortScriptsByPeriod,
  sortVariants,
} from 'signs/ui/display/SignImages'
import { MemoryRouter } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import userEvent from '@testing-library/user-event'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'

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

describe('Sign Images edge cases', () => {
  function annotationWith(
    overrides: Partial<CroppedAnnotation>,
  ): CroppedAnnotation {
    return { ...croppedAnnotations[0], ...overrides }
  }

  async function renderWith(annotations: CroppedAnnotation[]): Promise<void> {
    signService.getCentroidImages.mockReturnValue(Bluebird.resolve(annotations))
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
  }

  it('shows an unrecognised form label unchanged', async () => {
    await renderWith([
      annotationWith({
        annotationId: 'odd-form',
        pcaClustering: {
          ...croppedAnnotations[0].pcaClustering,
          form: 'unclustered',
        },
      } as Partial<CroppedAnnotation>),
    ])

    expect(screen.getByTitle('unclustered')).toBeInTheDocument()
  })

  it('keeps the centroids when no annotation carries a cluster', async () => {
    await renderWith([
      annotationWith({
        annotationId: 'no-cluster',
        script: 'MA',
        pcaClustering: undefined,
      }),
    ])

    await userEvent.click(
      screen.getByRole('button', { name: /Middle Assyrian/ }),
    )

    expect(signService.getClusterVariants).not.toHaveBeenCalled()
  })

  it('does not refetch the variants when a period is reopened', async () => {
    signService.getClusterVariants.mockReturnValue(
      Bluebird.resolve([annotationWith({ script: 'MA' })]),
    )
    await renderWith([annotationWith({ script: 'MA' })])
    const period = screen.getByRole('button', { name: /Middle Assyrian/ })

    await userEvent.click(period)
    await userEvent.click(period)
    await userEvent.click(period)

    expect(signService.getClusterVariants).toHaveBeenCalledTimes(1)
  })
})

describe('sortScriptsByPeriod', () => {
  it('orders the scripts by their period, unclassified last', () => {
    expect(
      sortScriptsByPeriod({ '': [1], MA: [2], NA: [3] }).map(
        ([script]) => script,
      ),
    ).toEqual(['MA', 'NA', ''])
  })

  it('refuses a script that is not a known period', () => {
    expect(() => sortScriptsByPeriod({ XX: [1] })).toThrow(
      'XX has to be one of',
    )
  })
})

describe('Sign Images optional annotation data', () => {
  const base = croppedAnnotations[0]

  async function renderWithAnnotations(
    annotations: CroppedAnnotation[],
  ): Promise<void> {
    signService.getCentroidImages.mockReturnValue(Bluebird.resolve(annotations))
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
  }

  it('renders an annotation without a label', async () => {
    await renderWithAnnotations([
      { ...base, label: undefined as unknown as string },
    ])

    expect(screen.getByTitle('Canonical 1')).toBeInTheDocument()
  })

  it.each([
    ['canonical', 'Canonical'],
    ['variant', 'Variant'],
  ])('titles the unnumbered %s form "%s"', async (form, title) => {
    await renderWithAnnotations([
      {
        ...base,
        pcaClustering: { ...base.pcaClustering, form },
      } as CroppedAnnotation,
    ])

    expect(screen.getByTitle(title)).toBeInTheDocument()
  })

  it('keeps the annotations of a cluster whose variants fail to load', async () => {
    signService.getClusterVariants.mockReturnValue(Bluebird.resolve([]))
    await renderWithAnnotations([
      { ...base, script: 'MA' },
      {
        ...base,
        annotationId: 'no-cluster',
        script: 'MA',
        pcaClustering: undefined,
      },
    ])

    await userEvent.click(
      screen.getByRole('button', { name: /Middle Assyrian/ }),
    )

    expect(signService.getClusterVariants).toHaveBeenCalledTimes(1)
  })

  it('shows the date of an annotation that has one, sorted first', async () => {
    const dated = {
      ...base,
      annotationId: 'dated',
      date: mesopotamianDateFactory.build(),
    }
    await renderWithAnnotations([dated])

    expect(screen.getByTitle('Canonical 1')).toBeInTheDocument()
    expect(sortVariants([base, dated])[0]).toBe(dated)
  })

  it('labels a group whose form is blank', async () => {
    signService.getClusterVariants.mockReturnValue(Bluebird.resolve([]))
    await renderWithAnnotations([
      {
        ...base,
        script: 'MA',
        pcaClustering: { ...base.pcaClustering, form: '' },
      } as CroppedAnnotation,
    ])

    await userEvent.click(
      screen.getByRole('button', { name: /Middle Assyrian/ }),
    )

    expect(await screen.findByText('Unknown form:')).toBeInTheDocument()
  })
})
