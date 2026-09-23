import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Bluebird from 'bluebird'
import DateSelection from 'chronology/application/DateSelection'
import { MesopotamianDate } from 'chronology/domain/Date'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { fragment as mockFragment } from 'test-support/test-fragment'

const seleucidDate = new MesopotamianDate({
  year: { value: '10' },
  month: { value: '5' },
  day: { value: '12' },
  isSeleucidEra: true,
})

function renderDateSelection(dateProp?: MesopotamianDate): void {
  const session = {
    isAllowedToTransliterateFragments: jest.fn().mockReturnValue(true),
  } as unknown as MemorySession
  render(
    <SessionContext.Provider value={session}>
      <DateSelection
        dateProp={dateProp}
        updateDate={jest.fn().mockReturnValue(Bluebird.resolve(mockFragment))}
      />
    </SessionContext.Provider>,
  )
}

describe('DateSelection with a saved date', () => {
  it('shows the saved date next to the edit button', () => {
    renderDateSelection(seleucidDate)

    expect(screen.getByRole('time')).toHaveTextContent('12.V.10 SE')
    expect(screen.queryByText('Date: -')).not.toBeInTheDocument()
  })

  it('marks a missing date with a dash', () => {
    renderDateSelection()

    expect(screen.getByText('Date: -')).toBeInTheDocument()
    expect(screen.queryByRole('time')).not.toBeInTheDocument()
  })
})

describe('DateSelection editor', () => {
  it('does not allow saving an empty Assyrian date', async () => {
    renderDateSelection()
    await userEvent.click(screen.getByLabelText('Edit date button'))

    await userEvent.click(screen.getByLabelText('Assyrian'))

    expect(
      screen.getByRole('button', { name: 'Save date button' }),
    ).toBeDisabled()
  })

  it('closes when clicking outside of it', async () => {
    renderDateSelection(seleucidDate)
    await userEvent.click(screen.getByLabelText('Edit date button'))
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()

    await userEvent.click(document.body)

    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    )
  })
})
