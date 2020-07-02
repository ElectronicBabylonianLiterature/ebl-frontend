import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { changeValueByLabel } from 'test-support/utils'

import TransliterationSearchForm from './TransliterationSearchForm'

it('Calls onChange on User Input', async () => {
  const transliteration = 'ma i-ra\nka li'
  const onChange = jest.fn()
  const getState = jest.fn(() => '')
  const element = render(
    <MemoryRouter>
      <TransliterationSearchForm onChange={onChange} getState={getState} />
    </MemoryRouter>
  )

  changeValueByLabel(element, 'Transliteration', transliteration)

  expect(onChange).toBeCalledWith('transliteration', transliteration)
})
