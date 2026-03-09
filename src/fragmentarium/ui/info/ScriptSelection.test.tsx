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
import Session from 'auth/Session'
import MemorySession from 'auth/Session'
import { MemoryRouter } from 'react-router-dom'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('auth/Session')

const updateScript = jest.fn()
let fragment: Fragment
let session: jest.Mocked<Session>

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
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <ScriptSelection
          fragment={fragment}
          updateScript={updateScript}
          fragmentService={fragmentService}
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
  await waitForSpinnerToBeRemoved(screen)
}

async function setup(): Promise<void> {
  fragment = fragmentFactory.build(
    {},
    {
      associations: {
        script: script,
      },
    },
  )
  fragmentService.fetchPeriods.mockReturnValue(
    Promise.resolve([...Object.keys(Periods)]),
  )
  session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
  session.isAllowedToTransliterateFragments.mockReturnValue(true)

  await renderScriptSelection()

  await userEvent.click(screen.getByRole('button'))
}
describe('User Input', () => {
  test.each([
    script.period.name,
    script.periodModifier.name,
    'Uncertain',
    'Save',
  ])('%s is visible', async (element) => {
    await setup()
    expect(screen.getByText(element)).toBeInTheDocument()
  })
  test('Save button is disabled', async () => {
    await setup()
    expect(screen.getByText('Save')).toBeDisabled()
  })
  test('Save button is enabled after changes', async () => {
    await setup()
    const periodSelect = screen.getByLabelText('select-period')
    await userEvent.click(periodSelect)
    await userEvent.click(await screen.findByText(Periods.Hellenistic.name))
    expect(screen.getByText('Save')).toBeEnabled()
  })
  test('Save button is disabled after changing back to previous value', async () => {
    await setup()
    const periodSelect = screen.getByLabelText('select-period')
    await userEvent.click(periodSelect)
    await userEvent.click(await screen.findByText(Periods.Hellenistic.name))
    await userEvent.click(periodSelect)
    await userEvent.click(await screen.findByText(script.period.name))
    expect(screen.getByText('Save')).toBeDisabled()
  })
  test('Clicking Save triggers update', async () => {
    await setup()
    updateScript.mockReturnValue(Promise.resolve(fragment))
    const modifierSelect = screen.getByLabelText('select-period-modifier')
    await userEvent.click(modifierSelect)
    await userEvent.click(await screen.findByText(PeriodModifiers.Late.name))
    await userEvent.click(screen.getByText('Save'))

    await waitFor(() => expect(updateScript).toHaveBeenCalled())
  })
})
