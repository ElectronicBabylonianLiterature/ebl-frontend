import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AfoRegisterTextSelect from './AfoRegisterTextSelect'
import userEvent from '@testing-library/user-event'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'
import Bluebird from 'bluebird'

describe('AfoRegisterTextSelect', () => {
  const mockSearchSuggestions = jest.fn()
  const mockOnChange = jest.fn()
  const defaultProps = {
    ariaLabel: 'test-select',
    value: null,
    searchSuggestions: mockSearchSuggestions,
    onChange: mockOnChange,
    isClearable: true,
  }

  it('renders without crashing', () => {
    render(<AfoRegisterTextSelect {...defaultProps} />)
    expect(screen.getByLabelText('test-select')).toBeInTheDocument()
  })

  it('updates selection when props change', async () => {
    const newValue = new AfoRegisterRecordSuggestion({
      text: 'Some text option',
      textNumbers: ['4', '5', '6'],
    })
    const { rerender } = render(<AfoRegisterTextSelect {...defaultProps} />)
    rerender(<AfoRegisterTextSelect {...defaultProps} value={newValue} />)
    await waitFor(() => {
      expect(screen.getByText(newValue.text)).toBeInTheDocument()
    })
  })

  it('calls onChange when an option is selected', async () => {
    const options = [
      { text: 'Text option 1', textNumbers: ['1'] },
      { text: 'Text option 2', textNumbers: ['2'] },
    ]
    mockSearchSuggestions.mockReturnValue(Bluebird.resolve(options))
    render(<AfoRegisterTextSelect {...defaultProps} />)
    await userEvent.type(screen.getByLabelText('test-select'), 'Option')
    const option = await screen.findByText(options[0].text)
    fireEvent.click(option)
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        text: options[0].text,
        textNumbers: options[0].textNumbers,
      })
    })
  })
})
