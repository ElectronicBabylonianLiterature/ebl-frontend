import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DictionarySourceFormGroup from 'dictionary/ui/search/DictionarySourceFormGroup'

it('Treats a missing origin as all sources', async () => {
  const missingOrigin: string[] = JSON.parse('null')
  const onChange = jest.fn()
  render(
    <DictionarySourceFormGroup origin={missingOrigin} onChange={onChange} />,
  )

  expect(screen.getByRole('checkbox', { name: 'All sources' })).toBeChecked()

  await userEvent.click(screen.getByRole('checkbox', { name: 'AfO Register' }))
  expect(onChange).toHaveBeenCalledWith(['AFO_REGISTER'])
})
