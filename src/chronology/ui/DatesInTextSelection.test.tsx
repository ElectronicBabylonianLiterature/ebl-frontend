import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import DatesInTextSelection from 'chronology/ui/DatesInTextSelection'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'
import { fragment as mockFragment } from 'test-support/test-fragment'
import SessionContext from 'auth/SessionContext'
import { Promise } from 'bluebird'

let session

describe('DatesInTextSelection', () => {
  const mockUpdateDatesInText = jest.fn()
  const datesInText = Array.from(
    {
      length: Math.floor(Math.random() * 5) + 1,
    },
    () => mesopotamianDateFactory.build()
  )
  const defaultProps = {
    datesInText: datesInText,
    updateDatesInText: mockUpdateDatesInText,
  }

  beforeEach(() => {
    session = {
      isAllowedToTransliterateFragments: jest.fn(),
    }
    session.isAllowedToTransliterateFragments.mockReturnValue(true)
    mockUpdateDatesInText.mockReturnValue(Promise.resolve(mockFragment))
  })

  it('renders without crashing', () => {
    render(<DatesInTextSelection {...defaultProps} />)
    screen.getByText('Dates in text:')
  })

  it('adds a date when addButton is clicked and DateEditor saves', async () => {
    render(
      <SessionContext.Provider value={session}>
        <DatesInTextSelection {...defaultProps} />
      </SessionContext.Provider>
    )
    const addButton = screen.getByLabelText('Add date button')
    await act(async () => {
      fireEvent.click(addButton)
    })
    const saveButton = screen.getByText('Save')
    await act(async () => {
      fireEvent.click(saveButton)
    })
    await waitFor(() => expect(mockUpdateDatesInText).toHaveBeenCalledTimes(1))
    expect(screen.getByText('1.I.1 SE (3 April 311 BCE)')).toBeVisible()
  })

  it('updates a date in the list', async () => {
    render(
      <SessionContext.Provider value={session}>
        <DatesInTextSelection {...defaultProps} />
      </SessionContext.Provider>
    )
    const editButton = screen.getAllByLabelText('Edit date button')[0]
    await act(async () => {
      fireEvent.click(editButton)
    })
    const saveButton = screen.getByText('Save')
    await act(async () => {
      fireEvent.click(saveButton)
    })
    await waitFor(() => expect(mockUpdateDatesInText).toHaveBeenCalledTimes(1))
    expect(screen.getByText('1.I.1 SE (3 April 311 BCE)')).toBeVisible()
  })

  it('deletes a date from the list', async () => {
    render(
      <SessionContext.Provider value={session}>
        <DatesInTextSelection {...defaultProps} />
      </SessionContext.Provider>
    )

    expect(screen.getAllByRole('time')[0]).toHaveTextContent(
      datesInText[0].toString()
    )
    const editButton = screen.getAllByLabelText('Edit date button')[0]
    await act(async () => {
      fireEvent.click(editButton)
    })
    const saveButton = screen.getByText('Delete')
    await act(async () => {
      fireEvent.click(saveButton)
    })
    await waitFor(() => expect(mockUpdateDatesInText).toHaveBeenCalledTimes(1))
    expect(screen.getAllByRole('time')[0]).not.toHaveTextContent(
      datesInText[0].toString()
    )
  })

  it('does not display add button when user does not have permission', () => {
    session.isAllowedToTransliterateFragments.mockReturnValue(false)

    render(
      <SessionContext.Provider value={session}>
        <DatesInTextSelection {...defaultProps} />
      </SessionContext.Provider>
    )

    expect(screen.queryByLabelText('Add date button')).not.toBeInTheDocument()
  })
})
