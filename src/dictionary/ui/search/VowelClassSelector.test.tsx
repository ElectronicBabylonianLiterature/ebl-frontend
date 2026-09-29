import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VowelClassSelector from 'dictionary/ui/search/VowelClassSelector'

it('Treats a missing selection as empty', async () => {
  const missingSelection: string[] = JSON.parse('null')
  const onChange = jest.fn()
  render(<VowelClassSelector selected={missingSelection} onChange={onChange} />)

  const vowelCheckbox = screen.getByRole('checkbox', { name: 'a/a' })
  expect(vowelCheckbox).not.toBeChecked()

  await userEvent.click(vowelCheckbox)
  expect(onChange).toHaveBeenCalledWith(['a/a'])
})
