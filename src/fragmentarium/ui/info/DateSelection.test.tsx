import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import DateSelection from './DateSelection'
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
        <DateSelection fragment={mockFragment} updateDate={mockUpdateDate} />
      </SessionContext.Provider>
    )
  })

  test('displays the date popover when the edit button is clicked', () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection fragment={mockFragment} updateDate={mockUpdateDate} />
      </SessionContext.Provider>
    )

    const editButton = screen.getByLabelText('Browse dates button')
    fireEvent.click(editButton)

    const popover = screen.getByRole('tooltip')
    expect(popover).toBeInTheDocument()
  })

  test('hides the date popover when the Save button is clicked', () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection fragment={mockFragment} updateDate={mockUpdateDate} />
      </SessionContext.Provider>
    )

    const editButton = screen.getByLabelText('Browse dates button')
    fireEvent.click(editButton)

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    const popover = screen.queryByTestId('popover-select-date')
    expect(popover).not.toBeInTheDocument()
  })

  test('calls the updateDate function with the selected date values when Save is clicked', () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection fragment={mockFragment} updateDate={mockUpdateDate} />
      </SessionContext.Provider>
    )

    const editButton = screen.getByLabelText('Browse dates button')
    fireEvent.click(editButton)

    const yearInput = screen.getByPlaceholderText('Year')
    fireEvent.change(yearInput, { target: { value: '2022' } })

    const monthInput = screen.getByPlaceholderText('Month')
    fireEvent.change(monthInput, { target: { value: '3' } })

    const dayInput = screen.getByPlaceholderText('Day')
    fireEvent.change(dayInput, { target: { value: '15' } })

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    expect(mockUpdateDate).toHaveBeenCalledTimes(1)
    expect(mockUpdateDate).toHaveBeenCalledWith({
      day: { broken: false, uncertain: false, value: '15' },
      era: 'seleucid',
      month: {
        broken: false,
        intercalary: false,
        uncertain: false,
        value: '3',
      },
      ur3Calendar: undefined,
      year: { broken: false, uncertain: false, value: '2022' },
    })
  })

  test('displays the loading spinner when saving', () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection fragment={mockFragment} updateDate={mockUpdateDate} />
      </SessionContext.Provider>
    )
    const editButton = screen.getByLabelText('Browse dates button')
    fireEvent.click(editButton)

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    const loadingSpinner = screen.getByText('Saving...')
    expect(loadingSpinner).toBeInTheDocument()
  })

  test('does not display the edit button for unauthorized users', () => {
    render(
      <DateSelection fragment={mockFragment} updateDate={mockUpdateDate} />
    )

    const editButton = screen.queryByLabelText('Browse dates button')
    expect(editButton).not.toBeInTheDocument()
  })
})
