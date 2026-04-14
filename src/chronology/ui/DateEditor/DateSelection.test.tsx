import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateSelection from '../../application/DateSelection'
import { fragment as mockFragment } from 'test-support/test-fragment'
import SessionContext from 'auth/SessionContext'
import { Promise } from 'bluebird'

let session
let mockUpdateDate

beforeEach(() => {
  session = {
    isAllowedToTransliterateFragments: jest.fn(),
  }
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  mockUpdateDate = jest.fn()
  mockUpdateDate.mockReturnValue(Promise.resolve(mockFragment))
})

describe('DateSelection', () => {
  test('renders without errors', () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection
          dateProp={mockFragment?.date}
          updateDate={mockUpdateDate}
        />
      </SessionContext.Provider>,
    )
  })

  test('displays the date popover when the edit button is clicked', async () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection
          dateProp={mockFragment?.date}
          updateDate={mockUpdateDate}
        />
      </SessionContext.Provider>,
    )

    const editButton = screen.getByLabelText('Edit date button')
    await userEvent.click(editButton)

    const popover = await screen.findByRole('tooltip')

    expect(popover).toBeInTheDocument()
  })

  test('hides the date popover when the Save button is clicked', async () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection
          dateProp={mockFragment?.date}
          updateDate={mockUpdateDate}
        />
      </SessionContext.Provider>,
    )

    const editButton = screen.getByLabelText('Edit date button')
    await userEvent.click(editButton)

    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)

    const popover = screen.queryByTestId('popover-select-date')
    expect(popover).not.toBeInTheDocument()
  })

  test('calls the updateDate function with the selected date values when Save is clicked', async () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection
          dateProp={mockFragment?.date}
          updateDate={mockUpdateDate}
        />
      </SessionContext.Provider>,
    )
    const editButton = screen.getByLabelText('Edit date button')
    await userEvent.click(editButton)
    const yearInput = screen.getByPlaceholderText('Year')
    const monthInput = screen.getByPlaceholderText('Month')
    const dayInput = screen.getByPlaceholderText('Day')
    const saveButton = screen.getByText('Save')
    await userEvent.clear(yearInput)
    await userEvent.type(yearInput, '2022')
    await userEvent.clear(monthInput)
    await userEvent.type(monthInput, '3')
    await userEvent.clear(dayInput)
    await userEvent.type(dayInput, '15')
    await userEvent.click(saveButton)
    expect(mockUpdateDate).toHaveBeenCalledTimes(1)
    expect(mockUpdateDate.mock.calls[0][0]).toMatchObject({
      day: { isBroken: false, isUncertain: false, value: '15' },
      month: {
        isBroken: false,
        isIntercalary: false,
        isUncertain: false,
        value: '3',
      },
      year: { isBroken: false, isUncertain: false, value: '2022' },
      king: undefined,
      isSeleucidEra: true,
      ur3Calendar: undefined,
    })
  })

  test('displays the loading spinner when saving', async () => {
    mockUpdateDate.mockReturnValueOnce(new Promise(() => undefined))
    render(
      <SessionContext.Provider value={session}>
        <DateSelection
          dateProp={mockFragment?.date}
          updateDate={mockUpdateDate}
        />
      </SessionContext.Provider>,
    )
    const editButton = screen.getByLabelText('Edit date button')
    await userEvent.click(editButton)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Year')).toBeInTheDocument()
    })
    const yearInput = screen.getByPlaceholderText('Year')
    await userEvent.clear(yearInput)
    await userEvent.type(yearInput, '189')
    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })

  test('does not display the edit button for unauthorized users', () => {
    render(
      <DateSelection
        dateProp={mockFragment?.date}
        updateDate={mockUpdateDate}
      />,
    )

    const editButton = screen.queryByLabelText('Edit date button')
    expect(editButton).not.toBeInTheDocument()
  })
})
