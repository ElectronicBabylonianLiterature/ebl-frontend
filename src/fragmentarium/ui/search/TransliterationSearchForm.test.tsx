import React from 'react'
import { render } from '@testing-library/react'

import TransliterationSearchForm from './TransliterationSearchForm'

it('calling render with the same component on the same container does not remount', () => {
  const handleChanges = jest.fn()
  const getState = jest.fn(() => 'pak')
  const getStateEmpty = jest.fn(() => '')
  const { getByLabelText, rerender } = render(
    <TransliterationSearchForm onChange={handleChanges} getState={getState} />
  )
  expect((getByLabelText('Transliteration') as HTMLInputElement).value).toBe(
    'pak'
  )

  rerender(
    <TransliterationSearchForm
      onChange={handleChanges}
      getState={getStateEmpty}
    />
  )
  expect((getByLabelText('Transliteration') as HTMLInputElement).value).toBe('')
})
