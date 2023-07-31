import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import DateSelection from './DateSelection'
import { fragment as mockFragment } from 'test-support/test-fragment'
import SessionContext from 'auth/SessionContext'

let session

beforeEach(() => {
  session = {
    isAllowedToTransliterateFragments: jest.fn(),
  }
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
})

describe('DateSelection', () => {
  test('renders without errors', () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection fragment={mockFragment} />
      </SessionContext.Provider>
    )
  })

  test('displays the date popover when the edit button is clicked', () => {
    render(
      <SessionContext.Provider value={session}>
        <DateSelection fragment={mockFragment} />
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
        <DateSelection fragment={mockFragment} />
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
    const mockUpdateDate = jest.fn()

    render(
      <SessionContext.Provider value={session}>
        <DateSelection fragment={mockFragment} />
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
    expect(mockUpdateDate).toHaveBeenCalledWith([
      {
        year: '2022',
        month: '3',
        day: '15',
        broken: false,
        uncertain: false,
      },
    ])
  })

  test('displays the loading spinner when saving', () => {
    render(<DateSelection fragment={mockFragment} />)

    const editButton = screen.getByLabelText('Browse dates button')
    fireEvent.click(editButton)

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    const loadingSpinner = screen.getByText('Saving...')
    expect(loadingSpinner).toBeInTheDocument()
  })

  test('does not display the edit button for unauthorized users', () => {
    render(<DateSelection fragment={mockFragment} />)

    const editButton = screen.queryByLabelText('Browse dates button')
    expect(editButton).not.toBeInTheDocument()
  })
})
