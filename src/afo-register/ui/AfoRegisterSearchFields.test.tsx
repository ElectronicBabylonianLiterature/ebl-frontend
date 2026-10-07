import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextNumberField } from 'afo-register/ui/AfoRegisterSearchFields'

jest.mock('react-select', () => ({
  __esModule: true,
  default: ({
    onChange,
    'aria-label': ariaLabel,
  }: {
    onChange: (option: { value: string } | null) => void
    'aria-label': string
  }): JSX.Element => (
    <button type="button" aria-label={ariaLabel} onClick={() => onChange(null)}>
      clear
    </button>
  ),
}))

it('keeps the current text number when the select reports no option', async () => {
  const setQuery = jest.fn()
  render(
    <TextNumberField
      query={{ text: 'Sample text', textNumber: '3' }}
      setQuery={setQuery}
      textNumberOptions={[{ label: '3', value: '3' }]}
      isTextNumberSelect={true}
    />,
  )

  await userEvent.click(screen.getByLabelText('select-text-number'))

  expect(setQuery).not.toHaveBeenCalled()
})
