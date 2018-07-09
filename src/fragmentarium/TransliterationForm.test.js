import React from 'react'
import {render, cleanup} from 'react-testing-library'
import TransliteratioForm from './TransliterationForm'

afterEach(cleanup)

it('Shows transliteration', () => {
  const transliteration = 'line1\nline2'

  const {getByLabelText} = render(<TransliteratioForm transliteration={transliteration} />)
  expect(getByLabelText('Transliteration').value).toEqual(transliteration)
})
