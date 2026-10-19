import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { screen, render } from '@testing-library/react'
import Details, { formatMeasurements } from 'fragmentarium/ui/info/Details'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'

export interface DetailsTestContext {
  fragmentService: jest.Mocked<FragmentService>
  dossiersService: jest.Mocked<DossiersService>
  renderDetails: (fragment: Fragment) => Promise<void>
}

export function createDetailsTestContext(): DetailsTestContext {
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()

  return {
    fragmentService: fragmentService,
    dossiersService: dossiersService,
    renderDetails: async (fragment: Fragment): Promise<void> => {
      render(
        <MemoryRouter>
          <Details
            fragment={fragment}
            updateGenres={jest.fn()}
            updateScript={jest.fn()}
            updateDate={jest.fn()}
            updateDatesInText={jest.fn()}
            fragmentService={fragmentService}
            dossiersService={dossiersService}
          />
        </MemoryRouter>,
      )
      await waitForSpinnerToBeRemoved(screen)
    },
  }
}

export function expectMeasurementsToBeRendered(fragment: Fragment): void {
  const measurements = formatMeasurements(fragment.measures)
  const expectedMeasures = `${measurements} cm`
  expect(screen.getByText(expectedMeasures)).toBeInTheDocument()
}
