import React from 'react'
import { render } from '@testing-library/react'

import TransliterationSearchForm from './TransliterationSearchForm'

it('calling render with the same component on the same container does not remount', () => {
  const handleChanges = jest.fn()
  const { getByLabelText, rerender } = render(
    <TransliterationSearchForm
      transliteration={'pak'}
      handleChanges={handleChanges}
    />
  )
  expect((getByLabelText('Transliteration') as HTMLInputElement).value).toBe(
    'pak'
  )

  rerender(
    <TransliterationSearchForm
      transliteration={undefined}
      handleChanges={handleChanges}
    />
  )
  expect((getByLabelText('Transliteration') as HTMLInputElement).value).toBe('')
})
