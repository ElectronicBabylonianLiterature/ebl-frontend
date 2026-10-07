import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateSelection from 'chronology/application/DateSelection'
import DatesInTextSelection from 'chronology/ui/DateEditor/DatesInTextSelection'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragment as savedFragment } from 'test-support/test-fragment'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'

type PendingSave = {
  save: jest.Mock<Promise<Fragment>>
  resolve: () => void
}

function pendingSave(): PendingSave {
  let resolveSave!: (fragment: Fragment) => void
  const save = jest.fn(
    () =>
      new Promise<Fragment>((resolve) => {
        resolveSave = resolve
      }),
  )
  return { save, resolve: () => resolveSave(savedFragment) }
}

const datesInText = [
  MesopotamianDate.fromJson({
    year: { value: '5' },
    month: { value: '5' },
    day: { value: '5' },
    isSeleucidEra: true,
  }),
  mesopotamianDateFactory.build(),
]

const editorSession = new MemorySession(['transliterate:fragments'])

function renderForEditor(element: JSX.Element): void {
  render(
    <SessionContext.Provider value={editorSession}>
      {element}
    </SessionContext.Provider>,
  )
}

async function openEditor(index: number): Promise<void> {
  await userEvent.click(screen.getAllByLabelText('Edit date button')[index])
  await waitFor(() => expect(screen.getAllByText('Delete')).toHaveLength(1))
}

describe('a pending date save', () => {
  it('locks Save and Delete of a single date until it settles', async () => {
    const pending = pendingSave()
    renderForEditor(
      <DateSelection dateProp={savedFragment.date} updateDate={pending.save} />,
    )
    await openEditor(0)

    await userEvent.click(screen.getByText('Delete'))

    expect(screen.getByText('Delete')).toBeDisabled()
    expect(screen.getByLabelText('Save date button')).toBeDisabled()
    fireEvent.click(screen.getByText('Delete'))
    expect(pending.save).toHaveBeenCalledTimes(1)

    pending.resolve()
    await waitFor(() =>
      expect(screen.queryByText('Delete')).not.toBeInTheDocument(),
    )
  })

  it('locks every dates-in-text editor until it settles', async () => {
    const pending = pendingSave()
    renderForEditor(
      <DatesInTextSelection
        datesInText={datesInText}
        updateDatesInText={pending.save}
      />,
    )
    await openEditor(0)
    await userEvent.click(screen.getByText('Delete'))

    expect(screen.getByLabelText('Add date button')).toBeDisabled()
    await openEditor(1)
    expect(screen.getByText('Delete')).toBeDisabled()
    expect(screen.getByLabelText('Save date button')).toBeDisabled()
    fireEvent.click(screen.getByText('Delete'))
    expect(pending.save).toHaveBeenCalledTimes(1)

    pending.resolve()
    await waitFor(() =>
      expect(screen.getByLabelText('Add date button')).toBeEnabled(),
    )
  })
})
