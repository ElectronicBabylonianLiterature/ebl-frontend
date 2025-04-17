import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
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
import Session from 'auth/Session'
import MemorySession from 'auth/Session'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'

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
  const history = createMemoryHistory()
  render(
    <Router history={history}>
      <SessionContext.Provider value={session}>
        <ScriptSelection
          fragment={fragment}
          updateScript={updateScript}
          fragmentService={fragmentService}
        />
      </SessionContext.Provider>
    </Router>
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
  session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
  session.isAllowedToTransliterateFragments.mockReturnValue(true)

  await renderScriptSelection()

  await act(async () => userEvent.click(screen.getByRole('button')))
})
describe('User Input', () => {
  test.each([
    script.period.name,
    script.periodModifier.name,
    'Uncertain',
    'Save',
  ])('%s is visible', (element) => {
    expect(screen.getByText(element)).toBeInTheDocument()
  })
  test('Save button is disabled', async () => {
    expect(screen.getByText('Save')).toBeDisabled()
  })
  test('Save button is enabled after changes', async () => {
    await act(() =>
      selectEvent.select(
        screen.getByText(script.period.name),
        Periods.Hellenistic.name
      )
    )
    expect(screen.getByText('Save')).toBeEnabled()
  })
  test('Save button is disabled after changing back to previous value', async () => {
    await act(() =>
      selectEvent.select(
        screen.getByText(script.period.name),
        Periods.Hellenistic.name
      )
    )
    await act(() =>
      selectEvent.select(
        screen.getByText(Periods.Hellenistic.name),
        script.period.name
      )
    )
    expect(screen.getByText('Save')).toBeDisabled()
  })
  test('Clicking Save triggers update', async () => {
    updateScript.mockReturnValue(Promise.resolve(fragment))
    await act(() =>
      selectEvent.select(
        screen.getByText(script.periodModifier.name),
        PeriodModifiers.Late.name
      )
    )
    act(() => userEvent.click(screen.getByText('Save')))

    await waitFor(() => expect(updateScript).toHaveBeenCalled())
  })
})
