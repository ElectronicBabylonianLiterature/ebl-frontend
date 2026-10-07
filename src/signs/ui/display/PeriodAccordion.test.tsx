import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PeriodAccordion from 'signs/ui/display/PeriodAccordion'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import loadClusterAnnotations from 'signs/ui/display/loadClusterAnnotations'
import {
  createMockSignService,
  imageString,
  signName,
} from 'signs/ui/display/signImages.testSupport'

jest.mock('signs/ui/display/loadClusterAnnotations')

const loadClusterAnnotationsMock =
  loadClusterAnnotations as jest.MockedFunction<typeof loadClusterAnnotations>

function createAnnotation(
  pcaClustering: CroppedAnnotation['pcaClustering'],
): CroppedAnnotation {
  return {
    fragmentNumber: 'K.1',
    image: imageString,
    script: '',
    label: 'label-1',
    annotationId: 'annotation-1',
    pcaClustering,
  }
}

function renderAccordion(
  annotations: CroppedAnnotation[],
  overrides: { scriptAbbr?: string; setActivePeriod?: jest.Mock } = {},
): void {
  render(
    <MemoryRouter>
      <PeriodAccordion
        eventKey="0"
        activePeriod="0"
        setActivePeriod={overrides.setActivePeriod ?? jest.fn()}
        scriptAbbr={overrides.scriptAbbr ?? ''}
        croppedAnnotations={annotations}
        signService={createMockSignService()}
        signName={signName}
      />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  loadClusterAnnotationsMock.mockResolvedValue({
    annotations: [],
    hasFailures: false,
  })
})

test('An unclustered group is labelled as ungrouped', () => {
  renderAccordion([createAnnotation(undefined)])

  expect(screen.getByText(/Ungrouped instances/)).toBeVisible()
})

test('A clustered group without a form falls back to an unknown-form label', () => {
  renderAccordion([
    createAnnotation({
      clusterId: 'cluster-1',
      clusterRank: 0,
      form: '',
      isCentroid: true,
      clusterSize: 1,
      isMain: true,
    }),
  ])

  expect(screen.getByText(/Unknown form/)).toBeVisible()
})

test('Annotations already loaded are not fetched again', async () => {
  renderAccordion([createAnnotation(undefined)])
  const header = screen.getByRole('button', { name: /Unclassified/ })

  await userEvent.click(header)
  await waitFor(() =>
    expect(loadClusterAnnotationsMock).toHaveBeenCalledTimes(1),
  )

  await userEvent.click(header)
  await waitFor(() =>
    expect(loadClusterAnnotationsMock).toHaveBeenCalledTimes(1),
  )
})

test('A known script abbreviation is shown as its period name and description', () => {
  renderAccordion([createAnnotation(undefined)], { scriptAbbr: 'NA' })

  expect(screen.getByRole('button', { name: /Neo-Assyrian/ })).toBeVisible()
})

test('Clicking the open period closes it', async () => {
  const setActivePeriod = jest.fn()
  renderAccordion([createAnnotation(undefined)], { setActivePeriod })

  await userEvent.click(screen.getByRole('button', { name: /Unclassified/ }))

  expect(setActivePeriod).toHaveBeenCalledWith(expect.any(Function))
  const toggle = setActivePeriod.mock.calls[0][0] as (
    current: string | null,
  ) => string | null
  expect(toggle('0')).toBeNull()
  expect(toggle('1')).toBe('0')
})

test('A failed variant load shows a warning and keeps the centroid fallback', async () => {
  loadClusterAnnotationsMock.mockResolvedValue({
    annotations: [],
    hasFailures: true,
  })
  renderAccordion([createAnnotation(undefined)])

  await userEvent.click(screen.getByRole('button', { name: /Unclassified/ }))

  await waitFor(() =>
    expect(screen.getByText(/Some variants could not be loaded/)).toBeVisible(),
  )
})
