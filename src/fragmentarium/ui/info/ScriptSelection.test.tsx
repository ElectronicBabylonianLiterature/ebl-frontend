import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { waitForSpinnerToBeRemoved } from '../../../test-support/waitForSpinnerToBeRemoved'
import ScriptSelection from './ScriptSelection'
import FragmentService from 'fragmentarium/application/FragmentService'
import { PeriodModifiers, Periods } from 'common/period'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'

jest.mock('fragmentarium/application/FragmentService')

const updateScript = jest.fn()
let fragment: Fragment
let session

const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentService = new MockFragmentService()
const script = {
  period: Periods['Old Elamite'],
  periodModifier: PeriodModifiers.Early,
  uncertain: false,
}

async function renderScriptSelection() {
  render(
    <SessionContext.Provider value={session}>
      <ScriptSelection
        fragment={fragment}
        updateScript={updateScript}
        fragmentService={fragmentService}
      />
    </SessionContext.Provider>
  )
  await waitForSpinnerToBeRemoved(screen)
}

beforeEach(async () => {
  fragment = fragmentFactory.build(
    {},
    {
      associations: {
        script: script,
      },
    }
  )
  fragmentService.fetchPeriods.mockReturnValue(
    Promise.resolve([...Object.keys(Periods)])
  )
  session = {
    isAllowedToTransliterateFragments: jest.fn(),
  }
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  await renderScriptSelection()
})
describe('User Input', () => {
  test('Selecting period triggers update', async () => {
    await selectEvent.select(
      screen.getByText(script.period.name),
      Periods.Hellenistic.name
    )

    await waitFor(() => expect(updateScript).toHaveBeenCalled())

    expect(screen.getByText(Periods.Hellenistic.name)).toBeInTheDocument()
  })
  test("Selecting the same period doesn't trigger update", async () => {
    await selectEvent.select(
      screen.getByText(script.period.name),
      script.period.name
    )

    await waitFor(() => expect(updateScript).not.toHaveBeenCalled())
  })
  test('Selecting period modifier triggers update', async () => {
    await selectEvent.select(
      screen.getByText(script.periodModifier.name),
      PeriodModifiers.Late.name
    )

    await waitFor(() => expect(updateScript).toHaveBeenCalled())

    expect(screen.getByText(PeriodModifiers.Late.name)).toBeInTheDocument()
  })
  test('Click Uncertain Checkbox', async () => {
    userEvent.click(screen.getByRole('checkbox'))
    expect(updateScript).toHaveBeenCalled()
  })
})
