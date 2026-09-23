import { screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Bluebird from 'bluebird'
import {
  sortScriptsByPeriod,
  sortVariants,
} from 'signs/ui/display/signImageGrouping'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import userEvent from '@testing-library/user-event'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'
import {
  croppedAnnotations,
  renderSignImages,
  signService,
} from 'signs/ui/display/signImages.testSupport'

jest.mock('signs/application/SignService')

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
